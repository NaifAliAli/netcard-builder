@echo off
chcp 65001 >nul
title محفظة جيب - تجهيز حزمة الدعم الفني
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo [خطأ] يلزم Node.js لتجهيز الحزمة.
  pause
  exit /b 1
)

set "OUT=NetCard-Builder-Support"
set "ZIP=NetCard-Builder-للدعم-الفني.zip"

echo جاري تجهيز حزمة التوزيع للدعم الفني...
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
copy /Y "package-lock.json" "%OUT%\" >nul 2>nul
copy /Y "next.config.js" "%OUT%\" >nul
copy /Y "tsconfig.json" "%OUT%\" >nul
copy /Y "tailwind.config.ts" "%OUT%\" >nul
copy /Y "postcss.config.js" "%OUT%\" >nul
copy /Y "README.md" "%OUT%\" >nul
copy /Y "دليل-الدعم-الفني.md" "%OUT%\" >nul
copy /Y "تثبيت.bat" "%OUT%\" >nul
copy /Y "تشغيل.bat" "%OUT%\" >nul
copy /Y ".gitignore" "%OUT%\" >nul 2>nul

powershell -NoProfile -Command "Compress-Archive -Path '%OUT%\*' -DestinationPath '%ZIP%' -Force"
if errorlevel 1 (
  echo [تحذير] تعذر إنشاء ZIP تلقائياً. المجلد جاهز: %OUT%
) else (
  echo.
  echo ========================================
  echo   الحزمة جاهزة للإرسال:
  echo   %ZIP%
  echo ========================================
)

echo.
echo أرسل الملف المضغوط لفريق الدعم مع دليل-الدعم-الفني.md
pause
