@echo off
cd /d "%~dp0"
title NetCard Builder - INSTALL

echo ========================================
echo   NetCard Builder - Installation
echo ========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js is not installed.
  echo Download LTS from https://nodejs.org then run INSTALL.bat again.
  start "" "https://nodejs.org"
  pause
  exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do echo Node found: %%v
echo.

if exist "node_modules\next\" (
  echo [1/3] Packages already installed - skipping npm install.
) else (
  echo [1/3] Installing packages... please wait...
  call npm install --no-fund --no-audit
  if errorlevel 1 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
  )
)

echo [2/3] Creating Desktop shortcut...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$desk=[Environment]::GetFolderPath('Desktop'); $ws=New-Object -ComObject WScript.Shell; $sc=$ws.CreateShortcut((Join-Path $desk 'NetCard Builder.lnk')); $sc.TargetPath=(Join-Path '%CD%' 'start.bat'); $sc.WorkingDirectory='%CD%'; $sc.WindowStyle=1; $sc.Description='NetCard Builder'; $sc.Save(); Write-Host 'Shortcut OK'"

echo [3/3] Launching app in a new window...
start "NetCard Builder Server" cmd /k call "%~dp0start.bat"

echo.
echo ========================================
echo   Installation finished.
echo   A new window will start the server.
echo   Browser opens when ready:
echo   http://localhost:3000
echo ========================================
echo.
echo You can close THIS window now.
pause