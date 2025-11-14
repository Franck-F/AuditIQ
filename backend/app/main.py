from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import health
import logging

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

try:
    from app.api.routes import audit

    app.include_router(audit.router, prefix=f"{settings.API_V1_STR}/audit", tags=["audit"])
except Exception as e:
    logging.warning("Audit routes not loaded (missing deps?): %s", e)

@app.get("/")
def root():
    return {
        "message": "AuditIQ API",
        "version": settings.VERSION,
        "docs": "/docs"
    }