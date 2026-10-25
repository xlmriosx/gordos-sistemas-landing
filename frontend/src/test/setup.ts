import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '../i18n';

/**
 * jsdom implements neither observer the app relies on: ResizeObserver drives
 * MessageScroller's auto-follow and Recharts' ResponsiveContainer, and
 * IntersectionObserver drives MessageScroller's visibility tracking. Stub both
 * so mounting a view doesn't throw — the tests assert rendering, not layout.
 */
class NoopObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): [] {
    return [];
  }
}

globalThis.ResizeObserver ??= NoopObserver as unknown as typeof ResizeObserver;
globalThis.IntersectionObserver ??= NoopObserver as unknown as typeof IntersectionObserver;

// Radix and react-day-picker both read matchMedia during mount.
globalThis.matchMedia ??= ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
})) as unknown as typeof matchMedia;

// jsdom has no layout engine, so these are no-ops rather than real scrolling.
Element.prototype.scrollIntoView ??= () => {};
Element.prototype.scrollTo ??= () => {};

afterEach(() => {
  cleanup();
});
