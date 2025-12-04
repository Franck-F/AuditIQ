from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from db import AsyncSessionLocal, init_models
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from enum import Enum
import jwt
import bcrypt
import io
import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

app = FastAPI(
    title="Audit-IQ API",
    description="API pour l'audit de fairness des algorithmes",
    version="1.0.0",
    debug=True  # Active le mode debug
)

# Middleware pour logger les requêtes
from starlette.requests import Request as StarletteRequest

@app.middleware("http")
async def log_requests(request: StarletteRequest, call_next):
    if request.url.path == "/api/auth/login" and request.method == "POST":
        # Ne pas consommer le body, juste logger les headers
        print(f"🔍 POST Request to {request.url.path}")
        print(f"   Content-Type: {request.headers.get('content-type', 'not set')}")
        print(f"   Content-Length: {request.headers.get('content-length', 'not set')}")
    response = await call_next(request)
    if request.url.path == "/api/auth/login" and response.status_code == 422:
        print(f"❌ Login failed with 422 - Validation Error")
    return response

# CORS Configuration - Allow frontend origins
# Default origins including the new Netlify deployment
default_origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "https://693172a5572b9400c6242238--auditiq-v1.netlify.app"
]

env_origins = os.getenv("CORS_ORIGINS", "*").split(",")
if env_origins == ["*"]:
    # If default *, we use our specific list but enable regex for all
    cors_origins = default_origins
else:
    cors_origins = env_origins
    # Ensure Netlify URL is present if not *
    if "https://693172a5572b9400c6242238--auditiq-v1.netlify.app" not in cors_origins:
        cors_origins.append("https://693172a5572b9400c6242238--auditiq-v1.netlify.app")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=".*", # Allow all origins (permissive mode)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers for profile management
from routers import team, profile, auth, settings, upload, connections, mapping, audits, reports, ai_chat
app.include_router(auth.router)
app.include_router(team.router)
app.include_router(profile.router)
app.include_router(settings.router)
app.include_router(upload.router)
app.include_router(connections.router)
app.include_router(mapping.router)
app.include_router(audits.router)
app.include_router(reports.router)
app.include_router(ai_chat.router)
print("[OK] Routers auth, team, profile, settings, upload, connections, mapping, audits, reports, ai_chat inclus")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


@app.on_event("startup")
async def on_startup():
    # initialize DB (create tables if necessary)
    await init_models()

# ============= ENDPOINTS =============

@app.get("/")
async def root():
    return {
        "message": "Bienvenue sur l'API Audit-IQ",
        "version": "1.0.0",
        "status": "operational"
    }
