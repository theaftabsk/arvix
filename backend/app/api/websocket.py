import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.websocket_manager import websocket_manager

router = APIRouter(tags=["WebSocket"])

@router.websocket("/ws/{device_type}")
async def websocket_endpoint(websocket: WebSocket, device_type: str = "windows"):
    """
    Live real-time channel for devices (windows, android, web).
    Carries remote commands, sync events, notifications, and execution results.
    """
    await websocket_manager.connect(websocket, device_type)
    try:
        # Send initial welcome and handshake
        await websocket.send_text(json.dumps({
            "type": "handshake",
            "message": f"Connected to ARVIX VPS Brain as [{device_type}]",
            "device_type": device_type,
            "status": "online"
        }))

        while True:
            data_text = await websocket.receive_text()
            try:
                msg = json.loads(data_text)
                msg_type = msg.get("type", "")

                # If a device is reporting the result of a remote command
                if msg_type == "command_result":
                    print(f"[WebSocket] Received command result from {device_type}: {msg}")
                    # Broadcast to all other devices so mobile sees the result
                    await websocket_manager.broadcast({
                        "type": "device_command_update",
                        "command_id": msg.get("command_id"),
                        "status": msg.get("status"),
                        "result": msg.get("result")
                    })
                
                # Ping/Pong heartbeat
                elif msg_type == "ping":
                    await websocket.send_text(json.dumps({"type": "pong"}))

            except json.JSONDecodeError:
                pass

    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket, device_type)
