import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../src/index.css';
import '../src/i18n';
import { applyTheme, readStoredTheme } from '../src/lib/theme';
import { App } from './App';
import { AppProviders } from './AppProviders';
import { applyStartingLanguage } from './language';

applyTheme(readStoredTheme());
applyStartingLanguage();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
