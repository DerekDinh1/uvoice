import { Link } from 'react-router-dom';
import { useAnalysisStore } from '../store/useAnalysisStore';
import { STYLE_DIMENSIONS } from '../types/styleProfile';
import { ROUTES } from '../config';
import { ScoreMeter } from '../components/profile/ScoreMeter';
import { TagList } from '../components/profile/TagList';

// Read-only render of the generated writing-style profile. Inline editing is
// out of scope here; that lands in a later phase.
export function ProfilePage() {
  const profile = useAnalysisStore((state) => state.profile);

  if (!profile) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight text-text">
          Profile
        </h1>
        <p className="max-w-xl text-muted">
          Your writing-style profile, once you have one: scores, voice, tone,
          structure, tendencies, and what to avoid.
        </p>
        <div className="space-y-3 rounded-lg border border-dashed border-border bg-surface p-8 text-center text-sm text-muted">
          <p>
            No profile yet. Answer the assessment and analyze your responses to
            build one.
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
          Profile
        </h1>
        <p className="max-w-xl text-muted">
          A read-only view of your writing-style profile, generated from your
          assessment answers.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-surface p-6">
        <h2 className="font-semibold text-text">Scores</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {STYLE_DIMENSIONS.map((dimension) => (
            <ScoreMeter
              key={dimension.key}
              label={dimension.label}
              score={profile[dimension.key]}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-border bg-surface p-6">
          <h2 className="font-semibold text-text">Voice</h2>
          <TagList items={profile.voice} />
        </div>
        <div className="space-y-3 rounded-xl border border-border bg-surface p-6">
          <h2 className="font-semibold text-text">Tone</h2>
          <TagList items={profile.tone} />
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-surface p-6">
        <h2 className="font-semibold text-text">Sentence style</h2>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="font-medium text-text">Typical length</dt>
            <dd className="text-muted">
              {profile.sentenceStyle.typicalLength}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-text">Complexity</dt>
            <dd className="text-muted">{profile.sentenceStyle.complexity}</dd>
          </div>
          <div>
            <dt className="font-medium text-text">Rhythm</dt>
            <dd className="text-muted">{profile.sentenceStyle.rhythm}</dd>
          </div>
        </dl>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-surface p-6">
        <h2 className="font-semibold text-text">Vocabulary</h2>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="font-medium text-text">Complexity</dt>
            <dd className="text-muted">{profile.vocabulary.complexity}</dd>
          </div>
          <div>
            <dt className="font-medium text-text">Jargon</dt>
            <dd className="text-muted">{profile.vocabulary.jargon}</dd>
          </div>
        </dl>
        <TagList items={profile.vocabulary.preferences} />
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-surface p-6">
        <h2 className="font-semibold text-text">Structure</h2>
        <dl className="space-y-2 text-sm">
          <div>
            <dt className="font-medium text-text">Paragraph style</dt>
            <dd className="text-muted">{profile.structure.paragraphStyle}</dd>
          </div>
          <div>
            <dt className="font-medium text-text">Bullet usage</dt>
            <dd className="text-muted">{profile.structure.bulletUsage}</dd>
          </div>
        </dl>
        <TagList items={profile.structure.preferredFormat} />
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-surface p-6">
        <h2 className="font-semibold text-text">Explanation style</h2>
        <TagList items={profile.explanationStyle.approach} />
        <ul className="space-y-1 text-sm text-muted">
          <li>
            {profile.explanationStyle.examples
              ? 'Uses examples'
              : 'Rarely uses examples'}
          </li>
          <li>
            {profile.explanationStyle.analogies
              ? 'Uses analogies'
              : 'Rarely uses analogies'}
          </li>
          <li>
            {profile.explanationStyle.reasoning
              ? 'Shows its reasoning'
              : 'Rarely shows its reasoning'}
          </li>
        </ul>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-border bg-surface p-6">
          <h2 className="font-semibold text-text">Tendencies</h2>
          <TagList items={profile.tendencies} />
        </div>
        <div className="space-y-3 rounded-xl border border-border bg-surface p-6">
          <h2 className="font-semibold text-text">Avoid</h2>
          <TagList items={profile.avoid} />
        </div>
      </div>
    </section>
  );
}
