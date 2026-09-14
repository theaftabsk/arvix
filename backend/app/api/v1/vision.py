from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
from app.tools.vision_tool import vision_tool

router = APIRouter(prefix="/vision", tags=["Vision Intelligence"])

class VisionAnalyzeRequest(BaseModel):
    image_base64: str

@router.post("/analyze")
async def analyze_vision_frame(req: VisionAnalyzeRequest) -> Dict[str, Any]:
    """Analyzes a captured camera video frame for face detection, OCR, objects, and visual sources"""
    if not req.image_base64:
        raise HTTPException(status_code=400, detail="Missing image data")

    try:
        result = await vision_tool.analyze_image(req.image_base64)
        return result
    except Exception as e:
        print(f"[Vision API Error]: {e}")
        raise HTTPException(status_code=500, detail=str(e))
