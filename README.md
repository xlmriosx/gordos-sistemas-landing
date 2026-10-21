# App base

The starting point of an app: a React design system with the real app built on
it (`frontend/`), a FastAPI backend that serves that app's built SPA and its
`/api/*` routes from one process (`backend/`), and dev-only tooling that never
ships (`tools/`). It is **app source only**: it ships no workflow, no
Dockerfile and no credential of its own — whoever builds and deploys it owns
those.

## Structure

- **`frontend/`** — the design system (`src/`, see [frontend/README.md](frontend/README.md))
  plus [`app/`](frontend/app/README.md), where the real application (routing, views, data,
  connectors, permissions) gets built on top of it.
- **`backend/`** — a FastAPI handler (see [backend/README.md](backend/README.md) /
  [backend/AGENTS.md](backend/AGENTS.md)) serving `GET /healthz`, this app's own `/api/*`
  routes, and, once built, the frontend SPA as static files.
- **`tools/`** — dev-only tooling that is not part of the design system and must never reach
  a production build (see [tools/AGENTS.md](tools/AGENTS.md)).

## Local setup

The JavaScript side is **three independent npm packages, with no workspace above them**. Each
has its own `package.json` and its own committed `package-lock.json`, and each is installed in
its own directory:

One command per line, so it works in any shell, PowerShell 5.1 included, where `&&`
does not exist. Only the first block is needed to build and preview the app:

```
cd frontend
npm ci
```

The other one only for working on the pointer toolbar's own test suite, from the repo root:

```
cd tools/pointer-toolbar/test
npm ci
```

`npm ci` rather than `npm install` for setting up a clone: it installs exactly the lockfile
and refuses one that has drifted from `package.json`, where `npm install` would quietly
rewrite it. `npm install <package>` is still how a dependency is added, and the lockfile it
updates gets committed with the change.

`frontend/` is the only one a clone needs. It runs the app preview (`npm run dev`), the
tests, the typecheck and the build, and that includes the dev-only
bars under `tools/`: the preview loads them from there, and `frontend/vite.config.ts` and
`frontend/tsconfig.json` resolve their `react` imports to `frontend/`'s own copy, so no install
in `tools/` is needed for them. The other one is for working on the pointer toolbar's own test
suite.

Why npm, and why no workspace: the image build consumes `frontend/` alone, with exactly
`frontend/package.json` and `frontend/package-lock.json` and `npm ci`. Installing the way the
image installs is the only way a local check says anything about the real build. There is no
`package.json` at the root either: nothing runs from the root, so it would be a manifest with
no lockfile, no script and no dependency. The `engines` range lives in `frontend/package.json`,
the manifest the build actually reads. Two rules follow from all this:

- **Never add a `packageManager` field, a `pnpm-lock.yaml`, or a workspace manifest** at the
  root or in `frontend/`.
- **Regenerate `frontend/package-lock.json` with a plain `npm install`**, never with
  `--legacy-peer-deps` or `--force`: `npm ci` installs exactly what the lockfile says, so a
  lockfile that was shaped by a flag is a build that differs from what was tested. One trap
  when regenerating it from nothing: npm 10.9, the line Node 22 bundles, crashes on this
  dependency tree with `Cannot read properties of null (reading 'edgesOut')` when there is no
  lockfile to start from. npm 11 resolves it (`npx npm@11 install`), and that is how the
  committed lockfile was made. With the lockfile present, npm 10 runs `npm ci` from it and
  adds packages to it normally (checked with 10.9.0).

The Python side is separate and uses `uv`: see [backend/README.md](backend/README.md).

## Deployment

Nothing in this repository deploys it. There is no workflow, no Dockerfile, no registry
credential and no cloud credential here.

The intended image shape is **one container**: a Node stage builds `frontend/` alone, a
Python stage installs `backend/`, and the runtime stage is one process serving both `/api/*`
and the built SPA. `backend/src/app_handler/main.py` matches that layout by default and
honours `FRONTEND_DIST_DIR` for any other. One container is deliberate, not incidental:
there is no separate frontend/backend deployment to keep in sync, and the SPA's `/api/*`
calls are same-origin, with no CORS surface.

A consequence worth stating for anyone tempted to add a pipeline back: a workflow here that
built or deployed this app would need credentials, and a credential that can deploy is a
credential that can deploy something else. The absence is the feature.

## Known gaps

- **The app shows the placeholder name until you write `app-identity.json`.**
  `frontend/app/appIdentity.ts` globs that file from the repo ROOT, and an image build that
  copies only `frontend/` will not have it: the app falls back to `App`. Write the file
  where the build can reach it — or accept the placeholder.
