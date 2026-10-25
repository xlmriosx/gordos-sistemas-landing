/**
 * The app's identity, read from `app-identity.json`.
 *
 * `app-identity.json` lives at the repo ROOT, not under frontend/, because the
 * identity is the app's and not the frontend's. It carries two forms: a
 * readable `displayName`, and a `slug` that is set once and never changes.
 *
 * This repo does not ship the file: `PLACEHOLDER` below is what a fresh clone
 * shows. Write the file to name the app for real.
 *
 * ## Why this is not a one-line static import
 *
 * It used to be `import identity from '../../app-identity.json'`, which made
 * the file's states the build's problem. Measured, that was wrong. Three
 * states, three outcomes:
 *
 * | The file | A static import did | This module does |
 * |---|---|---|
 * | absent | the build FAILS | placeholder |
 * | invalid JSON | the build FAILS | placeholder |
 * | valid, keys missing (`{}`) | builds clean, renders `undefined` | placeholder |
 *
 * **The third one is why this exists.** The first two fail loudly and somebody
 * reads the error; the third puts `undefined` on screen, which is exactly the
 * silent failure the rest of this app is built to avoid.
 *
 * Two mechanics carry it, and neither is decoration:
 *
 * - `import.meta.glob` instead of a static import, because a static import of a
 *   file that is not there is a build error and nothing at runtime can catch it.
 *   A glob that matches nothing is an empty object.
 * - `query: '?raw'`, because Vite parses a `.json` import at build time, so
 *   malformed content is a build error too. Reading it as text moves the parse
 *   to runtime, where a `try` can hold it.
 */
export type AppIdentity = { displayName: string; slug: string };

/**
 * What the app is called before `app-identity.json` exists, or when it cannot
 * be read. This is the only copy: the template used to ship the same two values
 * in the file, with a test keeping them equal, and ships no file now.
 */
export const PLACEHOLDER: AppIdentity = {
  displayName: 'App',
  slug: 'app',
};

/** A trimmed non-empty string, or nothing. `{"slug": ""}` is a missing slug. */
function usableString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Resolve the file's text into an identity, degrading key by key.
 *
 * **The two keys are judged separately, on purpose.** A file carrying a real
 * `displayName` and no `slug` keeps the name it has; throwing the whole object
 * away over the other key would lose a value that was perfectly good.
 *
 * Exported for `appIdentity.test.ts`: the states this has to survive are states
 * of a file, and handing the parsing its input directly is the only way to
 * exercise them without moving the file around underneath a build.
 */
export function resolveIdentity(
  raw: string | undefined,
  warn: (message: string) => void = (message) => console.warn(message),
): AppIdentity {
  if (raw === undefined) {
    warn(
      '[app-identity] app-identity.json was not found at the repo root. ' +
        'Using placeholder values: the app still runs, but its name is not its own.',
    );
    return PLACEHOLDER;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    warn(
      `[app-identity] app-identity.json is not valid JSON (${String(error)}). ` +
        'Using placeholder values.',
    );
    return PLACEHOLDER;
  }

  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    warn('[app-identity] app-identity.json is not a JSON object. Using placeholder values.');
    return PLACEHOLDER;
  }

  const record = parsed as Record<string, unknown>;
  const displayName = usableString(record.displayName);
  const slug = usableString(record.slug);

  const missing = [
    displayName === undefined ? 'displayName' : null,
    slug === undefined ? 'slug' : null,
  ].filter((key): key is string => key !== null);

  if (missing.length > 0) {
    warn(
      `[app-identity] app-identity.json is missing or empty: ${missing.join(', ')}. ` +
        'Using the placeholder for those, keeping whatever else it had.',
    );
  }

  return {
    displayName: displayName ?? PLACEHOLDER.displayName,
    slug: slug ?? PLACEHOLDER.slug,
  };
}

// A glob over a literal path, so this is not a directory scan: it is the one
// mechanism Vite offers that does not turn an absent file into a build error.
const matches = import.meta.glob('../../app-identity.json', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/**
 * Whatever the app is called. Never `undefined`, in any state of the file: the
 * degradation exists so a broken file never reaches the screen. The warning
 * above is for whoever opens the console.
 */
export const PRIMED: AppIdentity = resolveIdentity(Object.values(matches)[0]);
