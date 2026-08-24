import type { AssessmentQuestion } from '../../types/assessment';
import { useAppStore } from '../../store/useAppStore';
import { ResponseInput } from './ResponseInput';

interface QuestionCardProps {
  question: AssessmentQuestion;
}

export function QuestionCard({ question }: QuestionCardProps) {
  const value = useAppStore(
    (state) => state.responses[question.id]?.text ?? '',
  );
  const setResponse = useAppStore((state) => state.setResponse);

  return (
    <article className="space-y-4 rounded-xl border border-border bg-surface p-6 shadow-sm">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-text">
          {question.title}
        </h2>
        <p className="text-muted">{question.prompt}</p>
        {question.suggestedLength && (
          <p className="text-sm text-muted opacity-80">
            Suggested length: {question.suggestedLength}
          </p>
        )}
      </div>

      <ResponseInput
        value={value}
        onChange={(text) => setResponse(question.id, text)}
      />
    </article>
  );
}
