@echo off
REM Startup script for Excel Table Display Application (Windows)
REM This script starts both the FastAPI backend and React frontend

echo 🚀 Starting Excel Table Display Application...
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the project root directory
    pause
    exit /b 1
)

REM Start FastAPI backend
echo 🔧 Starting FastAPI backend...
cd backend

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Python is not installed
    pause
    exit /b 1
)

REM Check if virtual environment exists, if not create it
if not exist "venv" (
    echo 📦 Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate

REM Install dependencies if needed
if exist "requirements.txt" (
    echo 📚 Installing Python dependencies...
    pip install -r requirements.txt
)

REM Start FastAPI server in background
echo 🚀 Starting FastAPI server on http://localhost:8000
start "FastAPI Backend" uvicorn main:app --reload --port 8000

REM Go back to project root
cd ..

REM Start React frontend
echo 🎨 Starting React frontend...
cd client

REM Check if Node.js is available
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: npm is not installed
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing Node.js dependencies...
    npm install
)

REM Start React development server
echo 🚀 Starting React server on http://localhost:3000
start "React Frontend" npm run dev

REM Go back to project root
cd ..

echo.
echo ✅ Application is starting up...
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:8000
echo 📖 API Docs: http://localhost:8000/docs
echo.
echo Close this window to keep servers running
echo.
echo Press any key to stop all servers...
pause >nul

REM Stop all servers
echo.
echo 🛑 Stopping servers...
taskkill /FI "WINDOWTITLE eq FastAPI Backend*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq React Frontend*" /F >nul 2>&1
echo ✅ All servers stopped