import { Link } from 'react-router-dom';
import { ROUTES } from '../config';

export function WelcomePage() {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-text">
          Discover your writing style
        </h1>
        <p className="max-w-xl text-muted">
          Answer a short set of writing exercises. Uvoice reads how you
          naturally write and turns it into a reusable system prompt you can hand
          to any AI assistant, so its replies sound like you.
        </p>
      </div>

      <Link
        to={ROUTES.assessment}
        className="inline-flex items-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90"
      >
        Start assessment
      </Link>
    </section>
  );
}
