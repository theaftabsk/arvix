from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel
from app.core.config import settings
from app.services.ai_router import ai_router

router = APIRouter(prefix="/settings", tags=["Settings"])

class SettingsPayload(BaseModel):
    default_ai_provider: Optional[str] = None
    default_ai_model: Optional[str] = None
    gemini_api_key: Optional[str] = None
    groq_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None

@router.get("/")
def get_settings():
    return {
        "app_name": settings.APP_NAME,
        "app_env": settings.APP_ENV,
        "default_ai_provider": settings.DEFAULT_AI_PROVIDER,
        "default_ai_model": settings.DEFAULT_AI_MODEL,
        "has_gemini_key": bool(settings.GEMINI_API_KEY),
        "has_groq_key": bool(settings.GROQ_API_KEY),
        "has_openai_key": bool(settings.OPENAI_API_KEY),
        "database_type": "PostgreSQL" if "postgres" in settings.DATABASE_URL else "SQLite"
    }

@router.post("/")
def update_settings(data: SettingsPayload):
    if data.default_ai_provider:
        settings.DEFAULT_AI_PROVIDER = data.default_ai_provider
    if data.default_ai_model:
        settings.DEFAULT_AI_MODEL = data.default_ai_model
    if data.gemini_api_key is not None:
        settings.GEMINI_API_KEY = data.gemini_api_key
        ai_router.gemini_key = data.gemini_api_key
    if data.groq_api_key is not None:
        settings.GROQ_API_KEY = data.groq_api_key
        ai_router.groq_key = data.groq_api_key
    if data.openai_api_key is not None:
        settings.OPENAI_API_KEY = data.openai_api_key
        ai_router.openai_key = data.openai_api_key

    return {
        "message": "Settings updated successfully",
        "default_ai_provider": settings.DEFAULT_AI_PROVIDER,
        "default_ai_model": settings.DEFAULT_AI_MODEL
    }
