from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from db import AsyncSessionLocal

router = APIRouter(prefix="/api/migration", tags=["migration"])

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@router.get("/run")
async def run_migration(db: AsyncSession = Depends(get_db)):
    """
    Exécute les migrations SQL manquantes manuellement.
    À utiliser si Alembic n'est pas configuré.
    """
    try:
        # Ajout des colonnes pour l'email verification
        await db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE"))
        await db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255)"))
        
        # Mettre à jour les utilisateurs existants pour éviter qu'ils soient bloqués
        await db.execute(text("UPDATE users SET is_verified = TRUE WHERE is_verified IS NULL"))
        
        await db.commit()
        return {"message": "Migration successful: Columns added and users updated."}
    except Exception as e:
        return {"error": f"Migration failed: {str(e)}"}
