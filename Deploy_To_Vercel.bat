@echo off
title TruthLens - Deploy to Vercel
color 0B
echo ===================================================================
echo             TruthLens AI - Vercel Cloud Deployment
echo ===================================================================
echo.
cd /d "%~dp0frontend"

echo [1/3] Building production web assets...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Frontend build failed. Please fix any errors above.
    pause
    exit /b 1
)

echo.
echo [2/3] Launching Vercel Cloud Deployer...
echo.
echo NOTE: If this is your first time deploying to Vercel:
echo   - Vercel CLI will ask you to log in via browser (1-click GitHub/Google).
echo   - Accept the default options by pressing Enter.
echo.
call npx vercel

echo.
echo [3/3] Deploying to Production (--prod)...
echo.
set /p PROD="Do you want to deploy directly to Production (live URL)? (Y/N): "
if /i "%PROD%"=="Y" (
    call npx vercel --prod
)

echo.
echo ===================================================================
echo   Deployment completed! 
echo   Your TruthLens web application is now live on Vercel.
echo ===================================================================
echo.
pause
