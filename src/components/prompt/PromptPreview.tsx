import { useEffect, useRef, useState } from 'react';
import { buttonClass } from '../ui/buttonStyles';
import { downloadTextFile } from '../../lib/download';

interface PromptPreviewProps {
  title: string;
  description: string;
  content: string;
  filename: string;
}

// How long the Copy button shows "Copied" before reverting.
const COPIED_RESET_MS = 2000;

// One generated document (the system prompt or the style-profile doc), shown
// as a scrollable monospace preview with buttons to copy it to the clipboard
// or download it as a Markdown file.
export function PromptPreview({
  title,
  description,
  content,
  filename,
}: PromptPreviewProps) {
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, []);

  const handleCopy = () => {
    void navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      if (resetTimer.current) clearTimeout(resetTimer.current);
      resetTimer.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
    });
  };

  const handleDownload = () => {
    downloadTextFile(filename, content);
  };

  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="font-semibold text-text">{title}</h2>
          <p className="text-sm text-muted">{description}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCopy}
            aria-label={`Copy ${title.toLowerCase()}`}
            className={buttonClass('secondary')}
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            aria-label={`Download ${title.toLowerCase()}`}
            className={buttonClass('outline')}
          >
            Download
          </button>
        </div>
      </div>
      <pre className="max-h-96 overflow-auto rounded-md border border-border bg-bg p-4 text-xs text-text">
        <code className="block w-max min-w-full whitespace-pre">{content}</code>
      </pre>
    </div>
  );
}
