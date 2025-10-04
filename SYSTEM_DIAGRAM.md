# 🎨 Live Ticket Booking - Visual System Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER'S MOBILE DEVICE                            │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────┐    │
│  │                    LIVE.EJS INTERFACE                          │    │
│  │                                                                │    │
│  │  ┌──────────────────────────────────────────────────────┐    │    │
│  │  │         🚌 DTC Live Booking                          │    │    │
│  │  │    Smart ticket generation with live data            │    │    │
│  │  └──────────────────────────────────────────────────────┘    │    │
│  │                                                                │    │
│  │  ┌─────────────┬─────────────┬─────────────┐                │    │
│  │  │ Connection  │  Location   │   Buses     │                │    │
│  │  │    🟢       │     🟢      │     47      │                │    │
│  │  │ Connected   │  Located ✓  │   Active    │                │    │
│  │  └─────────────┴─────────────┴─────────────┘                │    │
│  │                                                                │    │
│  │  Next update in 25s 🔴                                        │    │
│  │                                                                │    │
│  │  ┌──────────────────────────────────────────────────────┐    │    │
│  │  │ 📍 Your Location                     [Refresh]       │    │    │
│  │  │ Coordinates: 28.7041, 77.1025                        │    │    │
│  │  │ 📍 Accuracy: ±12m                                    │    │    │
│  │  └──────────────────────────────────────────────────────┘    │    │
│  │                                                                │    │
│  │  ┌──────────────────────────────────────────────────────┐    │    │
│  │  │ 🚏 Nearest Bus Stops                            5    │    │    │
│  │  │ ──────────────────────────────────────────────────── │    │    │
│  │  │ 1. Kashmere Gate                         250m        │    │    │
│  │  │ 2. ISBT Kashmere Gate                    380m        │    │    │
│  │  │ 3. Chandni Chowk                         520m        │    │    │
│  │  │ 4. Red Fort                              780m        │    │    │
│  │  │ 5. Jama Masjid                           890m        │    │    │
│  │  └──────────────────────────────────────────────────────┘    │    │
│  │                                                                │    │
│  │  ┌──────────────────────────────────────────────────────┐    │    │
│  │  │ 🚍 Nearest Buses                               10    │    │    │
│  │  │ ──────────────────────────────────────────────────── │    │    │
│  │  │ #1 DL1PC1234                             150m        │    │    │
│  │  │    Route: 764 Ring Road       Speed: 25 km/h        │    │    │
│  │  │ ──────────────────────────────────────────────────── │    │    │
│  │  │ #2 DL1PA5678                             280m        │    │    │
│  │  │    Route: 423 Old Delhi       Speed: 15 km/h        │    │    │
│  │  │ ──────────────────────────────────────────────────── │    │    │
│  │  │ ... 8 more buses                                     │    │    │
│  │  └──────────────────────────────────────────────────────┘    │    │
│  │                                                                │    │
│  │  ┌──────────────────────────────────────────────────────┐    │    │
│  │  │ 🎫 Generate Ticket                                   │    │    │
│  │  │ ──────────────────────────────────────────────────── │    │    │
│  │  │ ℹ️ Select a bus above to auto-fill!                 │    │    │
│  │  │                                                      │    │    │
│  │  │ From (Source Stop)                                   │    │    │
│  │  │ [Kashmere Gate               ] 🔒                    │    │    │
│  │  │                                                      │    │    │
│  │  │ To (Destination)                                     │    │    │
│  │  │ [Type destination...         ] ✏️                    │    │    │
│  │  │                                                      │    │    │
│  │  │ Route Number                                         │    │    │
│  │  │ [764 (Ring Road)             ] 🔒                    │    │    │
│  │  │                                                      │    │    │
│  │  │ Bus Registration Number                              │    │    │
│  │  │ [DL1PC1234                   ] 🔒                    │    │    │
│  │  │                                                      │    │    │
│  │  │        [ GENERATE TICKET ]                           │    │    │
│  │  └──────────────────────────────────────────────────────┘    │    │
│  └────────────────────────────────────────────────────────────── ┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ HTTPS Fetch API
                                   ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                         EXPRESS.JS SERVER                               │
│                         (localhost:3001)                                │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                      ROUTE HANDLERS                             │  │
│  │                                                                 │  │
│  │  GET /live                                                      │  │
│  │    → renders live.ejs with initial data                        │  │
│  │                                                                 │  │
│  │  GET /api/nearest-stops/:lat/:lng?limit=5                      │  │
│  │    → calculates distances, returns sorted stops                │  │
│  │                                                                 │  │
│  │  GET /api/nearest-buses/:lat/:lng?limit=10                     │  │
│  │    → calculates distances, returns sorted buses                │  │
│  │                                                                 │  │
│  │  GET /api/all-stops                                            │  │
│  │    → returns all stops for autocomplete                        │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                   │                                     │
│                                   │                                     │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                    DATA PROCESSING                              │  │
│  │                                                                 │  │
│  │  calculateDistance(lat1, lon1, lat2, lon2)                     │  │
│  │    → Haversine formula                                         │  │
│  │    → Returns distance in kilometers                            │  │
│  │                                                                 │  │
│  │  sortByDistance()                                              │  │
│  │    → Sorts stops/buses by proximity                           │  │
│  │    → Returns top N results                                     │  │
│  └─────────────────────────────────────────────────────────────────┘  │
│                                   │                                     │
│                                   │                                     │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                    IN-MEMORY DATA                               │  │
│  │                                                                 │  │
│  │  busData = []           ← Live bus positions                   │  │
│  │  busStops = []          ← All stop coordinates                 │  │
│  │  routeMap = new Map()   ← Route ID → Name mappings            │  │
│  └─────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                     │                              │
                     │                              │
     Every 10 seconds│                              │ On server start
                     │                              │
                     ↓                              ↓
