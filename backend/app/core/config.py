from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "AuditIQ API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    DATABASE_URL: str
    SECRET_KEY: str
    
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "https://your-frontend-url.run.app"
    ]
    
    ANTHROPIC_API_KEY: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()