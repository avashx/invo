# 🎯 Live Ticket Booking - User Guide

## Overview

The Live Ticket Booking page (`/live`) is designed to make bus ticket generation as simple as possible. It automatically detects your location, finds nearby buses and stops, and pre-fills all ticket information. You only need to select a bus and enter your destination!

## 🚀 Quick Start

### Step 1: Open the Page

Navigate to: `http://localhost:3001/live`

### Step 2: Allow Location Access

When prompted, click "Allow" to enable location access. This is required to find nearby buses and stops.

### Step 3: Wait for Data to Load

The page will automatically:

- 📍 Detect your current location
- 🚏 Find the 5 nearest bus stops
- 🚍 Find the 10 nearest buses
- 🔄 Update every 30 seconds

### Step 4: Select a Bus

Scroll to the "Nearest Buses" section and tap/click on any bus. This will:

- Auto-fill the Route Number
- Auto-fill the Bus Registration Number
- Auto-fill the Source Stop (from nearest stop)

### Step 5: Enter Destination

Type your destination stop in the "To" field. The autocomplete will help you find the correct stop name.

### Step 6: Generate Ticket

Click the "Generate Ticket" button to create your ticket!

---

## 📱 Interface Guide

### Status Bar (Top)

The status bar shows three important indicators:

1. **Connection Status**

   - 🔄 Loading: Connecting to server
   - ✅ Connected: Data is live
   - ❌ Error: Connection problem

2. **Location Status**

   - ⏳ Waiting: Requesting location
   - ✅ Located: Your position acquired
   - ❌ Denied: Location access denied

3. **Bus Count**
   - Shows number of active buses found

### Auto-Refresh Timer

- Displays countdown to next data refresh (30 seconds)
- Live indicator (pulsing red dot) shows active updates
- Data refreshes automatically in the background

### Your Location Section

- Shows your current GPS coordinates
- Displays location accuracy (in meters)
- **Refresh button**: Tap to manually update your location

### Nearest Bus Stops (Top 5)

Each stop card shows:

- **Stop name**: Full name of the bus stop
- **Distance**: How far it is from you (in km or meters)
- **Selection**: Tap any stop to manually select it as source

### Nearest Buses (Top 10)

Each bus card displays:

- **Bus number**: The registration number (e.g., DL1PC1234)
- **Distance**: How far the bus is from you
- **Route**: Route number and name (e.g., 764 Ring Road)
- **Speed**: Current speed in km/h

**To select**: Simply tap/click on any bus card

### Ticket Form

Four fields are present:

1. **From (Source Stop)**

   - ✅ Auto-filled from nearest stop
   - 🔒 Locked (cannot edit)
   - Changes when you select a different stop

2. **To (Destination)**

   - ✏️ Editable field
   - 🔍 Has autocomplete - start typing to see suggestions
   - ✅ Required field

3. **Route Number**

   - ✅ Auto-filled when you select a bus
   - 🔒 Locked (cannot edit)
   - Shows both route ID and name

4. **Bus Registration Number**
   - ✅ Auto-filled when you select a bus
   - 🔒 Locked (cannot edit)

### Generate Button

- **Disabled** when form is incomplete (grayed out)
- **Enabled** when all fields are filled (gradient background)
- Tap to generate your ticket!

---

## 💡 Tips & Tricks

### For Best Results

1. **Enable High Accuracy Location**

   - Go to your device settings
   - Enable "High Accuracy" or "GPS" mode
   - This provides better distance calculations

2. **Wait for First Load**

   - Give the page 5-10 seconds on first load
   - Wait for buses and stops to appear
   - Auto-refresh will keep data current

3. **Selecting the Right Bus**

   - Check the route name matches your journey
   - Closer buses appear first in the list
   - Speed indicator shows if bus is moving

4. **Destination Entry**

   - Use autocomplete to avoid typos
   - Type at least 2 characters to see suggestions
   - Select from dropdown for accuracy

5. **Check Distance**
   - Buses within 500m are walking distance
   - Plan arrival time based on distance shown
   - Remember: bus positions update every 30 seconds

### Common Scenarios

#### Scenario 1: Bus Not Moving

If speed shows 0 km/h, the bus might be:

- At a bus stop
- Stopped at a traffic signal
- Parked (not in service)

#### Scenario 2: Multiple Buses Same Route

- Select the nearest one for quickest boarding
- Or select one further away if you need time to reach

#### Scenario 3: Nearest Stop Too Far

- Walk towards the nearest stop while page refreshes
- The list will update as you move
- New closer stops may appear

---

## 🔧 Troubleshooting

### Location Not Detected

**Problem**: "Location permission denied" or stuck on "Waiting"

**Solutions**:

1. Check browser permissions:

   - Chrome: Click padlock icon in address bar → Site Settings → Location → Allow
   - Safari: Settings → Safari → Location → Allow
   - Firefox: Click info icon → Permissions → Location → Allow

2. Check device settings:

   - Ensure Location Services are ON
   - Allow browser to access location
   - Try airplane mode off/on

3. Try manual refresh:
   - Click the "Refresh" button
   - Reload the entire page (Cmd/Ctrl + R)

### No Buses Showing

**Problem**: "No buses found nearby" or empty list

**Solutions**:

1. Wait longer - data fetches every 30 seconds
2. Check the Bus Count in status bar (should be > 0)
3. You might be in an area with no active buses currently
4. The GTFS API might be temporarily down - try again in a few minutes

