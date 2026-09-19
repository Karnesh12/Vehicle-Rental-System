@echo off
title RideFlow Frontend
color 0E
echo Starting RideFlow React Vite Frontend on Port 5173...
cd /d "%~dp0frontend"
npx vite --port 5173
pause
