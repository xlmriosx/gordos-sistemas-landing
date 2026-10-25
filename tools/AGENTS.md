# Architecture — dev-only tooling

Everything under `tools/` is mechanism for the app-building session itself,
not product code and not the design system. Two things distinguish a `tools/`
subfolder from a `frontend/src/` component:

- **It must never reach a production bundle.**
  [`pointer-toolbar`](pointer-toolbar/README.md) achieves this two ways: a
  `NODE_ENV` guard inside the component itself, and being reachable only
  through a dynamic import behind `import.meta.env.DEV`
  (`frontend/app/DevToolbar.tsx`), so frontend's `npm run build` resolves nothing in
  this folder. Living outside `frontend/src/` is a separate rule and does not
  achieve this on its own: `frontend/app/` is on the production build path, so
  a plain relative import from there does reach production. That is exactly
  what used to happen here, and it shipped a duplicate React: 139 kB, 27%
  of the bundle.
- **It must never be something a developer's app is built from.** It does not
  belong in `frontend/`'s component catalog or its public exports: it stays
  here, in its own folder, with its own README.

## Who may import a tool, exactly

Two folders, two different answers, and they used to be one ambiguous sentence:

| From | May import a tool? |
|---|---|
| `frontend/src/` — the design system | **Never.** If it ever does, the tool has stopped being dev-only and where it belongs is a new discussion, not a new import |
| `frontend/app/` — the developer's app | **Yes, and only like this:** by relative path, from a module that is behind a dev-only dynamic import. Today that module is [`frontend/app/DevToolbar.tsx`](../frontend/app/DevToolbar.tsx), and it is the only one. It is also **not mounted by default**: the product page is the product page, and both bars are opt-in, one line away in [`frontend/app/App.tsx`](../frontend/app/App.tsx) |

`frontend/app/` is inside `frontend/`, which is why "`frontend/` never imports
anything from `tools/`" was never quite true and confused the two rows above.
What is true is narrower and stronger: **nothing on the production build path
resolves anything under `tools/`.** The dev-only dynamic import is what makes
that hold, and the image build copying only `frontend/` is what turns a mistake
into a failed image build.

Locally the dynamic import does resolve, and it does so with **frontend's**
install, not one of its own. `frontend/` is a standalone npm package with no
workspace above it, so nothing under `tools/` can find `frontend/node_modules`
by ordinary resolution. Two settings in `frontend/` make the bars work anyway:
`resolve.dedupe` in `vite.config.ts` sends their `react` and `react-dom`
imports to frontend's React 19, so the dev app has one React; and `paths` in
`tsconfig.json` does the same for the typecheck, which follows that import too.
`server.fs.allow` in `vite.config.ts` is what lets Vite serve this folder at
all. A tool that imports a package other than React has to be added to those
settings, or it will not resolve at all.

Worth knowing if you are reading old notes: this used to work the other way —
the import was static, and the image build copied `tools/` in. Both are gone,
and the absence is deliberate: the image build copies only `frontend/`.

## No monorepo tooling here, on purpose

Matches `frontend/`'s own stance (see its `README.md` §1). A tool here is either
a plain folder reached the way the table above describes, or, if it ever needs a
real package boundary, a fully self-contained `package.json` of its own. There is
no workspace at the root (the image build installs `frontend/` with npm alone),
and `frontend/package.json` never lists a tool as a dependency.

`tools/pointer-toolbar/test/` is the existing example of the self-contained
shape: its own `package.json`, run on its own, never installed by `frontend/`.

## The coupling only goes one direction

A tool here may read `frontend/`'s real CSS tokens for preview fidelity — a
plain file import, not a package dependency. Nothing in `frontend/` takes a
tool as a dependency. If that direction ever reverses, the tool has stopped
being dev-only and the conversation about where it belongs needs to happen
again.

## The language the bars speak

Both bars read `VITE_DEV_TOOLS_LANGUAGE` — `es` or `en` — set in the
environment of whoever starts the preview, so they speak the language of the
session around the app. Absent or any other value is
Spanish. It is the developer's language, not the app's: it never goes through
`frontend/src/i18n` or its `app-language` key, and changing either leaves
the other alone. Nothing in this repo sets it. Each bar keeps its own words in
its own `strings.ts`, with a parity test beside it that frontend's `npm test`
runs; the payload the pointer toolbar copies is never translated, only the
line confirming the copy.

## Adding something new here

- Give it its own subfolder and its own `README.md` explaining why it is not
  in `frontend/src/` instead.
- State explicitly how it stays out of production — a runtime guard alone is
  not enough to trust; verify by grepping a production build for whatever
  identifies it (see `pointer-toolbar/README.md`'s example:
  `app-pointer-toolbar`). No CI runs that grep, so add the
  tool's id to the check below; it is the only place the claim gets measured.
- See it where it runs: the app preview, with the dev toolbar mounted behind
  `import.meta.env.DEV` (`frontend/app/DevToolbar.tsx`). A tool has no harness
  of its own.

## Checking that nothing here reached a production bundle

From the repo root, after `(cd frontend && npm run build)`. It must print
nothing; one id per folder under `tools/`:

```bash
grep -rlE "app-pointer-toolbar|app-session-bar" frontend/dist/
```

And that every package a tool imports is one `frontend/vite.config.ts` resolves from
the app (`resolve.dedupe`) and `frontend/tsconfig.json` maps (`paths`). Today that is
`react` and `react-dom` and nothing else. From the repo root, this must print nothing:

```bash
grep -rhoE "(from |import ?\()['\"][^'\"./][^'\"]*['\"]" tools \
  --include="*.ts" --include="*.tsx" --exclude="*.test.*" \
  --exclude-dir=node_modules --exclude-dir=test \
  | sort -u | grep -vE "['\"](react|react-dom)(/[^'\"]*)?['\"]"
```

It walks every folder under `tools/`, so a new tool is covered without editing it, and it
catches both quote styles and dynamic `import()`. Test suites are left out: they run in
`frontend/`'s test runner, against `frontend/`'s own dependencies.

A line there is an import that will not resolve: nothing under `tools/` can find
`frontend/node_modules` by ordinary resolution. Add the package to both configs,
or drop the import.
