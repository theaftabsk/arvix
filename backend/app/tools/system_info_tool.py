import platform
import os
import sys
from typing import Dict, Any

class SystemInfoTool:
    """
    ARVIX Native Windows System Diagnostics Tool
    Provides hardware and OS status for Master Aftab SK.
    """

    def get_system_status(self) -> Dict[str, Any]:
        """Collect basic hardware and OS diagnostics"""
        status: Dict[str, Any] = {
            "os": platform.system(),
            "os_release": platform.release(),
            "os_version": platform.version(),
            "machine": platform.machine(),
            "processor": platform.processor(),
            "python_version": platform.python_version(),
            "battery": "Unknown"
        }

        # Query Windows battery status via psutil if available or WMIC
        try:
            import psutil
            battery = psutil.sensors_battery()
            if battery:
                status["battery"] = {
                    "percent": round(battery.percent, 1),
                    "power_plugged": battery.power_plugged,
                    "status_text": f"{round(battery.percent)}% ({'চার্জিং' if battery.power_plugged else 'ব্যাটারি মোড'})"
                }
            cpu_usage = psutil.cpu_percent(interval=None)
            ram = psutil.virtual_memory()
            status["cpu_percent"] = cpu_usage
            status["ram_used_gb"] = round((ram.total - ram.available) / (1024 ** 3), 1)
            status["ram_total_gb"] = round(ram.total / (1024 ** 3), 1)
            status["ram_percent"] = ram.percent
        except ImportError:
            # Graceful fallback without psutil
            pass
        except Exception as e:
            print(f"[SystemInfoTool] Notice: {e}")

        return status

    def get_status_summary_bengali(self) -> str:
        """Returns a formatted Bengali voice/text friendly summary of laptop status"""
        info = self.get_system_status()
        batt = info.get("battery")
        batt_str = f"ব্যাটারি: {batt.get('status_text', 'উপলব্ধ নয়')}" if isinstance(batt, dict) else "ব্যাটারি স্ট্যাটাস পাওয়া যায়নি"
        
        cpu_str = f"CPU ব্যবহার: {info.get('cpu_percent', 'N/A')}%" if "cpu_percent" in info else ""
        ram_str = f"র‍্যাম: {info.get('ram_used_gb', 'N/A')}/{info.get('ram_total_gb', 'N/A')} GB" if "ram_used_gb" in info else ""
        
        parts = [f"💻 সিস্টেম: Windows {info.get('os_release', '')}", batt_str]
        if cpu_str:
            parts.append(cpu_str)
        if ram_str:
            parts.append(ram_str)
            
        return " | ".join(parts)

system_info_tool = SystemInfoTool()
