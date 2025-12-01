"""
Routeur d'authentification amélioré avec sécurité (F1.2)
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from typing import Optional
import secrets
import jwt
import bcrypt

from db import AsyncSessionLocal
from models.user import User
from models.auth import LoginLog, PasswordResetToken
from auth_middleware import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Configuration
SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_DURATION_MINUTES = 30


# Database dependency
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


# Pydantic models
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


# Utility functions
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
    return bcrypt.hashpw(
        password.encode('utf-8'), 
        bcrypt.gensalt()
    ).decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode('utf-8'), 
        hashed_password.encode('utf-8')
    )


async def log_login_attempt(
    db: AsyncSession,
    email: str,
    ip_address: str,
    user_agent: str,
    success: bool,
    user_id: Optional[int] = None,
    failure_reason: Optional[str] = None
):
    """F1.2.7: Enregistre une tentative de connexion"""
    log = LoginLog(
        user_id=user_id,
        email=email,
        ip_address=ip_address,
        user_agent=user_agent,
        success=success,
        failure_reason=failure_reason
    )
    db.add(log)
    await db.commit()


async def check_account_locked(user: User) -> bool:
    """F1.2.6: Vérifie si le compte est verrouillé"""
    if user.locked_until and user.locked_until > datetime.utcnow():
        return True
    return False


async def unlock_account(db: AsyncSession, user: User):
    """F1.2.6: Déverrouille un compte si la période est expirée"""
    if user.locked_until and user.locked_until <= datetime.utcnow():
        user.locked_until = None
        user.failed_login_attempts = 0
        await db.commit()


async def increment_failed_attempts(db: AsyncSession, user: User):
    """F1.2.6: Incrémente les tentatives échouées et verrouille si besoin"""
    user.failed_login_attempts += 1
    
    if user.failed_login_attempts >= MAX_LOGIN_ATTEMPTS:
        user.locked_until = datetime.utcnow() + timedelta(
            minutes=LOCKOUT_DURATION_MINUTES
        )
    
    await db.commit()


async def reset_failed_attempts(db: AsyncSession, user: User):
    """F1.2.6: Réinitialise les tentatives échouées après succès"""
    user.failed_login_attempts = 0
    user.locked_until = None
    await db.commit()


@router.post("/login", response_model=TokenResponse)
async def login(
    request: Request,
    response: Response,
    credentials: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    F1.2.1, F1.2.4, F1.2.6, F1.2.7: Connexion améliorée
    - Validation email/mot de passe
    - Gestion JWT
    - Verrouillage après 5 tentatives
    - Logs de connexion
    """
    print(f"🔍 LOGIN REQUEST: email={credentials.email}")
    
    # Récupérer IP et User-Agent
    ip_address = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")
    
    # Rechercher l'utilisateur
    stmt = select(User).where(User.email == credentials.email)
    result = await db.execute(stmt)
    user = result.scalars().first()
    
    if not user:
        # Log tentative échouée (email inexistant)
        await log_login_attempt(
            db, credentials.email, ip_address, user_agent,
            success=False, failure_reason="Email not found"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect"
        )
    
    # Vérifier si le compte est verrouillé
    await unlock_account(db, user)  # Déverrouille si période expirée
    
    if await check_account_locked(user):
        remaining = (user.locked_until - datetime.utcnow()).seconds // 60
        await log_login_attempt(
            db, credentials.email, ip_address, user_agent,
            success=False, user_id=user.id, failure_reason="Account locked"
        )
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail=f"Compte verrouillé. Réessayez dans {remaining} minutes."
        )
    
    # Vérifier le mot de passe
    if not verify_password(credentials.password, user.hashed_password):
        # Incrémenter tentatives échouées
        await increment_failed_attempts(db, user)
        
        # Log tentative échouée
        await log_login_attempt(
            db, credentials.email, ip_address, user_agent,
            success=False, user_id=user.id, 
            failure_reason="Invalid password"
        )
        
        attempts_left = MAX_LOGIN_ATTEMPTS - user.failed_login_attempts
        if attempts_left > 0:
            detail = f"Mot de passe incorrect. {attempts_left} tentative(s) restante(s)."
        else:
            detail = "Compte verrouillé pour 30 minutes (5 tentatives échouées)."
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail
        )
    
    # Vérifier si le compte est actif
    if not user.is_active:
        await log_login_attempt(
            db, credentials.email, ip_address, user_agent,
            success=False, user_id=user.id, 
            failure_reason="Account inactive"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte désactivé. Contactez le support."
        )
    
    # Connexion réussie
    await reset_failed_attempts(db, user)
    
    # Mettre à jour last_login
    user.last_login = datetime.utcnow()
    user.last_login_ip = ip_address
    await db.commit()
    
    # Log connexion réussie
    await log_login_attempt(
        db, credentials.email, ip_address, user_agent,
        success=True, user_id=user.id
    )
    
    # Créer token JWT
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id},
        expires_delta=access_token_expires
    )
    
    # Définir cookie HttpOnly
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role or "admin"
        }
    }


@router.post("/logout")
async def logout(response: Response):
    """Déconnexion - supprime le cookie JWT"""
    response.delete_cookie(key="access_token")
    return {"message": "Déconnecté avec succès"}


