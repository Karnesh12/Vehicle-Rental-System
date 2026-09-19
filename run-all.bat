@echo off
title RideFlow - Launcher
color 0A
echo ========================================================
echo        RIDEFLOW - VEHICLE RENTAL MANAGEMENT SYSTEM
echo ========================================================
echo.
echo [1/3] Starting Spring Boot Backend (Port 8085)...
start "RideFlow Backend (Spring Boot)" cmd /k "cd /d "%~dp0backend" && set JAVA_HOME=C:\Program Files\Java\jdk-21 && mvn spring-boot:run"

echo [2/3] Starting React Vite Frontend (Port 5173)...
start "RideFlow Frontend (Vite)" cmd /k "cd /d "%~dp0frontend" && npx vite --port 5173"

echo [3/3] Waiting for servers to initialize...
timeout /t 5 /nobreak >nul

echo Opening browser at http://localhost:5173/ ...
start http://localhost:5173/

echo.
echo ========================================================
echo RideFlow is now running!
echo Frontend: http://localhost:5173/
echo Backend:  http://localhost:8085/api
echo ========================================================
pause
