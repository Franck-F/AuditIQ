import plotly.express as px
import plotly.io as pio
import pandas as pd
import io
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Optional

# Essayer d'importer ReportLab, sinon utiliser fallback texte
try:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import A4
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.lib.enums import TA_CENTER
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False
    print("Warning: ReportLab not installed. Using text fallback for reports.")

def generate_audit_report(audit_data: Dict[str, Any], output_path: Path):
    """
    Génère un rapport d'audit complet (PDF ou TXT)
    """
    if not REPORTLAB_AVAILABLE:
        return generate_text_report(audit_data, output_path)
    
    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        rightMargin=50, leftMargin=50,
        topMargin=50, bottomMargin=50
    )
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Title'],
        fontSize=24,
        spaceAfter=30,
        textColor=colors.HexColor("#4F46E5") # Indigo primary
    )
    h1_style = styles['Heading1']
    h2_style = styles['Heading2']
    normal_style = styles['Normal']
    
    story = []
    
    # --- Header & Title ---
    story.append(Paragraph(f"Audit-IQ : Rapport de Conformité Fairness", title_style))
    story.append(Paragraph(f"Audit : {audit_data.get('name', 'Sans nom')}", h2_style))
    story.append(Paragraph(f"Date du rapport : {datetime.now().strftime('%d/%m/%Y')}", normal_style))
    story.append(Spacer(1, 0.5 * inch))
    
    # --- Executive Summary ---
    story.append(Paragraph("1. Résumé Exécutif", h1_style))
    score = audit_data.get('score', 0)
    risk = audit_data.get('risk_level', 'Unknown')
    
    summary_data = [
        ['Indicateur', 'Valeur'],
        ['Score d\'Équité Global', f"{score:.1f}%"],
        ['Niveau de Risque', risk],
        ['Statut Réglementaire', "Conforme (AI Act Est.)" if score >= 80 else "Nécessite Attention"],
        ['Biais Détectés', str(len([v for v in (audit_data.get('results', {}) or {}).values() if isinstance(v, (int, float)) and v < 80]))]
    ]
    
    t = Table(summary_data, colWidths=[2.5*inch, 3*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#4F46E5")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.whitesmoke, colors.white])
    ]))
    story.append(t)
    story.append(Spacer(1, 0.4 * inch))

    # --- Charts Section ---
    if audit_data.get('group_metrics'):
        story.append(Paragraph("2. Visualisation des Disparités", h1_style))
        chart_buffer = _create_summary_chart(audit_data['group_metrics'])
        if chart_buffer:
            img = Image(chart_buffer, width=5*inch, height=3*inch)
            story.append(img)
            story.append(Spacer(1, 0.3 * inch))

    # --- Detailed Metrics ---
    story.append(PageBreak())
    story.append(Paragraph("3. Détails des 16 Métriques de Fairness", h1_style))
    
    metrics_results = audit_data.get('results', {})
    if metrics_results:
        # On regroupe les métriques pour un affichage propre
        metrics_table_data = [['Métrique', 'Valeur', 'Statut']]
        for m_name, m_val in metrics_results.items():
            if isinstance(m_val, (int, float)):
                status = "OK" if m_val >= 80 else "Critique" if m_val < 60 else "Attention"
                metrics_table_data.append([m_name.replace('_', ' ').title(), f"{m_val:.1f}%", status])
        
        t_metrics = Table(metrics_table_data, colWidths=[3*inch, 1*inch, 1*inch])
        t_metrics.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ALIGN', (0, 1), (-1, -1), 'CENTER')
        ]))
        story.append(t_metrics)
    
    # --- Recommendations ---
    story.append(Spacer(1, 0.4 * inch))
    story.append(Paragraph("4. Recommandations de Mitigation", h1_style))
    
    recs = audit_data.get('mitigation_recommendations', {}).get('recommendations', [])
    if recs:
        for r in recs:
            story.append(Paragraph(f"• {r.get('strategy', r.get('name'))} ({r.get('priority', 'Medium')})", h2_style))
            story.append(Paragraph(f"<i>Impact: {r.get('benefit', r.get('impact'))} | Effort: {r.get('effort')}</i>", normal_style))
            story.append(Paragraph(r.get('reasoning', r.get('description', '')), normal_style))
            story.append(Spacer(1, 10))
    else:
        story.append(Paragraph("Aucune recommandation générée.", normal_style))

    # --- Footer ---
    story.append(Spacer(1, 1 * inch))
    story.append(Paragraph("Audit-IQ - Solution d'Audit de Biais IA Automatisée", ParagraphStyle('f', alignment=TA_CENTER, fontSize=8, textColor=colors.grey)))
    
    doc.build(story)
    return output_path

