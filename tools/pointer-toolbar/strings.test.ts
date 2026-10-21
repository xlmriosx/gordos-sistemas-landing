import { afterEach, describe, expect, it, vi } from 'vitest';
import { readStoredLanguage } from '../../frontend/src/i18n';
import { DICTIONARIES, resolveLanguage } from './strings';
import type { Annotation } from './context';
import { DICTIONARIES as SESSION_BAR } from '../session-bar/strings';

/**
 * Run by frontend's `npm test` (its vitest include reaches `../tools/`), because
 * tools/ has no runner of its own for plain unit tests: `test/` is the jsdom
 * lifecycle suite, and a key-parity check does not belong in a harness built to
 * catch leaked listeners.
 *
 * The import from frontend/src/i18n is the allowed direction — tools/ may read
 * frontend/, never the reverse — and it is here only to prove the two languages
 * do not know about each other.
 */

const VAR = 'VITE_DEV_TOOLS_LANGUAGE';

/** `strings.ts` reads the variable once, at module evaluation, like it does under Vite. */
async function freshStrings() {
  vi.resetModules();
  return import('./strings');
}

afterEach(() => {
  vi.unstubAllEnvs();
  window.localStorage.clear();
});

describe('pointer toolbar strings', () => {
  const [es, en] = [DICTIONARIES.es, DICTIONARIES.en];

  it('has the same keys, of the same kind, in es and en', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(es).sort());
    for (const key of Object.keys(es) as (keyof typeof es)[]) {
      expect(typeof en[key], key).toBe(typeof es[key]);
    }
  });

  it('has no empty string in either language', () => {
    for (const [language, dictionary] of Object.entries(DICTIONARIES)) {
      for (const [key, value] of Object.entries(dictionary)) {
        const text = typeof value === 'function' ? value('x', 1) : value;
        expect(text.trim(), `${language}.${key}`).not.toBe('');
      }
    }
  });

  it('pins the Spanish wording, neutral with tú', () => {
    expect(es.pointToolTitle).toBe('Señalar algo en la pantalla (Esc para salir)');
    expect(es.composerPlaceholder).toBe('¿Qué quieres cambiar aquí?');
    expect(es.copied('Achicar esto', 0)).toBe(
      'Copiado: Achicar esto · pégalo en la conversación',
    );
    expect(es.copied('Achicar esto', 2)).toBe(
      'Copiado: Achicar esto · y 2 más · pégalo en la conversación',
    );
  });

  it('is Spanish when the variable is absent, and for anything that is not exactly "en"', () => {
    expect(resolveLanguage(undefined)).toBe('es');
    for (const value of ['', 'es', 'EN', 'en-US', 'fr']) expect(resolveLanguage(value)).toBe('es');
    expect(resolveLanguage('en')).toBe('en');
  });

  it('speaks English when whoever starts the preview sets the variable to en', async () => {
    vi.stubEnv(VAR, 'en');
    const { LANGUAGE, t } = await freshStrings();
    expect(LANGUAGE).toBe('en');
    expect(t.pointTool).toBe('Point');
  });

  it('ignores the app language: the app in English leaves the bar in Spanish', async () => {
    window.localStorage.setItem('app-language', 'en');
    expect(readStoredLanguage()).toBe('en');
    const { LANGUAGE } = await freshStrings();
    expect(LANGUAGE).toBe('es');
  });

  it('never touches the app language: the bar in English leaves the app in Spanish', async () => {
    window.localStorage.setItem('app-language', 'es');
    vi.stubEnv(VAR, 'en');
    const { LANGUAGE } = await freshStrings();
    expect(LANGUAGE).toBe('en');
    expect(readStoredLanguage()).toBe('es');
  });

  /**
   * What the agent receiving the paste parses is `JSON.stringify(payload())`
   * (AnnotationPanel.tsx), built in context.tsx from the annotations alone. The
   * toast is the only part of a copy allowed to follow the language, and the
   * developer's own words inside it are quoted as typed.
   */
  it('translates only the toast around a copy, never the developer\'s words in it', async () => {
    const annotations: Annotation[] = [
      { message: 'Achicar este botón', action: 'point', target: { selector: '#a', text: 'Guardar', box: [0, 0, 1, 1] } },
      { message: 'Otro', action: 'point', target: { selector: '#b', text: '', box: [0, 0, 1, 1] } },
    ];

    vi.resetModules();
    const esContext = await import('./context');
    expect(esContext.confirmationFor(annotations)).toBe(
      'Copiado: Achicar este botón · y 1 más · pégalo en la conversación',
    );

    vi.stubEnv(VAR, 'en');
    vi.resetModules();
    const enContext = await import('./context');
    expect(enContext.confirmationFor(annotations)).toBe(
      'Copied: Achicar este botón · and 1 more · paste it into the conversation',
    );
  });
});

/**
 * The two bars speak neutral Spanish, with tú, and stay that way: they
 * are the developer's tools while building, and the agent never edits tools/.
 * An app's own base texts (frontend/src/i18n/locales/es/) are not checked here on
 * purpose: they start neutral, and the agent adapts them to the app's variant,
 * voseo or usted included, so a voseo there is correct in that app. Like every
 * test here, this runs with frontend's `npm test`; the template has no CI.
 */
const VOSEO =
  /(^|[^\p{L}])(vos|sos|acá|querés|podés|tenés|sabés|hacé|elegí|tocá|marcá|pegá|pegalo|probá|soltá|mirá|usá|escribí|abrí|volvé|decí|fijate|contame|decime|avisame)(?=$|[^\p{L}])/iu;

function spanishTexts(value: unknown, path: string): Array<[string, string]> {
  if (typeof value === 'string') return [[path, value]];
  if (typeof value === 'function') return [[path, String(value('x', 1))]];
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, inner]) => spanishTexts(inner, `${path}.${key}`));
  }
  return [];
}

describe('Spanish texts', () => {
  it('are neutral, with tú, in both bars', () => {
    const texts = [
      ...spanishTexts(DICTIONARIES.es, 'pointer-toolbar'),
      ...spanishTexts(SESSION_BAR.es, 'session-bar'),
    ];
    expect(texts.length).toBeGreaterThan(5);
    for (const [path, text] of texts) {
      expect(text, path).not.toMatch(VOSEO);
    }
  });
});
