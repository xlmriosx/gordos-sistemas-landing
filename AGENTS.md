# Architecture — App base

This file is for whoever edits this repo, or generates code inside it — human or
agent. It is not the getting-started guide (that's [`README.md`](README.md));
it's the rules that don't fit in prose about what things are.

## Structure

```
frontend/               the design system (src/) + the real app built on it (app/)
backend/                FastAPI handler — serves /api/* and, once built, the frontend SPA
tools/                  dev-only tooling — never product code, never shipped
```

Each of `frontend/`, `backend/`, and `tools/` is its own concern with its own
`AGENTS.md`/`CLAUDE.md`. Nothing here restates those — read them directly
before editing inside those folders.

## Hard rules

- **Never let `frontend/src/` grow product code.** Nothing enforces this for
  you; `frontend/AGENTS.md` has the three checks to run by hand. The real app
  lives in `frontend/app/`.
- **A new token, status, or component convention lands in `frontend/` first** —
  never invented locally in `app/`. See `frontend/AGENTS.md` and
  `frontend/DESIGN.md`. The rule is about the *shared kit*: a product page that
  carries a brand of its own (the Gordos Sistemas landing in
  `frontend/app/landing/`) keeps that theme in `app/`, scoped to its own root,
  and leaves the kit's tokens alone.
- **Nothing under `tools/` is a design-system component, and none of it may
  reach a production bundle.** See `tools/AGENTS.md`.
- **The backend stays a plain FastAPI handler**, installable from public
  indexes only: no dependency that needs a private index, a git source, or a
  local wheels folder. `backend/AGENTS.md` has the shape.

## Build and deploy

**This repository builds and deploys nothing.** It ships no workflow, no
Dockerfile and no credential. The intended image is **one** container: a Node
stage builds `frontend/`, a Python stage installs `backend/`, and one process
serves both (see `backend/AGENTS.md` for why single-container is the actual
requirement, not a two-image split).

**What no CI leaves unmeasured.** The checks a pipeline would make are yours to
run before you call a change done: `backend/`'s `uv run pytest` and
`uv run ruff check .`; `frontend/`'s `typecheck`, `lint`, `test` and `build`;
`src/`'s purity checks (`frontend/AGENTS.md`); and the bundle grep for the
dev-only tools (`tools/AGENTS.md`).
