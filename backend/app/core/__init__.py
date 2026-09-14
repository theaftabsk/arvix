"""
ARVIX Core Module
Configuration settings, database engine, and session dependencies.
"""

from app.core.config import settings
from app.core.database import Base, engine, get_db

__all__ = [
    "settings",
    "Base",
    "engine",
    "get_db"
]
