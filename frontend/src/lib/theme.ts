import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'app-theme';

export function readStoredTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {
    // Storage unavailable (private mode, blocked cookies) — fall back.
  }
  return 'light';
}

export function applyTheme(theme: Theme): void {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

/** Shared light/dark theme. Persists on <html data-theme> and localStorage. */
export function useTheme(): [Theme, (next: Theme) => void] {
  const [theme, setThemeState] = useState<Theme>(() => readStoredTheme());

  useEffect(() => {
    applyTheme(theme);
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Storage unavailable — the theme still applies for this session.
    }
  }, [theme]);

  function setTheme(next: Theme) {
    if (next !== 'light' && next !== 'dark') return;
    setThemeState(next);
  }

  return [theme, setTheme];
}
