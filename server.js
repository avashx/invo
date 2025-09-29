const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
const protobuf = require('protobufjs');
const fs = require('fs');
const csv = require('csv-parse');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'https://bus-19wu.onrender.com',        // Bus tracking app frontend ke liye
            'https://dtconnect-app.onrender.com',   // Bus booking app frontend ke liye
            'http://localhost:3000',                // Local testing (web app) ke liye
            'http://localhost:8081',                // Flutter app on emulator/simulator, ye nahi chal rha
            'http://10.0.2.2:8081'                 // Flutter app on Android emulator, ye bhi nahi chal rha
        ];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.static('public'));
app.use(express.json());
app.set('view engine', 'ejs');

// MongoDB Connection or credential env file se pick ho rha hai
const uri = process.env.MONGODB_URI || 'mongodb+srv://ticketchecker:lq2MvkxmjWn8c8Ot@cluster0.daitar2.mongodb.net/busTrackerDB?retryWrites=true&w=majority';
const client = new MongoClient(uri);
let db;

async function connectDB() {
  let retries = 5;
  while (retries) {
    try {
      await client.connect();
      db = client.db('busTrackerDB');
      console.log('Successfully connected to MongoDB');
      break;
    } catch (err) {
      console.error('MongoDB connection error:', err.message);
      retries -= 1;
      if (retries === 0) {
        console.error('Max retries reached. Could not connect to MongoDB.');
        process.exit(1);
      }
      console.log(`Retrying connection (${5 - retries}/5)...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

// ab ham  GTFS-realtime proto file ko load karenge
const protoFile = 'gtfs-realtime.proto';
const root = protobuf.loadSync(protoFile);
const FeedMessage = root.lookupType('transit_realtime.FeedMessage');

// GTFS API endpoint hai btw key included hai 
const url = 'https://otd.delhi.gov.in/api/realtime/VehiclePositions.pb?key=7pnJf5w6MCh0JWrdisnafk0YhnKfUqxx';

let busData = [];
let busStops = [];
let routeMap = new Map();
const clientZoomLevels = new Map();
const ZOOM_THRESHOLD = 14;

// it will Parse CSV data, error ke liye check karega
const parseCSV = (csvString) => {
  return new Promise((resolve, reject) => {
    const data = [];
    csv.parse(csvString, { columns: true, skip_empty_lines: true })
      .on('data', (row) => data.push(row))
      .on('end', () => resolve(data))
      .on('error', (err) => reject(err));
  });
};

// bus stop ka lat long read and parse karega from stops CSV 
const stopsCsvFilePath = 'data/stops.csv';
const stopsCsvString = fs.readFileSync(stopsCsvFilePath, 'utf8');
parseCSV(stopsCsvString)
  .then(stops => {
    busStops = stops.map(row => ({
      name: row.stop_name || 'Unknown Stop',
      latitude: parseFloat(row.stop_lat),
      longitude: parseFloat(row.stop_lon)
    }));
    console.log(`Parsed ${busStops.length} bus stops from CSV`);
  })
  .catch(err => console.error('Error parsing stops CSV:', err));

// same as above Read and parse routename CSV
const routeCsvFilePath = 'data/routename.csv';
const routeCsvString = fs.readFileSync(routeCsvFilePath, 'utf8');
parseCSV(routeCsvString)
  .then(routes => {
    routes.forEach(row => routeMap.set(row.route_id, row.route_name));
    console.log(`Parsed ${routeMap.size} routes from routename.csv`);
  })
  .catch(err => console.error('Error parsing routename CSV:', err));

// Function to calculate distance between two coordinates distance formula lagaya hai
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Fetch bus data with axios and other logic
const fetchBusData = async () => {
  let retries = 3;
  while (retries) {
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const buffer = response.data;
      const message = FeedMessage.decode(new Uint8Array(buffer));
      const data = FeedMessage.toObject(message, { longs: String, enums: String, bytes: String });

      const newBusData = data.entity
        .filter(entity => entity.vehicle && entity.vehicle.position)
        .map(entity => ({
          busNo: entity.vehicle.vehicle.id || 'Unknown',
          routeNo: entity.vehicle.trip?.routeId || 'Unknown',
          routeName: routeMap.get(entity.vehicle.trip?.routeId) || entity.vehicle.trip?.routeId || 'Unknown',
          latitude: entity.vehicle.position.latitude,
          longitude: entity.vehicle.position.longitude,
          checked: false,
          stopsRemaining: 0
        }));

      if (db) {
        const checkedBuses = await db.collection('busChecks').find({}).toArray();

        for (const bus of newBusData) {
          const check = checkedBuses.find(cb => cb.busNo === bus.busNo);

          if (check) {
            bus.checked = check.checked;
            bus.stopsRemaining = check.stopsRemaining || 0;
            bus.nonTicketHolders = check.nonTicketHolders || 0;
            bus.fineCollected = check.fineCollected || 0;
          }

          const nearestStop = busStops.find(stop => 
            calculateDistance(bus.latitude, bus.longitude, stop.latitude, stop.longitude) < 0.05
          );

          if (nearestStop && bus.checked) {
            const lastStop = check ? check.lastStop : null;
            if (lastStop !== nearestStop.name) {
              const newStopsRemaining = Math.max(0, bus.stopsRemaining - 1);
              await db.collection('busChecks').updateOne(
                { busNo: bus.busNo },
                { 
                  $set: { 
                    stopsRemaining: newStopsRemaining, 
                    lastStop: nearestStop.name,
                    checked: newStopsRemaining > 0,
                    timestamp: new Date()
                  } 
                },
                { upsert: true }
              );
              bus.stopsRemaining = newStopsRemaining;
              bus.checked = newStopsRemaining > 0;
              console.log(`Bus ${bus.busNo} moved to ${nearestStop.name}, stopsRemaining: ${bus.stopsRemaining}`);
            }
          }
        }
      }

      busData = newBusData;
      console.log(`Fetched and updated ${busData.length} buses`);

      io.sockets.sockets.forEach((socket) => {
        const zoomLevel = clientZoomLevels.get(socket.id) || 0;
        const updateData = { buses: busData };
        if (zoomLevel >= ZOOM_THRESHOLD) updateData.busStops = busStops;
        socket.emit('busUpdate', updateData);
      });
      break;
    } catch (error) {
      console.error('Error fetching bus data:', error.message);
      retries -= 1;
      if (retries === 0) {
        console.error('Max retries reached for GTFS fetch.');
        break;
      }
      console.log(`Retrying GTFS fetch (${3 - retries}/3)...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

setInterval(fetchBusData, 1000);

// Serve webpage
app.get('/', async (req, res) => {
  if (db) {
    const checkedBuses = await db.collection('busChecks').find({}).toArray();
    busData.forEach(bus => {
      const check = checkedBuses.find(cb => cb.busNo === bus.busNo);
      if (check) {
        bus.stopsRemaining = check.stopsRemaining || 0;
        bus.checked = check.checked;
        bus.nonTicketHolders = check.nonTicketHolders || 0;
        bus.fineCollected = check.fineCollected || 0;
      }
    });
  }
  res.render('index', { buses: busData, busStops: [] });
});

// realtime API to fetch the latest bus data
app.get('/api/buses', async (req, res) => {
  if (db) {
    const checkedBuses = await db.collection('busChecks').find({}).toArray();
    busData.forEach(bus => {
      const check = checkedBuses.find(cb => cb.busNo === bus.busNo);
      if (check) {
        bus.stopsRemaining = check.stopsRemaining || 0;
        bus.checked = check.checked;
        bus.nonTicketHolders = check.nonTicketHolders || 0;
        bus.fineCollected = check.fineCollected || 0;
      }
    });
  }
  res.json({ buses: busData, busStops: [] });
});

// API to fetch all stops
app.get('/api/all-stops', async (req, res) => {
  try {
    const stopsCsvString = fs.readFileSync('data/stops.csv', 'utf8');
    const stops = await parseCSV(stopsCsvString);
    const stopList = stops.map(row => ({
      name: row.stop_name || 'Unknown Stop',
      latitude: parseFloat(row.stop_lat),
      longitude: parseFloat(row.stop_lon)
    }));
    res.json(stopList);
  } catch (err) {
    console.error('Error fetching all stops:', err);
    res.status(500).json({ error: 'Failed to fetch stops' });
  }
});

// API to book a bus
app.post('/api/bookBus', async (req, res) => {
  console.log('Received /api/bookBus request:', req.body);
  const { busNo, routeNo, pickupStop, dropoffStop, userId } = req.body;

  if (!busNo || !routeNo || !pickupStop || !dropoffStop || !userId) {
    console.error('Invalid request body:', req.body);
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  if (!db) {
    console.error('Database not connected');
    return res.status(503).json({ success: false, error: 'Database not connected. Please try again later.' });
  }

  try {
    const result = await db.collection('bookings').insertOne({
      busNo,
      routeNo,
      pickupStop,
      dropoffStop,
      userId,
      timestamp: new Date(),
      status: 'confirmed',
    });
    console.log('Booking recorded:', result);
    res.json({ success: true, result });
  } catch (err) {
    console.error('Error in /api/bookBus:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// API to update bus check status (for tracking app) jo baad me dashboard ke saath integrat rahega
app.post('/api/checkBus', async (req, res) => {
  console.log('Received /api/checkBus request:', req.body);
  const { busNo, routeNo, nonTicketHolders, fineCollected } = req.body;

  if (!busNo || !routeNo || nonTicketHolders === undefined || fineCollected === undefined) {
    console.error('Invalid request body:', req.body);
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  if (!db) {
    console.error('Database not connected');
    return res.status(503).json({ success: false, error: 'Database not connected. Please try again later.' });
  }

  try {
    const result = await db.collection('busChecks').updateOne(
      { busNo },
      { 
        $set: { 
          routeNo, 
          checked: true, 
          nonTicketHolders, 
          fineCollected, 
          stopsRemaining: 10, 
          lastStop: null, 
          timestamp: new Date() 
        } 
      },
      { upsert: true }
    );
    console.log('Bus check updated:', result);

    const bus = busData.find(b => b.busNo === busNo);
    if (bus) {
      bus.checked = true;
      bus.stopsRemaining = 10;
      bus.nonTicketHolders = nonTicketHolders;
      bus.fineCollected = fineCollected;
    }
    io.emit('busUpdate', { buses: busData, busStops: clientZoomLevels.size > 0 && Math.max(...clientZoomLevels.values()) >= ZOOM_THRESHOLD ? busStops : [] });

    res.json({ success: true, result });
  } catch (err) {
    console.error('Error in /api/checkBus:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// API to record bus attendance (for tracking app)
app.post('/api/recordAttendance', async (req, res) => {
  console.log('Received /api/recordAttendance request:', req.body);
  const { busNo, routeNo, conductorId, conductorWaiver } = req.body;

  if (!busNo || !routeNo || !conductorId || !conductorWaiver) {
    console.error('Invalid request body:', req.body);
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  if (!db) {
    console.error('Database not connected');
    return res.status(503).json({ success: false, error: 'Database not connected. Please try again later.' });
  }

  try {
    const result = await db.collection('busAttendance').insertOne({
      busNo,
      routeNo,
      conductorId,
      conductorWaiver,
      timestamp: new Date()
    });
    console.log('Attendance recorded:', result);
    res.json({ success: true, result });
  } catch (err) {
    console.error('Error in /api/recordAttendance:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// basic Socket connections
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('zoomLevel', (zoom) => {
    clientZoomLevels.set(socket.id, zoom);
    const updateData = { buses: busData };
    if (zoom >= ZOOM_THRESHOLD) updateData.busStops = busStops;
    socket.emit('busUpdate', updateData);
  });
  socket.on('disconnect', () => {
    clientZoomLevels.delete(socket.id);
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
async function startServer() {
  await connectDB();
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    fetchBusData();
  });
}

startServer();

// Graceful shutdown for db
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing MongoDB connection...');
  await client.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Closing MongoDB connection...');
  await client.close();
  process.exit(0);
});
