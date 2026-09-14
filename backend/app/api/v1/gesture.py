import time
import asyncio
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any, Optional
from app.tools.mouse_control_tool import mouse_control_tool
from app.tools.system_audio_tool import system_audio_tool
from app.tools.youtube_tool import youtube_tool

router = APIRouter(prefix="/gesture", tags=["Hand Gesture Controller"])

class CursorPositionRequest(BaseModel):
    x: float  # Normalized 0.0 to 1.0 (from camera)
    y: float  # Normalized 0.0 to 1.0 (from camera)

class GestureActionRequest(BaseModel):
    action: str  # "click", "double_click", "right_click", "scroll_up", "scroll_down", "volume_up", "volume_down", "mute", "play_pause", "next_track"
    payload: Optional[Dict[str, Any]] = None

@router.post("/cursor")
async def move_cursor_endpoint(req: CursorPositionRequest):
    """Moves physical Windows cursor from normalized camera coordinates (zero-overhead async)"""
    coords = mouse_control_tool.move_to(req.x, req.y)
    return {"status": "ok", "screen_x": coords[0], "screen_y": coords[1]}

@router.post("/action")
async def execute_gesture_action(req: GestureActionRequest):
    """Executes gesture actions (pinch click, palm volume up, fist mute, scroll, etc.)"""
    act = req.action.lower()
    result_msg = "Acknowledged"

    if act in ["click", "left_click", "pinch"]:
        result_msg = mouse_control_tool.left_click()
    elif act in ["click_center", "start_solar", "auto_start", "click_at"]:
        # Exact measured center of START button is X=0.50, Y=0.620
        x = req.payload.get("x", 0.50) if req.payload else 0.50
        y = req.payload.get("y", 0.620) if req.payload else 0.620
        # Click twice (initial focus + action trigger) for cross-origin iframe
        mouse_control_tool.click_at(x, y)
        time.sleep(0.08)
        result_msg = mouse_control_tool.click_at(x, y)
    elif act in ["mute_solar_music", "mute_scope"]:
        # Clicks the sound mute icon in top right of Solar System Scope
        result_msg = mouse_control_tool.click_at(0.835, 0.265)
    elif act in ["exit_to_solar", "exit_planet"]:
        # Clicks the 'SOLAR SYSTEM' exit button at (0.23, 0.62)
        result_msg = mouse_control_tool.click_at(0.23, 0.62)
    elif act in ["double_click_at", "target_sun"]:
        x = req.payload.get("x", 0.50) if req.payload else 0.50
        y = req.payload.get("y", 0.50) if req.payload else 0.50
        result_msg = mouse_control_tool.double_click_at(x, y)
    elif act in ["mouse_down", "drag_start"]:
        result_msg = mouse_control_tool.mouse_down()
    elif act in ["mouse_up", "drag_end"]:
        result_msg = mouse_control_tool.mouse_up()
    elif act == "right_click":
        result_msg = mouse_control_tool.right_click()
    elif act == "double_click":
        result_msg = mouse_control_tool.double_click()
    elif act in ["scroll_up", "scroll_forward"]:
        result_msg = mouse_control_tool.scroll(360)
    elif act in ["scroll_down", "scroll_back"]:
        result_msg = mouse_control_tool.scroll(-360)
    elif act in ["volume_up", "palm_up"]:
        result_msg = system_audio_tool.volume_up(8)
    elif act in ["volume_down", "palm_down"]:
        result_msg = system_audio_tool.volume_down(8)
    elif act in ["mute", "fist_mute"]:
        result_msg = system_audio_tool.volume_mute()
    elif act in ["play_pause", "toggle_media"]:
        result_msg = youtube_tool.play_pause()
    elif act in ["next_track", "swipe_right"]:
        result_msg = youtube_tool.next_track()
    elif act in ["prev_track", "swipe_left"]:
        result_msg = youtube_tool.prev_track()

    return {"status": "ok", "action": act, "result": result_msg}

@router.get("/status")
def get_gesture_status():
    mouse_control_tool.update_screen_resolution()
    x, y = mouse_control_tool.get_cursor_position()
    return {
        "status": "active",
        "resolution": f"{mouse_control_tool.screen_width}x{mouse_control_tool.screen_height}",
        "cursor": {"x": x, "y": y}
    }
