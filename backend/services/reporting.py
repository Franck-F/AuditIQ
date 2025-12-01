from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from pathlib import Path
from datetime import datetime
from typing import Dict, Any

def generate_audit_report(audit_data: Dict[str, Any], output_path: Path):
    """
    Génère un rapport d'audit au format PDF
    """
    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        rightMargin=72, leftMargin=72,
        topMargin=72, bottomMargin=18
    )
    
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name='Center', alignment=1))
    
    story = []
    
    # --- Header ---
    story.append(Paragraph(f"Rapport d'Audit de Fairness", styles['Title']))
    story.append(Spacer(1, 12))
    story.append(Paragraph(f"Audit: {audit_data.get('name', 'Sans nom')}", styles['Heading2']))
    story.append(Paragraph(f"Date: {datetime.now().strftime('%d/%m/%Y')}", styles['Normal']))
    story.append(Spacer(1, 24))
    
    # --- Executive Summary ---
    story.append(Paragraph("Résumé Exécutif", styles['Heading1']))
    
    score = audit_data.get('score', 0)
    risk = audit_data.get('risk_level', 'Unknown')
    
    summary_data = [
        ['Score Global', f"{score:.1f}/100"],
        ['Niveau de Risque', risk],
        ['Statut', audit_data.get('status', 'Unknown')]
    ]
    
    t = Table(summary_data, colWidths=[2*inch, 2*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    story.append(t)
    story.append(Spacer(1, 24))
    
    # --- Detailed Metrics ---
    story.append(Paragraph("Détails des Métriques", styles['Heading1']))
    
    results = audit_data.get('results', {})
    if results:
        for attribute, metrics in results.items():
            story.append(Paragraph(f"Attribut Sensible: {attribute}", styles['Heading2']))
            
            # Demographic Parity
            if 'demographic_parity' in metrics:
                dp = metrics['demographic_parity']
                story.append(Paragraph("Parité Démographique", styles['Heading3']))
                story.append(Paragraph(f"Disparate Impact: {dp.get('disparate_impact', 0):.2f}", styles['Normal']))
                
                # Table des groupes
                groups_data = [['Groupe', 'Taux de Sélection', 'Effectif']]
                for group, stats in dp.get('groups', {}).items():
                    groups_data.append([
                        str(group),
                        f"{stats.get('selection_rate', 0):.2%}",
                        str(stats.get('count', 0))
                    ])
                
                t_groups = Table(groups_data, colWidths=[2*inch, 1.5*inch, 1.5*inch])
                t_groups.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('GRID', (0, 0), (-1, -1), 1, colors.black)
                ]))
                story.append(t_groups)
                story.append(Spacer(1, 12))
                
    else:
        story.append(Paragraph("Aucun résultat détaillé disponible.", styles['Normal']))
        
    # --- Footer ---
    story.append(Spacer(1, 48))
    story.append(Paragraph("Généré par Audit-IQ", styles['Center']))
    
    doc.build(story)
    return output_path
