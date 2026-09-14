from typing import Optional
from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import StreamingResponse, Response
from app.services import voice_service

router = APIRouter(prefix="/voice", tags=["Voice Engine"])

@router.get("/speak")
async def speak_text(
    text: str = Query(..., description="Text to synthesize"),
    voice: Optional[str] = Query(None, description="Neural Voice ID")
):
    clean_text = voice_service.clean_for_speech(text)
    if not clean_text:
        raise HTTPException(status_code=400, detail="Empty text provided")

    lang = voice_service.detect_language(clean_text)
    selected_voice = voice_service.select_voice(lang, voice)

    cache_key = f"{selected_voice}_deep_{clean_text}"
    cached_audio = voice_service.get_cached_audio(cache_key)
    if cached_audio:
        return Response(content=cached_audio, media_type="audio/mpeg")

    return StreamingResponse(
        voice_service.stream_audio(clean_text, selected_voice, lang),
        media_type="audio/mpeg"
    )
