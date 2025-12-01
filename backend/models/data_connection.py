"""
Modèle pour les connexions de données externes (F2.2)
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from db import Base

class DataConnection(Base):
    """
    F2.2: Connexions aux sources de données
    """
    __tablename__ = "data_connections"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # 'database', 'api', 'saas'
    provider = Column(String, nullable=False)  # 'postgres', 'salesforce', 'hubspot'
    
    # Configuration générique
    config = Column(JSON, nullable=False)  # Configuration spécifique (URL, paramètres, etc.)
    
    # F2.2.3: Credentials chiffrés
    encrypted_credentials = Column(Text, nullable=True)  # Stockage sécurisé des credentials
    
    # Statut
    is_active = Column(Boolean, default=True)
    last_sync = Column(DateTime, nullable=True)
    last_sync_status = Column(String(50), nullable=True)  # 'success', 'error'
    last_sync_error = Column(Text, nullable=True)
    
    # F2.2.4: Synchronisation automatique
    auto_sync_enabled = Column(Boolean, default=False)
    sync_frequency = Column(String(20), nullable=True)  # 'daily', 'weekly', 'monthly'
    sync_schedule = Column(JSON, nullable=True)  # Configuration horaire détaillée
    
    # Métadonnées
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    user = relationship("User", back_populates="data_connections")
    datasets = relationship("Dataset", back_populates="data_connection", cascade="all, delete-orphan")


class SyncHistory(Base):
    """
    Historique des synchronisations
    """
    __tablename__ = "sync_history"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    connection_id = Column(Integer, ForeignKey("data_connections.id"), nullable=False)
    
    sync_started_at = Column(DateTime, nullable=False)
    sync_completed_at = Column(DateTime, nullable=True)
    status = Column(String(50), nullable=False)  # 'pending', 'success', 'error'
    error_message = Column(Text, nullable=True)
    
    # Statistiques
    rows_fetched = Column(Integer, default=0)
    data_size_bytes = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
