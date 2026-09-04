import { useState } from 'react';
import type { StyleProfile } from '../../types/styleProfile';
import { STYLE_DIMENSIONS, styleProfileSchema } from '../../types/styleProfile';
import { buttonClass } from '../ui/buttonStyles';
import { ScoreSlider } from './ScoreSlider';
import { EditableTagList } from './EditableTagList';
import { TextField } from './TextField';
import { CheckboxField } from './CheckboxField';

interface ProfileEditorProps {
  profile: StyleProfile;
  onSave: (profile: StyleProfile) => void;
  onCancel: () => void;
}

// Edit form for the writing-style profile. `profile` is snapshotted into local
// draft state on mount; every field mutates the draft only, so nothing reaches
// the store until Save. Cancel discards the draft entirely.
export function ProfileEditor({
  profile,
  onSave,
  onCancel,
}: ProfileEditorProps) {
  const [draft, setDraft] = useState<StyleProfile>(profile);
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    const result = styleProfileSchema.safeParse(draft);
    if (!result.success) {
      setError('Could not save these changes. Check the fields and try again.');
      return;
    }
    onSave(result.data);
  }

  const actions = (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={handleSave}
        className={buttonClass('primary')}
      >
        Save
      </button>
      <button
        type="button"
        onClick={onCancel}
        className={buttonClass('outline')}
      >
        Cancel
      </button>
    </div>
  );

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-text">
            Edit profile
          </h1>
          <p className="max-w-xl text-muted">
            Adjust any field below, then save. Nothing changes until you save.
          </p>
        </div>
        {actions}
      </div>

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}

      <div className="space-y-4 rounded-xl border border-border bg-surface p-6">
        <h2 className="font-semibold text-text">Scores</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {STYLE_DIMENSIONS.map((dimension) => (
            <ScoreSlider
              key={dimension.key}
              id={`score-${dimension.key}`}
              label={dimension.label}
              value={draft[dimension.key] as number}
              onChange={(value) =>
                setDraft(
                  (prev) =>
                    ({ ...prev, [dimension.key]: value }) as StyleProfile,
                )
              }
            />
          ))}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-border bg-surface p-6">
          <h2 className="font-semibold text-text">Voice</h2>
          <EditableTagList
            items={draft.voice}
            addLabel="Add to voice"
            onChange={(voice) => setDraft((prev) => ({ ...prev, voice }))}
          />
        </div>
        <div className="space-y-3 rounded-xl border border-border bg-surface p-6">
          <h2 className="font-semibold text-text">Tone</h2>
          <EditableTagList
            items={draft.tone}
            addLabel="Add to tone"
            onChange={(tone) => setDraft((prev) => ({ ...prev, tone }))}
          />
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-surface p-6">
        <h2 className="font-semibold text-text">Sentence style</h2>
        <div className="space-y-3">
          <TextField
            id="sentence-typical-length"
            label="Typical length"
            value={draft.sentenceStyle.typicalLength}
            onChange={(typicalLength) =>
              setDraft((prev) => ({
                ...prev,
                sentenceStyle: { ...prev.sentenceStyle, typicalLength },
              }))
            }
          />
          <TextField
            id="sentence-complexity"
            label="Complexity"
            value={draft.sentenceStyle.complexity}
            onChange={(complexity) =>
              setDraft((prev) => ({
                ...prev,
                sentenceStyle: { ...prev.sentenceStyle, complexity },
              }))
            }
          />
          <TextField
            id="sentence-rhythm"
            label="Rhythm"
            value={draft.sentenceStyle.rhythm}
            onChange={(rhythm) =>
              setDraft((prev) => ({
                ...prev,
                sentenceStyle: { ...prev.sentenceStyle, rhythm },
              }))
            }
          />
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-surface p-6">
        <h2 className="font-semibold text-text">Vocabulary</h2>
        <div className="space-y-3">
          <TextField
            id="vocabulary-complexity"
            label="Complexity"
            value={draft.vocabulary.complexity}
            onChange={(complexity) =>
              setDraft((prev) => ({
                ...prev,
                vocabulary: { ...prev.vocabulary, complexity },
              }))
            }
          />
          <TextField
            id="vocabulary-jargon"
            label="Jargon"
            value={draft.vocabulary.jargon}
            onChange={(jargon) =>
              setDraft((prev) => ({
                ...prev,
                vocabulary: { ...prev.vocabulary, jargon },
              }))
            }
          />
        </div>
        <EditableTagList
          items={draft.vocabulary.preferences}
          addLabel="Add a vocabulary preference"
          onChange={(preferences) =>
            setDraft((prev) => ({
              ...prev,
              vocabulary: { ...prev.vocabulary, preferences },
            }))
          }
        />
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-surface p-6">
        <h2 className="font-semibold text-text">Structure</h2>
        <div className="space-y-3">
          <TextField
            id="structure-paragraph-style"
            label="Paragraph style"
            value={draft.structure.paragraphStyle}
            onChange={(paragraphStyle) =>
              setDraft((prev) => ({
                ...prev,
                structure: { ...prev.structure, paragraphStyle },
              }))
            }
          />
          <TextField
            id="structure-bullet-usage"
            label="Bullet usage"
            value={draft.structure.bulletUsage}
            onChange={(bulletUsage) =>
              setDraft((prev) => ({
                ...prev,
                structure: { ...prev.structure, bulletUsage },
              }))
            }
          />
        </div>
        <EditableTagList
          items={draft.structure.preferredFormat}
          addLabel="Add a preferred format"
          onChange={(preferredFormat) =>
            setDraft((prev) => ({
              ...prev,
              structure: { ...prev.structure, preferredFormat },
            }))
          }
        />
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-surface p-6">
        <h2 className="font-semibold text-text">Explanation style</h2>
        <EditableTagList
          items={draft.explanationStyle.approach}
          addLabel="Add an explanation approach"
          onChange={(approach) =>
            setDraft((prev) => ({
              ...prev,
              explanationStyle: { ...prev.explanationStyle, approach },
            }))
          }
        />
        <div className="space-y-2">
          <CheckboxField
            label="Uses examples"
            checked={draft.explanationStyle.examples}
            onChange={(examples) =>
              setDraft((prev) => ({
                ...prev,
                explanationStyle: { ...prev.explanationStyle, examples },
              }))
            }
          />
          <CheckboxField
            label="Uses analogies"
            checked={draft.explanationStyle.analogies}
            onChange={(analogies) =>
              setDraft((prev) => ({
                ...prev,
                explanationStyle: { ...prev.explanationStyle, analogies },
              }))
            }
          />
          <CheckboxField
            label="Shows its reasoning"
            checked={draft.explanationStyle.reasoning}
            onChange={(reasoning) =>
              setDraft((prev) => ({
                ...prev,
                explanationStyle: { ...prev.explanationStyle, reasoning },
              }))
            }
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-border bg-surface p-6">
          <h2 className="font-semibold text-text">Tendencies</h2>
          <EditableTagList
            items={draft.tendencies}
            addLabel="Add a tendency"
            onChange={(tendencies) =>
              setDraft((prev) => ({ ...prev, tendencies }))
            }
          />
        </div>
        <div className="space-y-3 rounded-xl border border-border bg-surface p-6">
          <h2 className="font-semibold text-text">Avoid</h2>
          <EditableTagList
            items={draft.avoid}
            addLabel="Add something to avoid"
            onChange={(avoid) => setDraft((prev) => ({ ...prev, avoid }))}
          />
        </div>
      </div>
    </section>
  );
}
