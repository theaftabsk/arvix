@echo off
title ARVIX Brain Server
echo ==================================================
echo 🚀 Starting ARVIX AI Brain Server...
echo ==================================================

powershell -ExecutionPolicy Bypass -File "%~dp0setup_python.ps1"

cd "%~dp0backend"
echo Installing backend requirements...
python -m pip install -r requirements.txt

echo Starting server...
python run_backend.py
pause
