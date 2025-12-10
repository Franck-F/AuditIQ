"""
EDA Report Generator Service
Génère les rapports matinaux avec les top findings
"""

from typing import Dict, List, Any
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class EDAReportGenerator:
    """
    Génère des rapports concis et actionnables
    """
    
    async def generate_morning_report(
        self,
        analysis_id: int,
        top_findings: List[Dict],
        summary_stats: Dict = None
    ) -> Dict[str, Any]:
        """
        Génère le rapport matinal avec top 3 findings
        
        Args:
            analysis_id: ID de l'analyse
            top_findings: Top 3 anomalies détectées
            summary_stats: Statistiques globales (optionnel)
        
        Returns:
            {
                "title": str,
                "summary": str,
                "findings": List[Dict],
                "recommendations": List[str],
                "metadata": Dict
            }
        """
        logger.info(f"Generating morning report for analysis {analysis_id}")
        
        # Limiter aux 3 plus importantes
        top_3 = top_findings[:3] if len(top_findings) > 3 else top_findings
        
        # Générer le résumé exécutif
        summary = self._generate_summary(top_3)
        
        # Générer les recommandations
        recommendations = self._generate_recommendations(top_3)
        
        # Formater les findings pour le rapport
        formatted_findings = [
            self._format_finding(f, idx + 1)
            for idx, f in enumerate(top_3)
        ]
        
        return {
            "title": f"Rapport EDA - {datetime.now().strftime('%d/%m/%Y')}",
            "summary": summary,
            "findings": formatted_findings,
            "recommendations": recommendations,
            "metadata": {
                "analysis_id": analysis_id,
                "generated_at": datetime.now().isoformat(),
                "total_anomalies": len(top_findings),
                "critical_count": sum(1 for f in top_findings if f.get('severity') == 'critical'),
                "high_count": sum(1 for f in top_findings if f.get('severity') == 'high')
            }
        }
    
    def _generate_summary(self, findings: List[Dict]) -> str:
        """
        Génère un résumé exécutif concis
        """
        if not findings:
            return "Aucune anomalie significative détectée aujourd'hui."
        
        critical_count = sum(1 for f in findings if f.get('severity') == 'critical')
        high_count = sum(1 for f in findings if f.get('severity') == 'high')
        
        summary_parts = []
        
        if critical_count > 0:
            summary_parts.append(f"{critical_count} anomalie(s) critique(s)")
        if high_count > 0:
            summary_parts.append(f"{high_count} anomalie(s) importante(s)")
        
        if summary_parts:
            summary = f"Détection de {' et '.join(summary_parts)} nécessitant une attention immédiate."
        else:
            summary = f"{len(findings)} anomalie(s) détectée(s) avec impact modéré."
        
        # Ajouter le métrique le plus impacté
        top_finding = findings[0]
        summary += f" Principal impact sur '{top_finding['metric_name']}'."
        
        return summary
    
    def _generate_recommendations(self, findings: List[Dict]) -> List[str]:
        """
        Génère des recommandations actionnables
        """
        recommendations = []
        
        for finding in findings:
            severity = finding.get('severity', 'medium')
            metric = finding['metric_name']
            dimension = finding.get('dimension')
            
            if severity == 'critical':
                action = "Intervention immédiate requise"
            elif severity == 'high':
                action = "Investigation approfondie recommandée"
            else:
                action = "Surveillance continue conseillée"
            
            if dimension:
                dim_value = finding.get('dimension_value')
                rec = f"{action} pour '{metric}' dans {dimension}={dim_value}"
            else:
                rec = f"{action} pour '{metric}'"
            
            # Ajouter la cause probable si disponible
            if finding.get('probable_root_cause'):
                rec += f" (Cause probable: {finding['probable_root_cause']})"
            
            recommendations.append(rec)
        
        return recommendations
    
    def _format_finding(self, finding: Dict, rank: int) -> Dict:
        """
        Formate un finding pour le rapport
        """
        return {
            "rank": rank,
            "metric": finding['metric_name'],
            "dimension": finding.get('dimension'),
            "dimension_value": finding.get('dimension_value'),
            "observed": round(finding['observed_value'], 2),
            "expected": round(finding['expected_value'], 2),
            "deviation": f"{finding['deviation_std']:.2f}σ",
            "severity": finding.get('severity', 'unknown'),
            "impact_score": round(finding.get('business_impact', 0), 1),
            "probable_cause": finding.get('probable_root_cause', 'Analyse en cours'),
            "confidence": round(finding.get('cause_confidence', 0) * 100, 0) if finding.get('cause_confidence') else None
        }
    
    async def generate_detailed_report(
        self,
        analysis_id: int,
        all_findings: List[Dict],
        summary_stats: Dict
    ) -> Dict[str, Any]:
        """
        Génère un rapport détaillé (pour export PDF/Excel)
        """
        return {
            "title": f"Rapport EDA Détaillé - {datetime.now().strftime('%d/%m/%Y %H:%M')}",
            "analysis_id": analysis_id,
            "executive_summary": self._generate_summary(all_findings[:3]),
            "all_findings": all_findings,
            "summary_statistics": summary_stats,
            "generated_at": datetime.now().isoformat()
        }
