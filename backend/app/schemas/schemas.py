from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

# --- Chat & Message Schemas ---
class MessageCreate(BaseModel):
    role: str = "user"
    content: str
    metadata_json: Optional[str] = None

class MessageOut(BaseModel):
    id: int
    conversation_id: int
    role: str
    content: str
    metadata_json: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationOut(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[MessageOut] = []

    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[int] = None
    provider: Optional[str] = None  # "groq", "gemini", "ollama", "mock"
    model: Optional[str] = None
    device_type: Optional[str] = "windows"  # "windows" or "android"

class ChatResponse(BaseModel):
    conversation_id: int
    reply: str
    intent: str
    tools_used: List[str] = []
    device_command: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

# --- Task Schemas ---
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    project_id: Optional[int] = None
    due_date: Optional[datetime] = None
    priority: str = "medium"  # low, medium, high, urgent
    status: str = "pending"

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[datetime] = None

class TaskOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    project_id: Optional[int] = None
    due_date: Optional[datetime] = None
    priority: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Project Schemas ---
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    status: str = "active"

class ProjectOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    status: str
    created_at: datetime
    tasks: List[TaskOut] = []

    class Config:
        from_attributes = True

# --- Memory Schemas ---
class MemoryCreate(BaseModel):
    category: str = "personal"  # personal, preference, project, fact
    content: str
    importance: int = 3

class MemoryOut(BaseModel):
    id: int
    category: str
    content: str
    importance: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Routine Schemas ---
class RoutineCreate(BaseModel):
    title: str
    cron_time: str = "08:00 AM"
    action_type: str = "briefing"  # briefing, reminder, news, cleanup
    is_active: bool = True

class RoutineOut(BaseModel):
    id: int
    title: str
    cron_time: str
    action_type: str
    is_active: bool
    last_run: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Device & Command Schemas ---
class DeviceRegister(BaseModel):
    device_name: str
    device_type: str  # "windows", "android"

class DeviceOut(BaseModel):
    id: int
    device_name: str
    device_type: str
    token: str
    is_online: bool
    last_seen: datetime

    class Config:
        from_attributes = True

class DeviceCommandRequest(BaseModel):
    target_device_type: str = "windows"
    command_type: str  # "open_app", "search_file", "notify", "shell"
    payload: Dict[str, Any] = {}

class DeviceCommandResult(BaseModel):
    command_id: int
    status: str  # "executed", "failed", "rejected"
    result: Dict[str, Any] = {}
