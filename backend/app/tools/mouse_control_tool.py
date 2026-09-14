import sys
import ctypes
import time
from typing import Optional, Tuple

# Windows User32 Virtual Mouse Event Flags
MOUSEEVENTF_MOVE = 0x0001
MOUSEEVENTF_LEFTDOWN = 0x0002
MOUSEEVENTF_LEFTUP = 0x0004
MOUSEEVENTF_RIGHTDOWN = 0x0008
MOUSEEVENTF_RIGHTUP = 0x0009
MOUSEEVENTF_MIDDLEDOWN = 0x0020
MOUSEEVENTF_MIDDLEUP = 0x0040
MOUSEEVENTF_WHEEL = 0x0800
MOUSEEVENTF_ABSOLUTE = 0x8000

class POINT(ctypes.Structure):
    _fields_ = [("x", ctypes.c_long), ("y", ctypes.c_long)]

class MouseControlTool:
    """
    ARVIX Native Windows Hardware Cursor & Mouse Controller
    Maps camera hand gesture coordinates to physical screen pixels with 0ms delay.
    """

    def __init__(self):
        self.user32 = ctypes.windll.user32 if sys.platform == "win32" else None
        self.screen_width = 1920
        self.screen_height = 1080
        self.last_x = 0
        self.last_y = 0
        self.smoothing = 0.65  # Exponential Moving Average factor (smooth & jitter-free)
        self.update_screen_resolution()

    def update_screen_resolution(self):
        """Fetch actual current primary monitor resolution"""
        if self.user32:
            try:
                self.screen_width = self.user32.GetSystemMetrics(0)
                self.screen_height = self.user32.GetSystemMetrics(1)
            except Exception as e:
                print(f"[MouseControlTool] Resolution query error: {e}")

    def get_cursor_position(self) -> Tuple[int, int]:
        """Returns current mouse pixel coordinates"""
        if not self.user32:
            return (0, 0)
        pt = POINT()
        self.user32.GetCursorPos(ctypes.byref(pt))
        return (pt.x, pt.y)

    def move_to(self, norm_x: float, norm_y: float) -> Tuple[int, int]:
        """
        Moves Windows cursor from normalized camera coordinates (0.0 to 1.0)
        with exponential smoothing to prevent hand trembling/jitter.
        """
        if not self.user32:
            return (0, 0)

        # Clamping
        nx = max(0.0, min(1.0, norm_x))
        ny = max(0.0, min(1.0, norm_y))

        # Map to physical screen resolution
        target_x = int(nx * self.screen_width)
        target_y = int(ny * self.screen_height)

        # Exponential Moving Average for silky smooth pointer movement
        if self.last_x == 0 and self.last_y == 0:
            smoothed_x = target_x
            smoothed_y = target_y
        else:
            # Micro-jitter deadzone filter (eliminates finger tremor)
            if abs(target_x - self.last_x) <= 2 and abs(target_y - self.last_y) <= 2:
                return (self.last_x, self.last_y)
            smoothed_x = int(self.last_x * self.smoothing + target_x * (1.0 - self.smoothing))
            smoothed_y = int(self.last_y * self.smoothing + target_y * (1.0 - self.smoothing))

        self.last_x = smoothed_x
        self.last_y = smoothed_y

        self.user32.SetCursorPos(smoothed_x, smoothed_y)
        return (smoothed_x, smoothed_y)

    def left_click(self) -> str:
        """Simulates physical left mouse click"""
        if not self.user32:
            return "Windows required"
        self.user32.mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
        time.sleep(0.02)
        self.user32.mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)
        return "Left Click Executed"

    def right_click(self) -> str:
        """Simulates physical right mouse click"""
        if not self.user32:
            return "Windows required"
        self.user32.mouse_event(MOUSEEVENTF_RIGHTDOWN, 0, 0, 0, 0)
        time.sleep(0.02)
        self.user32.mouse_event(MOUSEEVENTF_RIGHTUP, 0, 0, 0, 0)
        return "Right Click Executed"

    def double_click(self) -> str:
        """Simulates physical double click"""
        self.left_click()
        time.sleep(0.06)
        self.left_click()
        return "Double Click Executed"

    def mouse_down(self) -> str:
        """Presses and holds left mouse button (for 3D drag / rotate)"""
        if not self.user32:
            return "Windows required"
        self.user32.mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0)
        return "Mouse Down"

    def mouse_up(self) -> str:
        """Releases left mouse button"""
        if not self.user32:
            return "Windows required"
        self.user32.mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0)
        return "Mouse Up"

    def scroll(self, delta: int = 120) -> str:
        """Scrolls wheel up (positive) or down (negative)"""
        if not self.user32:
            return "Windows required"
        self.user32.mouse_event(MOUSEEVENTF_WHEEL, 0, 0, delta, 0)
        return f"Scrolled {delta}"

    def click_at(self, norm_x: float, norm_y: float) -> str:
        """Directly jumps to normalized screen coordinates without EMA smoothing and executes a click"""
        self.update_screen_resolution()
        target_x = int(max(0.0, min(1.0, norm_x)) * self.screen_width)
        target_y = int(max(0.0, min(1.0, norm_y)) * self.screen_height)
        self.last_x = target_x
        self.last_y = target_y
        if self.user32:
            self.user32.SetCursorPos(target_x, target_y)
        time.sleep(0.05)
        return self.left_click()

    def double_click_at(self, norm_x: float, norm_y: float) -> str:
        """Directly jumps to normalized screen coordinates without EMA smoothing and executes a double click"""
        self.update_screen_resolution()
        target_x = int(max(0.0, min(1.0, norm_x)) * self.screen_width)
        target_y = int(max(0.0, min(1.0, norm_y)) * self.screen_height)
        self.last_x = target_x
        self.last_y = target_y
        if self.user32:
            self.user32.SetCursorPos(target_x, target_y)
        time.sleep(0.05)
        return self.double_click()

mouse_control_tool = MouseControlTool()
