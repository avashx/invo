# 🚌 Live DTC Ticket Generator

A clean, focused real-time bus tracking and ticket generation system with radar-style UI.

## 🚀 Quick Start

**Start the system:**

```bash
./start.sh
```

**Access the app:**

- **Main app:** http://localhost:3001/liveinvoice.html

## 🎯 Core Features

### ✅ **Live Bus Tracking**

- **Real-time data** from DTC API with fallback support
- **50km search radius** for buses, **20km** for stops
- **Auto-refresh** every 30 seconds
- **Automatic fallback** to demo data when API unavailable

### ✅ **Radar-Style Interface**

- **Clean black & white theme** inspired by AirDrop
- **Animated radar sweep** with distance rings
- **Interactive bus markers** positioned by real distance
- **Professional design** without emojis or clutter

### ✅ **Smart Connection Handling**

- **Proxy server** resolves CORS issues automatically
- **Multiple server fallback** (local proxy → direct API → demo data)
- **Automatic retry** with graceful degradation
- **Cache system** for better performance

### ✅ **Ticket Generation**

- **Auto-populated** from selected buses
- **Manual override** capabilities
- **Live preview** with authentic DTC styling
- **Download as PNG** functionality

## 🔧 How It Works

1. **Location Detection** - Gets your GPS coordinates
2. **Live Data Fetch** - Connects to DTC bus APIs via proxy
3. **Distance Calculation** - Finds buses within 50km radius
4. **Radar Display** - Shows buses positioned by actual distance
5. **Ticket Generation** - Creates authentic-looking DTC tickets

## � Usage

1. **Allow location access** when prompted
2. **View nearby buses** on the animated radar display
3. **Click any bus** on radar or list to select it
4. **Auto-filled ticket** details from selected bus
5. **Manual adjustments** via configuration panel
6. **Generate and download** your ticket as image

## 🛠 Technical Stack

- **Frontend:** Vanilla JavaScript, CSS3 animations
- **Backend:** Express.js proxy server
- **APIs:** DTC bus tracking endpoints
- **Fallback:** Demo data for offline capability
- **Image Generation:** DOM-to-image for ticket downloads

## 🎨 UI Design

- **Radar Display:** Circular interface with animated sweep
- **Distance Rings:** Visual 10km, 20km, 30km, 40km markers
- **Status Indicators:** Color-coded connection status
- **Responsive Design:** Works on mobile and desktop
- **Clean Typography:** Professional, readable fonts

## 🔄 Data Flow

```
User Location → API Fetch → Distance Calc → Radar Display → Ticket Generation
```

The system gracefully handles API failures and always provides a working experience with fallback data when needed.
