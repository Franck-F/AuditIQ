"""
Routeur pour la gestion des paramètres utilisateur
"""
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from typing import Optional
import bcrypt

from db import AsyncSessionLocal
from models.user import User
from auth_middleware import get_current_user

router = APIRouter(prefix="/api/settings", tags=["settings"])


# Database dependency
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


# Pydantic models
class UpdateProfileRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    language: Optional[str] = None
    use_case: Optional[str] = None
    onboarding_completed: Optional[int] = None

class UpdateCompanyRequest(BaseModel):
    company_name: Optional[str] = None
    siret: Optional[str] = None
    sector: Optional[str] = None
    company_size: Optional[str] = None


class UpdateNotificationsRequest(BaseModel):
    critical_bias: Optional[bool] = None
    weekly_reports: Optional[bool] = None
    scheduled_audits: Optional[bool] = None
    product_updates: Optional[bool] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class DeleteAccountRequest(BaseModel):
    password: str
    confirmation: str


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode('utf-8'), 
        hashed_password.encode('utf-8')
    )


def hash_password(password: str) -> str:
    return bcrypt.hashpw(
        password.encode('utf-8'), 
        bcrypt.gensalt()
    ).decode('utf-8')


@router.get("/profile")
async def get_profile_settings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupère les paramètres de profil de l'utilisateur"""
    return {
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "email": current_user.email,
        "phone": None,  # TODO: Ajouter à la base de données
        "language": current_user.language or "fr",
    }


@router.put("/profile")
async def update_profile_settings(
    data: UpdateProfileRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Met à jour les paramètres de profil"""
    # Récupérer l'utilisateur dans la session actuelle
    stmt = select(User).where(User.id == current_user.id)
    result = await db.execute(stmt)
    user = result.scalar_one()
    
    # Vérifier si l'email est déjà utilisé
    if data.email and data.email != user.email:
        stmt = select(User).where(User.email == data.email)
        result = await db.execute(stmt)
        existing = result.scalar_one_or_none()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cet email est déjà utilisé"
            )

    # Mettre à jour les champs
    if data.first_name is not None:
        user.first_name = data.first_name
    if data.last_name is not None:
        user.last_name = data.last_name
    if data.email is not None:
        user.email = data.email
    if data.language is not None:
        user.language = data.language
    if data.use_case is not None:
        user.use_case = data.use_case
    if data.onboarding_completed is not None:
        user.onboarding_completed = data.onboarding_completed
    # Note: phone n'est pas encore dans la base de données
    
    await db.commit()
    await db.refresh(user)
    
    return {
        "message": "Profil mis à jour avec succès",
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "language": user.language,
    }


@router.get("/company")
async def get_company_settings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupère les paramètres d'entreprise"""
    return {
        "company_name": current_user.company_name,
        "siret": current_user.siret,
        "sector": current_user.sector,
        "company_size": current_user.company_size,
    }


@router.put("/company")
async def update_company_settings(
    data: UpdateCompanyRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Met à jour les paramètres d'entreprise"""
    # Récupérer l'utilisateur dans la session actuelle
    stmt = select(User).where(User.id == current_user.id)
    result = await db.execute(stmt)
    user = result.scalar_one()
    
    # Mettre à jour les champs
    if data.company_name is not None:
        user.company_name = data.company_name
    if data.siret is not None:
        user.siret = data.siret
    if data.sector is not None:
        user.sector = data.sector
    if data.company_size is not None:
        user.company_size = data.company_size
    
    await db.commit()
    await db.refresh(user)
    
    return {
        "message": "Informations entreprise mises à jour avec succès",
        "company_name": user.company_name,
        "siret": user.siret,
        "sector": user.sector,
        "company_size": user.company_size,
    }


@router.get("/notifications")
async def get_notification_settings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupère les préférences de notifications"""
    # TODO: Ajouter ces champs à la base de données
    # Pour l'instant, retourner des valeurs par défaut
    return {
        "critical_bias": True,
        "weekly_reports": True,
        "scheduled_audits": True,
        "product_updates": False,
    }


@router.put("/notifications")
async def update_notification_settings(
    data: UpdateNotificationsRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Met à jour les préférences de notifications"""
    # TODO: Stocker ces préférences dans la base de données
    # Pour l'instant, retourner simplement les données reçues
    return {
        "message": "Préférences de notifications mises à jour avec succès",
        "critical_bias": data.critical_bias if data.critical_bias is not None else True,
        "weekly_reports": data.weekly_reports if data.weekly_reports is not None else True,
        "scheduled_audits": data.scheduled_audits if data.scheduled_audits is not None else True,
        "product_updates": data.product_updates if data.product_updates is not None else False,
    }


@router.post("/change-password")
async def change_password(
    data: ChangePasswordRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Change le mot de passe de l'utilisateur"""
    # Récupérer l'utilisateur dans la session actuelle
    stmt = select(User).where(User.id == current_user.id)
    result = await db.execute(stmt)
    user = result.scalar_one()
    
    # Vérifier le mot de passe actuel
    if not verify_password(data.current_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mot de passe actuel incorrect"
        )
    
    # Valider le nouveau mot de passe
    if len(data.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le nouveau mot de passe doit contenir au moins 8 caractères"
        )
    
    # Mettre à jour le mot de passe
    user.hashed_password = hash_password(data.new_password)
    user.failed_login_attempts = 0  # Réinitialiser les tentatives
    user.locked_until = None  # Déverrouiller si verrouillé
    
    await db.commit()
    
    return {"message": "Mot de passe changé avec succès"}


@router.post("/delete-account")
async def delete_account(
    data: DeleteAccountRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Supprime le compte de l'utilisateur (soft delete)"""
    # Vérifier le mot de passe
    if not verify_password(data.password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mot de passe incorrect"
        )
    
    # Vérifier la confirmation
    if data.confirmation != "SUPPRIMER":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Veuillez taper 'SUPPRIMER' pour confirmer"
        )
    
    # Récupérer l'utilisateur dans la session actuelle
    stmt = select(User).where(User.id == current_user.id)
    result = await db.execute(stmt)
    user = result.scalar_one()
    
    # Soft delete - marquer comme inactif et enregistrer la date de suppression
    from datetime import datetime
    user.is_active = False
    user.deleted_at = datetime.utcnow()
    
    await db.commit()
    
    # Déconnecter l'utilisateur
    response.delete_cookie(key="access_token")
    
    return {"message": "Compte supprimé avec succès"}


@router.get("/export")
async def export_user_data(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Exporte toutes les données de l'utilisateur (RGPD)"""
    from datetime import datetime
    
    data = {
        "export_date": datetime.utcnow().isoformat(),
        "user": {
            "id": current_user.id,
            "email": current_user.email,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "company_name": current_user.company_name,
            "company_size": current_user.company_size,
            "sector": current_user.sector,
            "siret": current_user.siret,
            "company_address": current_user.company_address,
            "dpo_contact": current_user.dpo_contact,
            "plan": current_user.plan,
            "role": current_user.role,
            "language": current_user.language,
            "timezone": current_user.timezone,
            "notifications_enabled": current_user.notifications_enabled,
            "is_active": current_user.is_active,
            "last_login": current_user.last_login.isoformat() if current_user.last_login else None,
            "last_login_ip": current_user.last_login_ip,
            "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
        },
        # TODO: Ajouter audits, rapports, etc.
        "audits": [],
        "reports": [],
        "team_members": [],
    }
    
    return data
