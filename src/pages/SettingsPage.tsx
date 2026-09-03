import {
  SPEECH_PROVIDER_MODES,
  SPEECH_PROVIDER_LABELS,
  WHISPER_MODELS,
  type SpeechProviderMode,
  type WhisperModelId,
} from '../config';
import { useSettingsStore } from '../store/useSettingsStore';

const modelIds = Object.keys(WHISPER_MODELS) as WhisperModelId[];

export function SettingsPage() {
  const speechMode = useSettingsStore((state) => state.speechMode);
  const whisperModel = useSettingsStore((state) => state.whisperModel);
  const analysisMode = useSettingsStore((state) => state.analysisMode);
  const apiKey = useSettingsStore((state) => state.apiKey);
  const setSpeechMode = useSettingsStore((state) => state.setSpeechMode);
  const setWhisperModel = useSettingsStore((state) => state.setWhisperModel);
  const setAnalysisMode = useSettingsStore((state) => state.setAnalysisMode);
  const setApiKey = useSettingsStore((state) => state.setApiKey);

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-text">
          Settings
        </h1>
        <p className="max-w-xl text-muted">
          Choose how spoken answers are turned into text. Typing always works, no
          matter what you pick here.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-surface p-6">
        <h2 className="font-semibold text-text">Voice input</h2>

        <fieldset className="space-y-3">
          <legend className="sr-only">Transcription mode</legend>
          {SPEECH_PROVIDER_MODES.map((mode: SpeechProviderMode) => (
            <label
              key={mode}
              className="flex cursor-pointer gap-3 rounded-lg border border-border bg-bg p-3"
            >
              <input
                type="radio"
                name="speech-mode"
                value={mode}
                checked={speechMode === mode}
                onChange={() => setSpeechMode(mode)}
                className="mt-1"
              />
              <span className="space-y-1">
                <span className="block text-sm font-medium text-text">
                  {SPEECH_PROVIDER_LABELS[mode].label}
                </span>
                <span className="block text-xs text-muted">
                  {SPEECH_PROVIDER_LABELS[mode].description}
                </span>
              </span>
            </label>
          ))}
        </fieldset>

        {speechMode === 'whisper' && (
          <div className="space-y-2 border-t border-border pt-4">
            <label
              htmlFor="whisper-model"
              className="block text-sm font-medium text-text"
            >
              Model
            </label>
            <select
              id="whisper-model"
              value={whisperModel}
              onChange={(event) =>
                setWhisperModel(event.target.value as WhisperModelId)
              }
              className="w-full rounded-md border border-border bg-bg p-2 text-sm text-text"
            >
              {modelIds.map((id) => (
                <option key={id} value={id}>
                  {WHISPER_MODELS[id].label}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted">
              The model downloads once on first use, then stays cached in your
              browser. Base is more accurate; tiny is a smaller, faster download
              that suits slower devices.
            </p>
          </div>
        )}

        <p className="rounded-md bg-surface-2 px-3 py-2 text-xs text-muted">
          Your voice is transcribed locally in your browser. Audio is not
          uploaded to any server. On first use, model files are downloaded from
          the Hugging Face CDN.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-surface p-6">
        <h2 className="font-semibold text-text">Style analysis</h2>

        <fieldset className="space-y-3">
          <legend className="sr-only">Analysis mode</legend>
          <label className="flex cursor-pointer gap-3 rounded-lg border border-border bg-bg p-3">
            <input
              type="radio"
              name="analysis-mode"
              value="mock"
              checked={analysisMode === 'mock'}
              onChange={() => setAnalysisMode('mock')}
              className="mt-1"
            />
            <span className="space-y-1">
              <span className="block text-sm font-medium text-text">
                Demo analysis
              </span>
              <span className="block text-xs text-muted">
                Returns a realistic sample profile with no API key, so the flow
                works instantly.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer gap-3 rounded-lg border border-border bg-bg p-3">
            <input
              type="radio"
              name="analysis-mode"
              value="openai"
              checked={analysisMode === 'openai'}
              onChange={() => setAnalysisMode('openai')}
              className="mt-1"
            />
            <span className="space-y-1">
              <span className="block text-sm font-medium text-text">
                Your own API key
              </span>
              <span className="block text-xs text-muted">
                Analyzes your real responses with an OpenAI-compatible model.
              </span>
            </span>
          </label>
        </fieldset>

        {analysisMode === 'openai' && (
          <div className="space-y-2 border-t border-border pt-4">
            <label
              htmlFor="api-key"
              className="block text-sm font-medium text-text"
            >
              API key
            </label>
            <input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="sk-..."
              autoComplete="off"
              className="w-full rounded-md border border-border bg-bg p-2 text-sm text-text"
            />
            <p className="text-xs text-muted">
              Kept in memory for this session only and never written to storage.
              Browser-side keys are fine for personal use but are not a secure
              production setup.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
