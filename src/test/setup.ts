import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

/** Newer Node versions expose an incomplete global `localStorage` that shadows jsdom's; use a plain in-memory one. */
function createMemoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => void data.delete(key),
    setItem: (key, value) => void data.set(key, String(value)),
  };
}

// Re-installed before each test because `vi.unstubAllGlobals()` would otherwise restore the broken one.
beforeEach(() => {
  vi.stubGlobal('localStorage', createMemoryStorage());
  vi.stubGlobal('sessionStorage', createMemoryStorage());
});

// Vitest runs without globals, so Testing Library's automatic cleanup is wired up by hand.
afterEach(cleanup);
