@echo off
setlocal
echo ==========================================
echo   AgroTech Backend Server Startup
echo ==========================================
echo.

:: Get the directory where the script is located
set "BASE_DIR=%~dp0"
cd /d "%BASE_DIR%backend"

echo Current Directory: %CD%
echo.

:: Check if main.py exists
if not exist "main.py" (
    echo [ERROR] main.py not found in %CD%
    echo Please ensure the backend folder contains main.py
    pause
    exit /b
)

:: Try to run the backend
echo Checking if port 8005 is already in use...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8005') do (
    if NOT "%%a" == "" (
        echo [INFO] Closing previous backend instance ^(PID: %%a^)...
        taskkill /f /pid %%a >nul 2>&1
    )
)

echo Starting FastAPI server...
python main.py

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Backend failed to start.
    echo ------------------------------------------
    echo 1. Check if Python is installed: run "python --version"
    echo 2. Check if dependencies are installed: run "pip install -r requirements.txt"
    echo 3. Ensure port 8005 is not already in use.
    echo ------------------------------------------
    pause
)

pause
