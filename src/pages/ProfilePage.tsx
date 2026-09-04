import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAnalysisStore } from '../store/useAnalysisStore';
import { ROUTES } from '../config';
import { ProfileView } from '../components/profile/ProfileView';
import { ProfileEditor } from '../components/profile/ProfileEditor';

type Mode = 'view' | 'edit';

// Renders the generated writing-style profile, either as a read-only view or,
// once "Edit profile" is clicked, an editable form. Edits stay local to the
// editor (a draft) until Save writes them back to the store.
export function ProfilePage() {
  const profile = useAnalysisStore((state) => state.profile);
  const updateProfile = useAnalysisStore((state) => state.updateProfile);
  const [mode, setMode] = useState<Mode>('view');

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

  if (mode === 'edit') {
    return (
      <ProfileEditor
        profile={profile}
        onSave={(updated) => {
          updateProfile(updated);
          setMode('view');
        }}
        onCancel={() => setMode('view')}
      />
    );
  }

  return <ProfileView profile={profile} onEdit={() => setMode('edit')} />;
}
