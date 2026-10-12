@echo off
title TruthLens AI Backend & Mobile Server
color 0A
echo ===================================================================
echo     TruthLens AI Truth Verification - Mobile & Web Server
echo ===================================================================
echo.
cd /d "%~dp0"

echo [1/3] Checking Python Virtual Environment...
if not exist "%~dp0venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment not found at %~dp0venv
    pause
    exit /b 1
)

echo [2/3] Starting FastAPI Backend on 0.0.0.0:8000 (LAN + Web)...
tasklist /fi "imagename eq python.exe" 2>nul | findstr /i "python.exe" >nul
if %ERRORLEVEL% NEQ 0 (
    start "TruthLens Backend" /b "%~dp0venv\Scripts\python.exe" -m uvicorn main:app --app-dir "%~dp0backend" --host 0.0.0.0 --port 8000
    timeout /t 3 /nobreak >nul
) else (
    echo Python backend is already running.
)

echo [3/3] Starting Public Cloud Tunnel for Mobile Access (4G/5G/Wi-Fi)...
start "TruthLens Cloud Tunnel" /b npx localtunnel --port 8000 --subdomain cute-lamps-itch

echo.
echo ===================================================================
echo   TruthLens Server is now ACTIVE and accepting connections!
echo.
echo   Local Wi-Fi Endpoint:  http://10.48.35.23:8000
echo   Cloud Tunnel Endpoint: https://cute-lamps-itch.loca.lt
echo   Web Dashboard:         http://localhost:5173/dashboard
echo ===================================================================
echo.
echo   KEEP THIS WINDOW OPEN while using TruthLens on your phone!
echo   (Automatic watchdog monitoring and reconnecting every 15s)
echo.

:: Keep-alive and auto-reconnect loop
:loop
timeout /t 15 /nobreak >nul

:: Check backend health
curl.exe -s -m 3 http://127.0.0.1:8000/ >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [Watchdog] Backend not responding, restarting Uvicorn...
    start "TruthLens Backend" /b "%~dp0venv\Scripts\python.exe" -m uvicorn main:app --app-dir "%~dp0backend" --host 0.0.0.0 --port 8000
)

:: Check cloud tunnel health
curl.exe -s -m 5 -H "bypass-tunnel-reminder: true" https://cute-lamps-itch.loca.lt/ >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [Watchdog] Cloud tunnel dropped, restarting localtunnel...
    start "TruthLens Cloud Tunnel" /b npx localtunnel --port 8000 --subdomain cute-lamps-itch
)

goto loop
