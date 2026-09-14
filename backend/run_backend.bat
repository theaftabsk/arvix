@echo off
title ARVIX AI Core Brain Server
echo ====================================================
echo Starting ARVIX AI Core Brain (Python 3.12)...
echo ====================================================

set "PY_EXE=%LOCALAPPDATA%\Programs\Python\Python312\python.exe"

if exist "%PY_EXE%" (
    "%PY_EXE%" run_backend.py
) else (
    python run_backend.py
)

pause
