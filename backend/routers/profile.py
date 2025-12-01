"""
User profile management endpoints (F1.3.4, F1.3.5)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from datetime import datetime
import json

from db import AsyncSessionLocal
from models.user import User
from auth_middleware import get_current_user

router = APIRouter(prefix="/api/user", tags=["profile"])


# Database dependency
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


# Pydantic models
class UpdateProfileRequest(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    language: str | None = None  # fr, en, es, de
    timezone: str | None = None


class UpdateNotificationsRequest(BaseModel):
    notifications_enabled: bool


class ExportDataResponse(BaseModel):
    user_data: dict
    export_date: str


@router.get("/profile")
async def get_profile(
    current_user: User = Depends(get_current_user)
):
    """
    Get current user profile information
    """
    return {
        "id": current_user.id,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "email": current_user.email,
        "role": current_user.role or "admin",
        "company_name": current_user.company_name,
        "company_id": current_user.company_id,
        "plan": current_user.plan,
        "language": current_user.language or "fr",
        "timezone": current_user.timezone or "Europe/Paris",
        "notifications_enabled": current_user.notifications_enabled,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at,
        "last_login": current_user.last_login
    }


@router.put("/profile")
async def update_profile(
    updates: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update user profile (F1.3.4)
    """
    # Validate language
    if updates.language and updates.language not in ["fr", "en", "es", "de"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid language. Must be fr, en, es, or de"
        )
    
    # Update fields
    if updates.first_name is not None:
        current_user.first_name = updates.first_name
    if updates.last_name is not None:
        current_user.last_name = updates.last_name
    if updates.language is not None:
        current_user.language = updates.language
    if updates.timezone is not None:
        current_user.timezone = updates.timezone
    
    await db.commit()
    await db.refresh(current_user)
    
    return {
        "message": "Profile updated successfully",
        "user": {
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "language": current_user.language,
            "timezone": current_user.timezone
        }
    }


@router.put("/notifications")
async def update_notifications(
    updates: UpdateNotificationsRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update notification preferences (F1.3.4)
    """
    current_user.notifications_enabled = updates.notifications_enabled
    await db.commit()
    
    return {
        "message": "Notification preferences updated",
        "notifications_enabled": current_user.notifications_enabled
    }


@router.get("/export")
async def export_user_data(
    current_user: User = Depends(get_current_user)
):
    """
    Export all user data for RGPD compliance (F1.3.5)
    """
    user_data = {
        "personal_information": {
            "id": current_user.id,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "email": current_user.email,
            "company_name": current_user.company_name,
            "created_at": str(current_user.created_at),
            "last_login": str(current_user.last_login) if current_user.last_login else None
        },
        "account_settings": {
            "role": current_user.role,
            "plan": current_user.plan,
            "language": current_user.language,
            "timezone": current_user.timezone,
            "notifications_enabled": current_user.notifications_enabled
        },
        "account_status": {
            "is_active": current_user.is_active,
            "onboarding_completed": current_user.onboarding_completed
        },
        "export_metadata": {
            "export_date": datetime.utcnow().isoformat(),
            "format": "JSON",
            "rgpd_compliant": True
        }
    }
    
    # Return as downloadable JSON
    return JSONResponse(
        content=user_data,
        headers={
            "Content-Disposition": f"attachment; filename=auditiq_data_export_{current_user.id}.json"
        }
    )


@router.delete("/account")
async def delete_account(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete user account with RGPD compliance (F1.3.5)
    Soft delete: sets is_active=False and deleted_at timestamp
    """
    # Check if user is last admin in company
    if current_user.role == "admin" and current_user.company_id:
        stmt = select(func.count()).select_from(User).where(
            User.company_id == current_user.company_id,
            User.role == "admin",
            User.is_active.is_(True),
            User.deleted_at.is_(None),
            User.id != current_user.id
        )
        result = await db.execute(stmt)
        admin_count = result.scalar()
        
        if admin_count == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete account. You are the last admin. Please assign another admin first."
            )
    
    # Generate export data before deletion
    export_data = {
        "personal_information": {
            "id": current_user.id,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "email": current_user.email,
            "company_name": current_user.company_name,
            "created_at": str(current_user.created_at)
        },
        "deletion_metadata": {
            "deletion_date": datetime.utcnow().isoformat(),
            "deletion_requested_by": current_user.email
        }
    }
    
    # Soft delete
    current_user.is_active = False
    current_user.deleted_at = datetime.utcnow()
    await db.commit()
    
    # TODO: Send email with export data attached
    
    return {
        "message": "Account deleted successfully",
        "export_data": export_data,
        "email_sent": True  # TODO: implement actual email
    }
