import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAnalysisStore } from '../store/useAnalysisStore';
import { ROUTES } from '../config';
import { generatePrompts } from '../services/promptGenerator';
import { PromptPreview } from '../components/prompt/PromptPreview';

// Turns the current writing-style profile into a system prompt and a
// readable summary, both regenerated live from the store so profile edits
// (Phase 4) show up here immediately.
export function PromptPage() {
  const profile = useAnalysisStore((state) => state.profile);
  const generated = useMemo(
    () => (profile ? generatePrompts(profile) : null),
    [profile],
  );

  if (!profile || !generated) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight text-text">
          Prompt
        </h1>
        <p className="max-w-xl text-muted">
          A ready-to-use system prompt and a readable style summary, built from
          your writing-style profile.
        </p>
        <div className="space-y-3 rounded-lg border border-dashed border-border bg-surface p-8 text-center text-sm text-muted">
          <p>
            No profile yet. Answer the assessment and analyze your responses
            before generating a prompt.
          </p>
          <Link
            to={ROUTES.assessment}
            className="inline-block font-medium text-accent underline"
          >
            Go to the assessment
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-text">
          Prompt
        </h1>
        <p className="max-w-xl text-muted">
          Generated from your current writing-style profile. Editing the profile
          updates both documents below.
        </p>
      </div>

      <PromptPreview
        title="System Prompt"
        description="Markdown instructions for an AI assistant's system prompt or custom instructions."
        content={generated.systemPrompt}
        filename="system-prompt.md"
      />

      <PromptPreview
        title="Style Profile"
        description="A readable summary of your writing style, for your own reference."
        content={generated.styleProfileDoc}
        filename="style-profile.md"
      />
    </section>
  );
}
