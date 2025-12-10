from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship
from db import Base
from datetime import datetime

class EDADataSource(Base):
    """
    Source de données pour Auto EDA (indépendante des audits de fairness)
    Permet de configurer l'ingestion automatique depuis diverses sources
    """
    __tablename__ = "eda_data_sources"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Identification
    name = Column(String, nullable=False)
    description = Column(String)
    
    # Type de source
    source_type = Column(String, nullable=False)  # "csv", "warehouse", "api", "google_sheets"
    connection_config = Column(JSON)  # Credentials, URL, query, etc.
    
    # Configuration d'ingestion
    ingestion_schedule = Column(String, default="daily")  # "daily", "hourly", "weekly", "manual"
    last_ingestion = Column(DateTime, nullable=True)
    next_ingestion = Column(DateTime, nullable=True)
    
    # Métadonnées
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relations
    analyses = relationship("EDAAnalysis", back_populates="data_source", cascade="all, delete-orphan")
    user = relationship("User")

class EDAAnalysis(Base):
    """
    Analyse EDA (séparée des audits de fairness)
    Stocke les résultats d'une analyse exploratoire automatique
    """
    __tablename__ = "eda_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    data_source_id = Column(Integer, ForeignKey("eda_data_sources.id"), nullable=False)
    
    # Timing
    analysis_date = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Status
    status = Column(String, default="pending")  # pending, running, completed, failed
    error_message = Column(String, nullable=True)
    
    # Configuration d'analyse
    metrics_config = Column(JSON)  # {"revenue": {"type": "sum", "alert_threshold": 10000}}
    dimensions_config = Column(JSON)  # ["region", "product_category", "ad_set"]
    confidence_level = Column(Float, default=0.95)
    
    # Résultats
    summary_stats = Column(JSON)  # Statistiques descriptives globales
    top_anomalies = Column(JSON)  # Top 3 anomalies pour rapport matinal
    all_findings_count = Column(Integer, default=0)
    
    # Alertes
    alerts_sent = Column(Boolean, default=False)
    alert_channels = Column(JSON)  # ["email", "slack"]
    alert_sent_at = Column(DateTime, nullable=True)
    
    # Relations
    data_source = relationship("EDADataSource", back_populates="analyses")
    findings = relationship("AnomalyFinding", back_populates="analysis", cascade="all, delete-orphan")

class AnomalyFinding(Base):
    """
    Anomalie détectée (indépendante des biais de fairness)
    Représente une déviation statistiquement significative
    """
    __tablename__ = "eda_anomaly_findings"
    
    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("eda_analyses.id"), nullable=False)
    
    # Identification de l'anomalie
    metric_name = Column(String, nullable=False)
    dimension = Column(String, nullable=True)  # Ex: "region"
    dimension_value = Column(String, nullable=True)  # Ex: "Europe"
    
    # Statistiques
    observed_value = Column(Float, nullable=False)
    expected_value = Column(Float, nullable=False)
    deviation_std = Column(Float)  # Écarts-types (sigma)
    p_value = Column(Float)
    confidence_interval_lower = Column(Float, nullable=True)
    confidence_interval_upper = Column(Float, nullable=True)
    
    # Impact et sévérité
    business_impact = Column(Float)  # Score 0-100
    severity = Column(String)  # "low", "medium", "high", "critical"
    
    # Analyse de cause
    probable_root_cause = Column(String)
    cause_confidence = Column(Float)  # 0.0 - 1.0
    correlated_factors = Column(JSON)  # Liste de facteurs corrélés
    
    # Métadonnées
    detected_at = Column(DateTime, default=datetime.utcnow)
    is_false_positive = Column(Boolean, default=False)  # Marqué par utilisateur
    
    # Relations
    analysis = relationship("EDAAnalysis", back_populates="findings")

class EDAFairnessLink(Base):
    """
    Table de liaison optionnelle entre EDA et Fairness Audit
    Permet aux utilisateurs de croiser les analyses si souhaité
    """
    __tablename__ = "eda_fairness_links"
    
    id = Column(Integer, primary_key=True, index=True)
    eda_analysis_id = Column(Integer, ForeignKey("eda_analyses.id"), nullable=False)
    fairness_audit_id = Column(Integer, ForeignKey("audits.id"), nullable=False)
    
    # Type de lien
    link_type = Column(String, default="cross_reference")  # "cross_reference", "impact_analysis"
    notes = Column(String)
    
    # Métadonnées
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"))
    
    # Relations
    creator = relationship("User")
