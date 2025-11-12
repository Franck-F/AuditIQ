from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
from io import BytesIO

router = APIRouter()

@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):
    """Upload et validation d'un fichier CSV/Excel"""
    try:
        contents = await file.read()
        
        if file.filename.endswith('.csv'):
            df = pd.read_csv(BytesIO(contents))
        elif file.filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Format non supporté")
        
        return {
            "filename": file.filename,
            "rows": len(df),
            "columns": df.columns.tolist(),
            "preview": df.head(5).to_dict('records')
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze")
async def analyze_fairness(session_id: str):
    """Lancer l'analyse de fairness"""
    return {
        "session_id": session_id,
        "status": "analysis_started"
    }