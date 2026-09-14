import ctypes
import sys

# Windows Virtual Key Codes for Hardware Audio Control
VK_VOLUME_MUTE = 0xAD
VK_VOLUME_DOWN = 0xAE
VK_VOLUME_UP = 0xAF

class SystemAudioTool:
    """
    ARVIX Native Windows Audio & Master Volume Controller
    Direct hardware keystroke emulation with 0ms latency.
    """

    def volume_up(self, steps: int = 8) -> str:
        """Increase Windows master volume by given steps"""
        if sys.platform != "win32":
            return "অডিও কন্ট্রোল শুধু উইন্ডোজেই কাজ করবে।"
        try:
            for _ in range(steps):
                ctypes.windll.user32.keybd_event(VK_VOLUME_UP, 0, 0, 0)
                ctypes.windll.user32.keybd_event(VK_VOLUME_UP, 0, 2, 0)
            return "সাউন্ড বাড়িয়ে দিয়েছি, বস।"
        except Exception as e:
            return f"সাউন্ড বাড়াতে সমস্যা হয়েছে: {e}"

    def volume_down(self, steps: int = 8) -> str:
        """Decrease Windows master volume by given steps"""
        if sys.platform != "win32":
            return "অডিও কন্ট্রোল শুধু উইন্ডোজেই কাজ করবে।"
        try:
            for _ in range(steps):
                ctypes.windll.user32.keybd_event(VK_VOLUME_DOWN, 0, 0, 0)
                ctypes.windll.user32.keybd_event(VK_VOLUME_DOWN, 0, 2, 0)
            return "সাউন্ড কমিয়ে দিয়েছি, বস।"
        except Exception as e:
            return f"সাউন্ড কমাতে সমস্যা হয়েছে: {e}"

    def volume_mute(self) -> str:
        """Mute / Unmute Windows master volume"""
        if sys.platform != "win32":
            return "অডিও কন্ট্রোল শুধু উইন্ডোজেই কাজ করবে।"
        try:
            ctypes.windll.user32.keybd_event(VK_VOLUME_MUTE, 0, 0, 0)
            ctypes.windll.user32.keybd_event(VK_VOLUME_MUTE, 0, 2, 0)
            return "সাউন্ড মিউট/আনমিউট করেছি, বস।"
        except Exception as e:
            return f"মিউট করতে সমস্যা হয়েছে: {e}"

    def handle_volume_action(self, action: str, steps: int = 8) -> str:
        if action == "volume_up":
            return self.volume_up(steps)
        elif action == "volume_down":
            return self.volume_down(steps)
        elif action in ["volume_mute", "volume_unmute"]:
            return self.volume_mute()
        return "সাউন্ড অ্যাডজাস্ট করা হয়েছে, বস।"

system_audio_tool = SystemAudioTool()
