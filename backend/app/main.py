import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
import app.models.models  # Ensure all tables are registered

# Import routers
from app.api.v1.chat import router as chat_router
from app.api.v1.tasks import router as tasks_router
from app.api.v1.projects import router as projects_router
from app.api.v1.memories import router as memories_router
from app.api.v1.routines import router as routines_router
from app.api.v1.devices import router as devices_router
from app.api.v1.news import router as news_router
from app.api.v1.settings import router as settings_router
from app.api.v1.voice import router as voice_router
from app.api.v1.vision import router as vision_router
from app.api.v1.gesture import router as gesture_router
from app.api.websocket import router as ws_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize tables on startup
    print("[ARVIX Core] Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    print("[ARVIX Core] ARVIX Brain online and ready.")
    yield
    print("[ARVIX Core] ARVIX Brain shutting down.")

app = FastAPI(
    title="ARVIX AI Core Brain",
    description="Central AI Orchestration, Memory, Task, Routine, and Device Sync Backend for ARVIX",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount REST API routers under /api/v1
app.include_router(chat_router, prefix="/api/v1")
app.include_router(tasks_router, prefix="/api/v1")
app.include_router(projects_router, prefix="/api/v1")
app.include_router(memories_router, prefix="/api/v1")
app.include_router(routines_router, prefix="/api/v1")
app.include_router(devices_router, prefix="/api/v1")
app.include_router(news_router, prefix="/api/v1")
app.include_router(settings_router, prefix="/api/v1")
app.include_router(voice_router, prefix="/api/v1")
app.include_router(vision_router, prefix="/api/v1")
app.include_router(gesture_router, prefix="/api/v1")

# Mount WebSocket router
app.include_router(ws_router)

@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "version": "1.0.0"
    }

# Mount production built desktop frontend (Single-Origin Local Hosting)
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

_current_dir = os.path.dirname(os.path.abspath(__file__))
dist_path = os.path.abspath(os.path.join(_current_dir, "..", "..", "desktop", "dist"))

if os.path.exists(dist_path) and os.path.exists(os.path.join(dist_path, "index.html")):
    assets_dir = os.path.join(dist_path, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_desktop_spa(full_path: str):
        target_file = os.path.join(dist_path, full_path)
        if full_path and os.path.isfile(target_file):
            return FileResponse(target_file)
        return FileResponse(os.path.join(dist_path, "index.html"))

if __name__ == "__main__":
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
