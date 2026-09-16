// Triggers a browser download of in-memory text, with no server round trip.
// Used to save the generated system prompt and style-profile doc as .md files.
// Returns false rather than throwing if the Blob/anchor path fails, so the
// caller can show its own feedback without wrapping every call in try/catch.
export function downloadTextFile(
  filename: string,
  text: string,
  type = 'text/markdown',
): boolean {
  try {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    return true;
  } catch {
    return false;
  }
}
