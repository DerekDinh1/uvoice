// Pulls a JSON object out of a model response. Handles clean JSON, code fences,
// and prose wrapped around the object. Throws when nothing parses.
export function extractJsonObject(raw: string): unknown {
  const trimmed = raw.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    // fall through to brace extraction
  }

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start !== -1 && end > start) {
    try {
      return JSON.parse(trimmed.slice(start, end + 1));
    } catch {
      // fall through to error
    }
  }

  throw new Error('No JSON object found in the model response.');
}
