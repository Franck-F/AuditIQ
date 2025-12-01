"""
Team management endpoints for multi-user features (F1.3.2)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import datetime
from pydantic import BaseModel, EmailStr

from db import AsyncSessionLocal
from models.user import User
from auth_middleware import get_current_user, get_current_active_admin

router = APIRouter(prefix="/api/team", tags=["team"])


# Database dependency
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


# Pydantic models
class TeamMemberResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime
    last_login: datetime | None

    class Config:
        from_attributes = True


class InviteUserRequest(BaseModel):
    email: EmailStr
    role: str = "reader"  # admin, auditor, reader


class UpdateRoleRequest(BaseModel):
    role: str  # admin, auditor, reader


@router.get("/members", response_model=List[TeamMemberResponse])
async def get_team_members(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all members of the current user's company (F1.3.2)
    """
    if not current_user.company_id:
        # User has no company - return only themselves
        return [TeamMemberResponse(
            id=current_user.id,
            first_name=current_user.first_name,
            last_name=current_user.last_name,
            email=current_user.email,
            role=current_user.role or "admin",
            is_active=current_user.is_active,
            created_at=current_user.created_at,
            last_login=current_user.last_login
        )]
    
    # Get all active members of the company
    stmt = select(User).where(
        User.company_id == current_user.company_id,
        User.is_active == True,
        User.deleted_at == None
    )
    result = await db.execute(stmt)
    members = result.scalars().all()
    
    return [TeamMemberResponse(
        id=member.id,
        first_name=member.first_name,
        last_name=member.last_name,
        email=member.email,
        role=member.role or "admin",
        is_active=member.is_active,
        created_at=member.created_at,
        last_login=member.last_login
    ) for member in members]


@router.post("/invite")
async def invite_team_member(
    invite: InviteUserRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Invite a new team member (F1.3.2) - Admin only
    """
    # Check if user is admin
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can invite team members"
        )
    
    # Validate role
    if invite.role not in ["admin", "auditor", "reader"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be admin, auditor, or reader"
        )
    
    # Check if user already exists
    stmt = select(User).where(User.email == invite.email)
    result = await db.execute(stmt)
    existing_user = result.scalars().first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # TODO: Send invitation email with signup link including company_id
    
    return {
        "message": "Invitation sent successfully",
        "email": invite.email,
        "role": invite.role,
        "company_id": current_user.company_id
    }


@router.put("/member/{member_id}/role")
async def update_member_role(
    member_id: str,
    update: UpdateRoleRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a team member's role (F1.3.1) - Admin only
    """
    # Check if user is admin
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can change member roles"
        )
    
    # Validate role
    if update.role not in ["admin", "auditor", "reader"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be admin, auditor, or reader"
        )
    
    # Get member
    stmt = select(User).where(User.id == member_id)
    result = await db.execute(stmt)
    member = result.scalars().first()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team member not found"
        )
    
    # Check if member is in same company
    if member.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot modify members from other companies"
        )
    
    # Update role
    member.role = update.role
    await db.commit()
    
    return {
        "message": "Role updated successfully",
        "member_id": member_id,
        "new_role": update.role
    }


@router.delete("/member/{member_id}")
async def remove_team_member(
    member_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Remove a team member (F1.3.2) - Admin only
    Soft delete: sets is_active=False and deleted_at timestamp
    """
    # Check if user is admin
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can remove team members"
        )
    
    # Prevent self-deletion
    if member_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove yourself from the team"
        )
    
    # Get member
    stmt = select(User).where(User.id == member_id)
    result = await db.execute(stmt)
    member = result.scalars().first()
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team member not found"
        )
    
    # Check if member is in same company
    if member.company_id != current_user.company_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot remove members from other companies"
        )
    
    # Soft delete
    member.is_active = False
    member.deleted_at = datetime.utcnow()
    await db.commit()
    
    return {
        "message": "Team member removed successfully",
        "member_id": member_id
    }


@router.get("/stats")
async def get_team_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get team statistics for dashboard cards
    """
    if not current_user.company_id:
        return {
            "active_members": 1,
            "pending_invitations": 0,
            "roles_count": 1
        }
    
    # Count active members
    from sqlalchemy import func
    stmt = select(func.count()).select_from(User).where(
        User.company_id == current_user.company_id,
        User.is_active == True,
        User.deleted_at == None
    )
    result = await db.execute(stmt)
    active_count = result.scalar()
    
    # Count unique roles
    stmt = select(User.role).where(
        User.company_id == current_user.company_id,
        User.is_active == True,
        User.deleted_at == None
    ).distinct()
    result = await db.execute(stmt)
    roles = result.scalars().all()
    
    return {
        "active_members": active_count,
        "pending_invitations": 0,  # TODO: implement invitation table
        "roles_count": len(roles)
    }

