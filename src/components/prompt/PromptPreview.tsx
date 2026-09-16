import { useEffect, useRef, useState } from 'react';
import { buttonClass } from '../ui/buttonStyles';
import { downloadTextFile } from '../../lib/download';

interface PromptPreviewProps {
  title: string;
  description: string;
  content: string;
  filename: string;
}

// How long the Copy/Download buttons show their confirmation label before
// reverting.
const CONFIRMATION_RESET_MS = 2000;

// Selects the full contents of the preview <pre>, so a failed clipboard copy
// still leaves the user able to copy manually with Ctrl/Cmd+C.
function selectPreContents(pre: HTMLPreElement): void {
  try {
    const selection = window.getSelection?.();
    if (!selection) return;
    const range = document.createRange();
    range.selectNodeContents(pre);
    selection.removeAllRanges();
    selection.addRange(range);
  } catch {
    // Selection is a best-effort fallback; a failure here should not mask
    // the copy error itself.
  }
}

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
  const [copyError, setCopyError] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [downloadError, setDownloadError] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);
  const copyResetTimer = useRef<ReturnType<typeof setTimeout>>();
  const downloadResetTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => {
      if (copyResetTimer.current) clearTimeout(copyResetTimer.current);
      if (downloadResetTimer.current) clearTimeout(downloadResetTimer.current);
    };
  }, []);

  // Copy is the app's primary action here, so a failure must never be silent:
  // guard against browsers (or insecure contexts) with no Clipboard API, and
  // fall back to selecting the text so the user can still copy it by hand.
  const handleCopy = async () => {
    setCopyError(false);
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable');
      }
      await navigator.clipboard.writeText(content);
      setCopied(true);
      if (copyResetTimer.current) clearTimeout(copyResetTimer.current);
      copyResetTimer.current = setTimeout(
        () => setCopied(false),
        CONFIRMATION_RESET_MS,
      );
    } catch {
      setCopyError(true);
      if (preRef.current) selectPreContents(preRef.current);
    }
  };

  const handleDownload = () => {
    setDownloadError(false);
    const succeeded = downloadTextFile(filename, content);
    if (!succeeded) {
      setDownloadError(true);
      return;
    }
    setDownloaded(true);
    if (downloadResetTimer.current) clearTimeout(downloadResetTimer.current);
    downloadResetTimer.current = setTimeout(
      () => setDownloaded(false),
      CONFIRMATION_RESET_MS,
    );
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
            {downloaded ? 'Downloaded' : 'Download'}
          </button>
        </div>
      </div>
      {copyError && (
        <p role="alert" className="text-sm text-danger">
          Could not copy. Select the text and copy manually.
        </p>
      )}
      {downloadError && (
        <p role="alert" className="text-sm text-danger">
          Could not download. Copy the text instead.
        </p>
      )}
      <pre
        ref={preRef}
        className="max-h-96 overflow-auto rounded-md border border-border bg-bg p-4 text-xs text-text"
      >
        <code className="block w-max min-w-full whitespace-pre">{content}</code>
      </pre>
    </div>
  );
}
