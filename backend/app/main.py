from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import audit, health

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix=settings.API_V1_STR, tags=["health"])
app.include_router(audit.router, prefix=f"{settings.API_V1_STR}/audit", tags=["audit"])

@app.get("/")
def root():
    return {
        "message": "AuditIQ API",
        "version": settings.VERSION,
        "docs": "/docs"
    }