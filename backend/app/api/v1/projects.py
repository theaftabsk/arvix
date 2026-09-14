from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Project, Task
from app.schemas.schemas import ProjectCreate, ProjectOut
from app.core.config import settings

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("/", response_model=List[ProjectOut])
def list_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).order_by(Project.created_at.desc()).all()
    if not projects:
        # Pre-populate Master Aftab SK's projects
        defaults = [
            Project(name="ARVIX AI Core Ecosystem", description=f"Master {settings.MASTER_NAME}'s Central Private AI Assistant with Windows & Android Realtime Sync.", status="active"),
            Project(name=f"{settings.MASTER_NAME} Personal Web & Portfolio", description=f"Full stack web application and portfolio managed by Master {settings.MASTER_NAME}.", status="active"),
            Project(name="Automated Daily Intelligence Stream", description="Web scraping & summarization routine for AI breakthroughs and tech news.", status="active")
        ]
        for p in defaults:
            db.add(p)
        db.commit()
        projects = db.query(Project).all()
    return projects

@router.post("/", response_model=ProjectOut)
def create_project(proj_in: ProjectCreate, db: Session = Depends(get_db)):
    project = Project(
        name=proj_in.name,
        description=proj_in.description,
        status=proj_in.status
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@router.delete("/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    proj = db.query(Project).filter(Project.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(proj)
    db.commit()
    return {"message": "Project deleted", "id": project_id}