┌─────────────────────────────────┐   ┌──────────────────────────────────┐
│      GTFS REAL-TIME API         │   │        CSV FILES                 │
│                                 │   │                                  │
│  https://otd.delhi.gov.in/      │   │  stops.csv                       │
│  api/realtime/                  │   │    - stop_name                   │
│  VehiclePositions.pb            │   │    - stop_lat                    │
│                                 │   │    - stop_lon                    │
│  Returns:                       │   │                                  │
│  - Bus positions (lat/lng)      │   │  routename.csv                   │
│  - Route IDs                    │   │    - route_id                    │
│  - Bus registration numbers     │   │    - route_name                  │
│  - Speed, bearing               │   │                                  │
│  - Timestamp                    │   │  Loaded on server startup        │
└─────────────────────────────────┘   └──────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════
                           DATA FLOW SEQUENCE
═══════════════════════════════════════════════════════════════════════════

1. USER OPENS PAGE
   User → Browser → GET /live → Server → Renders live.ejs

2. PAGE REQUESTS LOCATION
   Browser → Geolocation API → User → [Allow] → GPS Coordinates

3. FETCH NEAREST STOPS
   Browser → GET /api/nearest-stops/28.7041/77.1025?limit=5
   Server → Calculate distances from user location
   Server → Sort by distance
   Server → Return top 5 stops
   Browser → Display in "Nearest Stops" section
   Browser → Auto-select #1 as source

4. FETCH NEAREST BUSES
   Browser → GET /api/nearest-buses/28.7041/77.1025?limit=10
   Server → Calculate distances from user location
   Server → Sort by distance
   Server → Return top 10 buses with live data
   Browser → Display in "Nearest Buses" section

5. FETCH ALL STOPS (for autocomplete)
   Browser → GET /api/all-stops
   Server → Return complete stop list
   Browser → Store in memory for autocomplete

6. USER SELECTS BUS
   User → Taps on bus card
   Browser → Updates selected state
   Browser → Auto-fills:
            - Route Number: "764 (Ring Road)"
            - Bus Registration: "DL1PC1234"
   Browser → Enables submit button (if destination entered)

7. USER ENTERS DESTINATION
   User → Types in "To" field
   Browser → Shows autocomplete dropdown
   User → Selects from dropdown
   Browser → Fills destination field
   Browser → Enables submit button (all fields valid)

8. USER GENERATES TICKET
   User → Clicks "Generate Ticket"
   Browser → Collects form data
   Browser → Redirects to:
            invoice.html?from=Kashmere+Gate&to=Connaught+Place
                        &route=764&bus=DL1PC1234&timestamp=1234567890

9. AUTO-REFRESH CYCLE (Every 30 seconds)
   Timer → Triggers refresh
   Browser → GET /api/nearest-buses/28.7041/77.1025?limit=10
   Server → Returns updated bus positions
   Browser → Updates display
   Browser → Maintains user's selections
   Timer → Resets to 30 seconds


═══════════════════════════════════════════════════════════════════════════
                          COMPONENT INTERACTION
═══════════════════════════════════════════════════════════════════════════

┌──────────────────┐
│   Geolocation    │ ─────┐
│      API         │      │
└──────────────────┘      │
                          │
┌──────────────────┐      │    ┌──────────────────┐
│   Status Bar     │◄─────┼────┤   Main Logic     │
│  - Connection    │      │    │   (JavaScript)   │
│  - Location      │      │    │                  │
│  - Bus Count     │      │    │  - getUserLocation()
└──────────────────┘      │    │  - calculateDistance()
                          │    │  - fetchNearestStops()
┌──────────────────┐      │    │  - fetchNearestBuses()
│  Location Info   │◄─────┤    │  - displayNearestStops()
│  - Coordinates   │      │    │  - displayNearestBuses()
│  - Accuracy      │      │    │  - selectBus()
└──────────────────┘      │    │  - selectStop()
                          │    │  - checkFormValidity()
┌──────────────────┐      │    │  - generateTicket()
│  Stops List      │◄─────┤    └──────────────────┘
│  (Top 5)         │      │              │
└──────────────────┘      │              │
                          │              │
┌──────────────────┐      │              │
│  Buses List      │◄─────┤              │
│  (Top 10)        │      │              │
└──────────────────┘      │              │
                          │              │
