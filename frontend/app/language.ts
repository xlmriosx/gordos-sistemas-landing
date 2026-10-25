import i18n, { applyLanguage, type Language } from '../src/i18n';

/**
 * The language the app opens in.
 *
 * `src/i18n` starts in English unless a language was stored, which is right for
 * the design system on its own and wrong for an app whose people mostly read
 * Spanish. This picks the browser's language instead, and leaves `src/` exactly
 * as it was promoted from the design system's repo.
 *
 * Order, first match wins:
 *
 * 1. A language stored under `app-language`: someone chose it, in this app,
 *    with the kit's own switcher. The key is `src/i18n`'s; it is not exported,
 *    so it is repeated here, and `language.test.ts` writes it through the kit's
 *    own setter to keep the two in step.
 * 2. The browser's languages, in order: the first `es*` or `en*` decides.
 * 3. English.
 *
 * The browser's choice is applied and never stored, so a person who changes
 * their browser's language gets the app in the new one next time.
 */
const STORAGE_KEY = 'app-language';

function asLanguage(tag: string | null | undefined): Language | undefined {
  const primary = tag?.trim().toLowerCase().split('-')[0];
  return primary === 'es' || primary === 'en' ? primary : undefined;
}

function readStored(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Exported for `language.test.ts`: the decision, without a browser around it. */
export function pickLanguage(stored: string | null, browser: readonly string[]): Language {
  if (stored === 'es' || stored === 'en') return stored;
  for (const tag of browser) {
    const language = asLanguage(tag);
    if (language) return language;
  }
  return 'en';
}

/** Run once, before the first render, from `main.tsx`. */
export function applyStartingLanguage(): void {
  const browser = navigator.languages?.length ? navigator.languages : [navigator.language];
  const language = pickLanguage(readStored(), browser);
  if (i18n.language !== language) void i18n.changeLanguage(language);
  applyLanguage(language);
}
