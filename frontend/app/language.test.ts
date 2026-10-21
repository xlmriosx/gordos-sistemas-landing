/**
 * Which language the app opens in: a stored choice, else the browser's, else
 * English. The browser's is applied and never stored.
 */
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import i18n, { useLanguage } from '../src/i18n';
import { applyStartingLanguage, pickLanguage } from './language';

describe('pickLanguage', () => {
  it('takes a stored choice over the browser', () => {
    expect(pickLanguage('en', ['es-MX', 'es'])).toBe('en');
    expect(pickLanguage('es', ['en-US'])).toBe('es');
  });

  it('takes the first browser language it supports, region and case aside', () => {
    expect(pickLanguage(null, ['ES-419', 'en'])).toBe('es');
    expect(pickLanguage(null, ['pt-BR', 'en-GB', 'es'])).toBe('en');
  });

  it('falls back to English', () => {
    expect(pickLanguage(null, ['pt-BR', 'fr'])).toBe('en');
    expect(pickLanguage(null, [])).toBe('en');
  });

  it('ignores a stored value that is not a language', () => {
    expect(pickLanguage('klingon', ['es-AR'])).toBe('es');
  });
});

describe('applyStartingLanguage', () => {
  afterEach(async () => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    await i18n.changeLanguage('en');
  });

  it('opens in the browser language and does not store it', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['es-CL', 'en']);
    applyStartingLanguage();
    expect(i18n.language).toBe('es');
    expect(document.documentElement.lang).toBe('es');
    expect(window.localStorage.getItem('app-language')).toBeNull();
  });

  it('reads the key the kit switcher writes', () => {
    // Writes through src/i18n's own setter, so a renamed key fails here.
    const { result } = renderHook(() => useLanguage());
    act(() => result.current[1]('en'));
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['es-ES']);
    applyStartingLanguage();
    expect(i18n.language).toBe('en');
  });
});