def _create_summary_chart(group_metrics: Dict[str, Any]) -> Optional[io.BytesIO]:
    """Génère un graphique de synthèse des disparités avec Plotly"""
    try:
        # Prendre le premier attribut sensible pour la démo
        attr = list(group_metrics.keys())[0]
        data = group_metrics[attr]
        
        # Préparer les données pour Plotly
        df_plot = pd.DataFrame([
            {"Groupe": k, "Taux de sélection": v.get('selection_rate', 0) * 100}
            for k, v in data.items()
        ])
        
        # Créer le graphique avec Plotly Express
        fig = px.bar(
            df_plot, 
            x="Groupe", 
            y="Taux de sélection",
            title=f"Taux de sélection par {attr} (%)",
            color="Taux de sélection",
            color_continuous_scale="Viridis",
            template="plotly_white"
        )
        
        fig.update_layout(yaxis_range=[0, 100], showlegend=False)
        fig.update_coloraxes(showscale=False)
        
        # Exporter l'image en PNG vers un buffer
        img_bytes = pio.to_image(fig, format='png', width=800, height=500)
        buf = io.BytesIO(img_bytes)
        buf.seek(0)
        return buf
    except Exception as e:
        print(f"Error creating Plotly chart: {e}")
        return None


def generate_text_report(audit_data: Dict[str, Any], output_path: Path) -> Path:
    """
    Génère un rapport d'audit au format texte (fallback complet)
    """
    output_path = output_path.with_suffix('.txt')
    
    score = audit_data.get('score', 0)
    risk = audit_data.get('risk_level', 'Unknown')
    name = audit_data.get('name', 'Sans nom')
    
    content = f"""
============================================================
           AUDIT-IQ : RAPPORT DE CONFORMITÉ
============================================================

Audit : {name}
Date  : {datetime.now().strftime('%d/%m/%Y %H:%M')}

------------------------------------------------------------
1. RÉSUMÉ EXÉCUTIF
------------------------------------------------------------
Score d'Équité Global : {score:.1f}%
Niveau de Risque      : {risk}
Conformité (AI Act)  : {"OUI (Est.)" if score >= 80 else "NON / ATTENTION"}

------------------------------------------------------------
2. DÉTAILS DES MÉTRIQUES (16 INDICATEURS)
------------------------------------------------------------
"""
    results = audit_data.get('results', {})
    if results:
        for m_name, m_val in results.items():
            if isinstance(m_val, (int, float)):
                content += f"{m_name.ljust(30)} : {m_val:.1f}%\n"
    
    content += "\n------------------------------------------------------------\n"
    content += "3. RECOMMANDATIONS DE MITIGATION\n"
    content += "------------------------------------------------------------\n"
    
    recs = audit_data.get('mitigation_recommendations', {}).get('recommendations', [])
    for r in recs:
        content += f"\n- {r.get('name', r.get('strategy'))} [{r.get('priority', 'Medium')}]\n"
        content += f"  Technique : {r.get('technique', 'N/A')}\n"
        content += f"  Impact    : {r.get('impact', r.get('benefit', 'N/A'))}\n"
        content += f"  Description : {r.get('description', r.get('reasoning', ''))}\n"

    content += "\n============================================================\n"
    content += "Généré par Audit-IQ\n"
    content += "============================================================\n"
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return output_path
