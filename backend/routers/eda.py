"""
Auto EDA API Routes
Routes dédiées à l'analyse exploratoire automatique
"""

from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from datetime import datetime
import pandas as pd
import logging

from models.eda_models import EDADataSource, EDAAnalysis, AnomalyFinding, EDAFairnessLink
from models.user import User
from db import AsyncSessionLocal
from auth_middleware import get_current_user
from services.eda import AnomalyDetector, RootCauseAnalyzer, EDAReportGenerator
from connectors.base import BaseConnector

router = APIRouter(prefix="/api/eda", tags=["Auto EDA"])
logger = logging.getLogger(__name__)

# Database session dependency
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# ============================================================================
# DATA SOURCES ENDPOINTS
# ============================================================================

@router.post("/data-sources", status_code=status.HTTP_201_CREATED)
async def create_data_source(
    source_data: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Créer une nouvelle source de données EDA
    
    Body:
        {
            "name": "My Data Source",
            "description": "...",
            "source_type": "csv|warehouse|api|google_sheets",
            "connection_config": {...},
            "ingestion_schedule": "daily|hourly|weekly|manual"
        }
    """
    new_source = EDADataSource(
        user_id=current_user.id,
        name=source_data['name'],
        description=source_data.get('description'),
        source_type=source_data['source_type'],
        connection_config=source_data['connection_config'],
        ingestion_schedule=source_data.get('ingestion_schedule', 'daily')
    )
    
    db.add(new_source)
    await db.commit()
    await db.refresh(new_source)
    
    logger.info(f"Created EDA data source {new_source.id} for user {current_user.id}")
    
    return {
        "id": new_source.id,
        "name": new_source.name,
        "status": "created"
    }

@router.get("/data-sources")
async def list_data_sources(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Lister les sources de données de l'utilisateur"""
    result = await db.execute(
        select(EDADataSource)
        .where(EDADataSource.user_id == current_user.id)
        .order_by(EDADataSource.created_at.desc())
    )
    sources = result.scalars().all()
    
    return [
        {
            "id": s.id,
            "name": s.name,
            "source_type": s.source_type,
            "ingestion_schedule": s.ingestion_schedule,
            "last_ingestion": s.last_ingestion.isoformat() if s.last_ingestion else None,
            "is_active": s.is_active,
            "created_at": s.created_at.isoformat()
        }
        for s in sources
    ]

@router.get("/data-sources/{source_id}")
async def get_data_source(
    source_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Récupérer les détails d'une source"""
    source = await db.get(EDADataSource, source_id)
    
    if not source or source.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Source not found")
    
    return {
        "id": source.id,
        "name": source.name,
        "description": source.description,
        "source_type": source.source_type,
        "connection_config": source.connection_config,
        "ingestion_schedule": source.ingestion_schedule,
        "is_active": source.is_active
    }

@router.delete("/data-sources/{source_id}")
async def delete_data_source(
    source_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Supprimer une source de données"""
    source = await db.get(EDADataSource, source_id)
    
    if not source or source.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Source not found")
    
    await db.delete(source)
    await db.commit()
    
    return {"status": "deleted"}

# ============================================================================
# ANALYSIS ENDPOINTS
# ============================================================================

@router.post("/analyses/run")
async def run_analysis(
    analysis_config: dict,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Lancer une analyse EDA manuelle
    
    Body:
        {
            "data_source_id": 1,
            "metrics": {"revenue": {"type": "sum"}, "conversion": {"type": "mean"}},
            "dimensions": ["region", "product"],
            "confidence_level": 0.95
        }
    """
    data_source_id = analysis_config['data_source_id']
    
    # Vérifier ownership
    source = await db.get(EDADataSource, data_source_id)
    if not source or source.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Source not found")
    
    # Créer l'analyse
    analysis = EDAAnalysis(
        data_source_id=data_source_id,
        metrics_config=analysis_config['metrics'],
        dimensions_config=analysis_config.get('dimensions', []),
        confidence_level=analysis_config.get('confidence_level', 0.95),
        status="pending",
        alert_channels=analysis_config.get('alert_channels', [])
    )
    
    db.add(analysis)
    await db.commit()
    await db.refresh(analysis)
    
    # Lancer en background
    background_tasks.add_task(
        execute_eda_analysis,
        analysis.id,
        source.connection_config,
        source.source_type
    )
    
    logger.info(f"Started EDA analysis {analysis.id}")
    
    return {
        "analysis_id": analysis.id,
        "status": "started"
    }

@router.get("/analyses")
async def list_analyses(
    data_source_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Lister les analyses de l'utilisateur"""
    query = (
        select(EDAAnalysis)
        .join(EDADataSource)
        .where(EDADataSource.user_id == current_user.id)
    )
    
    if data_source_id:
        query = query.where(EDAAnalysis.data_source_id == data_source_id)
    
    query = query.order_by(EDAAnalysis.analysis_date.desc()).limit(50)
    
    result = await db.execute(query)
    analyses = result.scalars().all()
    
    return [
        {
            "id": a.id,
            "data_source_id": a.data_source_id,
            "status": a.status,
            "analysis_date": a.analysis_date.isoformat(),
            "top_anomalies_count": len(a.top_anomalies) if a.top_anomalies else 0
        }
        for a in analyses
    ]

@router.get("/analyses/{analysis_id}")
async def get_analysis_results(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Récupérer les résultats d'une analyse"""
    analysis = await db.get(EDAAnalysis, analysis_id)
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    # Vérifier ownership via data_source
    source = await db.get(EDADataSource, analysis.data_source_id)
    if source.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return {
        "id": analysis.id,
        "status": analysis.status,
        "analysis_date": analysis.analysis_date.isoformat(),
        "summary_stats": analysis.summary_stats,
        "top_anomalies": analysis.top_anomalies,
        "findings_count": analysis.all_findings_count,
        "error_message": analysis.error_message
    }

@router.get("/reports/latest")
async def get_latest_report(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Récupérer le dernier rapport matinal"""
    # Récupérer la dernière analyse complétée
    result = await db.execute(
        select(EDAAnalysis)
        .join(EDADataSource)
        .where(
            EDADataSource.user_id == current_user.id,
            EDAAnalysis.status == "completed"
        )
        .order_by(EDAAnalysis.analysis_date.desc())
        .limit(1)
    )
    analysis = result.scalar_one_or_none()
    
    if not analysis:
        return {"message": "No reports available"}
    
    # Générer le rapport
    report_gen = EDAReportGenerator()
    report = await report_gen.generate_morning_report(
        analysis.id,
        analysis.top_anomalies or [],
        analysis.summary_stats
    )
    
    return report

# ============================================================================
# OPTIONAL BRIDGE TO FAIRNESS AUDIT
# ============================================================================

@router.post("/link-to-fairness-audit")
async def link_to_fairness_audit(
    link_data: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Créer un lien optionnel entre une analyse EDA et un audit de fairness
    
    Body:
        {
            "eda_analysis_id": 1,
            "fairness_audit_id": 2,
            "notes": "..."
        }
    """
    eda_analysis_id = link_data['eda_analysis_id']
    fairness_audit_id = link_data['fairness_audit_id']
    
    # Vérifier ownership de l'analyse EDA
    eda_analysis = await db.get(EDAAnalysis, eda_analysis_id)
    if not eda_analysis:
        raise HTTPException(status_code=404, detail="EDA analysis not found")
    
    source = await db.get(EDADataSource, eda_analysis.data_source_id)
    if source.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Créer le lien
    link = EDAFairnessLink(
        eda_analysis_id=eda_analysis_id,
        fairness_audit_id=fairness_audit_id,
        link_type=link_data.get('link_type', 'cross_reference'),
        notes=link_data.get('notes'),
        created_by=current_user.id
    )
    
    db.add(link)
    await db.commit()
    
    return {"status": "linked", "link_id": link.id}

# ============================================================================
# BACKGROUND TASK
# ============================================================================

async def execute_eda_analysis(
    analysis_id: int,
    connection_config: dict,
    source_type: str
):
    """
    Tâche background pour exécuter l'analyse EDA
    """
    from db import async_session_maker
    
    async with async_session_maker() as db:
        try:
            analysis = await db.get(EDAAnalysis, analysis_id)
            if not analysis:
                return
            
            analysis.status = "running"
            analysis.started_at = datetime.utcnow()
            await db.commit()
            
            # 1. Charger les données
            # TODO: Implémenter chargement selon source_type
            # Pour l'instant, mock avec données de test
            df = pd.DataFrame({
                'revenue': [100, 120, 95, 200, 110],
                'region': ['EU', 'US', 'EU', 'US', 'ASIA'],
                'product': ['A', 'B', 'A', 'B', 'C']
            })
            
            # 2. Détecter les anomalies
            detector = AnomalyDetector(confidence_level=analysis.confidence_level)
            anomalies = await detector.detect_anomalies(
                df,
                analysis.metrics_config,
                analysis.dimensions_config
            )
            
            # 3. Analyser les causes
            analyzer = RootCauseAnalyzer()
            for anomaly in anomalies[:10]:  # Top 10
                root_cause = await analyzer.analyze_root_cause(
                    df,
                    anomaly,
                    analysis.dimensions_config
                )
                anomaly.update(root_cause)
            
            # 4. Sauvegarder les résultats
            analysis.top_anomalies = anomalies[:3]
            analysis.all_findings_count = len(anomalies)
            analysis.summary_stats = {
                "total_rows": len(df),
                "metrics_analyzed": list(analysis.metrics_config.keys())
            }
            analysis.status = "completed"
            analysis.completed_at = datetime.utcnow()
            
            # 5. Créer les findings en DB
            for anomaly in anomalies:
                finding = AnomalyFinding(
                    analysis_id=analysis.id,
                    **{k: v for k, v in anomaly.items() if k in [
                        'metric_name', 'dimension', 'dimension_value',
                        'observed_value', 'expected_value', 'deviation_std',
                        'p_value', 'business_impact', 'severity',
                        'probable_root_cause', 'cause_confidence'
                    ]}
                )
                db.add(finding)
            
            await db.commit()
            logger.info(f"Completed EDA analysis {analysis_id}")
            
        except Exception as e:
            logger.error(f"Error in EDA analysis {analysis_id}: {e}")
            analysis.status = "failed"
            analysis.error_message = str(e)
            await db.commit()
