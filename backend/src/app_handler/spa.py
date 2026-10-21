"""SPA static-file serving: the cache policy a Vite build needs, plus a
client-side-routing fallback.

Cache policy: `no-cache` on `index.html` — the one mutable entry point, so
every load revalidates and a rollback is never held stale (a stale index
references asset hashes a later deploy removed) — and a year of `immutable`
only on chunks under the mount's own `assets/`, where Vite emits only
content-hashed files: the one thing safe to hold forever.

The fallback: an app with a client-side router (a board at `/board/42`, a
detail view reached by a shared link) needs the server to hand back
`index.html` for an unknown path and let the router resolve it, or every
link anyone pastes is a 404 on first load.

**The fallback is for routes, not files.** A missing `assets/` chunk, or any
path whose last segment has an extension (`favicon.svg`, `x.js`), stays a
404. Answering those with `index.html` turns a missing script into HTML the
browser refuses to run, and a 404 into a blank page that says nothing about
why. Non-404 errors are re-raised untouched: a 405 or a permission error is
not a client-side route.
"""

from __future__ import annotations

from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.responses import Response
from starlette.staticfiles import StaticFiles
from starlette.types import Scope

_IMMUTABLE_CACHE_CONTROL = "public, max-age=31536000, immutable"
_NO_CACHE_CONTROL = "no-cache"


def _normalize(path: str) -> list[str]:
    # `get_response` receives an OS-native relative path: on Windows that is
    # backslash-separated, and the site root comes through as ".".
    return [s for s in path.replace("\\", "/").split("/") if s and s != "."]


def is_client_route(path: str) -> bool:
    """A path a client-side router can own: not under `assets/`, no file extension."""
    segments = _normalize(path)
    if not segments:
        return True
    if segments[0] == "assets":
        return False
    return "." not in segments[-1]


def _cache_control(served_path: str) -> str | None:
    segments = _normalize(served_path)
    if segments and segments[0] == "assets":
        return _IMMUTABLE_CACHE_CONTROL
    if not segments or segments[-1] == "index.html":
        return _NO_CACHE_CONTROL
    return None


class SpaStaticFiles(StaticFiles):
    """StaticFiles with the SPA cache policy and an `index.html` fallback for client routes."""

    async def get_response(self, path: str, scope: Scope) -> Response:
        try:
            response = await super().get_response(path, scope)
            served_path = path
        except StarletteHTTPException as exc:
            if exc.status_code != 404 or not is_client_route(path):
                raise
            response = await super().get_response("index.html", scope)
            served_path = "index.html"
        cache_control = _cache_control(served_path)
        if cache_control is not None:
            response.headers["cache-control"] = cache_control
        return response
