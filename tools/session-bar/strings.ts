/**
 * Every word the session bar puts on screen, in Spanish and English.
 *
 * Chosen by `VITE_DEV_TOOLS_LANGUAGE` (`es` | `en`), set by whoever starts
 * the preview; absent or anything else is Spanish. It is the developer's language,
 * not the app's, so it never goes through `frontend/src/i18n` — see
 * `tools/pointer-toolbar/strings.ts`, which states the reasons once.
 *
 * The lookup is repeated here rather than imported from there on purpose: the
 * two tools share a variable name and a DOM contract, never code.
 *
 * The app's name is not in here and never will be. It is the developer's own
 * words, passed in as a prop, and it reads the same in any language.
 */

export type DevLanguage = 'es' | 'en';

export type SessionBarStrings = {
  /** The bar's accessible name. A brand, so it does not translate. */
  barLabel: string;
  renameTitle: string;
  nameLabel: string;
  unsaved: string;
  /** The pointer toolbar's toggle. It names the tool by the word that tool uses. */
  hidePointer: string;
  showPointer: string;
};

const es: SessionBarStrings = {
  barLabel: 'App',
  renameTitle: 'Cambiar el nombre de la app',
  nameLabel: 'Nombre de la app',
  unsaved: 'sin guardar',
  hidePointer: 'Ocultar Señalar',
  showPointer: 'Mostrar Señalar',
};

const en: SessionBarStrings = {
  barLabel: 'App',
  renameTitle: 'Rename the app',
  nameLabel: 'App name',
  unsaved: 'unsaved',
  hidePointer: 'Hide Point',
  showPointer: 'Show Point',
};

export const DICTIONARIES: Record<DevLanguage, SessionBarStrings> = { es, en };

/** `en` exactly, or Spanish — the same rule, and the same reasons, as the pointer toolbar's. */
export function resolveLanguage(value: unknown): DevLanguage {
  return value === 'en' ? 'en' : 'es';
}

export const LANGUAGE = resolveLanguage(import.meta.env?.VITE_DEV_TOOLS_LANGUAGE);

export const t: SessionBarStrings = DICTIONARIES[LANGUAGE];
