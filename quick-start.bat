@echo off
REM Zervi Travel - Quick Start Script for Windows
REM This script sets up the development environment automatically

echo 🚀 Zervi Travel - Quick Start Setup
echo ====================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% == 0 (
    docker-compose --version >nul 2>&1
    if %errorlevel% == 0 (
        echo ✅ Docker found - Using Docker setup (recommended)
        echo.
        
        REM Check if .env exists, if not create from example
        if not exist .env (
            if exist .env.example (
                copy .env.example .env >nul
                echo 📝 Created .env file from .env.example
            )
        )
        
        echo 🐳 Starting Docker containers...
        docker-compose up --build
        goto :end
    )
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% == 0 (
    npm --version >nul 2>&1
    if %errorlevel% == 0 (
        echo ✅ Node.js found - Using manual setup
        echo.
        
        REM Check if .env exists, if not create from example
        if not exist .env (
            if exist .env.example (
                copy .env.example .env >nul
                echo 📝 Created .env file from .env.example
            )
        )
        
        REM Install dependencies if node_modules doesn't exist
        if not exist node_modules (
            echo 📦 Installing dependencies...
            npm install
        )
        
        echo 🚀 Starting development server...
        npm run dev
        goto :end
    )
)

echo ❌ Neither Docker nor Node.js found!
echo.
echo Please install one of the following:
echo 1. Docker Desktop (recommended): https://www.docker.com/products/docker-desktop
echo 2. Node.js 18+: https://nodejs.org/
echo.
echo Then run this script again.
pause
exit /b 1

:end
pause