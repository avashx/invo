#!/bin/bash

# DTC Bus Tracker - Setup Script
# This script will help you set up the project

echo "🚌 DTC Bus Tracker - Setup Script"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    echo "Recommended version: v14.0.0 or higher"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed!"
    echo "npm should come with Node.js. Please reinstall Node.js."
    exit 1
fi

echo "✅ npm version: $(npm -v)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
echo ""
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ All dependencies installed successfully!"
else
    echo ""
    echo "❌ Failed to install dependencies"
    echo "Please check your internet connection and try again"
    exit 1
fi

echo ""
echo "🔧 Setup checklist:"
echo ""
echo "  ✓ Dependencies installed"
echo "  ⚠️  Create .env file with your MongoDB URI and other settings"
echo "  ⚠️  Ensure stops.csv and routename.csv are in the root directory"
echo "  ⚠️  Ensure gtfs-realtime.proto file is present"
echo ""
echo "📚 To start the server:"
echo "   npm start          (production mode)"
echo "   npm run dev        (development mode with auto-restart)"
echo ""
echo "🌐 Access points:"
echo "   Live Booking:      http://localhost:3001/live"
echo "   Bus Tracking:      http://localhost:3001/track"
echo "   Manual Ticket:     http://localhost:3001/invoice.html"
echo ""
echo "✨ Setup complete! Happy coding!"
echo ""
