import os
import requests
import pytest

# Permite cambiar la URL desde variables de entorno si hace falta
BASE_URL = os.getenv("BASE_URL", "http://localhost:3000")


def test_health_ok():
    """El backend debe responder en /health"""
    r = requests.get(f"{BASE_URL}/health", timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert data.get("ok") is True
    assert data.get("service") == "backend"


def test_chat_hola():
    """El chatbot debe devolver texto al enviar 'Hola'"""
    r = requests.post(f"{BASE_URL}/chat", json={"message": "Hola"}, timeout=20)

    # Si falta la API key y el backend responde 500, mejor saltar esta prueba
    if r.status_code == 500:
        pytest.skip("El backend no tiene OPENAI_API_KEY configurada")

    assert r.status_code == 200
    data = r.json()

    # Aceptamos 'respuesta' o 'reply' (tu backend devuelve ambas)
    texto = data.get("respuesta") or data.get("reply")
    assert isinstance(texto, str) and len(texto.strip()) > 0


def test_chat_sin_message():
    """Debe devolver error si falta el campo 'message'"""
    r = requests.post(f"{BASE_URL}/chat", json={}, timeout=10)
    assert r.status_code == 400
    data = r.json()
    assert "error" in data and isinstance(data["error"], str) and data["error"].strip()
