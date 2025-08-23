# tests/conftest.py
import os
import pytest
import requests

@pytest.fixture(scope="session")
def base_url():
    # Permite: BASE_URL=http://localhost:3000 pytest -v
    return os.getenv("BASE_URL", "http://localhost:3000")

@pytest.fixture(scope="session")
def http():
    # Reutiliza la conexión (más rápido y “de producción”)
    s = requests.Session()
    yield s
    s.close()
