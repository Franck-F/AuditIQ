from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, func, UniqueConstraint
from sqlalchemy.orm import relationship
from db import Base

class Organization(Base):
    __tablename__ = 'organizations'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relations
    users = relationship("User", back_populates="organization")
    invitations = relationship("TeamInvitation", back_populates="organization", cascade="all, delete-orphan")
    audits = relationship("Audit", back_populates="organization")
    datasets = relationship("Dataset", back_populates="organization")

class TeamInvitation(Base):
    __tablename__ = 'team_invitations'
    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey('organizations.id'), nullable=False)
    email = Column(String, nullable=False, index=True)
    role = Column(String, default='member')  # admin, member, viewer
    token = Column(String, unique=True, index=True)
    inviter_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    status = Column(String, default='pending')  # pending, accepted, expired, revoked
    created_at = Column(DateTime, server_default=func.now())
    expires_at = Column(DateTime)

    organization = relationship("Organization", back_populates="invitations")
    inviter = relationship("User")
    
    __table_args__ = (UniqueConstraint('organization_id', 'email', name='_org_email_uc'),)
