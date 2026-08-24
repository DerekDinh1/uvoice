import { Link } from 'react-router-dom';
import { ROUTES } from '../config';

export function WelcomePage() {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          Discover your writing style
        </h1>
        <p className="max-w-xl text-slate-600">
          Prompt Architect interviews you with a short set of writing exercises,
          analyzes how you naturally write, and turns the result into a reusable
          system prompt you can hand to any AI assistant.
        </p>
      </div>

      <Link
        to={ROUTES.assessment}
        className="inline-flex items-center rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-700"
      >
        Start assessment
      </Link>

      <p className="text-sm text-slate-500">
        Phase 1 placeholder &mdash; the assessment flow is built in Phase 2.
      </p>
    </section>
  );
}
