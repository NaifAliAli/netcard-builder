@echo off
chcp 65001 >nul
cd /d "%~dp0"
title تجهيز حزمة محفظة جيب

set "OUT=محفظة-جيب-جاهزة"
set "ZIP=محفظة-جيب-للموظفين.zip"

echo.
echo  جاري تجهيز الحزمة...
echo.

if exist "%OUT%" rmdir /s /q "%OUT%"
if exist "%ZIP%" del /f /q "%ZIP%"
mkdir "%OUT%"

xcopy /E /I /Y /Q "fonts" "%OUT%\fonts\" >nul
xcopy /E /I /Y /Q "templates" "%OUT%\templates\" >nul
copy /Y "index.html" "%OUT%\" >nul
copy /Y "templates-base64.js" "%OUT%\" >nul
copy /Y "templates-manifest.js" "%OUT%\" >nul
copy /Y "mahfazat-jeeb-template.csv" "%OUT%\" >nul
copy /Y "فتح-محفظة-جيب.bat" "%OUT%\" >nul
copy /Y "مشاركة-على-الشبكة.bat" "%OUT%\" >nul
copy /Y "اقرأني-طريقة-الاستخدام.txt" "%OUT%\" >nul

powershell -NoProfile -Command "Compress-Archive -Path '%OUT%\*' -DestinationPath '%ZIP%' -Force"

echo.
echo  ============================================
echo   تم! الملف جاهز:
echo   %CD%\%ZIP%
echo  ============================================
echo.
echo  أرسل هذا الملف ZIP للموظفين عبر واتساب أو البريد.
echo  الموظف: يفك الضغط ^> ينقر ^«فتح-محفظة-جيب.bat^»
echo.
pause
