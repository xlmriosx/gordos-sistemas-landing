import { lazy, Suspense, useEffect, useState } from 'react';
import { PRIMED } from './appIdentity';

/**
 * The dev-only session tooling, and the app identity it displays.
 *
 * `import.meta.env.DEV` is a compile-time constant, so a production build folds
 * this module down to a component that returns null and the dynamic imports
 * below become unreachable — nothing under tools/ is in the production import
 * graph at all. The image build copies only frontend/ into its frontend
 * stage, so a static import reintroduced anywhere fails the image build
 * rather than shipping quietly. The bundle grep for each tool's id is a
 * manual check, in tools/AGENTS.md.
 *
 * Locally both imports resolve with frontend's own install and nothing else.
 * TypeScript follows them and type-checks what is on the other side, although
 * the tsconfig includes only src and app, and Vite serves those files in dev.
 * From a file in tools/, plain resolution finds no React at all (or tools/'s
 * own React 18), because frontend/ is a standalone npm package with no
 * workspace above it; `paths` in
 * tsconfig.json and `resolve.dedupe` in vite.config.ts point both at this
 * package's React 19, so the bars and the app share one React.
 */

const PointerToolbar = import.meta.env.DEV
  ? lazy(() => import('../../tools/pointer-toolbar/Toolbar'))
  : null;

const SessionBar = import.meta.env.DEV
  ? lazy(() => import('../../tools/session-bar/SessionBar'))
  : null;

/**
 * The local edit, and only that.
 *
 * The app has two names and **this file derives neither of them**. Both live
 * in `app-identity.json` at the repo root (see `appIdentity.ts`): a readable
 * one, and a slug that is set once and never changes.
 *
 * What lives here is a **local scribble on the readable one**. It is a cache, in
 * a browser, and it deliberately does not try to be more:
 *
 *   - It does not cross machines or people. A name that only exists in one
 *     browser is one person's private note, so this is NOT where a name lives.
 *   - Changing it for real means editing `app-identity.json`, the one source
 *     of truth.
 *
 * The bar makes that visible rather than hiding it: while the local name differs
 * from the primed one it shows `sin guardar`, so an edit never poses as the
 * app's name.
 */
const STORE_KEY = 'app-local-name';

/** Best-effort, the same way the pointer toolbar treats its own flag: every
 *  failure degrades to the primed name rather than breaking the bar. */
function readLocalName(): string {
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    return typeof raw === 'string' && raw.trim() ? raw : PRIMED.displayName;
  } catch {
    return PRIMED.displayName;
  }
}

function writeLocalName(next: string) {
  try {
    if (next === PRIMED.displayName) window.localStorage.removeItem(STORE_KEY);
    else window.localStorage.setItem(STORE_KEY, next);
  } catch {
    /* the bar still works for this page load */
  }
}

export function DevToolbar() {
  const [appName, setAppName] = useState(readLocalName);

  // Read so the slug is used rather than merely stored: an identity nobody reads
  // is an identity nobody notices going wrong.
  //
  // In an effect, and above the early return below rather than beside the line
  // it replaces. Two reasons, and both are the linter being right: writing to
  // the document during render is a side effect the render cannot take back,
  // and a hook placed after a conditional return is not a hook React can rely
  // on. `oxlint` 1.83 reports the first as `react(immutability)`.
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    document.documentElement.dataset.appSlug = PRIMED.slug;
  }, []);

  if (!PointerToolbar || !SessionBar) return null;

  const rename = (next: string) => {
    setAppName(next);
    writeLocalName(next);
  };

  // No fallback: a bar appearing a tick late is invisible, and anything drawn in
  // its place would be a dev-only flash on every page load.
  return (
    <Suspense fallback={null}>
      <SessionBar appName={appName} primedName={PRIMED.displayName} onAppNameChange={rename} />
      <PointerToolbar />
    </Suspense>
  );
}
