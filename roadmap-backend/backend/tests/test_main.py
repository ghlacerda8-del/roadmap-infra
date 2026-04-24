import os
import pytest
from fastapi.testclient import TestClient

# Variáveis mínimas para o app inicializar sem .env real
os.environ.setdefault("RESEND_API_KEY", "test_key")
os.environ.setdefault("INTERNAL_TOKEN", "test_token")
os.environ.setdefault("SUPABASE_URL", "https://placeholder.supabase.co")
os.environ.setdefault("SUPABASE_KEY", "placeholder_key")

from main import app

client = TestClient(app)


def test_health_returns_200():
    response = client.get("/health")
    assert response.status_code == 200


def test_health_response_body():
    response = client.get("/health")
    body = response.json()
    assert body["status"] == "online"
    assert body["service"] == "roadmap-infra-backend"


def test_send_reminder_requires_token():
    response = client.post("/send-reminder")
    assert response.status_code == 401


def test_send_reminder_rejects_wrong_token():
    response = client.post("/send-reminder", headers={"authorization": "Bearer wrong_token"})
    assert response.status_code == 401


def test_send_weekly_requires_token():
    response = client.post("/send-weekly")
    assert response.status_code == 401
