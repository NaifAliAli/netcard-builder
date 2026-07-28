@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Pack Support ZIP

set "OUT=NetCard-Builder-Support"
set "ZIP=NetCard-Builder-Support.zip"

echo Creating support package for all PCs...
if exist "%OUT%" rmdir /s /q "%OUT%"
if exist "%ZIP%" del /f /q "%ZIP%"

mkdir "%OUT%"
mkdir "%OUT%\app"
mkdir "%OUT%\public"
mkdir "%OUT%\templates"

xcopy /E /I /Y "app\*" "%OUT%\app\" >nul
xcopy /E /I /Y "public\*" "%OUT%\public\" >nul
xcopy /E /I /Y "templates\*" "%OUT%\templates\" >nul

copy /Y "package.json" "%OUT%\" >nul
if exist "package-lock.json" copy /Y "package-lock.json" "%OUT%\" >nul
copy /Y "next.config.js" "%OUT%\" >nul
copy /Y "tsconfig.json" "%OUT%\" >nul
copy /Y "tailwind.config.ts" "%OUT%\" >nul
copy /Y "postcss.config.js" "%OUT%\" >nul
copy /Y "README.md" "%OUT%\" >nul
copy /Y "INSTALL.bat" "%OUT%\" >nul
copy /Y "install.bat" "%OUT%\" >nul
copy /Y "start.bat" "%OUT%\" >nul
copy /Y "pack-support.bat" "%OUT%\" >nul
if exist "تثبيت.bat" copy /Y "تثبيت.bat" "%OUT%\" >nul
if exist "تشغيل.bat" copy /Y "تشغيل.bat" "%OUT%\" >nul
if exist "دليل-الدعم-الفني.md" copy /Y "دليل-الدعم-الفني.md" "%OUT%\" >nul
if exist ".gitignore" copy /Y ".gitignore" "%OUT%\" >nul

> "%OUT%\READ-ME-FIRST.txt" (
  echo NetCard Builder - Support Package
  echo ================================
  echo.
  echo On EVERY support PC:
  echo 1^) Install Node.js LTS once from https://nodejs.org
  echo 2^) Extract this ZIP
  echo 3^) Double-click INSTALL.bat
  echo 4^) Browser opens http://localhost:3000
  echo.
  echo Later runs: Desktop shortcut "NetCard Builder" or start.bat
  echo.
  echo Excel template: templates folder
  echo Single client: use text boxes in the app ^(no Excel needed^)
)

powershell -NoProfile -Command "Compress-Archive -Path '%OUT%\*' -DestinationPath '%ZIP%' -Force"
echo.
echo DONE: %ZIP%
echo Send this file to all support devices.
pause