┌──────────────────┐      │              │
│  Ticket Form     │◄─────┘              │
│  - From (auto)   │                     │
│  - To (manual)   │                     │
│  - Route (auto)  │                     │
│  - Bus (auto)    │                     │
└──────────────────┘                     │
         │                               │
         │ Form Submission               │
         ↓                               │
┌──────────────────┐                     │
│  invoice.html    │                     │
│  (Ticket Page)   │                     │
└──────────────────┘                     │
                                         │
                                         │ Fetch API
                                         ↓
                                ┌──────────────────┐
                                │  Server APIs     │
                                │  /api/...        │
                                └──────────────────┘


═══════════════════════════════════════════════════════════════════════════
                            KEY ALGORITHMS
═══════════════════════════════════════════════════════════════════════════

1. HAVERSINE DISTANCE CALCULATION

   function calculateDistance(lat1, lon1, lat2, lon2) {
       R = 6371 (Earth's radius in km)

       dLat = (lat2 - lat1) * π/180
       dLon = (lon2 - lon1) * π/180

       a = sin²(dLat/2) + cos(lat1) * cos(lat2) * sin²(dLon/2)
       c = 2 * atan2(√a, √(1-a))

       return R * c (distance in km)
   }

2. SORTING BY PROXIMITY

   stops.map(stop => ({
       ...stop,
       distance: calculateDistance(userLat, userLng, stop.lat, stop.lng)
   }))
   .sort((a, b) => a.distance - b.distance)
   .slice(0, limit)

3. AUTO-REFRESH LOGIC

   setInterval(() => {
       if (userLocation exists) {
           fetchNearestBuses()
       }
   }, 30000)

   setInterval(() => {
       countdown--
       if (countdown <= 0) countdown = 30
   }, 1000)

4. FORM VALIDATION

   checkFormValidity() {
       isValid = fromLocation && toLocation && routeNumber && busRegistration
       submitButton.disabled = !isValid
   }


═══════════════════════════════════════════════════════════════════════════
                         RESPONSIVE BREAKPOINTS
═══════════════════════════════════════════════════════════════════════════

Mobile (Default)                  Desktop
─────────────────                 ───────────────
max-width: 420px                  Same styling
Full width container              Centered container
Touch-optimized                   Hover effects work
                                  Mouse interactions

┌─────────────────┐              ┌───────────────────────┐
│                 │              │                       │
│   Mobile View   │              │     Desktop View      │
│   (Portrait)    │              │    (Same layout)      │
│                 │              │                       │
│  ┌───────────┐  │              │    ┌───────────┐     │
│  │  Content  │  │              │    │  Content  │     │
│  │   420px   │  │              │    │   420px   │     │
│  │   max     │  │              │    │   max     │     │
│  └───────────┘  │              │    └───────────┘     │
│                 │              │                       │
└─────────────────┘              └───────────────────────┘


═══════════════════════════════════════════════════════════════════════════
                            SUCCESS FLOW
═══════════════════════════════════════════════════════════════════════════

START
  ↓
[User opens /live]
  ↓
[Allow location] ✓
  ↓
[Location detected: 28.7041, 77.1025] ✓
  ↓
[Fetching stops...] → [5 stops found] ✓
  ↓
[Fetching buses...] → [10 buses found] ✓
  ↓
[Source auto-filled: Kashmere Gate] ✓
  ↓
[User taps bus: DL1PC1234] → [Route & Bus filled] ✓
  ↓
[User types destination: Connaught Place] ✓
  ↓
[Form validated] ✓
  ↓
[Submit button enabled] ✓
  ↓
[User clicks Generate Ticket]
  ↓
[Redirect to invoice.html with params]
  ↓
TICKET GENERATED! 🎫
  ↓
END


═══════════════════════════════════════════════════════════════════════════
                          ERROR HANDLING
═══════════════════════════════════════════════════════════════════════════

Location Errors:
├─ PERMISSION_DENIED → Show: "Location permission denied"
├─ POSITION_UNAVAILABLE → Show: "Location unavailable"
├─ TIMEOUT → Show: "Location request timeout" → Retry
└─ UNKNOWN → Show: "Unknown error" → Retry

API Errors:
├─ Network Error → Show: "Failed to load data"
├─ 404 Not Found → Show: "Endpoint not found"
├─ 500 Server Error → Show: "Server error, try again"
└─ Timeout → Show: "Request timeout" → Retry

Validation Errors:
├─ Empty destination → Disable submit button
├─ No bus selected → Disable submit button
└─ Invalid coordinates → Prevent API call


═══════════════════════════════════════════════════════════════════════════

Legend:
  🚌  Bus/Vehicle
  🚏  Bus Stop
  📍  Location/GPS
  🎫  Ticket
  ✓   Success/Complete
  ✗   Error/Failed
  →   Data flow
  ↓   Process flow
  🔒  Locked/Disabled field
  ✏️  Editable field
  🟢  Active/Success
  🔴  Live/Pulsing
  ⏳  Loading/Waiting

═══════════════════════════════════════════════════════════════════════════
```
