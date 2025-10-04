# 🚀 Quick Start Guide

## Get Started in 3 Minutes!

### Step 1: Install Dependencies
```bash
cd /Users/Vashishth/CODING/invo
npm install
```

**What this does:**
- Installs Express.js, EJS, Socket.IO, and other required packages
- Sets up node_modules folder
- Takes ~30 seconds with good internet

### Step 2: Start the Server
```bash
npm start
```

**What this does:**
- Starts Express server on port 3001
- Loads bus stops and route data from CSV files
- Begins fetching live bus data from GTFS API
- Takes ~5 seconds to initialize

### Step 3: Open in Browser
```
http://localhost:3001/live
```

**What you'll see:**
- Live booking page opens
- Browser asks for location permission → Click "Allow"
- Page shows your location and nearby buses
- You're ready to generate tickets!

---

## 📱 Alternative: Use the Setup Script

```bash
./setup.sh
```

This automated script will:
- ✅ Check if Node.js is installed
- ✅ Install all dependencies
- ✅ Show you what's next

---

## 🎯 First Ticket - Step by Step

### 1. Allow Location Access
When the page loads, click **"Allow"** on the location permission prompt.

### 2. Wait for Data
The page will automatically:
- Find your GPS coordinates
- Display nearest 5 bus stops
- Show nearest 10 buses
- Takes 3-5 seconds

### 3. Select a Bus
Scroll to **"Nearest Buses"** section and tap any bus card. This will:
- Highlight the selected bus (purple border)
- Auto-fill the Route Number
- Auto-fill the Bus Registration
- Auto-fill the Source Stop (from nearest stop)

### 4. Enter Destination
In the **"To (Destination)"** field:
- Start typing your destination
- Autocomplete suggestions will appear
- Select from the dropdown or type the full name

### 5. Generate Ticket
Click the **"GENERATE TICKET"** button.
- You'll be redirected to the ticket page
- Your ticket is ready to view, download, or print!

---

## 🌐 All Available Pages

| URL | Description | Use Case |
|-----|-------------|----------|
| `http://localhost:3001/live` | **Live Booking** (Recommended) | Quick ticket with auto-location |
| `http://localhost:3001/track` | **Bus Tracking Map** | View real-time bus positions |
| `http://localhost:3001/invoice.html` | **Manual Ticket** | Generate ticket with manual entry |
| `http://localhost:3001/api/buses` | **API: All Buses** | JSON data of all active buses |
| `http://localhost:3001/api/all-stops` | **API: All Stops** | JSON data of all bus stops |

---

## 🔍 Testing the System

### Test 1: Location Detection
**Expected:** Your coordinates appear within 5 seconds
**If fails:** Check browser location permissions

### Test 2: Nearest Stops
**Expected:** 5 stops listed with distances
**If fails:** Check if stops.csv file exists

### Test 3: Nearest Buses
**Expected:** Up to 10 buses with live data
**If fails:** Check internet connection, GTFS API might be down

### Test 4: Auto-Fill
**Expected:** Route and bus number fill when you tap a bus
**If succeeds:** Form validation working correctly!

### Test 5: Autocomplete
**Expected:** Suggestions appear as you type destination
**If fails:** Wait for stops to load (shown in status bar)

### Test 6: Ticket Generation
**Expected:** Redirects to invoice.html with your data
**If succeeds:** System working end-to-end! 🎉

---

## 🐛 Common Issues & Quick Fixes

### Issue: "npm: command not found"
**Fix:** Install Node.js from https://nodejs.org/
- Download LTS version
- Run installer
- Restart terminal
- Try `npm install` again

### Issue: Location not detected
**Fix 1:** Check browser permissions
- Chrome: Click padlock → Site Settings → Location → Allow
- Safari: Settings → Safari → Location → Allow

**Fix 2:** Use HTTPS or localhost
- Geolocation only works on secure origins
- `localhost` is considered secure

### Issue: No buses showing
**Fix 1:** Wait 30 seconds for auto-refresh
**Fix 2:** Check bus count in status bar
- If 0, GTFS API might be temporarily down
- If > 0 but not showing, refresh the page

**Fix 3:** Check console for errors
- Open Developer Tools (F12)
- Look for red error messages
- Report the error if persistent

### Issue: Form won't submit
**Check:**
- ✅ Is a bus selected?
- ✅ Is destination entered?
- ✅ Is source auto-filled?
- All four fields must have values

### Issue: EJS templates not rendering
**Fix:** Install EJS package
```bash
npm install ejs
```
Then restart the server.

### Issue: Port 3001 already in use
**Fix:** Change port in server.js
```javascript
const CONFIG = {
    PORT: 3002, // Change this
    ...
};
```
Or kill the process using port 3001:
```bash
lsof -ti:3001 | xargs kill -9
```

---

## 📁 Required Files Checklist

