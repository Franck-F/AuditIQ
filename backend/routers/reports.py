from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pathlib import Path
import os

from db import AsyncSessionLocal
from models.user import User
from models.dataset import Audit
from auth_middleware import get_current_user
from services.reporting import generate_audit_report

router = APIRouter(prefix="/api/reports", tags=["reports"])
REPORTS_DIR = Path("reports")
REPORTS_DIR.mkdir(exist_ok=True)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@router.get("/generate/{audit_id}")
async def generate_report(
    audit_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Génère un rapport PDF pour un audit terminé
    """
    stmt = select(Audit).where(Audit.id == audit_id, Audit.user_id == current_user.id)
    result = await db.execute(stmt)
    audit = result.scalar_one_or_none()
    
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
        
    if audit.status != "completed":
        raise HTTPException(status_code=400, detail="Audit not completed yet")
        
    # Préparer les données pour le rapport
    audit_data = {
        "name": audit.audit_name,
        "score": audit.overall_score,
        "risk_level": audit.risk_level,
        "status": audit.status,
        "results": audit.metrics_results,
        "group_metrics": audit.group_metrics,
        "mitigation_recommendations": audit.mitigation_recommendations,
        "ai_recommendations": audit.ai_recommendations
    }
    
    # Générer le PDF
    filename = f"audit_report_{audit.id}.pdf"
    file_path = REPORTS_DIR / filename
    
    try:
        generate_audit_report(audit_data, file_path)
        
        # Mettre à jour l'audit avec l'URL du rapport
        audit.report_generated = True
        audit.report_url = str(file_path)
        audit.report_format = "pdf"
        await db.commit()
        
        return {"message": "Report generated successfully", "url": f"/api/reports/{audit.id}/download"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating report: {str(e)}")

@router.get("/{audit_id}/download")
async def download_report(
    audit_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Télécharge le rapport PDF
    """
    stmt = select(Audit).where(Audit.id == audit_id, Audit.user_id == current_user.id)
    result = await db.execute(stmt)
    audit = result.scalar_one_or_none()
    
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
        
    if not audit.report_generated or not audit.report_url:
        raise HTTPException(status_code=404, detail="Report not generated")
        
    file_path = Path(audit.report_url)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Report file missing")
        
    return FileResponse(
        path=file_path,
        filename=f"Audit_Report_{audit.audit_name}.pdf",
        media_type='application/pdf'
    )
