from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app_handler.main import create_app


@pytest.fixture
def app_no_spa(tmp_path):
    """An app instance with no frontend/dist present — the "SPA not built" branch."""
    return create_app(frontend_dist_dir=tmp_path / "does-not-exist")


@pytest.fixture
def client(app_no_spa):
    return TestClient(app_no_spa)
