# app-handler

The backend half of the app: a FastAPI handler that serves `/api/*` and, once
built, the frontend SPA as static files — all from one process. See
[`AGENTS.md`](AGENTS.md) in this folder for the architecture.

## Prerequisites

- Python 3.12+
- [`uv`](https://docs.astral.sh/uv/)

## Local development

```bash
cd backend
uv sync                                                       # installs deps into backend/.venv
uv run uvicorn app_handler.main:app --reload --port 8000
```

```bash
curl http://127.0.0.1:8000/healthz
# -> {"status":"ok","service":"app-handler"}
```

There are no other `/api/*` routes yet — they are this app's own, added in
`main.py`.

## Tests & lint

```bash
uv run pytest
uv run ruff check .
```

## The deployable image

This repo does not build it — there is no Dockerfile here, in this folder or at
the root. The intended image serves the whole app (frontend + backend) from one
process. To see the same shape locally, point the handler at a local frontend
build. From the repo root:

```bash
# bash or Git Bash. In PowerShell, run each `cd` and command on its own line,
# and set the variable with `$env:FRONTEND_DIST_DIR = "../frontend/dist"` first.
(cd frontend && npm run build)
cd backend && FRONTEND_DIST_DIR=../frontend/dist uv run uvicorn app_handler.main:app --port 8000
curl http://127.0.0.1:8000/          # the built SPA
curl http://127.0.0.1:8000/healthz   # this backend
```
