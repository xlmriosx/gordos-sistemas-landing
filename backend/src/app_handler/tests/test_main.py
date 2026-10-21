from __future__ import annotations

from fastapi.testclient import TestClient

from app_handler.main import SERVICE_NAME, create_app


def test_healthz(client: TestClient) -> None:
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": SERVICE_NAME}


def test_spa_mount_serves_index_when_dist_exists(tmp_path) -> None:
    dist_dir = tmp_path / "dist"
    dist_dir.mkdir()
    (dist_dir / "index.html").write_text("<html><body>hello spa</body></html>")

    app = create_app(frontend_dist_dir=dist_dir)
    client = TestClient(app)

    response = client.get("/")
    assert response.status_code == 200
    assert "hello spa" in response.text

    # An unknown client-side route still gets index.html (SPA fallback), not a 404.
    response = client.get("/some/client/route")
    assert response.status_code == 200
    assert "hello spa" in response.text


def test_spa_fallback_is_for_routes_not_files(tmp_path) -> None:
    """A missing file answered with index.html is a script the browser refuses:
    a blank page. It has to stay a 404, under `assets/` and anywhere a path ends
    in a file name, while a route with a trailing slash still gets the page."""
    dist_dir = tmp_path / "dist"
    (dist_dir / "assets").mkdir(parents=True)
    (dist_dir / "index.html").write_text("<html><body>hello spa</body></html>")
    client = TestClient(create_app(frontend_dist_dir=dist_dir))

    for path in ("/assets/missing.js", "/board/assets/index-BfoI-cZ_.js", "/board/x.css"):
        response = client.get(path)
        assert response.status_code == 404, path
        assert "hello spa" not in response.text, path

    for path in ("/board/42", "/board/42/"):
        response = client.get(path)
        assert response.status_code == 200, path
        assert "hello spa" in response.text, path


def test_spa_mount_keeps_the_cache_policy(tmp_path) -> None:
    """`spa.py` exists for these two headers: `index.html` must revalidate
    every load (a stale one references asset hashes a later deploy removed,
    which reads as a broken rollback), and a content-hashed chunk under
    `assets/` is the one thing safe to hold forever."""
    dist_dir = tmp_path / "dist"
    (dist_dir / "assets").mkdir(parents=True)
    (dist_dir / "index.html").write_text("<html><body>hello spa</body></html>")
    # The filename shape Vite really emits: an 8-character base64url-ish hash.
    (dist_dir / "assets" / "index-BfoI-cZ_.js").write_text("console.log(1)")

    client = TestClient(create_app(frontend_dist_dir=dist_dir))

    assert client.get("/").headers["cache-control"] == "no-cache"
    assert (
        client.get("/assets/index-BfoI-cZ_.js").headers["cache-control"]
        == "public, max-age=31536000, immutable"
    )
    # The fallback's index.html goes through the same response path, so a
    # deep link gets the same no-cache rather than escaping the policy.
    assert client.get("/some/client/route").headers["cache-control"] == "no-cache"


def test_no_spa_mount_when_dist_missing(client: TestClient) -> None:
    response = client.get("/")
    assert response.status_code == 404
