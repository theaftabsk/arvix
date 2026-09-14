import re
import unicodedata
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.models import Memory

class MemoryService:
    """
    ARVIX Intelligent Memory & Preference Management Service
    Persists personal user details, favorite music, preferences, and facts in PostgreSQL.
    """

    @staticmethod
    def extract_favorite_song(text: str) -> Optional[str]:
        """Extracts the song name from natural Bengali/English preference declarations"""
        norm = unicodedata.normalize("NFC", text)
        cleaned = re.sub(
            r"^(মনে\s*রাখো|মনে\s*রেখো|সেভ\s*করো|save|remember|ami\s*bolchi|আমি\s*বলছি)\s*", 
            "", 
            norm, 
            flags=re.IGNORECASE
        ).strip()

        pattern = r"(?:amar|আমার|my)\s+(?:fav|favorite|favourite|প্রিয়|প্রিয়|ফেভারিট)\s+(?:songs?|গান|গানটা|গানের\s+নাম)\s*(?:ache|আছে|is|হল|হলো|হচ্ছে|:|—|-)?\s*(.+)"
        m = re.search(pattern, cleaned, flags=re.IGNORECASE)
        if m:
            val = m.group(1).strip()
            # Remove trailing command phrases
            val = re.sub(r"^(ache|আছে|is|\:|\-)\s*", "", val, flags=re.IGNORECASE).strip()
            val = re.sub(
                r"(সেভ\s*করে\s*রাখো|সেভ\s*করো|মনে\s*রাখো|মনে\s*রেখো|save\s*it|save|remember|eta|এটা|ta|টা)\s*$", 
                "", 
                val, 
                flags=re.IGNORECASE
            ).strip()
            val = val.strip(" \"'—:-")
            return val if val else None
        return None

    def save_favorite_song(self, db: Session, song_name: str) -> str:
        """Saves or updates Master's favorite song in persistent database"""
        existing = db.query(Memory).filter(Memory.category == "favorite_song").first()
        if existing:
            existing.content = song_name
            existing.importance = 5
        else:
            new_mem = Memory(
                category="favorite_song",
                content=song_name,
                importance=5
            )
            db.add(new_mem)
        db.commit()
        return f"আপনার প্রিয় গান '{song_name}' মেমোরিতে সেভ করেছি, বস।"

    def get_favorite_song(self, db: Session) -> Optional[str]:
        """Retrieves Master's saved favorite song from memory"""
        fav_mem = db.query(Memory).filter(Memory.category == "favorite_song").order_by(Memory.created_at.desc()).first()
        if fav_mem and fav_mem.content:
            return fav_mem.content.strip()

        # Fallback: scan personal memories for favorite song mentions
        general_mems = db.query(Memory).filter(
            Memory.content.ilike("%গান%") | Memory.content.ilike("%song%")
        ).order_by(Memory.importance.desc(), Memory.created_at.desc()).all()
        
        for m in general_mems:
            extracted = self.extract_favorite_song(m.content)
            if extracted:
                return extracted

        return None

    def save_general_memory(self, db: Session, text: str) -> str:
        """Stores general personal facts and reminders"""
        norm = unicodedata.normalize("NFC", text)
        cleaned = re.sub(
            r"(মনে\s*রাখো|মনে\s*রেখো|সেভ\s*করো|remember\s*that|remember|save)", 
            "", 
            norm, 
            flags=re.IGNORECASE
        ).strip()
        cleaned = re.sub(r"^[\s,!:—\-]+", "", cleaned).strip()

        mem = Memory(category="personal", content=cleaned or norm, importance=4)
        db.add(mem)
        db.commit()
        return f"মনে রাখব, বস: \"{cleaned or norm}\""

    def search_memories(self, db: Session, query: str, limit: int = 4) -> List[Memory]:
        """Retrieves memories matching query keywords"""
        norm = unicodedata.normalize("NFC", query)
        words = [w for w in re.split(r"\s+", norm) if len(w) > 2]
        if not words:
            return db.query(Memory).order_by(Memory.created_at.desc()).limit(limit).all()

        filters = [Memory.content.ilike(f"%{w}%") for w in words]
        return db.query(Memory).filter(*filters).order_by(Memory.importance.desc()).limit(limit).all()

memory_service = MemoryService()
