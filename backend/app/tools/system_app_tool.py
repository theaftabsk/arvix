import subprocess
import sys
from typing import Dict

class SystemAppTool:
    """
    ARVIX Native Windows Application Controller
    Launches and manages desktop software for Master Aftab SK.
    """

    KNOWN_APPS: Dict[str, str] = {
        "code": "code",
        "vscode": "code",
        "vs code": "code",
        "visual studio code": "code",
        "notepad": "notepad.exe",
        "নোটপ্যাড": "notepad.exe",
        "calc": "calc.exe",
        "calculator": "calc.exe",
        "chrome": "start chrome",
        "browser": "start chrome",
        "ব্রাউজার": "start chrome",
        "youtube": "start https://www.youtube.com",
        "ইউটিউব": "start https://www.youtube.com",
        "google": "start https://www.google.com",
        "গুগল": "start https://www.google.com",
        "facebook": "start https://www.facebook.com",
        "ফেসবুক": "start https://www.facebook.com",
        "whatsapp": "start https://web.whatsapp.com",
        "solarsystem": "start https://www.solarsystemscope.com/",
        "solarsystemscope": "start https://www.solarsystemscope.com/",
        "solar system": "start https://www.solarsystemscope.com/",
        "সোলার সিস্টেম": "start https://www.solarsystemscope.com/",
        "spotify": "spotify",
        "স্পটিফাই": "spotify",
        "explorer": "explorer.exe",
        "downloads": "explorer.exe shell:Downloads"
    }

    def open_application(self, target: str) -> bool:
        """Launches target application on Windows"""
        if sys.platform != "win32":
            return False

        t_key = target.lower().strip()
        command = self.KNOWN_APPS.get(t_key, target)

        try:
            if "start " in command or command.startswith("explorer") or command == "code":
                subprocess.Popen(["cmd", "/c", command], shell=True)
            else:
                subprocess.Popen([command], shell=True)
            return True
        except Exception as e:
            print(f"[System App Tool] Failed to launch '{target}': {e}")
            return False

system_app_tool = SystemAppTool()
