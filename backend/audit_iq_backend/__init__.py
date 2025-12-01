from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from db import AsyncSessionLocal, init_models
from models.user import User as DBUser
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
cors_origins = CORS_ORIGINS if isinstance(CORS_ORIGINS, list) else [CORS_ORIGINS]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers for profile management
try:
    from routers import team, profile, auth, settings, upload, connections, mapping
    app.include_router(auth.router)
    app.include_router(team.router)
    app.include_router(profile.router)
    app.include_router(settings.router)
    app.include_router(upload.router)
    app.include_router(connections.router)
    app.include_router(mapping.router)
    print("✅ Routers auth, team, profile, settings, upload, connections, mapping inclus")
except ImportError as e:
    print(f"⚠️ Erreur lors de l'import des routers: {e}")
    pass  # Routers not yet configured

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


@app.on_event("startup")
async def on_startup():
    # initialize DB (create tables if necessary)
    await init_models()

# ============= MODELS =============

class UserRole(str, Enum):
    ADMIN = "admin"
    AUDITOR = "auditor"
    READER = "reader"

class UseCaseType(str, Enum):
    RECRUITMENT = "recruitment"
    SCORING = "scoring"
    SUPPORT = "support"
    MARKETING = "marketing"
    OTHER = "other"

class BiasStatus(str, Enum):
    CRITICAL = "critical"
    WARNING = "warning"
    COMPLIANT = "compliant"

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    company_name: str
    sector: str
    company_size: str
    
    # F1.1.3: Profil entreprise étendu
    siret: Optional[str] = None
    company_address: Optional[str] = None
    dpo_contact: Optional[str] = None
    
    # F1.1.5: Choix du plan
    plan: Optional[str] = 'freemium'

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# ============= UTILITIES =============

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

# ============= ENDPOINTS =============

@app.get("/")
async def root():
    return {
        "message": "Bienvenue sur l'API Audit-IQ",
        "version": "1.0.0",
        "status": "operational"
    }

@app.post("/api/auth/register")
async def register(
    user: UserCreate,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """Register a new user and persist to DB"""
    # Check existing user
    q = await db.execute(select(DBUser).where(DBUser.email == user.email))
    existing = q.scalars().first()
    if existing:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")

    hashed_pw = hash_password(user.password)
    db_user = DBUser(
        email=user.email,
        hashed_password=hashed_pw,
        first_name=user.first_name,
        last_name=user.last_name,
        company_name=user.company_name,
        sector=user.sector,
        company_size=user.company_size,
        siret=user.siret,
        company_address=user.company_address,
        dpo_contact=user.dpo_contact,
        plan=user.plan,
        onboarding_completed=0,
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )

    # Set token as HttpOnly cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

    return {"message": "registered"}


# Note: L'endpoint /api/auth/login est maintenant dans routers/auth.py
# (supprimé pour éviter les conflits)


@app.post("/api/user/onboarding")
async def update_onboarding(
    use_case: str,
    onboarding_completed: int = 4,
    db: AsyncSession = Depends(get_db),
):
    """Update user onboarding status (requires authentication)"""
    # TODO: Get user from JWT token in production
    # For now, update the first user as demo
    stmt = select(DBUser).limit(1)
    q = await db.execute(stmt)
    user = q.scalars().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.use_case = use_case
    user.onboarding_completed = onboarding_completed
    await db.commit()
    
    return {"message": "onboarding updated", "use_case": use_case}
