from fastapi import APIRouter
from app.tools import news_tool

router = APIRouter(prefix="/news", tags=["News"])

@router.get("/")
def get_news(category: str = "ai"):
    """Get latest tech and AI news summaries"""
    items = news_tool.get_latest_news(category)
    return {
        "category": category,
        "count": len(items),
        "articles": items
    }
