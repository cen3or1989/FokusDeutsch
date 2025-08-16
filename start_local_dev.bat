@echo off
echo ========================================
echo TELC Exam System - Local Development
echo ========================================
echo.

echo 1. Starting PostgreSQL in Docker...
docker-compose up -d postgres

echo.
echo 2. Waiting for PostgreSQL to be ready...
timeout /t 5 /nobreak > nul

echo.
echo 3. Initializing database...
python init_database.py

echo.
echo 4. Starting Backend (Local)...
cd telc_exam_backend
python run_local.py

pause
