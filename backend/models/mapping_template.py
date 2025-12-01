"""
Modèle pour les templates de mapping réutilisables
F2.3.4 & F2.3.5: Mapping colonnes personnalisé et templates réutilisables
"""
from sqlalchemy import Column, String, Integer, DateTime, Text, JSON, ForeignKey, func
from sqlalchemy.orm import relationship
from db import Base


class MappingTemplate(Base):
    """Template de mapping réutilisable pour standardiser les colonnes"""
    __tablename__ = 'mapping_templates'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    # Identification
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    use_case = Column(String, nullable=True)  # recruitment, scoring, etc.
    
    # Mapping colonnes
    column_mappings = Column(JSON, nullable=False)
    # Format: {
    #   "original_name": {
    #     "mapped_name": "standardized_name",
    #     "expected_type": "string|number|date|boolean",
    #     "description": "Description de la colonne"
    #   }
    # }
    
    # Configuration par défaut
    default_target_column = Column(String, nullable=True)
    default_sensitive_attributes = Column(JSON, nullable=True)
    
    # Statistiques d'utilisation
    usage_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relations
    user = relationship("User", back_populates="mapping_templates")
