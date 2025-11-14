
# AuditIQ

![AuditIQ logo](https://raw.githubusercontent.com/Franck-F/AuditIQ/master/frontend/public/assets/logo-auditiq-big.png)

Build Real-Time Fairness & Audit Pipelines for ML systems — backend (FastAPI) and frontend (Next.js).

[![Lint with Ruff](https://github.com/Franck-F/AuditIQ/actions/workflows/backend-lint.yml/badge.svg)](https://github.com/Franck-F/AuditIQ/actions/workflows/backend-lint.yml)
[![Tests](https://github.com/Franck-F/AuditIQ/actions/workflows/backend-tests.yml/badge.svg)](https://github.com/Franck-F/AuditIQ/actions/workflows/backend-tests.yml)
[![Type Check](https://github.com/Franck-F/AuditIQ/actions/workflows/backend-typecheck.yml/badge.svg)](https://github.com/Franck-F/AuditIQ/actions/workflows/backend-typecheck.yml)
[![Release](https://img.shields.io/github/v/release/Franck-F/AuditIQ?label=Release)](https://github.com/Franck-F/AuditIQ/releases)
[![Stars](https://img.shields.io/github/stars/Franck-F/AuditIQ?style=flat-square)](https://github.com/Franck-F/AuditIQ/stargazers)

This repository contains the AuditIQ frontend (Next.js) and backend (FastAPI).

Quick start

1. Copy `.env.example` to `.env` and fill secret values.
2. Start the stack with Docker Compose:

```powershell
cd <repo-root>
docker compose up --build
```

Local development

Backend (Python):

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Frontend (Next.js):

```powershell
cd frontend
pnpm install
pnpm run dev
```

