@echo off
cd /d "%~dp0"
title NetCard Builder Server

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js missing.
  echo Install from https://nodejs.org then run INSTALL.bat
  start "" "https://nodejs.org"
  pause
  exit /b 1
)

if not exist "node_modules\next\" (
  echo Packages missing. Installing now...
  call npm install --no-fund --no-audit
  if errorlevel 1 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
  )
)

echo ========================================
echo   NetCard Builder is starting...
echo   Keep this window OPEN.
echo   Browser: http://localhost:3000
echo ========================================
echo.

for /f "tokens=5" %%p in ('netstat -ano 2^>nul ^| findstr ":3000" ^| findstr "LISTENING"') do (
  echo Stopping old process on port 3000: %%p
  taskkill /F /PID %%p >nul 2>nul
)

start "" /min cmd /c "timeout /t 6 /nobreak >nul & start http://localhost:3000"

call npm run dev
echo.
echo Server stopped.
pause