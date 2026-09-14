import os
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

def _persist_to_env(updates: dict):
    """Permanently updates key-values in .env file on disk so they survive restarts"""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    candidate_paths = [
        os.path.abspath(os.path.join(base_dir, "..", "..", "..", ".env")), # backend/.env
        os.path.abspath(os.path.join(base_dir, "..", "..", "..", "..", ".env")) # root .env
    ]

    for env_path in candidate_paths:
        if os.path.exists(env_path):
            try:
                with open(env_path, "r", encoding="utf-8") as f:
                    lines = f.readlines()

                new_lines = []
                found_keys = set()

                for line in lines:
                    stripped = line.strip()
                    matched = False
                    for key, val in updates.items():
                        if val is None:
                            continue
                        if stripped.startswith(f"{key}=") or stripped.startswith(f"#{key}="):
                            new_lines.append(f"{key}={val}\n")
                            found_keys.add(key)
                            matched = True
                            break
                    if not matched:
                        new_lines.append(line)

                # Append any remaining keys not found in existing file
                for key, val in updates.items():
                    if val is not None and key not in found_keys:
                        new_lines.append(f"{key}={val}\n")

                with open(env_path, "w", encoding="utf-8") as f:
                    f.writelines(new_lines)
                print(f"[Settings] Successfully persisted {list(updates.keys())} to {env_path}")
            except Exception as e:
                print(f"[Settings] Notice persisting to {env_path}: {e}")

@router.get("/")
def get_settings():
    return {
        "app_name": settings.APP_NAME,
        "app_env": settings.APP_ENV,
        "default_ai_provider": settings.DEFAULT_AI_PROVIDER,
        "default_ai_model": settings.DEFAULT_AI_MODEL,
        "gemini_api_key": settings.GEMINI_API_KEY or "",
        "groq_api_key": settings.GROQ_API_KEY or "",
        "openai_api_key": settings.OPENAI_API_KEY or "",
        "has_gemini_key": bool(settings.GEMINI_API_KEY),
        "has_groq_key": bool(settings.GROQ_API_KEY),
        "has_openai_key": bool(settings.OPENAI_API_KEY),
        "database_type": "PostgreSQL" if "postgres" in settings.DATABASE_URL else "SQLite"
    }

@router.post("/")
def update_settings(data: SettingsPayload):
    env_updates = {}

    if data.default_ai_provider:
        settings.DEFAULT_AI_PROVIDER = data.default_ai_provider
        env_updates["DEFAULT_AI_PROVIDER"] = data.default_ai_provider

    if data.default_ai_model:
        settings.DEFAULT_AI_MODEL = data.default_ai_model
        env_updates["DEFAULT_AI_MODEL"] = data.default_ai_model

    if data.gemini_api_key is not None:
        clean_key = data.gemini_api_key.strip()
        settings.GEMINI_API_KEY = clean_key
        ai_router.gemini_key = clean_key
        env_updates["GEMINI_API_KEY"] = clean_key

    if data.groq_api_key is not None:
        clean_key = data.groq_api_key.strip()
        settings.GROQ_API_KEY = clean_key
        ai_router.groq_key = clean_key
        env_updates["GROQ_API_KEY"] = clean_key

    if data.openai_api_key is not None:
        clean_key = data.openai_api_key.strip()
        settings.OPENAI_API_KEY = clean_key
        ai_router.openai_key = clean_key
        env_updates["OPENAI_API_KEY"] = clean_key

    if env_updates:
        _persist_to_env(env_updates)

    return {
        "status": "ok",
        "message": "Settings updated and persisted to .env successfully",
        "default_ai_provider": settings.DEFAULT_AI_PROVIDER,
        "default_ai_model": settings.DEFAULT_AI_MODEL,
        "has_gemini_key": bool(settings.GEMINI_API_KEY),
        "has_groq_key": bool(settings.GROQ_API_KEY)
    }
