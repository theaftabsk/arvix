import re
import sys
import ctypes
import asyncio
import urllib.parse
import webbrowser
import httpx
from typing import Optional

# Windows Virtual Key Codes
VK_ESCAPE = 0x1B
VK_SPACE = 0x20
VK_MEDIA_NEXT_TRACK = 0xB0
VK_MEDIA_PREV_TRACK = 0xB1
VK_MEDIA_STOP = 0xB2
VK_MEDIA_PLAY_PAUSE = 0xB3

# YouTube standard keyboard shortcuts
VK_KEY_F = 0x46   # Fullscreen toggle
VK_KEY_K = 0x4B   # Play/Pause toggle
VK_KEY_M = 0x4D   # Mute toggle
VK_KEY_T = 0x54   # Theater mode toggle
VK_KEY_J = 0x4A   # Rewind 10 seconds
VK_KEY_L = 0x4C   # Forward 10 seconds

def _press_key(vk_code: int):
    """Simulate Windows hardware keypress down and up"""
    if sys.platform != "win32":
        return
    try:
        ctypes.windll.user32.keybd_event(vk_code, 0, 0, 0)
        ctypes.windll.user32.keybd_event(vk_code, 0, 2, 0)
    except Exception as e:
        print(f"[YouTube Tool Keypress Error]: {e}")

class YouTubeTool:
    """
    ARVIX YouTube Streaming & Media Controller
    Supports direct video playback, auto-fullscreen, play/pause, next/prev, and theater mode.
    """

    async def get_direct_video_url(self, query: str) -> str:
        """Finds the first matching YouTube video ID and returns autoplay link"""
        search_url = f"https://www.youtube.com/results?search_query={urllib.parse.quote(query)}"
        try:
            headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
            async with httpx.AsyncClient(timeout=4.0) as client:
                resp = await client.get(search_url, headers=headers, follow_redirects=True)
                matches = re.findall(r'/watch\?v=([a-zA-Z0-9_-]{11})', resp.text)
                if matches:
                    return f"https://www.youtube.com/watch?v={matches[0]}&autoplay=1"
        except Exception as e:
            print(f"[YouTube Tool Notice]: {e}")
        return search_url

    async def play_song_in_browser(self, query: str, fullscreen: bool = False) -> str:
        """Resolves video and opens browser tab automatically with optional auto-fullscreen"""
        clean_query = self.clean_song_query(query)
        target_url = await self.get_direct_video_url(clean_query)
        try:
            webbrowser.open(target_url)
            if fullscreen:
                # Give browser 2.5s to load YouTube DOM then press 'F' for fullscreen
                await asyncio.sleep(2.5)
                self.toggle_fullscreen()
        except Exception as err:
            print(f"[YouTube Tool] Browser open error: {err}")
        return target_url

    def toggle_fullscreen(self) -> str:
        """Toggles YouTube fullscreen mode using 'F' keypress"""
        _press_key(VK_KEY_F)
        return "ভিডিও ফুলস্ক্রিন করে দিয়েছি, বস।"

    def exit_fullscreen(self) -> str:
        """Exits fullscreen mode using Escape key"""
        _press_key(VK_ESCAPE)
        return "নরমাল স্ক্রিনে ফিরিয়ে এনেছি, বস।"

    def play_pause(self) -> str:
        """Toggles play and pause using Media Play/Pause and 'K' key"""
        _press_key(VK_MEDIA_PLAY_PAUSE)
        _press_key(VK_KEY_K)
        return "ভিডিও প্লে/পজ করেছি, বস।"

    def pause_video(self) -> str:
        """Pauses video playback"""
        _press_key(VK_KEY_K)
        _press_key(VK_MEDIA_PLAY_PAUSE)
        return "গান পজ করেছি, বস।"

    def resume_video(self) -> str:
        """Resumes video playback"""
        _press_key(VK_KEY_K)
        _press_key(VK_MEDIA_PLAY_PAUSE)
        return "গান আবার চালু করেছি, বস।"

    def mute_unmute(self) -> str:
        """Mutes/unmutes YouTube video audio"""
        _press_key(VK_KEY_M)
        return "ভিডিও সাউন্ড মিউট/আনমিউট করেছি, বস।"

    def next_track(self) -> str:
        """Skips to next track"""
        _press_key(VK_MEDIA_NEXT_TRACK)
        return "পরের গানে চলে গিয়েছি, বস।"

    def prev_track(self) -> str:
        """Returns to previous track"""
        _press_key(VK_MEDIA_PREV_TRACK)
        return "আগের গানে ফিরে গেছি, বস।"

    def forward_10s(self) -> str:
        """Fast-forwards 10 seconds"""
        _press_key(VK_KEY_L)
        return "১০ সেকেন্ড এগিয়ে দিয়েছি, বস।"

    def rewind_10s(self) -> str:
        """Rewinds 10 seconds"""
        _press_key(VK_KEY_J)
        return "১০ সেকেন্ড পিছিয়ে দিয়েছি, বস।"

    def theater_mode(self) -> str:
        """Toggles YouTube theater mode"""
        _press_key(VK_KEY_T)
        return "থিয়েটার মোড অন করেছি, বস।"

    def handle_control(self, action: str) -> str:
        """Dispatches media and YouTube control actions"""
        if action == "fullscreen":
            return self.toggle_fullscreen()
        elif action in ["exit_fullscreen", "small_screen", "normal_screen"]:
            return self.exit_fullscreen()
        elif action in ["pause", "stop"]:
            return self.pause_video()
        elif action in ["resume", "play"]:
            return self.resume_video()
        elif action in ["play_pause", "toggle"]:
            return self.play_pause()
        elif action == "mute":
            return self.mute_unmute()
        elif action == "next":
            return self.next_track()
        elif action == "prev":
            return self.prev_track()
        elif action == "forward":
            return self.forward_10s()
        elif action == "rewind":
            return self.rewind_10s()
        elif action == "theater":
            return self.theater_mode()
        return "মিডিয়া কমান্ড সম্পন্ন করেছি, বস।"

    @staticmethod
    def clean_song_query(raw_query: str) -> str:
        cleaned = re.sub(
            r"(গানটা|গান|চালাও|বাজাও|প্লে|করো|আমার|play|song|youtube|ইউটিউবে|ভিডিও|video|ফুলস্ক্রিনে|fullscreen)", 
            "", 
            raw_query, 
            flags=re.IGNORECASE
        ).strip()
        return cleaned if cleaned else "trending music"

youtube_tool = YouTubeTool()
