import { useAppStore, countAnswered } from '../store/useAppStore';
import { QUESTIONS } from '../data/questions';
import { ProgressBar } from '../components/assessment/ProgressBar';
import { QuestionCard } from '../components/assessment/QuestionCard';
import { AssessmentNav } from '../components/assessment/AssessmentNav';

export function AssessmentPage() {
  const currentIndex = useAppStore((state) => state.currentIndex);
  const responses = useAppStore((state) => state.responses);

  const question = QUESTIONS[currentIndex];
  const allAnswered = countAnswered(responses) === QUESTIONS.length;

  return (
    <section className="space-y-6">
      <ProgressBar />
      <QuestionCard question={question} />
      <AssessmentNav />

      {allAnswered && (
        <p className="rounded-md bg-success-bg px-4 py-3 text-sm text-success-text">
          All twelve answered. Style analysis arrives in Phase 3.
        </p>
      )}
    </section>
  );
}
