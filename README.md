# DTC Bus Tracker & Live Ticket Booking System

A comprehensive web-based application for Delhi Transport Corporation (DTC) that combines real-time bus tracking, location-based services, and automated ticket generation.

## 🚀 Features

### Live Ticket Booking (`/live`)

- **Automatic Location Detection**: Uses HTML5 Geolocation API to detect user's current location
- **Smart Bus Discovery**: Automatically finds and displays:
  - Top 5 nearest bus stops
  - Top 10 nearest buses with real-time positions
- **Auto-populated Forms**:
  - Source stop auto-filled from nearest location
  - Route number and bus registration auto-filled from selected bus
  - User only needs to enter destination
- **Auto-refresh**: Live data updates every 30 seconds
- **Mobile-first Design**: iOS-inspired, responsive interface optimized for mobile devices
- **Destination Autocomplete**: Smart search for destination stops

### Bus Tracking Map (`/track`)

- Real-time bus positions on interactive map
- Bus stop visualization at higher zoom levels
- Live status indicators
- Distance calculations
- Bus check-in system for conductors

### Ticket Generation (`invoice.html`)

- Professional ticket design with QR codes
- Print-ready format
- Timestamp and unique ticket IDs
- DTC branding

## 📋 Prerequisites

Before running this application, ensure you have:

- Node.js (v14.0.0 or higher)
- npm (Node Package Manager)
- MongoDB (local or cloud instance)
- Internet connection for accessing GTFS real-time data

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   cd /Users/Vashishth/CODING/invo
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

   This will install:

   - `express` - Web framework
   - `ejs` - Template engine for rendering dynamic pages
   - `socket.io` - Real-time bidirectional communication
   - `axios` - HTTP client for API requests
   - `protobufjs` - Protocol Buffers for GTFS data
   - `mongodb` - Database driver
   - `cors` - Cross-origin resource sharing
   - `dotenv` - Environment variable management

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   PORT=3001
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/busTrackerDB?retryWrites=true&w=majority
   GTFS_API_KEY=your_api_key_here
   ```

4. **Ensure required files are present**
   - `stops.csv` - Bus stop data (latitude, longitude, names)
   - `routename.csv` - Route ID to route name mappings
   - `gtfs-realtime.proto` - Protocol buffer definition for GTFS
   - `alo.otf` - Custom font for ticket authenticity
   - `blank-ticket.JPG` - Ticket background image

## 🚦 Running the Application

### Development Mode (with auto-restart)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:3001`

## 📱 Usage

### For Passengers

1. **Quick Ticket Booking** (Recommended)

   - Visit: `http://localhost:3001/live`
   - Allow location access when prompted
   - Wait for nearby buses and stops to load (auto-refreshes every 30s)
   - Select any bus from the "Nearest Buses" list
   - Enter your destination in the "To" field (autocomplete available)
   - Click "Generate Ticket"
   - Your ticket will be generated with all details pre-filled!

2. **Bus Tracking**

   - Visit: `http://localhost:3001/track`
   - View real-time bus positions on map
   - Zoom in to see bus stops
   - Click on buses for details

3. **Manual Ticket Generation**
   - Visit: `http://localhost:3001/invoice.html`
   - Manually enter all ticket details
   - Generate and print/save ticket

### For Conductors

1. **Bus Check-in**

   - Access the tracking page
   - Use the check-in modal to record:
     - Non-ticket holders count
     - Fine collected
     - Stops remaining

2. **Attendance Recording**
   - Submit conductor ID and bus details
   - System logs attendance with timestamp

## 🏗️ Architecture

### Backend (`server.js`)

- Express.js server with Socket.IO for real-time updates
- Fetches GTFS real-time data every 10 seconds
- Calculates distances using Haversine formula
- MongoDB integration for persistence
- RESTful API endpoints:
  - `GET /api/buses` - All active buses
  - `GET /api/all-stops` - All bus stops
  - `GET /api/nearest-stops/:lat/:lng` - Nearest stops to coordinates
  - `GET /api/nearest-buses/:lat/:lng` - Nearest buses to coordinates
  - `POST /api/bookBus` - Book a bus ticket
  - `POST /api/checkBus` - Conductor check-in
  - `POST /api/recordAttendance` - Record attendance

### Frontend

#### live.ejs (Live Booking Page)

- **HTML5 Geolocation**: High-accuracy location detection
- **Status Indicators**: Real-time connection, location, and bus count status
- **Distance Calculation**: Client-side Haversine formula for instant feedback
- **Auto-refresh Logic**: Fetches new data every 30 seconds with countdown timer
- **Responsive Design**: Mobile-first with touch-friendly controls
- **Smart Form Validation**: Enables submit only when all fields are valid

