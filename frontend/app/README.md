# App

This is where the real application goes: routing, views, data fetching, connectors,
and permissions — whatever this specific app built on the App template
needs. It consumes the design-system components from [`../src`](../src) the same way
an external project would.

Unlike `src/`, this folder is **not** covered by the purity rule in
[`../AGENTS.md`](../AGENTS.md) — that rule only covers `src/`, to keep the design system
itself free of business logic (no `views/`/`data/` folders, no `window.location`, no
product-specific i18n namespaces). None of those restrictions apply here: `app/` is exactly
the place for that code. (The rule used to be a CI guard; this repo ships no
CI, so it is a check you run by hand.)

## The landing

What a fresh clone renders is the Gordos Sistemas landing: the topbar, the hero with
its foundation slab and its four numbers, the three moral pillars, the nine apps, the
manifesto terminal, the call to the community and the footer.

The zero state that used to stand here is gone: `app.css` has no `.zero-state-page`
any more. There is a real screen now, and a page saying "your app is still empty" next
to it would be saying it about the landing.

The dev-only annotation bars are not on that page either. `App.tsx` does not mount
[`DevToolbar.tsx`](DevToolbar.tsx): the session bar and the pointer toolbar are the
developer's tooling, not the screen, and a session bar drawn across the landing is not
what ships. The module stays in the repo because it is the one place `app/` is allowed to
import from `../../tools/` (see [`../../tools/AGENTS.md`](../../tools/AGENTS.md)), and
mounting it again is one line.

The landing's brand lives in [`landing/`](landing): its tokens, its type scale and its
components, every one of them named `landing-*` and rooted at `.landing`. The kit in
[`../src`](../src) is a different brand and is not re-valued for it — re-valuing its
tokens would change ~90 kit components and break their light theme for the sake of one
marketing page. [`landing/landing.css`](landing/landing.css) carries the whole
argument.

**The app's own words live in [`copy.ts`](copy.ts)**, in `en` and `es`, and the type
is the parity check: a key in one language and not the other fails `npm run typecheck`.
They do not go in the design system's `ui` namespace, which is the kit's chrome.

**The language is the browser's** ([`language.ts`](language.ts)): a language stored with
the kit's switcher wins, otherwise the first `es*` or `en*` in `navigator.languages`,
otherwise English. The browser's choice is applied and never stored.

`index.html` (at the frontend root) is the Vite entry point for this app —
`npm run dev` / `npm run build`.

## `npm run build` is this app's build

`build` is `vite build` into `dist/`. The image build copies only
`frontend/package.json` and `frontend/package-lock.json`, runs
`npm ci --ignore-scripts`, then `npm run build` in this folder, and copies `dist/` into
the image. **A `build` that does not produce `dist/` breaks the image build.**

The typecheck is deliberately not part of `build`: TypeScript follows
`DevToolbar.tsx`'s dynamic import into `../tools/`, which the image does not
contain, so it can only run in a full clone, as `npm run typecheck`.

This lives here and not in `../README.md` because that one is the design system's own
README.

`vite.config.ts` proxies `/api/*` to `http://127.0.0.1:8000` **in dev only**. In a
real deployment one container serves this SPA and the handler from a single origin,
so nothing is proxied there; in dev the two run apart, and without
the proxy every `fetch('/api/…')` would 404 against the dev server rather than reach
the handler and get its own honest answer. So a full preview is two processes:
`npm run dev` in `frontend/`, and
`cd backend && uv run uvicorn app_handler.main:app --reload --port 8000` there.

**The handler's port is `APP_HANDLER_PORT`, 8000 when unset.** Set it on both
processes when 8000 is taken: `--port` on uvicorn, and the variable in the
environment of `dev`, so the proxy follows. On Windows a second uvicorn binds
an occupied port without an error, and the proxy then gets whatever process was
there first — which looks exactly like a broken app. Nothing in this repo sets
the variable; it belongs to whoever starts the preview.

## The providers, and the test that renders the app

`main.tsx` renders `App` inside `AppProviders`, which mounts what kit components
need from above them (today `TooltipProvider`: `Tip` throws without it, and a
throw on first render leaves the page blank). `App.render.test.tsx` renders the
same tree and fails if the first render throws. `build` and `lint` both pass on
a blank page, so run `npm test` as well after changing what `App` renders.

**Run it in both states of `app-identity.json`** when you touch `vite.config.ts` or
`appIdentity.ts`: without the file, and with one at the repo root. The state
without the file cannot show a failure that only a named app has.

## `ThemeToggle` and `LanguageToggle` are not mounted, on purpose

Both components exist in [`../src/components/`](../src/components/) and work. Neither
is mounted in `App.tsx`, because this file is the starting point every generated app
inherits: anything it puts on screen ends up shipping in every app without anyone
deciding to, and a preference control is exactly the kind of thing that should be a
decision.

The language switcher is the sharper case. The design system's i18n covers one
namespace, `ui`, which is the kit's own chrome — buttons, pagination, field states.
An app's own copy is not in it, so flipping the switch translates the frame and
leaves the screen the person actually came for unchanged. That is a control that
promises something that does not happen.

An app that genuinely needs either mounts it itself, behind an overflow rather than
beside the primary actions in `PageHeader` — and an app that exposes the language
switcher registers its own namespace from this folder with
`i18n.addResourceBundle`, populated in both languages. Note that the EN/ES parity
guard in `../src/i18n/parity.ts` is type-only over the design system's own
resources: it will not check an app-level namespace for you.

**The landing brings its own switcher**
([`landing/components/TopBar.tsx`](landing/components/TopBar.tsx)), built on the kit's
`useLanguage` and not on the kit's chrome. It switches the page's own copy — the whole
landing, es ↔ en — and it wears the landing's brand. The kit's `LanguageToggle` still
does not appear: the kit's `ui` namespace has nothing to translate on a page that
carries none of it.

`App.tsx` also mounts `PointerToolbar`, imported from
[`../../tools/pointer-toolbar/`](../../tools/pointer-toolbar/README.md) — dev-only
annotation chrome, not a design-system component, kept out of `src/` on purpose. It
no-ops under `NODE_ENV=production`; see that folder's own README for why it lives
outside `src/` instead of being gated by the guard alone.
