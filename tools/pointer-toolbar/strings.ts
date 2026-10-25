/**
 * Every word the pointer toolbar puts on screen, in the two languages a developer
 * can be talking to the agent in.
 *
 * WHO CHOOSES
 *
 * Whoever starts the preview, through `VITE_DEV_TOOLS_LANGUAGE` (`es` or
 * `en`). The agent knows which language the conversation is in; this file does
 * not, and guessing from the browser would get it wrong for exactly the person it
 * is for — a developer whose OS is in one language and who talks to the agent in the
 * other. Absent, or anything that is not `en`, means Spanish, which is what this
 * bar has always said. Nothing in the repo sets it: like `APP_HANDLER_PORT`, it
 * belongs to the session that runs the dev server, never to a file.
 *
 * WHY NOT THE APP'S OWN i18n
 *
 * `frontend/src/i18n` is the language of the app being built, which the developer
 * switches from inside that app to see how it reads. This is the language of the
 * session around it. They are two different people's choices — the app's end user
 * and the developer — and routing this bar through the app's i18next instance would
 * make flipping the app to English flip the tooling too, or worse, make a tool
 * that must never reach production depend on something that does. So this is a
 * plain object, read once, and the app's `app-language` key never hears of it.
 *
 * WHY THE SESSION BAR HAS ITS OWN COPY OF THE LOOKUP
 *
 * `tools/session-bar/strings.ts` repeats the three lines that read the variable
 * rather than importing them from here. Two tools that import each other trip the
 * package-boundary signal, the same reason they talk through a DOM
 * contract instead of shared code. The variable name is the contract; each side
 * reads it on its own.
 *
 * WHAT IS NEVER HERE
 *
 * Anything in the copied payload. `AnnotationPanel.tsx` copies
 * `JSON.stringify(payload())`, and the agent receiving the paste parses it:
 * its keys, `action: 'point'`, the selector, the element's own text and the box
 * are the same whatever language the bar speaks. Only `copied()` below — the line
 * the developer reads after copying — changes.
 */

export type DevLanguage = 'es' | 'en';

export type PointerToolbarStrings = {
  /** The bar's accessible name. A brand, so it does not translate. */
  toolbarLabel: string;
  pointTool: string;
  pointToolTitle: string;
  notes: string;
  hideBar: string;
  showBar: string;
  composerLabel: string;
  composerPlaceholder: string;
  cancel: string;
  save: string;
  /** The onboarding sentence the panel shows until it has been read once. */
  panelOnboarding: string;
  /** What an empty panel says after that. */
  panelEmpty: string;
  removeNote: string;
  pasteHint: string;
  clearAll: string;
  /** The Copiar button's word; the count beside it is not a string to translate. */
  copy: string;
  copyFailed: string;
  /** Shown in place of an anchor when the element pointed at has no text. */
  anchorFallback: string;
  /** The toast after copying. `head` is the developer's own words, never translated. */
  copied: (head: string, more: number) => string;
};

const es: PointerToolbarStrings = {
  toolbarLabel: 'App',
  pointTool: 'Señalar',
  pointToolTitle: 'Señalar algo en la pantalla (Esc para salir)',
  notes: 'Notas',
  hideBar: 'Ocultar la barra',
  showBar: 'Mostrar la barra',
  composerLabel: 'Nota',
  composerPlaceholder: '¿Qué quieres cambiar aquí?',
  cancel: 'Cancelar',
  save: 'Guardar',
  panelOnboarding:
    'Toca Señalar y marca algo en la pantalla. Puedes marcar varias cosas antes de copiar.',
  panelEmpty: 'Todavía no marcaste nada.',
  removeNote: 'Quitar esta nota',
  pasteHint: 'Pega este mensaje en la conversación para realizar los cambios.',
  clearAll: 'Borrar todo',
  copy: 'Copiar',
  copyFailed: 'No pude copiar. Prueba de nuevo.',
  anchorFallback: 'un punto de la pantalla',
  copied: (head, more) =>
    `Copiado: ${head}${more > 0 ? ` · y ${more} más` : ''} · pégalo en la conversación`,
};

const en: PointerToolbarStrings = {
  toolbarLabel: 'App',
  pointTool: 'Point',
  pointToolTitle: 'Point at something on screen (Esc to exit)',
  notes: 'Notes',
  hideBar: 'Hide the bar',
  showBar: 'Show the bar',
  composerLabel: 'Note',
  composerPlaceholder: 'What do you want to change here?',
  cancel: 'Cancel',
  save: 'Save',
  panelOnboarding:
    'Press Point and mark something on screen. You can mark several things before copying.',
  panelEmpty: "You haven't marked anything yet.",
  removeNote: 'Remove this note',
  pasteHint: 'Paste this message into the conversation to make the changes.',
  clearAll: 'Clear all',
  copy: 'Copy',
  copyFailed: "Couldn't copy. Try again.",
  anchorFallback: 'a point on the screen',
  copied: (head, more) =>
    `Copied: ${head}${more > 0 ? ` · and ${more} more` : ''} · paste it into the conversation`,
};

export const DICTIONARIES: Record<DevLanguage, PointerToolbarStrings> = { es, en };

/**
 * `en` exactly, or Spanish. Not lenient on purpose: `EN`, `en-US` or a typo fall
 * back to today's behaviour rather than to a guess, so a wrong value is visible as
 * "still in Spanish" instead of as something half-translated.
 */
export function resolveLanguage(value: unknown): DevLanguage {
  return value === 'en' ? 'en' : 'es';
}

/**
 * Optional chaining because `import.meta.env` is Vite's, and this file is also
 * bundled by `test/build.mjs` with esbuild for node, where `import.meta` is an
 * empty object. There it reads as absent, which is Spanish — what those
 * scenarios assert against.
 */
export const LANGUAGE = resolveLanguage(import.meta.env?.VITE_DEV_TOOLS_LANGUAGE);

export const t: PointerToolbarStrings = DICTIONARIES[LANGUAGE];
