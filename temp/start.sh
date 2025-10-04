#!/bin/bash

echo "🚀 Starting Live DTC Ticket Generator..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🔧 Starting proxy server on port 3001..."
echo "🌐 Open: http://localhost:3001/liveinvoice.html"
echo ""
echo "Press Ctrl+C to stop"
echo ""

node proxy-server.js