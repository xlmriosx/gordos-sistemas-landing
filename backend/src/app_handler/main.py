"""App — Python handler entrypoint.

Serves `GET /healthz` and, once the frontend is built, the SPA as static
files. This app's own `/api/*` routes are added here.

Single-container serving posture, on purpose: this one process is the app's
one deployable artifact — there is no separate frontend container to route
to. `_DEFAULT_FRONTEND_DIST_DIR` below matches where the image build puts
the compiled SPA, and `FRONTEND_DIST_DIR` overrides it for tests and local
smoke checks that don't have a real build on disk.

Plain FastAPI, not a serverless programming model.
"""

from __future__ import annotations

import os
from pathlib import Path

from fastapi import FastAPI

# `spa.py`, not a bare StaticFiles: an app with a client-side router needs an
# unknown deep path to serve `index.html`, not 404 — see that module.
from app_handler.spa import SpaStaticFiles

SERVICE_NAME = "app-handler"

_DEFAULT_FRONTEND_DIST_DIR = "frontend/dist"


def _resolve_frontend_dist_dir() -> Path:
    return Path(os.environ.get("FRONTEND_DIST_DIR", _DEFAULT_FRONTEND_DIST_DIR))


def create_app(frontend_dist_dir: Path | None = None) -> FastAPI:
    """Build and configure the FastAPI application (app factory pattern).

    `frontend_dist_dir` is exposed as a parameter (defaulting to
    `_resolve_frontend_dist_dir()`) so tests can exercise both the "SPA
    mounted" and "SPA not built yet" branches deterministically.
    """
    app = FastAPI(
        title="App Handler",
        docs_url=None,
        redoc_url=None,
        openapi_url=None,
    )

    @app.get("/healthz")
    def healthz() -> dict[str, str]:
        return {"status": "ok", "service": SERVICE_NAME}

    dist_dir = frontend_dist_dir if frontend_dist_dir is not None else _resolve_frontend_dist_dir()
    if dist_dir.is_dir():
        # Mounted LAST so it never shadows /healthz or any /api/* route above.
        app.mount("/", SpaStaticFiles(directory=dist_dir, html=True), name="spa")

    return app


app = create_app()
