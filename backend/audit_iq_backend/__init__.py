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

# Configuration
SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

app = FastAPI(
    title="Audit-IQ API",
    description="API pour l'audit de fairness des algorithmes",
    version="1.0.0"
)

# CORS Configuration - Allow frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://172.31.32.1:3000",
        "http://172.31.32.1:3001",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


@app.post("/api/auth/login")
async def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """Login user and return JWT token"""
    stmt = select(DBUser).where(DBUser.email == form_data.username)
    q = await db.execute(stmt)
    user = q.scalars().first()

    if user:
        pwd_ok = verify_password(form_data.password, user.hashed_password)
    else:
        pwd_ok = False

    if not user or not pwd_ok:
        raise HTTPException(status_code=401, detail="Identifiants invalides")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )

    return {"message": "ok"}
