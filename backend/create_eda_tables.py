"""
Script to create Auto EDA tables in Supabase
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from models.eda_models import Base
import os
from dotenv import load_dotenv

load_dotenv()

async def create_eda_tables():
    """Create Auto EDA tables in database"""
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("❌ DATABASE_URL not found in environment")
        return
    
    # Convert to async URL if needed
    if database_url.startswith("postgresql://"):
        database_url = database_url.replace("postgresql://", "postgresql+asyncpg://")
    
    print(f"🔗 Connecting to database...")
    engine = create_async_engine(database_url, echo=True)
    
    try:
        async with engine.begin() as conn:
            print("📊 Creating Auto EDA tables...")
            # Import all models to ensure they're registered
            from models.eda_models import (
                EDADataSource,
                EDAAnalysis,
                AnomalyFinding,
                EDAFairnessLink
            )
            
            # Create tables
            await conn.run_sync(Base.metadata.create_all)
            print("✅ Auto EDA tables created successfully!")
            
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(create_eda_tables())
