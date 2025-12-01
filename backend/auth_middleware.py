"""
Middleware et utilitaires JWT pour l'authentification (F1.2.4)
"""
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
import jwt
from datetime import datetime

from db import AsyncSessionLocal
from models.user import User

# Configuration
SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"

security = HTTPBearer(auto_error=False)


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


async def get_token_from_cookie_or_header(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[str]:
    """
    Récupère le token JWT depuis le cookie ou le header Authorization
    """
    # Essayer depuis le cookie (priorité)
    token = request.cookies.get("access_token")
    if token:
        return token
    
    # Essayer depuis le header Authorization
    if credentials:
        return credentials.credentials
    
    return None


async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> User:
    """
    F1.2.4: Récupère l'utilisateur authentifié depuis le JWT
    Utilisé comme dépendance dans les routes protégées
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentification requise",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Récupérer le token
    token = await get_token_from_cookie_or_header(request, credentials)
    
    if not token:
        raise credentials_exception
    
    try:
        # Décoder le token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        user_id: int = payload.get("user_id")
        
        if email is None or user_id is None:
            raise credentials_exception
    
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expiré. Veuillez vous reconnecter.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise credentials_exception
    
    # Récupérer l'utilisateur depuis la base
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalars().first()
    
    if user is None:
        raise credentials_exception
    
    # Vérifier que le compte est actif
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte désactivé"
        )
    
    # Vérifier que le compte n'est pas supprimé
    if user.deleted_at:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Compte supprimé"
        )
    
    return user


async def get_current_active_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    F1.3.1: Vérifie que l'utilisateur est admin
    Utilisé pour protéger les routes d'administration
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux administrateurs"
        )
    return current_user


async def get_current_active_auditor_or_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    F1.3.1: Vérifie que l'utilisateur est admin ou auditeur
    Utilisé pour protéger les routes de création/modification
    """
    if current_user.role not in ["admin", "auditor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès réservé aux administrateurs et auditeurs"
        )
    return current_user


def require_role(*allowed_roles: str):
    """
    F1.3.3: Décorateur pour vérifier les rôles
    Usage: @require_role("admin", "auditor")
    """
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Accès réservé aux rôles: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker
