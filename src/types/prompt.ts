// Output of the deterministic prompt generator (Phase 5): a system prompt an
// AI assistant can follow, plus a human-readable summary of the same profile.
export interface GeneratedPrompt {
  systemPrompt: string;
  styleProfileDoc: string;
}
