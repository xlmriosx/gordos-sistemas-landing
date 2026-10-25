import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// The handler's port for the dev proxy below. 8000 unless whoever starts the
// preview says otherwise, which they have to when something else already holds
// 8000: on Windows a second uvicorn binds the same port without an error, and
// the proxy then gets another app's answers. Read here, never written into a
// file of this repo; it belongs to the session that runs the two processes.
const HANDLER_PORT = process.env.APP_HANDLER_PORT ?? '8000'
if (!/^\d+$/.test(HANDLER_PORT)) {
  throw new Error(`APP_HANDLER_PORT must be a port number, got "${HANDLER_PORT}"`)
}

// https://vite.dev/config/
export default defineConfig({
  // Absolute. The app is served at the root of its origin, so "/" is right.
  // A relative "./" breaks every deep link: opened at /board/42, the page
  // asks for /board/assets/…, the handler's SPA fallback answers with
  // index.html, and the browser refuses it as a script, which leaves a blank
  // page.
  base: '/',
  plugins: [react()],
  // The dev toolbar under ../tools/ imports react, and nothing above tools/ has
  // a node_modules: frontend/ is a standalone npm package, not a workspace
  // member. Plain resolution from a file in tools/ would therefore find no
  // React at all. `dedupe` makes Vite resolve these from this package's root
  // for every importer, so the dev app has exactly one React. The production
  // build is unaffected: nothing under tools/ is in its import graph (see
  // app/DevToolbar.tsx).
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  // Dev only. In production one container serves both halves from one origin,
  // so `/api/*` is same-origin and needs no proxy. In dev the two run apart —
  // Vite here, uvicorn on HANDLER_PORT — and without this every
  // `fetch('/api/…')` 404s against the dev server instead of reaching the
  // handler, which reads nothing like the handler's own answer.
  server: {
    proxy: {
      '/api': `http://127.0.0.1:${HANDLER_PORT}`,
    },
    // Vite only serves files under the workspace root it detects, and with no
    // workspace manifest above frontend/ that root is frontend/ itself.
    //
    // The dev server needs `.` and `../tools` (the dev toolbar), and nothing
    // else: ../app-identity.json, which app/appIdentity.ts globs, reaches it
    // through the module graph and is served under these two. Keep it this
    // narrow: the preview in a remote environment can be reached by other
    // people, and the repo root holds backend/ and .claude/.
    //
    // vitest is different: it checks every file it loads against these
    // folders, `app-identity.json?raw` included, and refuses it with "Denied
    // ID" when the file sits outside frontend/. Allowing the file by path does
    // not help, because the check is on folders. So under vitest only, the
    // allowed root is the repository. A build reads no file through any of
    // this, and Vite's fs.deny defaults (.env, *.pem, *.crt) apply in every
    // mode.
    fs: {
      allow: process.env.VITEST ? ['..'] : ['.', '../tools'],
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    // `app/` as well as `src/`, and the split is the point: `src/` is the
    // design system and an AGENTS.md rule keeps business logic out of it, so
    // a test about this app's own behaviour cannot live there.
    //
    // `../tools/` too, for plain unit tests only (the string parity ones).
    // tools/ has no runner of its own for those, and this one already has
    // jsdom. The pointer toolbar's lifecycle suite in tools/pointer-toolbar/
    // test/ is `.cjs` and stays on its own runner; nothing here reaches a
    // build, which never follows a test file.
    include: [
      'src/**/*.test.{ts,tsx}',
      'app/**/*.test.{ts,tsx}',
      '../tools/*/*.test.{ts,tsx}',
    ],
  },
})
