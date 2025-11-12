# AuditIQ - Backend

Minimal instructions to run the backend locally and with Docker.

Local (development)

1. Create and activate a virtual environment:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

2. Run the server:

```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Docker (recommended for parity)

1. Copy `.env.example` to `.env` and fill secrets.
2. Start services:

```powershell
# from project root
docker compose up --build
```

Notes
- Do not commit `.env` to version control. Use the `.env.example` as a template.
- If using Windows, ensure Docker Desktop is running (WSL2 backend recommended).