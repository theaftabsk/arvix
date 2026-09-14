from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Memory
from app.schemas.schemas import MemoryCreate, MemoryOut

router = APIRouter(prefix="/memories", tags=["Memories"])

@router.get("/", response_model=List[MemoryOut])
def list_memories(category: str = None, db: Session = Depends(get_db)):
    query = db.query(Memory)
    if category:
        query = query.filter(Memory.category == category)
    return query.order_by(Memory.created_at.desc()).all()

@router.post("/", response_model=MemoryOut)
def save_memory(mem_in: MemoryCreate, db: Session = Depends(get_db)):
    mem = Memory(
        category=mem_in.category,
        content=mem_in.content,
        importance=mem_in.importance
    )
    db.add(mem)
    db.commit()
    db.refresh(mem)
    return mem

@router.delete("/{memory_id}")
def delete_memory(memory_id: int, db: Session = Depends(get_db)):
    mem = db.query(Memory).filter(Memory.id == memory_id).first()
    if not mem:
        raise HTTPException(status_code=404, detail="Memory not found")
    db.delete(mem)
    db.commit()
    return {"message": "Memory forgotten successfully", "id": memory_id}
