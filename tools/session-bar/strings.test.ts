import { afterEach, describe, expect, it, vi } from 'vitest';
import { readStoredLanguage } from '../../frontend/src/i18n';
import { DICTIONARIES, resolveLanguage } from './strings';

/**
 * Same shape as `tools/pointer-toolbar/strings.test.ts`, and deliberately not
 * sharing a helper with it: the two tools share no code, tests included.
 * Run by frontend's `npm test`.
 */

const VAR = 'VITE_DEV_TOOLS_LANGUAGE';

async function freshStrings() {
  vi.resetModules();
  return import('./strings');
}

afterEach(() => {
  vi.unstubAllEnvs();
  window.localStorage.clear();
});

describe('session bar strings', () => {
  const [es, en] = [DICTIONARIES.es, DICTIONARIES.en];

  it('has the same keys in es and en, and none of them empty', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(es).sort());
    for (const [language, dictionary] of Object.entries(DICTIONARIES)) {
      for (const [key, value] of Object.entries(dictionary)) {
        expect(value.trim(), `${language}.${key}`).not.toBe('');
      }
    }
  });

  it('keeps the Spanish wording exactly as the bar has always said it', () => {
    expect(es.renameTitle).toBe('Cambiar el nombre de la app');
    expect(es.hidePointer).toBe('Ocultar Señalar');
    expect(es.unsaved).toBe('sin guardar');
  });

  it('is Spanish unless the variable is exactly "en"', () => {
    for (const value of [undefined, '', 'es', 'EN', 'en-US']) expect(resolveLanguage(value)).toBe('es');
    expect(resolveLanguage('en')).toBe('en');
  });

  it('speaks English when whoever starts the preview sets the variable to en', async () => {
    vi.stubEnv(VAR, 'en');
    const { LANGUAGE, t } = await freshStrings();
    expect(LANGUAGE).toBe('en');
    expect(t.renameTitle).toBe('Rename the app');
  });

  it('is independent of the app language, in both directions', async () => {
    window.localStorage.setItem('app-language', 'en');
    expect((await freshStrings()).LANGUAGE).toBe('es');

    window.localStorage.setItem('app-language', 'es');
    vi.stubEnv(VAR, 'en');
    expect((await freshStrings()).LANGUAGE).toBe('en');
    expect(readStoredLanguage()).toBe('es');
  });
});
