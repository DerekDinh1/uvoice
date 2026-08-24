import { SPEECH_CONFIG } from '../config';

// Decodes a recorded audio Blob into mono Float32 samples at the target sample
// rate (16 kHz) that Whisper expects, using the Web Audio API. Runs entirely in
// the browser; no audio leaves the device.
export async function decodeToMono(
  blob: Blob,
  targetSampleRate: number = SPEECH_CONFIG.targetSampleRate,
): Promise<Float32Array> {
  const arrayBuffer = await blob.arrayBuffer();

  const AudioContextCtor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioContextCtor) {
    throw new Error('Web Audio API is not available in this browser.');
  }

  const decodeContext = new AudioContextCtor();
  let decoded: AudioBuffer;
  try {
    decoded = await decodeContext.decodeAudioData(arrayBuffer);
  } finally {
    void decodeContext.close();
  }

  // Resample to mono at the target rate via an offline render.
  const frameCount = Math.max(1, Math.ceil(decoded.duration * targetSampleRate));
  const offline = new OfflineAudioContext(1, frameCount, targetSampleRate);
  const source = offline.createBufferSource();
  source.buffer = decoded;
  source.connect(offline.destination);
  source.start();
  const rendered = await offline.startRendering();
  return rendered.getChannelData(0);
}
