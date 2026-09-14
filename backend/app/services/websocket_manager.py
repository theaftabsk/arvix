import json
import asyncio
from typing import Dict, Any, List
from fastapi import WebSocket

class DeviceConnectionManager:
    """
    ARVIX Central WebSocket Hub
    Coordinates real-time bi-directional messaging between:
    Mobile (Android) <---> VPS Central Brain <---> Laptop (Windows)
    """

    def __init__(self):
        # Map device_type ("windows", "android", "web") -> list of WebSockets
        self.active_connections: Dict[str, List[WebSocket]] = {
            "windows": [],
            "android": [],
            "web": []
        }
        self.pending_command_futures: Dict[str, asyncio.Future] = {}

    async def connect(self, websocket: WebSocket, device_type: str = "windows"):
        await websocket.accept()
        if device_type not in self.active_connections:
            self.active_connections[device_type] = []
        self.active_connections[device_type].append(websocket)
        print(f"[WebSocket Hub] Device connected: {device_type}. Total: {len(self.active_connections[device_type])}")

    def disconnect(self, websocket: WebSocket, device_type: str = "windows"):
        if device_type in self.active_connections and websocket in self.active_connections[device_type]:
            self.active_connections[device_type].remove(websocket)
            print(f"[WebSocket Hub] Device disconnected: {device_type}")

    async def broadcast(self, message: Dict[str, Any]):
        """Send message to all connected clients"""
        payload = json.dumps(message)
        for d_type, sockets in self.active_connections.items():
            for ws in list(sockets):
                try:
                    await ws.send_text(payload)
                except Exception:
                    pass

    async def send_to_device_type(self, target_type: str, message: Dict[str, Any]) -> bool:
        """Send message specifically to Windows or Android"""
        sockets = self.active_connections.get(target_type, [])
        if not sockets:
            return False
        
        payload = json.dumps(message)
        for ws in sockets:
            try:
                await ws.send_text(payload)
            except Exception:
                pass
        return True

    def get_online_status(self) -> Dict[str, bool]:
        return {
            "windows": len(self.active_connections.get("windows", [])) > 0,
            "android": len(self.active_connections.get("android", [])) > 0,
            "web": len(self.active_connections.get("web", [])) > 0,
        }

websocket_manager = DeviceConnectionManager()
