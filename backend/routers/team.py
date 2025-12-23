"""
Team management endpoints for multi-user features (F1.3.2)
- Organization management
- Member invitations
- Role assignment (Admin, Member, Viewer)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import secrets
from datetime import datetime, timedelta

from db import AsyncSessionLocal
from models.user import User
from models.organization import Organization, TeamInvitation
from auth_middleware import get_current_user
from services.email import send_invitation_email

router = APIRouter(prefix="/api/team", tags=["team"])

# Database dependency
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# Pydantic models
class MemberResponse(BaseModel):
    id: int
    email: str
    first_name: Optional[str]
    last_name: Optional[str]
    role: str
    created_at: datetime
    last_login: Optional[datetime]

class OrganizationResponse(BaseModel):
    id: int
    name: str
    slug: str
    members: List[MemberResponse]

class InviteRequest(BaseModel):
    email: EmailStr
    role: str = "member"  # admin, member, viewer

class RoleUpdateRequest(BaseModel):
    role: str

# Routes
@router.get("/me", response_model=OrganizationResponse)
async def get_my_organization(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get details of the current user's organization"""
    if not current_user.organization_id:
        # Auto-create organization if missing (for legacy users)
        org = Organization(
            name=f"{current_user.company_name or 'Ma Team'}",
            slug=secrets.token_hex(4)
        )
        db.add(org)
        await db.flush()
        current_user.organization_id = org.id
        current_user.role = 'admin' # First user is admin
        await db.commit()
        await db.refresh(org)
    else:
        result = await db.execute(select(Organization).where(Organization.id == current_user.organization_id))
        org = result.scalar_one()

    # Get active members
    result = await db.execute(
        select(User).where(
            User.organization_id == org.id,
            User.is_active == True,
            User.deleted_at == None
        )
    )
    members = result.scalars().all()

    return {
        "id": org.id,
        "name": org.name,
        "slug": org.slug,
        "members": [
            {
                "id": m.id,
                "email": m.email,
                "first_name": m.first_name,
                "last_name": m.last_name,
                "role": m.role or "member",
                "created_at": m.created_at,
                "last_login": m.last_login
            } for m in members
        ]
    }

@router.post("/invite", status_code=status.HTTP_201_CREATED)
async def invite_member(
    request: InviteRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Invite a new member to the organization"""
    if not current_user.organization_id:
        raise HTTPException(status_code=400, detail="Vous n'appartenez à aucune organisation.")
    
    # Check if admin
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Seuls les administrateurs peuvent inviter des membres.")

    # Check if user already exists in org
    existing_member_stmt = select(User).where(User.email == request.email, User.organization_id == current_user.organization_id)
    existing_member = (await db.execute(existing_member_stmt)).scalar_one_or_none()
    if existing_member:
        raise HTTPException(status_code=400, detail="Cet utilisateur est déjà membre de l'organisation.")

    # Check for pending invitation
    stmt = select(TeamInvitation).where(
        TeamInvitation.email == request.email, 
        TeamInvitation.organization_id == current_user.organization_id,
        TeamInvitation.status == 'pending'
    )
    existing_invite = (await db.execute(stmt)).scalar_one_or_none()
    if existing_invite:
        # Update existing invite
        existing_invite.role = request.role
        existing_invite.expires_at = datetime.utcnow() + timedelta(days=7)
        token = existing_invite.token
    else:
        token = secrets.token_urlsafe(32)
        invitation = TeamInvitation(
            organization_id=current_user.organization_id,
            email=request.email,
            role=request.role,
            token=token,
            inviter_id=current_user.id,
            expires_at=datetime.utcnow() + timedelta(days=7)
        )
        db.add(invitation)
    
    # Get org name for email
    result = await db.execute(select(Organization).where(Organization.id == current_user.organization_id))
    org = result.scalar_one()
    
    await db.commit()
    
    # Send email
    await send_invitation_email(request.email, org.name, request.role)
    
    return {"message": "Invitation envoyée avec succès"}

@router.post("/accept-invite/{token}")
async def accept_invitation(
    token: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Accept an invitation to join an organization"""
    stmt = select(TeamInvitation).where(TeamInvitation.token == token, TeamInvitation.status == 'pending')
    invitation = (await db.execute(stmt)).scalar_one_or_none()
    
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation invalide ou expirée.")
    
    if invitation.expires_at < datetime.utcnow():
        invitation.status = 'expired'
        await db.commit()
        raise HTTPException(status_code=400, detail="L'invitation a expiré.")
        
    if invitation.email != current_user.email:
        raise HTTPException(status_code=403, detail="Cette invitation ne vous est pas destinée.")

    # Apply join
    current_user.organization_id = invitation.organization_id
    current_user.role = invitation.role
    invitation.status = 'accepted'
    
    await db.commit()
    return {"message": "Vous avez rejoint l'organisation avec succès."}

@router.put("/member/{user_id}/role")
async def update_member_role(
    user_id: int,
    request: RoleUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a team member's role"""
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Seuls les admins peuvent modifier les rôles.")
        
    stmt = select(User).where(User.id == user_id, User.organization_id == current_user.organization_id)
    user = (await db.execute(stmt)).scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="Membre introuvable.")
        
    user.role = request.role
    await db.commit()
    return {"message": "Rôle mis à jour"}

@router.delete("/member/{user_id}")
async def remove_member(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Remove a member from the organization"""
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Droits insuffisants.")
    
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas vous supprimer vous-même.")
        
    stmt = select(User).where(User.id == user_id, User.organization_id == current_user.organization_id)
    user = (await db.execute(stmt)).scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="Membre introuvable.")
        
    user.organization_id = None
    user.role = 'auditor' # Default role
    
    await db.commit()
    return {"message": "Membre supprimé de l'équipe"}

@router.get("/stats")
async def get_team_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get team statistics for dashboard"""
    if not current_user.organization_id:
        return {
            "active_members": 1,
            "pending_invitations": 0,
            "roles_count": 1
        }
    
    # Active members
    stmt = select(func.count()).select_from(User).where(
        User.organization_id == current_user.organization_id,
        User.is_active == True,
        User.deleted_at == None
    )
    active_count = (await db.execute(stmt)).scalar()
    
    # Pending invites
    stmt = select(func.count()).select_from(TeamInvitation).where(
        TeamInvitation.organization_id == current_user.organization_id,
        TeamInvitation.status == 'pending'
    )
    pending_count = (await db.execute(stmt)).scalar()
    
    return {
        "active_members": active_count,
        "pending_invitations": pending_count,
        "roles_count": 3 # Admin, Member, Viewer
    }
