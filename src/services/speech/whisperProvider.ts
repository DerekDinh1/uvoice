import type {
  TranscriptionProvider,
  TranscriptionProgress,
} from '../../types/speech';
import { SpeechErrorException } from '../../types/speech';
import {
  WHISPER_MODELS,
  SPEECH_CONFIG,
  type WhisperModelId,
} from '../../config';
import { decodeToMono } from '../../lib/audioDecode';

interface AsrOutput {
  text: string;
}
type Transcriber = (
  audio: Float32Array,
  options?: Record<string, unknown>,
) => Promise<AsrOutput | AsrOutput[]>;

interface ProgressInfo {
  status?: string;
  progress?: number;
}

// Local Whisper transcription via Transformers.js (ONNX Runtime Web / WASM). The
// library and model load lazily on first use. Audio never leaves the browser;
// model weights are fetched once from the Hugging Face CDN and then cached.
export class WhisperProvider implements TranscriptionProvider {
  readonly id = 'whisper';
  private transcriber: Transcriber | null = null;
  private readonly model: WhisperModelId;

  constructor(model: WhisperModelId = SPEECH_CONFIG.defaultModel) {
    this.model = model;
  }

  isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const hasAudio =
      typeof window.AudioContext !== 'undefined' ||
      'webkitAudioContext' in window;
    return hasAudio && typeof WebAssembly !== 'undefined';
  }

  async initialize(
    onProgress?: (progress: TranscriptionProgress) => void,
  ): Promise<void> {
    if (this.transcriber) return;
    try {
      const { pipeline, env } = await import('@huggingface/transformers');
      env.allowLocalModels = false; // load weights from the Hugging Face CDN
      const repo = WHISPER_MODELS[this.model].repo;
      const pipe = await pipeline('automatic-speech-recognition', repo, {
        progress_callback: (info: ProgressInfo) => {
          if (info.status === 'progress' && typeof info.progress === 'number') {
            onProgress?.({ stage: 'loading-model', ratio: info.progress / 100 });
          }
        },
      });
      this.transcriber = pipe as unknown as Transcriber;
    } catch (caught) {
      throw new SpeechErrorException(
        'model-load-failed',
        'Could not load the speech model.',
        caught,
      );
    }
  }

  async transcribe(
    audio: Blob,
    onProgress?: (progress: TranscriptionProgress) => void,
  ): Promise<string> {
    await this.initialize(onProgress);
    onProgress?.({ stage: 'transcribing' });

    const transcriber = this.transcriber;
    if (!transcriber) {
      throw new SpeechErrorException(
        'model-load-failed',
        'The speech model is not ready.',
      );
    }

    try {
      const samples = await decodeToMono(audio, SPEECH_CONFIG.targetSampleRate);
      const output = await transcriber(samples);
      const text = Array.isArray(output)
        ? output.map((part) => part.text).join(' ')
        : output.text;
      return text.trim();
    } catch (caught) {
      if (caught instanceof SpeechErrorException) throw caught;
      throw new SpeechErrorException(
        'transcription-failed',
        'Transcription failed. Please try again or type your answer.',
        caught,
      );
    }
  }
}
