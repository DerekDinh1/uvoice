// Adds jest-dom matchers (e.g. toBeInTheDocument) to Vitest's expect.
import '@testing-library/jest-dom';

// jsdom in this environment does not ship a localStorage implementation, which
// the persisted Zustand stores rely on. Provide a minimal in-memory one so
// persistence behaves the same in tests as in the browser.
class MemoryStorage {
  private store = new Map<string, string>();
  get length() {
    return this.store.size;
  }
  clear() {
    this.store.clear();
  }
  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null;
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  setItem(key: string, value: string) {
    this.store.set(key, String(value));
  }
}

if (!globalThis.localStorage) {
  Object.defineProperty(globalThis, 'localStorage', {
    value: new MemoryStorage() as unknown as Storage,
    writable: true,
  });
}

// jsdom also lacks matchMedia, which the theme logic queries. Stub it to report
// a light OS preference so theme resolution is deterministic in tests.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}
