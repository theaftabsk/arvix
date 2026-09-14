"""
ARVIX Tools Module
Unified registry of hardware, streaming, vision, mouse, and external application tools.
"""

from app.tools.system_audio_tool import system_audio_tool, SystemAudioTool
from app.tools.youtube_tool import youtube_tool, YouTubeTool
from app.tools.system_app_tool import system_app_tool, SystemAppTool
from app.tools.news_tool import news_tool, NewsTool
from app.tools.system_info_tool import system_info_tool, SystemInfoTool
from app.tools.vision_tool import vision_tool, VisionTool
from app.tools.mouse_control_tool import mouse_control_tool, MouseControlTool

__all__ = [
    "system_audio_tool",
    "SystemAudioTool",
    "youtube_tool",
    "YouTubeTool",
    "system_app_tool",
    "SystemAppTool",
    "news_tool",
    "NewsTool",
    "system_info_tool",
    "SystemInfoTool",
    "vision_tool",
    "VisionTool",
    "mouse_control_tool",
    "MouseControlTool"
]
