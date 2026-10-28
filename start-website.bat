@echo off
cd /d "%~dp0nexuss"

echo Paketler kontrol ediliyor ve kuruluyor...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force; npm install"

echo Proje baslatiliyor...
powershell -NoProfile -ExecutionPolicy Bypass -Command "npm run dev"

pause