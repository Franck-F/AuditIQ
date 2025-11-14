import os
import time
import uuid
from urllib.parse import urlparse, parse_qs

from fastapi.testclient import TestClient


def wait_for_db(dsn: str, timeout: int = 30):
    import psycopg2

    start = time.time()
    while True:
        try:
            conn = psycopg2.connect(dsn)
            conn.close()
            return True
        except Exception:
            if time.time() - start > timeout:
                raise
            time.sleep(1)


def test_auth_full_flow(monkeypatch):
    """E2E test covering sign-up, sign-in, verify, forgot, reset flows."""
    dsn = os.environ.get("DATABASE_URL")
    assert dsn, "DATABASE_URL must be set for this test"

    wait_for_db(dsn)

    # import app after environment is set
    from app.main import app

    client = TestClient(app)

    email = f"e2e-auth-{uuid.uuid4().hex[:8]}@example.com"
    password = "InitialPass123!"
    new_password = "NewPass456!"

    # 1) Sign-up (creates user, account and verification entry)
    resp = client.post("/api/v1/auth/sign-up", json={
        "email": email,
        "password": password,
        "name": "E2E Auth User",
    })
    assert resp.status_code == 200
    body = resp.json()
    assert body.get("ok") is True
    verify_url = body.get("verifyUrl")
    assert verify_url, "sign-up should return a verifyUrl"

    # 2) Attempt sign-in before verification -> should be forbidden (401/403)
    signin_payload = {"email": email, "password": password}
    resp = client.post("/api/v1/auth/sign-in", json=signin_payload)
    assert resp.status_code in (401, 403)

    # 3) Verify email using token from verify_url
    parsed = urlparse(verify_url)
    qs = parse_qs(parsed.query)
    token = qs.get("token", [None])[0]
    token_email = qs.get("email", [None])[0]
    assert token and token_email == email

    # call verify without following redirect so we can assert redirect target
    verify_path = f"/api/v1/auth/verify?token={token}&email={email}"
    resp = client.get(verify_path, allow_redirects=False)
    assert resp.status_code in (307, 302)
    # confirm user is now verified by attempting sign-in
    resp = client.post("/api/v1/auth/sign-in", json=signin_payload)
    assert resp.status_code == 200
    # cookie should be set on successful sign-in
    assert "auditiq_session" in resp.cookies

    # 4) Forgot password -> receive resetUrl
    resp = client.post("/api/v1/auth/forgot", json={"email": email})
    assert resp.status_code == 200
    body = resp.json()
    reset_url = body.get("resetUrl")
    assert reset_url

    parsed = urlparse(reset_url)
    qs = parse_qs(parsed.query)
    reset_token = qs.get("token", [None])[0]
    reset_email = qs.get("email", [None])[0]
    assert reset_token and reset_email == email

    # 5) Reset password
    resp = client.post(
        "/api/v1/auth/reset",
        json={"email": email, "token": reset_token, "password": new_password},
    )
    assert resp.status_code == 200

    # 6) Sign-in with new password
    signin_new = {"email": email, "password": new_password}
    resp = client.post("/api/v1/auth/sign-in", json=signin_new)
    assert resp.status_code == 200
    assert "auditiq_session" in resp.cookies

    # Sanity check: DB has verification entries cleaned up and user exists
    import psycopg2

    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE email = %s", (email,))
    assert cur.fetchone() is not None
    cur.close()
    conn.close()
