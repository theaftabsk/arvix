from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Routine
from app.schemas.schemas import RoutineCreate, RoutineOut

router = APIRouter(prefix="/routines", tags=["Routines"])

@router.get("/", response_model=List[RoutineOut])
def list_routines(db: Session = Depends(get_db)):
    routines = db.query(Routine).all()
    # If no routines exist initially, create default starter routines
    if not routines:
        defaults = [
            Routine(title="Morning Coding & Tasks Briefing", cron_time="08:00 AM", action_type="briefing", is_active=True),
            Routine(title="Midday High-Priority Review", cron_time="01:00 PM", action_type="reminder", is_active=True),
            Routine(title="Evening Tech & AI News Digest", cron_time="08:00 PM", action_type="news", is_active=True),
        ]
        for r in defaults:
            db.add(r)
        db.commit()
        routines = db.query(Routine).all()
    return routines

@router.post("/", response_model=RoutineOut)
def create_routine(r_in: RoutineCreate, db: Session = Depends(get_db)):
    routine = Routine(
        title=r_in.title,
        cron_time=r_in.cron_time,
        action_type=r_in.action_type,
        is_active=r_in.is_active
    )
    db.add(routine)
    db.commit()
    db.refresh(routine)
    return routine

@router.patch("/{routine_id}/toggle")
def toggle_routine(routine_id: int, db: Session = Depends(get_db)):
    r = db.query(Routine).filter(Routine.id == routine_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Routine not found")
    r.is_active = not r.is_active
    db.commit()
    return {"id": r.id, "is_active": r.is_active}