#### bapp.ejs (Tracking Page)

- **Leaflet.js**: Interactive map with custom markers
- **Socket.IO Client**: Real-time bus position updates
- **Custom Icons**: Bus markers with labels, stop markers, user location
- **Zoom-based Loading**: Bus stops shown only at zoom level 14+
- **Analytics Dashboard**: Charts and statistics

#### invoice.html (Ticket Generator)

- **dom-to-image**: Converts ticket to downloadable image
- **Custom Fonts**: Antic Didone for authentic ticket appearance
- **QR Code Generation**: For ticket verification
- **Print Optimization**: CSS for clean printing

## 🎨 Design Features

- **Mobile-First**: Max width 420px, optimized for smartphones
- **iOS-Inspired UI**: Clean gradients, smooth animations, card-based layout
- **Touch-Friendly**: Large tap targets, swipe-friendly scrolling
- **Visual Feedback**: Hover effects, active states, loading spinners
- **Status Indicators**: Color-coded connection/location status, live pulse animation
- **Smooth Animations**: Fade-in, slide-in, pulse effects using CSS keyframes

## 🔧 Configuration

Edit `CONFIG` object in `server.js`:

```javascript
const CONFIG = {
  PORT: process.env.PORT || 3001,
  MONGODB_URI: "your_mongodb_uri",
  GTFS_URL: "https://otd.delhi.gov.in/api/realtime/VehiclePositions.pb",
  BUS_FETCH_INTERVAL: 10000, // 10 seconds
  MAX_RETRIES: 3,
  ZOOM_THRESHOLD: 14, // Zoom level to show stops
};
```

## 📊 Data Sources

1. **GTFS Real-time Feed**: Live bus positions from Delhi Government OTD API
2. **stops.csv**: Bus stop database with coordinates
3. **routename.csv**: Route ID to human-readable name mappings
4. **MongoDB**: Bookings, check-ins, attendance records

## 🐛 Troubleshooting

### Location not working

- Ensure HTTPS or localhost (required for Geolocation API)
- Check browser permissions for location access
- Try refreshing the page

### No buses showing

- Verify GTFS API is accessible
- Check internet connection
- Ensure server is fetching data (check console logs)
- API might have rate limits - wait and retry

### EJS templates not rendering

- Ensure EJS is installed: `npm install ejs`
- Check that `app.set('view engine', 'ejs')` is in server.js
- Verify .ejs files are in the correct directory

### CSS not loading

- Clear browser cache
- Check browser console for 404 errors
- Ensure static file serving is configured

## 🚀 Deployment

### Render.com / Heroku

1. Set environment variables in platform dashboard
2. Ensure `package.json` has correct start script
3. Set `PORT` environment variable
4. Deploy from Git repository

### Environment Variables Required

- `PORT` - Server port
- `MONGODB_URI` - MongoDB connection string
- `GTFS_API_KEY` - API key for GTFS data (if required)

## 📄 API Endpoints Summary

| Endpoint                       | Method | Description                              |
| ------------------------------ | ------ | ---------------------------------------- |
| `/`                            | GET    | Redirects to `/live`                     |
| `/live`                        | GET    | Live ticket booking page (auto-location) |
| `/track`                       | GET    | Bus tracking map page                    |
| `/api/buses`                   | GET    | Get all active buses                     |
| `/api/all-stops`               | GET    | Get all bus stops                        |
| `/api/nearest-stops/:lat/:lng` | GET    | Get nearest stops to coordinates         |
| `/api/nearest-buses/:lat/:lng` | GET    | Get nearest buses to coordinates         |
| `/api/bookBus`                 | POST   | Book a bus ticket                        |
| `/api/checkBus`                | POST   | Conductor check-in                       |
| `/api/recordAttendance`        | POST   | Record conductor attendance              |
| `/api/health`                  | GET    | Server health check                      |

## 🎯 Future Enhancements

- [ ] Push notifications for arriving buses
- [ ] Route planning and multi-leg journeys
- [ ] Fare calculation based on distance
- [ ] User authentication and booking history
- [ ] Real-time seat availability
- [ ] Integration with payment gateways
- [ ] Offline mode with service workers
- [ ] Progressive Web App (PWA) support

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Delhi Transport Corporation for GTFS data
- Open Transport Data platform
- Leaflet.js for mapping
- Socket.IO for real-time features

## 📧 Support

For issues or questions, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ for Delhi Transport Corporation**
