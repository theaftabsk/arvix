import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Device, DeviceCommand
from app.schemas.schemas import DeviceCommandRequest, DeviceCommandResult
from app.services.websocket_manager import websocket_manager

router = APIRouter(prefix="/devices", tags=["Devices & Sync"])

@router.get("/status")
def get_devices_status():
    """Check live status of Windows Laptop, Android Mobile, and Web connection"""
    return {
        "status": "success",
        "devices": websocket_manager.get_online_status(),
        "timestamp": datetime.utcnow().isoformat()
    }

@router.post("/command")
async def dispatch_device_command(cmd_in: DeviceCommandRequest, db: Session = Depends(get_db)):
    """
    Dispatches a remote command to a target device (e.g. from Mobile to Laptop)
    """
    command = DeviceCommand(
        sender_device_type="mobile",
        target_device_type=cmd_in.target_device_type,
        command_type=cmd_in.command_type,
        payload_json=json.dumps(cmd_in.payload),
        status="pending"
    )
    db.add(command)
    db.commit()
    db.refresh(command)

    # Broadcast / Send via WebSocket to Laptop Agent
    sent = await websocket_manager.send_to_device_type(cmd_in.target_device_type, {
        "type": "device_command",
        "command_id": command.id,
        "action": cmd_in.command_type,
        "payload": cmd_in.payload
    })

    return {
        "command_id": command.id,
        "target": cmd_in.target_device_type,
        "action": cmd_in.command_type,
        "dispatched_live": sent,
        "status": "dispatched" if sent else "queued_offline"
    }

@router.post("/command/{command_id}/result")
def update_command_result(command_id: int, result_in: DeviceCommandResult, db: Session = Depends(get_db)):
    """Laptop Agent reports back result after execution"""
    cmd = db.query(DeviceCommand).filter(DeviceCommand.id == command_id).first()
    if not cmd:
        raise HTTPException(status_code=404, detail="Command not found")
    
    cmd.status = result_in.status
    cmd.result_json = json.dumps(result_in.result)
    db.commit()
    return {"message": "Command result logged", "status": cmd.status}
