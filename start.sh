#!/bin/bash

# Startup script for Excel Table Display application
# This script starts both the FastAPI backend and React frontend

echo "🚀 Starting Excel Table Display Application..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Function to kill background processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    echo "✅ All servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start FastAPI backend
echo "🔧 Starting FastAPI backend..."
cd backend

# Check if Python is available
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "❌ Error: Python is not installed"
    exit 1
fi

# Check if virtual environment exists, if not create it
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv || python -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies if needed
if [ -f "requirements.txt" ]; then
    echo "📚 Installing Python dependencies..."
    pip install -r requirements.txt
fi

# Start FastAPI server in background
echo "🚀 Starting FastAPI server on http://localhost:8000"
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

# Go back to project root
cd ..

# Start React frontend
echo "🎨 Starting React frontend..."
cd client

# Check if Node.js is available
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    cleanup
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Start React development server in background
echo "🚀 Starting React server on http://localhost:3000"
npm run dev &
FRONTEND_PID=$!

# Go back to project root
cd ..

echo ""
echo "✅ Application is starting up..."
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📖 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for both processes
wait