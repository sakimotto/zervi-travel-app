#!/bin/bash

# Zervi Travel - Quick Start Script
# This script sets up the development environment automatically

echo "🚀 Zervi Travel - Quick Start Setup"
echo "===================================="

# Check if Docker is installed
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "✅ Docker found - Using Docker setup (recommended)"
    echo ""
    
    # Check if .env exists, if not create from example
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            echo "📝 Created .env file from .env.example"
        fi
    fi
    
    echo "🐳 Starting Docker containers..."
    docker-compose up --build
    
elif command -v node &> /dev/null && command -v npm &> /dev/null; then
    echo "✅ Node.js found - Using manual setup"
    echo ""
    
    # Check if .env exists, if not create from example
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            echo "📝 Created .env file from .env.example"
        fi
    fi
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing dependencies..."
        npm install
    fi
    
    echo "🚀 Starting development server..."
    npm run dev
    
else
    echo "❌ Neither Docker nor Node.js found!"
    echo ""
    echo "Please install one of the following:"
    echo "1. Docker Desktop (recommended): https://www.docker.com/products/docker-desktop"
    echo "2. Node.js 18+: https://nodejs.org/"
    echo ""
    echo "Then run this script again."
    exit 1
fi