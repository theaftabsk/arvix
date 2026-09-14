# 🤖 ARVIX AI — Personal Private AI Ecosystem

> **One AI, Two Native Apps (Windows Laptop + Android Mobile), Single Central Brain, Unified Memory & Workspace.**

## 📂 Project Structure
- `backend/` : FastAPI + Python + SQLAlchemy/pgvector + AI Model Router + WebSocket Hub
- `desktop/` : Windows Native Desktop App (React + TypeScript + Vite + Tauri)
- `mobile/`  : Android Native App (Flutter + Dart) [Phase 3]

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
pip install -r requirements.txt

# Start ARVIX Brain Server:
python run_backend.py
```
Server runs at `http://localhost:8000` (Swagger docs: `http://localhost:8000/docs`).

### 2. Desktop App Setup
```bash
cd desktop
npm install
npm run dev
```
Development client runs at `http://localhost:5173`.
To build Windows Native `ARVIX.exe`:
```bash
npm run tauri build
```
