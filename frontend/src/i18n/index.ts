import { useCallback, useEffect, useState } from 'react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { defaultNS, enResources, esResources, namespaces } from './resources';

export const SUPPORTED_LANGUAGES = ['en', 'es'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

const STORAGE_KEY = 'app-language';

function isLanguage(value: unknown): value is Language {
  return value === 'en' || value === 'es';
}

export function readStoredLanguage(): Language {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLanguage(stored)) return stored;
  } catch {
    // Storage unavailable (private mode, blocked cookies) — fall back.
  }
  return 'en';
}

/**
 * Resources are bundled, not fetched: there is no backend, both locales are
 * small, and shipping them inline removes the Suspense boundary and the
 * first-paint flash of untranslated keys.
 */
void i18n.use(initReactI18next).init({
  resources: { en: enResources, es: esResources },
  lng: readStoredLanguage(),
  fallbackLng: 'en',
  defaultNS,
  ns: namespaces,
  interpolation: { escapeValue: false }, // React escapes already
  returnNull: false,
  react: { useSuspense: false },
});

export function applyLanguage(language: Language): void {
  document.documentElement.lang = language;
}

applyLanguage(readStoredLanguage());

/**
 * Shared language state. Mirrors `lib/theme.ts`: persists to localStorage and
 * reflects onto <html lang> so the document advertises the language it renders.
 */
export function useLanguage(): [Language, (next: Language) => void] {
  const [language, setLanguageState] = useState<Language>(() => {
    const current = i18n.resolvedLanguage;
    return isLanguage(current) ? current : readStoredLanguage();
  });

  useEffect(() => {
    function onLanguageChanged(next: string) {
      if (isLanguage(next)) setLanguageState(next);
    }
    i18n.on('languageChanged', onLanguageChanged);
    return () => {
      i18n.off('languageChanged', onLanguageChanged);
    };
  }, []);

  const setLanguage = useCallback((next: Language) => {
    if (!isLanguage(next)) return;
    void i18n.changeLanguage(next);
    applyLanguage(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage unavailable — the language still applies for this session.
    }
  }, []);

  return [language, setLanguage];
}

export default i18n;
