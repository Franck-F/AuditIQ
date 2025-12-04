import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

# Fix protocol for asyncpg
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# Configure connection args
# Force disable statement cache for Supabase Transaction Pooler compatibility
# This is required when using pgbouncer in transaction mode
connect_args = {
    "statement_cache_size": 0
}

print(f"🔌 Database Connection: {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else 'HIDDEN'}")
print(f"⚙️ Connect Args: {connect_args}")

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    future=True,
    pool_pre_ping=True,
    connect_args=connect_args
)
AsyncSessionLocal = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
Base = declarative_base()

async def init_models():
    # create tables if they don't exist (development convenience)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
