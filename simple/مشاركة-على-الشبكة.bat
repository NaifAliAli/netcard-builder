@echo off
chcp 65001 >nul
cd /d "%~dp0"
title محفظة جيب - مشاركة على الشبكة

echo.
echo  ============================================
echo    محفظة جيب — مشاركة مع الموظفين (شبكة المكتب)
echo  ============================================
echo.

set "IP="
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    if not defined IP set "IP=%%a"
)
set "IP=%IP: =%"

if not defined IP (
    echo تعذر معرفة عنوان IP. شغّل start.bat وافتح http://localhost:8080
    set "IP=localhost"
)

echo  1^) اترك هذه النافذة مفتوحة
echo  2^) أرسل للموظفين هذا الرابط:
echo.
echo     http://%IP%:8080
echo.
echo  3^) للإيقاف: اضغط Ctrl+C
echo.
echo  ============================================
echo.

python -m http.server 8080 --bind 0.0.0.0 2>nul
if errorlevel 1 (
    echo Python غير مثبت. جرّب: فتح-محفظة-جيب.bat
    pause
)