@router.get("/me")
async def get_current_user_info(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Récupère les informations de l'utilisateur connecté
    """
    return {
        "id": current_user.id,
        "email": current_user.email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "company_name": current_user.company_name,
        "company_size": current_user.company_size,
        "sector": current_user.sector,
        "role": current_user.role or "admin",
        "plan": current_user.plan or "free",
        "is_active": current_user.is_active,
        "language": current_user.language or "fr",
        "timezone": current_user.timezone or "Europe/Paris",
        "notifications_enabled": current_user.notifications_enabled if current_user.notifications_enabled is not None else True,
        "last_login": current_user.last_login.isoformat() if current_user.last_login else None,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None
    }


class UpdateProfileRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    company_name: Optional[str] = None
    company_size: Optional[str] = None
    sector: Optional[str] = None
    role: Optional[str] = None
    language: Optional[str] = None
    timezone: Optional[str] = None
    notifications_enabled: Optional[bool] = None


@router.put("/me")
async def update_current_user_profile(
    profile_data: UpdateProfileRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Met à jour le profil de l'utilisateur connecté
    """
    print(f"🔄 UPDATE PROFILE REQUEST:")
    print(f"   User ID: {current_user.id}")
    print(f"   Données reçues: {profile_data.model_dump()}")
    
    # Récupérer l'utilisateur dans la session actuelle (pas celle de get_current_user)
    stmt = select(User).where(User.id == current_user.id)
    result = await db.execute(stmt)
    user = result.scalar_one()
    
    print(f"   Avant - first_name: {user.first_name}, last_name: {user.last_name}")
    
    # Mettre à jour les champs fournis
    if profile_data.first_name is not None:
        user.first_name = profile_data.first_name
    if profile_data.last_name is not None:
        user.last_name = profile_data.last_name
    if profile_data.company_name is not None:
        user.company_name = profile_data.company_name
    if profile_data.company_size is not None:
        user.company_size = profile_data.company_size
    if profile_data.sector is not None:
        user.sector = profile_data.sector
    if profile_data.role is not None:
        user.role = profile_data.role
    if profile_data.language is not None:
        user.language = profile_data.language
    if profile_data.timezone is not None:
        user.timezone = profile_data.timezone
    if profile_data.notifications_enabled is not None:
        user.notifications_enabled = profile_data.notifications_enabled
    
    print(f"   Après - first_name: {user.first_name}, last_name: {user.last_name}")
    
    # Sauvegarder les modifications
    await db.commit()
    await db.refresh(user)
    
    print(f"   ✅ Commit effectué et rechargé depuis DB")
    print(f"   Vérifié - first_name: {user.first_name}, last_name: {user.last_name}")
    
    return {
        "message": "Profil mis à jour avec succès",
        "user": {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "company_name": user.company_name,
            "company_size": user.company_size,
            "sector": user.sector,
            "role": user.role,
            "language": user.language,
            "timezone": user.timezone,
            "notifications_enabled": user.notifications_enabled
        }
    }


@router.post("/forgot-password")
async def forgot_password(
    request: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    F1.2.5: Demande de réinitialisation de mot de passe
    Génère un token sécurisé valide 1 heure
    """
    # Rechercher l'utilisateur
    stmt = select(User).where(User.email == request.email)
    result = await db.execute(stmt)
    user = result.scalars().first()
    
    # Ne pas révéler si l'email existe ou non (sécurité)
    if not user:
        return {
            "message": "Si l'email existe, un lien de réinitialisation a été envoyé."
        }
    
    # Générer token sécurisé
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)
    
    # Enregistrer le token
    reset_token = PasswordResetToken(
        user_id=user.id,
        token=token,
        expires_at=expires_at
    )
    db.add(reset_token)
    await db.commit()
    
    # TODO: Envoyer email avec le lien
    # reset_link = f"https://auditiq.com/reset-password?token={token}"
    
    return {
        "message": "Si l'email existe, un lien de réinitialisation a été envoyé.",
        "token": token  # À RETIRER EN PRODUCTION (debug only)
    }


@router.post("/reset-password")
async def reset_password(
    request: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    F1.2.5: Réinitialisation du mot de passe avec token
    """
    # Rechercher le token
    stmt = select(PasswordResetToken).where(
        PasswordResetToken.token == request.token,
        PasswordResetToken.used == False
    )
    result = await db.execute(stmt)
    reset_token = result.scalars().first()
    
    if not reset_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token invalide ou déjà utilisé"
        )
    
    # Vérifier expiration
    if reset_token.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token expiré. Demandez un nouveau lien."
        )
    
    # Récupérer l'utilisateur
    stmt = select(User).where(User.id == reset_token.user_id)
    result = await db.execute(stmt)
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur introuvable"
        )
    
    # Mettre à jour le mot de passe
    user.hashed_password = hash_password(request.new_password)
    user.failed_login_attempts = 0  # Réinitialiser les tentatives
    user.locked_until = None  # Déverrouiller si verrouillé
    
    # Marquer le token comme utilisé
    reset_token.used = True
    
    await db.commit()
    
    return {"message": "Mot de passe réinitialisé avec succès"}


@router.get("/login-history")
async def get_login_history(
    db: AsyncSession = Depends(get_db),
    limit: int = 20
):
    """
    F1.2.7: Historique des connexions
    TODO: Ajouter authentification et filtrer par user_id
    """
    stmt = select(LoginLog).order_by(LoginLog.timestamp.desc()).limit(limit)
    result = await db.execute(stmt)
    logs = result.scalars().all()
    
    return [
        {
            "email": log.email,
            "ip_address": log.ip_address,
            "success": log.success,
            "failure_reason": log.failure_reason,
            "timestamp": log.timestamp
        }
        for log in logs
    ]
