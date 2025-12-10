"""
EDA Scheduler Service
Planifie et exécute les analyses EDA automatiques
"""

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime
import logging
import asyncio

from db import AsyncSessionLocal
from models.eda_models import EDADataSource, EDAAnalysis
from services.eda import AnomalyDetector, RootCauseAnalyzer, EDAReportGenerator
from services.eda.alerting import AlertService
from sqlalchemy import select

logger = logging.getLogger(__name__)

class EDAScheduler:
    """
    Gestionnaire de tâches planifiées pour Auto EDA
    """
    
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.alert_service = AlertService()
        
    def start(self):
        """Démarrer le scheduler"""
        # Tâche nocturne à 3h du matin (heure locale)
        self.scheduler.add_job(
            self.run_nightly_analysis,
            trigger=CronTrigger(hour=3, minute=0),
            id='nightly_eda_analysis',
            name='Analyse EDA Nocturne',
            replace_existing=True
        )
        
        self.scheduler.start()
        logger.info("📅 EDA Scheduler started - Nightly analysis at 3:00 AM")
    
    def stop(self):
        """Arrêter le scheduler"""
        self.scheduler.shutdown()
        logger.info("📅 EDA Scheduler stopped")
    
    async def run_nightly_analysis(self):
        """
        Tâche nocturne : analyse toutes les sources actives
        """
        logger.info("🌙 Starting nightly EDA analysis...")
        
        async with AsyncSessionLocal() as db:
            try:
                # Récupérer toutes les sources actives
                result = await db.execute(
                    select(EDADataSource).where(EDADataSource.is_active == True)
                )
                active_sources = result.scalars().all()
                
                logger.info(f"Found {len(active_sources)} active data sources")
                
                for source in active_sources:
                    try:
                        await self.analyze_source(source, db)
                    except Exception as e:
                        logger.error(f"Error analyzing source {source.id}: {e}")
                
                logger.info("✅ Nightly EDA analysis completed")
                
            except Exception as e:
                logger.error(f"Error in nightly analysis: {e}")
    
    async def analyze_source(self, source: EDADataSource, db):
        """
        Analyser une source de données
        """
        logger.info(f"Analyzing source: {source.name} (ID: {source.id})")
        
        # Créer une nouvelle analyse
        analysis = EDAAnalysis(
            data_source_id=source.id,
            status="running",
            started_at=datetime.utcnow(),
            metrics_config={"revenue": {"type": "sum"}},  # Config par défaut
            dimensions_config=["region"],  # Config par défaut
            confidence_level=0.95
        )
        
        db.add(analysis)
        await db.commit()
        await db.refresh(analysis)
        
        try:
            # TODO: Charger les données depuis la source
            # Pour l'instant, on simule avec des données de test
            import pandas as pd
            df = pd.DataFrame({
                'revenue': [100, 120, 95, 200, 110],
                'region': ['EU', 'US', 'EU', 'US', 'ASIA']
            })
            
            # Détecter les anomalies
            detector = AnomalyDetector(confidence_level=analysis.confidence_level)
            anomalies = await detector.detect_anomalies(
                df,
                analysis.metrics_config,
                analysis.dimensions_config
            )
            
            # Analyser les causes
            analyzer = RootCauseAnalyzer()
            for anomaly in anomalies[:10]:
                root_cause = await analyzer.analyze_root_cause(
                    df,
                    anomaly,
                    analysis.dimensions_config
                )
                anomaly.update(root_cause)
            
            # Sauvegarder les résultats
            analysis.top_anomalies = anomalies[:3]
            analysis.all_findings_count = len(anomalies)
            analysis.summary_stats = {
                "total_rows": len(df),
                "metrics_analyzed": list(analysis.metrics_config.keys())
            }
            analysis.status = "completed"
            analysis.completed_at = datetime.utcnow()
            
            await db.commit()
            
            # Envoyer les alertes si nécessaire
            critical_anomalies = [a for a in anomalies if a.get('severity') == 'critical']
            high_anomalies = [a for a in anomalies if a.get('severity') == 'high']
            
            if critical_anomalies or high_anomalies:
                await self.send_alerts(source, analysis, critical_anomalies, high_anomalies)
            
            logger.info(f"✅ Analysis {analysis.id} completed - {len(anomalies)} anomalies found")
            
        except Exception as e:
            logger.error(f"Error in analysis {analysis.id}: {e}")
            analysis.status = "failed"
            analysis.error_message = str(e)
            await db.commit()
    
    async def send_alerts(self, source, analysis, critical_anomalies, high_anomalies):
        """
        Envoyer les alertes pour les anomalies critiques/importantes
        """
        try:
            # Générer le rapport
            report_gen = EDAReportGenerator()
            report = await report_gen.generate_morning_report(
                analysis.id,
                critical_anomalies + high_anomalies,
                analysis.summary_stats
            )
            
            # Envoyer les alertes
            if critical_anomalies:
                await self.alert_service.send_critical_alert(source, report)
            elif high_anomalies:
                await self.alert_service.send_high_alert(source, report)
            
            # Marquer les alertes comme envoyées
            async with AsyncSessionLocal() as db:
                analysis.alerts_sent = True
                analysis.alert_sent_at = datetime.utcnow()
                db.add(analysis)
                await db.commit()
            
        except Exception as e:
            logger.error(f"Error sending alerts: {e}")

# Instance globale du scheduler
eda_scheduler = EDAScheduler()
