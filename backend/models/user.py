from sqlalchemy import Column, String, Integer, DateTime, Boolean, func
from sqlalchemy.orm import relationship
from db import Base

class User(Base):
    __tablename__ = 'users'
    __table_args__ = {'extend_existing': True}
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    first_name = Column(String)
    last_name = Column(String)
    company_name = Column(String)
    sector = Column(String)
    company_size = Column(String)
    
    # F1.1.3: Profil entreprise étendu
    siret = Column(String, nullable=True)
    company_address = Column(String, nullable=True)
    dpo_contact = Column(String, nullable=True)
    
    # F1.1.5: Choix du plan
    plan = Column(String, default='freemium')  # freemium, pro, enterprise
    
    # F1.1.4: Onboarding
    onboarding_completed = Column(Integer, default=0)  # 0=non démarré, 1-3=étapes, 4=terminé
    use_case = Column(String, nullable=True)  # recrutement, scoring, service_client
    
    # F1.3.1: Rôles utilisateurs
    role = Column(String, default='admin')  # admin, auditor, reader
    
    # F1.3.2: Gestion multi-utilisateurs
    company_id = Column(String, nullable=True)  # ID de l'entreprise pour regrouper les utilisateurs
    
    # F1.3.4: Paramètres de compte
    notifications_enabled = Column(Boolean, default=True)
    language = Column(String, default='fr')  # fr, en, es, de
    timezone = Column(String, default='Europe/Paris')
    
    # F1.3.5: Compte actif/désactivé
    is_active = Column(Boolean, default=True)
    deleted_at = Column(DateTime, nullable=True)

    # Verification Email
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String, nullable=True)
    
    # F1.2.6: Verrouillage après tentatives échouées
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime, nullable=True)
    
    # F1.2.7: Logs de connexion
    last_login = Column(DateTime, nullable=True)
    last_login_ip = Column(String, nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())
    

    datasets = relationship(
        "Dataset",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    audits = relationship(
        "Audit",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    data_connections = relationship(
        "DataConnection",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    mapping_templates = relationship(
        "MappingTemplate",
        back_populates="user",
        cascade="all, delete-orphan"
    )
