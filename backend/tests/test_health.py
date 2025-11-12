import os
import sys
from fastapi.testclient import TestClient

# ensure backend root is on sys.path so "app" package can be imported when pytest
# is run from repository root
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

import types
from fastapi import APIRouter

# some routers (audit) import heavy deps (pandas, fairlearn). Create a lightweight
# fake module for `app.api.routes.audit` so importing `app.main` during tests does
# not pull heavy native packages.
audit_mod = "app.api.routes.audit"
if audit_mod not in sys.modules:
    sys.modules[audit_mod] = types.ModuleType(audit_mod)
    sys.modules[audit_mod].router = APIRouter()

# Prevent Settings from loading the repo .env (it contains unrelated keys that
# cause pydantic validation errors). Temporarily rename .env if present.
env_path = os.path.join(ROOT, ".env")
renamed = None
try:
    if os.path.exists(env_path):
        renamed = env_path + ".bak"
        os.rename(env_path, renamed)
    # provide minimal required settings for tests
    os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
    os.environ.setdefault("SECRET_KEY", "test-secret")
    from app.main import app
finally:
    if renamed:
        # restore original .env
        os.rename(renamed, env_path)


client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data.get("status") == "healthy"
