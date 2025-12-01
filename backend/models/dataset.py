"""
Modèles de données pour les datasets et audits
"""
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, JSON, Float, ForeignKey, func
from sqlalchemy.orm import relationship
from db import Base


class Dataset(Base):
    """Représente un dataset uploadé pour audit"""
    __tablename__ = 'datasets'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    connection_id = Column(Integer, ForeignKey('data_connections.id'), nullable=True)
    
    # Métadonnées fichier
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)  # En bytes
    file_hash = Column(String, nullable=False)  # SHA256 pour déduplication
    mime_type = Column(String, nullable=False)
    encoding = Column(String, default='utf-8')  # Encodage détecté
    
    # Statistiques dataset
    row_count = Column(Integer, nullable=False)
    column_count = Column(Integer, nullable=False)
    columns_info = Column(JSON)  # {name: {type, null_count, unique_count, sample_values}}
    
    # Status traitement
    status = Column(String, default='uploaded')  # uploaded, processing, ready, error
    processing_error = Column(Text, nullable=True)
    
    # Configuration audit
    use_case = Column(String, nullable=True)  # recruitment, scoring, support, marketing, other
    target_column = Column(String, nullable=True)  # Colonne à prédire
    sensitive_attributes = Column(JSON, nullable=True)  # ['age', 'gender', 'origin']
    proxy_variables = Column(JSON, nullable=True)  # Variables détectées comme proxy
    
    # F2.3.4: Mapping colonnes personnalisé
    column_mappings = Column(JSON, nullable=True)
    # Format: {"original_col": "mapped_col", ...}
    mapping_template_id = Column(Integer, ForeignKey('mapping_templates.id'), nullable=True)
    
    # RGPD & Sécurité
    anonymized = Column(Boolean, default=False)
    anonymization_method = Column(String, nullable=True)  # hash, pseudonym, suppression
    retention_date = Column(DateTime, nullable=True)  # Date suppression automatique (30 jours)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    
    # Relations
    user = relationship("User", back_populates="datasets")
    data_connection = relationship("DataConnection", back_populates="datasets")
    audits = relationship("Audit", back_populates="dataset", cascade="all, delete-orphan")


class Audit(Base):
    """Représente un audit de fairness sur un dataset"""
    __tablename__ = 'audits'
    
    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey('datasets.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    # Configuration
    audit_name = Column(String, nullable=False)
    use_case = Column(String, nullable=False)
    target_column = Column(String, nullable=False)
    sensitive_attributes = Column(JSON, nullable=False)
    fairness_metrics = Column(JSON, nullable=True)  # ['demographic_parity', 'equal_opportunity', ...]
    comparison_groups = Column(JSON, nullable=True)  # [{attribute: 'gender', groups: ['M', 'F']}]
    
    # Résultats
    status = Column(String, default='pending')  # pending, running, completed, failed
    overall_score = Column(Float, nullable=True)  # Score global 0-100
    risk_level = Column(String, nullable=True)  # low, medium, high, critical
    compliant = Column(Boolean, nullable=True)  # Conforme AI Act
    
    # Métriques calculées
    metrics_results = Column(JSON, nullable=True)  # Résultats détaillés par métrique
    bias_detected = Column(Boolean, default=False)
    critical_bias_count = Column(Integer, default=0)
    
    # Recommandations
    recommendations = Column(JSON, nullable=True)  # Liste des recommandations générées
    mitigation_strategies = Column(JSON, nullable=True)  # Stratégies de mitigation proposées
    
    # Rapports générés
    report_generated = Column(Boolean, default=False)
    report_url = Column(String, nullable=True)
    report_format = Column(String, nullable=True)  # pdf, docx, html, json
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime, nullable=True)
    
    # Relations
    dataset = relationship("Dataset", back_populates="audits")
    user = relationship("User", back_populates="audits")

