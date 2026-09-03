import { describe, it, expect } from 'vitest';
import { extractJsonObject } from './json';

describe('extractJsonObject', () => {
  it('parses clean JSON', () => {
    expect(extractJsonObject('{"a":1}')).toEqual({ a: 1 });
  });

  it('extracts JSON wrapped in prose and code fences', () => {
    const raw = 'Sure!\n```json\n{"a":2}\n```\nHope that helps.';
    expect(extractJsonObject(raw)).toEqual({ a: 2 });
  });

  it('throws when there is no JSON object', () => {
    expect(() => extractJsonObject('no json here')).toThrow();
  });
});
