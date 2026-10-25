# Architecture — the app handler

This file is for whoever edits code in `backend/`, human or agent. For
getting-started commands, read [`README.md`](README.md) — this file does not
restate those.

## What this is

A FastAPI Python handler, package `app_handler`: `GET /healthz`, the app's own
`/api/*` routes, and a static mount that serves the built frontend SPA.

Two modules carry that: `main.py` (the app factory) and `spa.py` (the static
mount). There are no `/api/*` routes yet; they are this app's own, added in
`main.py`.

**This folder does not build its own Docker image, and neither does the
repo.** The intended image builds this package *and* the frontend into one
container, and that one process serves both `/api/*` and the SPA — there is no
separate backend container or deployment. Single-container is the actual
requirement: nothing has to keep two images' versions in sync, and the SPA's
`/api/*` calls are same-origin, with no CORS surface.

## `spa.py`, and its two deliberate behaviours

`SpaStaticFiles` subclasses Starlette's `StaticFiles` to add exactly two
things, and `tests/test_main.py` pins both:

- **The cache policy a Vite build needs.** `no-cache` on `index.html` — the one
  mutable entry point, so every load revalidates and a rollback is never held
  stale — and a year of `immutable` only on chunks under `assets/`, where Vite
  emits only content-hashed files.
- **An `index.html` fallback for client-side routes.** An app with a
  client-side router needs an unknown deep path (`/board/42`, a shared link) to
  serve `index.html`, or every pasted link 404s on first load. The fallback is
  for routes, not files: a missing `assets/` chunk or any path ending in a file
  name stays a 404, because answering it with HTML is a script the browser
  refuses to run.

One gotcha, pinned by the tests: `get_response` receives an OS-native path — on
Windows the site root is `"."` and separators are backslashes — so the module
normalizes before classifying.

## Dependencies

`pyproject.toml` is the whole story, and everything on it resolves from public
PyPI: `fastapi[standard]` and `starlette` (imported directly by `spa.py`, so
declared directly), plus `pytest`/`httpx`/`ruff` in the dev group. Never add a
dependency that needs a private index, a git source, or a local wheels folder:
if this handler cannot `uv sync` from public PyPI alone, the dependency was
wrong, not the lockfile.

## Verify

```bash
cd backend
uv sync
uv run pytest
uv run ruff check .
```
