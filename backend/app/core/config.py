import os
from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import field_validator

class Settings(BaseSettings):
    APP_NAME: str = "ARVIX Brain"
    APP_ENV: str = "development"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    SECRET_KEY: str = "arvix_secret_dev_key_2024_auth"
    
    # Master Identity
    MASTER_NAME: str = "Aftab"
    
    # PostgreSQL Local Database
    DATABASE_URL: str = "postgresql://postgres:123456@localhost:5432/postgres"
    
    # AI Provider API Keys
    GROQ_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    
    # Default Models
    DEFAULT_AI_PROVIDER: str = "gemini"
    DEFAULT_AI_MODEL: str = "gemini-flash-lite-latest"
    BACKUP_AI_MODEL: str = "gemini-flash-latest"
    
    # CORS
    CORS_ORIGINS: Union[str, List[str]] = "*"
    
    @field_validator("CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        return ["*"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
