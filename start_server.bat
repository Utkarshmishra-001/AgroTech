@echo off
title AgroTech Full-Stack Python Backend
color 0A
echo ==========================================================
echo       🌾 AGROTECH FULL-STACK FASTAPI BACKEND SERVER 🌾
echo ==========================================================
echo.
echo [*] Starting Python FastAPI Backend on http://127.0.0.1:8005 ...
echo [*] Interactive Swagger REST API Docs: http://127.0.0.1:8005/docs
echo.
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8005 --reload
pause