Before starting, ensure these files exist:

- ✅ **server.js** - Main server file
- ✅ **live.ejs** - Live booking page
- ✅ **bapp.ejs** - Tracking map page
- ✅ **invoice.html** - Ticket generation page
- ✅ **package.json** - Dependencies list
- ✅ **stops.csv** - Bus stop database
- ✅ **routename.csv** - Route mappings
- ✅ **gtfs-realtime.proto** - Protocol buffer definition
- ✅ **alo.otf** - Custom font for tickets
- ✅ **blank-ticket.JPG** - Ticket background

---

## 🎨 Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome (Desktop) | ✅ Full | Recommended |
| Chrome (Mobile) | ✅ Full | Best mobile experience |
| Safari (iOS) | ✅ Full | Works great on iPhone |
| Safari (macOS) | ✅ Full | Works great on Mac |
| Firefox | ✅ Full | All features work |
| Edge | ✅ Full | Chromium-based, works well |
| Internet Explorer | ❌ No | Not supported |

---

## 🚦 Server Status Check

### Verify Server is Running
Open: `http://localhost:3001/api/health`

**Expected Response:**
```json
{
  "success": true,
  "status": "running",
  "busCount": 47,
  "stopsCount": 1234,
  "mongodb": true,
  "csvLoaded": true
}
```

### Check Individual Endpoints

1. **All Buses**
   ```
   http://localhost:3001/api/buses
   ```
   Should return JSON with array of buses

2. **All Stops**
   ```
   http://localhost:3001/api/all-stops
   ```
   Should return JSON with array of stops

3. **Nearest Stops** (Example coordinates)
   ```
   http://localhost:3001/api/nearest-stops/28.7041/77.1025?limit=5
   ```
   Should return 5 nearest stops to that location

---

## 💡 Pro Tips

### Tip 1: Keep Page Open
Leave the page open while waiting for a bus - it auto-refreshes every 30 seconds!

### Tip 2: Use on the Go
Open the page on your phone as you're walking to the bus stop for most accurate results.

### Tip 3: Check Multiple Buses
Don't just select the nearest bus - check if a bus on the same route is approaching from behind!

### Tip 4: Bookmark It
Bookmark `http://localhost:3001/live` for instant access.

### Tip 5: Compare Distances
Look at both bus distances AND stop distances to plan your route optimally.

---

## 📊 Performance Benchmarks

**Expected Performance:**
- Location Detection: < 5 seconds
- Data Load: < 3 seconds
- Auto-refresh: Every 30 seconds
- Form Auto-fill: < 1 second
- Ticket Generation: Instant redirect

**If slower:**
- Check internet speed
- Close other apps/tabs
- Clear browser cache
- Restart server

---

## 🎓 Next Steps

Once you're comfortable with the basics:

1. **Explore the Tracking Map**
   - Visit `/track` to see live bus positions on a map
   - Zoom in to see bus stops
   - Click buses for details

2. **Try Manual Ticket Generation**
   - Visit `/invoice.html` for full control
   - Enter all details manually
   - Customize ticket appearance

3. **Check the API**
   - Use the REST endpoints for your own apps
   - All endpoints return JSON
   - No authentication required (currently)

4. **Read the Documentation**
   - `README.md` - Full system documentation
   - `USAGE_GUIDE.md` - Detailed user guide
   - `FEATURE_SUMMARY.md` - Feature list and goals
   - `SYSTEM_DIAGRAM.md` - Visual architecture

---

## 🆘 Getting Help

### Debugging Steps
1. Open Browser Console (F12)
2. Look for error messages (red text)
3. Check Network tab for failed requests
4. Check Console tab for JavaScript errors

### Server Logs
The terminal running `npm start` shows:
- Bus data fetch logs
- API request logs
- Error messages
- Connection status

### Report Issues
If you find bugs:
1. Note the exact steps to reproduce
2. Screenshot the error (if visible)
3. Check browser console for errors
4. Include your OS and browser version
5. Open an issue on GitHub

---

## ✅ Success Checklist

You're all set up when:
- [x] Server starts without errors
- [x] Browser shows live booking page
- [x] Location is detected
- [x] Stops list populates
- [x] Buses list populates
- [x] Selecting a bus auto-fills the form
- [x] Typing destination shows autocomplete
- [x] Generate button becomes enabled
- [x] Ticket is generated successfully

---

## 🎉 You're Ready!

If all the above works, congratulations! You now have a fully functional live bus ticket booking system running locally.

**Start generating tickets:** `http://localhost:3001/live`

---

## 📞 Support

For questions or issues:
- 📧 Email: support@example.com
- 💬 GitHub Issues: https://github.com/avashx/invo/issues
- 📚 Full Docs: See README.md

---

**Built with ❤️ for Delhi Transport Corporation**

Last updated: October 4, 2025
