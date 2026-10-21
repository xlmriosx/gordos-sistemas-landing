import enUi from './locales/en/ui.json';
import esUi from './locales/es/ui.json';

/**
 * A single `ui` namespace: this package ships components, not screens, so
 * there is no per-surface vocabulary to keep separate.
 */
export const namespaces = ['ui'] as const;

export const defaultNS = 'ui' as const;

/** EN is the source of truth for the key types — see react-i18next.d.ts. */
export const enResources = {
  ui: enUi,
} as const;

export const esResources = {
  ui: esUi,
};
