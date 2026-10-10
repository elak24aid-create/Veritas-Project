@echo off
title TruthLens: AI Truth Verification Platform
echo =======================================================
echo   Launching TruthLens App...
echo =======================================================

cd /d "%~dp0"

:: Check if backend is responding on port 8000
curl -s http://127.0.0.1:8000/ >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Starting TruthLens AI Backend Server on all interfaces (0.0.0.0:8000)...
    start /b "" "%~dp0venv\Scripts\python.exe" -m uvicorn main:app --app-dir "%~dp0backend" --host 0.0.0.0 --port 8000
    timeout /t 2 /nobreak >nul
)

:: Start Cloud Tunnel for Mobile Phone access (cute-lamps-itch.loca.lt)
curl -s -H "bypass-tunnel-reminder: true" https://cute-lamps-itch.loca.lt/ >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Starting TruthLens Mobile Cloud Tunnel...
    start /b "" npx localtunnel --port 8000 --subdomain cute-lamps-itch
    timeout /t 2 /nobreak >nul
)

:: Check if frontend is responding on port 5173
curl -s http://localhost:5173/ >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Starting TruthLens Web Engine...
    cd /d "%~dp0frontend"
    start /b "" npm run dev
    timeout /t 3 /nobreak >nul
    cd /d "%~dp0"
)

echo.
echo Opening TruthLens Standalone App Window...
cd /d "%~dp0frontend"

:: Check if Electron is installed to launch native Desktop window
if exist "node_modules\electron\dist\electron.exe" (
    start "" "node_modules\electron\dist\electron.exe" electron.cjs
    goto done
)

:: Fallback to native Chrome/Edge App Mode (standalone smartphone-sized window)
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app="http://localhost:5173/dashboard" --window-size=440,920
    goto done
)

if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app="http://localhost:5173/dashboard" --window-size=440,920
    goto done
)

start "" http://localhost:5173/dashboard

:done
echo TruthLens App is now running!
exit /b 0
