from fastapi.testclient import TestClient


def test_register_new_user(client: TestClient):
    response = client.post(
        "/auth/register",
        json={"email": "newuser@example.com", "password": "strongpass123"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert "hashed_password" not in data  # schema must never leak this


def test_register_duplicate_email_fails(client: TestClient):
    client.post("/auth/register", json={"email": "dupe@example.com", "password": "strongpass123"})
    response = client.post("/auth/register", json={"email": "dupe@example.com", "password": "anotherpass123"})
    assert response.status_code == 409


def test_register_short_password_fails(client: TestClient):
    response = client.post(
        "/auth/register",
        json={"email": "shortpw@example.com", "password": "short"},
    )
    assert response.status_code == 422


def test_login_success(client: TestClient):
    client.post("/auth/register", json={"email": "logintest@example.com", "password": "strongpass123"})
    response = client.post(
        "/auth/login",
        data={"username": "logintest@example.com", "password": "strongpass123"},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_wrong_password_fails(client: TestClient):
    client.post("/auth/register", json={"email": "wrongpw@example.com", "password": "strongpass123"})
    response = client.post(
        "/auth/login",
        data={"username": "wrongpw@example.com", "password": "definitely_wrong"},
    )
    assert response.status_code == 401


def test_login_nonexistent_user_fails(client: TestClient):
    response = client.post(
        "/auth/login",
        data={"username": "ghost@example.com", "password": "whatever123"},
    )
    assert response.status_code == 401