### Autocomplete Not Working

**Problem**: Typing destination but no suggestions appear

**Solutions**:

1. Type at least 2-3 characters
2. Wait a moment - suggestions load on keystroke
3. Try typing the stop name differently (e.g., "Kashmere Gate" vs "Kashmiri Gate")
4. If no matches, check spelling or try partial name

### Form Won't Submit

**Problem**: Generate button stays grayed out

**Check**:

- ✅ Is a bus selected? (Route and Bus Registration filled?)
- ✅ Is destination entered?
- ✅ Is source stop auto-filled?
- All four fields must have values

### Page Freezing or Slow

**Solutions**:

1. Close other browser tabs
2. Clear browser cache
3. Disable browser extensions
4. Check internet connection speed
5. Try different browser (Chrome, Safari, Firefox)

---

## 🎨 Visual Indicators

### Colors & Meanings

- **Purple Gradient**: Active/Selected items
- **Green Text**: Success/Connected status
- **Orange Text**: Warning/Loading status
- **Red Text**: Error/Disconnected status
- **Gray Background**: Disabled/Locked fields
- **White Background**: Active/Editable fields

### Animations

- **Pulsing Red Dot**: Live data active
- **Spinning Circle**: Loading/Processing
- **Slide In**: New content appearing
- **Highlight**: Selected item (purple border)

### Interactive Elements

- **Cards**: Tap anywhere on bus/stop card to select
- **Hover Effect**: Desktop users see hover states
- **Active State**: Items slightly shrink when tapped
- **Selection**: Purple border and background tint

---

## 📊 Understanding Distance

### Distance Calculations

- Uses GPS coordinates (latitude/longitude)
- Calculates straight-line distance (as the crow flies)
- Actual walking distance may be longer due to roads

### Distance Display

- **< 1 km**: Shown in meters (e.g., "250m")
- **≥ 1 km**: Shown in kilometers (e.g., "1.5km")

### Typical Walking Times

- 100m = ~1-2 minutes
- 500m = ~5-7 minutes
- 1km = ~10-15 minutes

---

## 🔐 Privacy & Permissions

### What We Access

- **Location**: GPS coordinates for finding nearby buses
- **Internet**: To fetch live bus data
- **Local Storage**: May store preferences (future feature)

### What We Don't Access

- Contacts, Camera, Microphone
- Personal information
- Background location
- Location history

### Data Usage

- Location is only used for distance calculation
- Not stored permanently
- Not shared with third parties
- Cleared when you close the page

---

## 🌐 Browser Support

### Fully Supported

- ✅ Chrome (Desktop & Mobile)
- ✅ Safari (iOS & macOS)
- ✅ Firefox (Desktop & Mobile)
- ✅ Edge (Desktop & Mobile)

### Requirements

- JavaScript enabled
- Location services enabled
- Modern browser (last 2 years)
- Internet connection

---

## 📱 Mobile vs Desktop

### Mobile Advantages

- Built for mobile-first
- Touch-optimized
- On-the-go usage
- Better location accuracy (GPS)

### Desktop Advantages

- Larger screen for viewing
- Hover effects for better UX
- Keyboard navigation
- Easier for planning

---

## 🆘 Getting Help

### Support Channels

1. Check this guide first
2. Read the FAQ section below
3. Contact technical support
4. Report issues on GitHub

### Reporting Issues

When reporting problems, include:

- Device type (iPhone 12, Samsung Galaxy, etc.)
- Browser (Chrome 120, Safari 17, etc.)
- Error message (screenshot if possible)
- Steps to reproduce

---

## ❓ FAQ

**Q: Why do I need to allow location access?**
A: To find buses and stops near you automatically. Without it, the app can't calculate distances.

**Q: How accurate is the bus location?**
A: GPS accuracy is typically ±10-50 meters. Bus positions update every 30 seconds.

**Q: Can I use this without internet?**
A: No, live data requires an active internet connection.

**Q: Why are some buses showing 0 km/h speed?**
A: The bus might be stopped, or the GPS data hasn't updated yet.

**Q: How often does data refresh?**
A: Automatically every 30 seconds. You can also manually refresh your location.

**Q: Can I book a ticket in advance?**
A: Currently, this generates tickets for immediate use. Advance booking is a planned feature.

**Q: What if my location is wrong?**
A: Click the "Refresh" button to get a new location reading. Ensure GPS is enabled.

**Q: Why can't I edit the source stop?**
A: It's auto-selected from your nearest stop to prevent errors. You can select a different stop from the list if needed.

**Q: What happens after I generate a ticket?**
A: You're redirected to the ticket page where you can view, download, or print your ticket.

**Q: Is the ticket valid?**
A: This is a demo system. Check with DTC for official ticketing.

---

## 🎓 Best Practices

### Before Leaving Home

1. Open the page
2. Allow location access
3. Wait for buses to load
4. Check which buses serve your route

### At the Bus Stop

1. Refresh your location
2. Select the approaching bus
3. Enter destination
4. Generate ticket quickly

### While Walking

1. Keep the page open
2. Let it auto-refresh
3. Watch for new buses appearing
4. Update selection if a closer bus appears

---

**💚 Enjoy hassle-free bus ticket booking!**

For technical documentation, see [README.md](README.md)
