import sys
import uvicorn
from app.core.config import settings

# Ensure UTF-8 console output on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

def main():
    print("==================================================")
    print("🚀 STARTING ARVIX AI CORE BRAIN SERVER (VPS MODE)")
    print("==================================================")
    print(f"📡 Host: {settings.HOST}:{settings.PORT}")
    print(f"🤖 Main Model: {settings.DEFAULT_AI_MODEL} ({settings.DEFAULT_AI_PROVIDER})")
    print(f"🔄 Backup Model: {settings.BACKUP_AI_MODEL} (gemini)")
    print(f"🗄️ Database: {settings.DATABASE_URL}")
    print("==================================================")

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )

if __name__ == "__main__":
    main()
