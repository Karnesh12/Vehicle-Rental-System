@echo off
title RideFlow Backend
color 0B
echo Starting RideFlow Spring Boot Backend on Port 8085...
cd /d "%~dp0backend"
set JAVA_HOME=C:\Program Files\Java\jdk-21
mvn spring-boot:run
pause
