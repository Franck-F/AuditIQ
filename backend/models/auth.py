"""
Modèles pour l'authentification et la sécurité (F1.2)
"""
from sqlalchemy import Column, String, Integer, DateTime, Boolean, func, ForeignKey
from db import Base


class LoginLog(Base):
    """
    F1.2.7: Logs de connexion
    Historique de toutes les tentatives de connexion
    """
    __tablename__ = 'login_logs'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    email = Column(String, nullable=False)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    success = Column(Boolean, default=False)
    failure_reason = Column(String, nullable=True)
    timestamp = Column(DateTime, server_default=func.now())


class PasswordResetToken(Base):
    """
    F1.2.5: Réinitialisation de mot de passe
    Tokens temporaires pour réinitialisation sécurisée
    """
    __tablename__ = 'password_reset_tokens'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    token = Column(String, unique=True, nullable=False, index=True)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    expires_at = Column(DateTime, nullable=False)
