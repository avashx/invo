const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
const protobuf = require('protobufjs');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Configuration
const CONFIG = {
    PORT: process.env.PORT || 3001,
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://ticketchecker:lq2MvkxmjWn8c8Ot@cluster0.daitar2.mongodb.net/busTrackerDB?retryWrites=true&w=majority',
    GTFS_URL: 'https://otd.delhi.gov.in/api/realtime/VehiclePositions.pb?key=7pnJf5w6MCh0JWrdisnafk0YhnKfUqxx',
    BUS_FETCH_INTERVAL: 10000, // 10 seconds
    MAX_RETRIES: 3,
    ZOOM_THRESHOLD: 14
};

// CORS Configuration
const corsOptions = {
    origin: [
        'https://bus-19wu.onrender.com',
        'https://dtconnect-app.onrender.com',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:8000',
        'http://localhost:8080',
        'http://localhost:8081',
        'http://10.0.2.2:8081',
        '*' // Allow all origins for development
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use(express.static('.', {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        }
        if (filePath.endsWith('.csv')) {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Access-Control-Allow-Origin', '*');
        }
    }
}));

// Global variables
let db = null;
let busData = [];
let busStops = [];
let routeMap = new Map();
let csvDataLoaded = false;
let protobufRoot = null;
let FeedMessage = null;
let isConnectedToMongo = false;
const connectedClients = new Map();

// Utility Functions
const logger = {
    info: (message) => console.log(`[INFO ${new Date().toISOString()}] ${message}`),
    error: (message) => console.error(`[ERROR ${new Date().toISOString()}] ${message}`),
    warn: (message) => console.warn(`[WARN ${new Date().toISOString()}] ${message}`)
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Distance calculation using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// CSV Parser
function parseCSV(csvContent) {
    const lines = csvContent.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = [];
        let currentValue = '';
        let inQuotes = false;
        
        for (let j = 0; j < lines[i].length; j++) {
            const char = lines[i][j];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(currentValue.trim().replace(/"/g, ''));
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        values.push(currentValue.trim().replace(/"/g, ''));
        
        if (values.length === headers.length) {
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            data.push(row);
        }
    }
    return data;
}

// MongoDB Connection
async function connectToMongoDB() {
    let retries = CONFIG.MAX_RETRIES;
    
    while (retries > 0) {
        try {
            const client = new MongoClient(CONFIG.MONGODB_URI, {
                serverSelectionTimeoutMS: 5000,
                connectTimeoutMS: 5000,
                maxPoolSize: 10,
                retryWrites: true,
                w: 'majority'
            });
            
            await client.connect();
            await client.db('admin').command({ ping: 1 });
            
            db = client.db('busTrackerDB');
            isConnectedToMongo = true;
            logger.info('Successfully connected to MongoDB');
            return true;
        } catch (error) {
            retries--;
            logger.error(`MongoDB connection failed: ${error.message}. Retries left: ${retries}`);
            
            if (retries === 0) {
                logger.error('Max retries reached. Running without MongoDB.');
                return false;
            }
            
            await sleep(2000);
        }
    }
    return false;
}

// Load CSV Data
async function loadCSVData() {
    try {
        // Load bus stops
        const stopsPath = path.join(__dirname, 'stops.csv');
        if (fs.existsSync(stopsPath)) {
            const stopsContent = fs.readFileSync(stopsPath, 'utf8');
            const stopsData = parseCSV(stopsContent);
            
            busStops = stopsData.map(row => ({
                name: row.stop_name || 'Unknown Stop',
                latitude: parseFloat(row.stop_lat) || 0,
                longitude: parseFloat(row.stop_lon) || 0
            })).filter(stop => stop.latitude !== 0 && stop.longitude !== 0);
            
            logger.info(`Loaded ${busStops.length} bus stops`);
        }
        
        // Load route names
        const routesPath = path.join(__dirname, 'routename.csv');
        if (fs.existsSync(routesPath)) {
            const routesContent = fs.readFileSync(routesPath, 'utf8');
            const routesData = parseCSV(routesContent);
            
            routeMap.clear();
            routesData.forEach(row => {
                if (row.route_id && row.route_name) {
                    routeMap.set(row.route_id.trim(), row.route_name.trim());
                }
            });
            
            logger.info(`Loaded ${routeMap.size} route mappings`);
        }
        
        csvDataLoaded = true;
        return true;
    } catch (error) {
        logger.error(`Failed to load CSV data: ${error.message}`);
        return false;
    }
}

// Initialize Protobuf
async function initializeProtobuf() {
    try {
        const protoPath = path.join(__dirname, 'gtfs-realtime.proto');
        if (fs.existsSync(protoPath)) {
            protobufRoot = protobuf.loadSync(protoPath);
            FeedMessage = protobufRoot.lookupType('transit_realtime.FeedMessage');
            logger.info('Protobuf initialized successfully');
            return true;
        } else {
            logger.error('GTFS protobuf file not found');
            return false;
        }
    } catch (error) {
        logger.error(`Failed to initialize protobuf: ${error.message}`);
        return false;
    }
}

// Fetch GTFS Bus Data
async function fetchBusData() {
    if (!FeedMessage) {
        logger.error('Protobuf not initialized');
        return false;
    }
    
    let retries = CONFIG.MAX_RETRIES;
    
    while (retries > 0) {
        try {
            logger.info('Fetching bus data from GTFS API...');
            
            const response = await axios.get(CONFIG.GTFS_URL, {
                responseType: 'arraybuffer',
                timeout: 10000,
                headers: {
                    'User-Agent': 'Delhi-Bus-Tracker/1.0'
                }
            });
            
            const buffer = response.data;
            const message = FeedMessage.decode(new Uint8Array(buffer));
            const data = FeedMessage.toObject(message, {
                longs: String,
                enums: String,
                bytes: String
            });
            
            const newBusData = data.entity
                .filter(entity => entity.vehicle && entity.vehicle.position)
                .map(entity => {
                    const vehicle = entity.vehicle;
                    const routeId = vehicle.trip?.routeId || 'Unknown';
                    
                    return {
                        id: entity.id,
                        busNo: vehicle.vehicle?.id || `BUS-${entity.id}`,
                        routeNo: routeId,
                        routeName: routeMap.get(routeId) || routeId,
                        latitude: vehicle.position.latitude,
                        longitude: vehicle.position.longitude,
                        speed: vehicle.position.speed || 0,
                        bearing: vehicle.position.bearing || 0,
                        timestamp: vehicle.timestamp || Date.now() / 1000,
                        checked: false,
                        stopsRemaining: 0,
                        nonTicketHolders: 0,
                        fineCollected: 0
                    };
                });
            
            // Update with MongoDB data if available
            if (isConnectedToMongo && db) {
                try {
                    const checkedBuses = await db.collection('busChecks').find({}).toArray();
                    
                    newBusData.forEach(bus => {
                        const check = checkedBuses.find(cb => cb.busNo === bus.busNo);
                        if (check) {
                            bus.checked = check.checked || false;
                            bus.stopsRemaining = check.stopsRemaining || 0;
                            bus.nonTicketHolders = check.nonTicketHolders || 0;
                            bus.fineCollected = check.fineCollected || 0;
                        }
                    });
                } catch (dbError) {
                    logger.error(`MongoDB query failed: ${dbError.message}`);
                }
            }
            
            busData = newBusData;
            logger.info(`Successfully fetched ${busData.length} buses`);
            
            // Broadcast to connected clients
            broadcastBusUpdate();
            return true;
            
        } catch (error) {
            retries--;
            logger.error(`GTFS fetch failed: ${error.message}. Retries left: ${retries}`);
            
            if (retries === 0) {
                logger.error('Max retries reached for GTFS fetch');
                return false;
            }
            
            await sleep(2000);
        }
    }
    return false;
}

// Broadcast bus updates to connected clients
function broadcastBusUpdate() {
    const updateData = {
        buses: busData,
        timestamp: Date.now(),
        totalBuses: busData.length
    };
    
    connectedClients.forEach((clientData, socketId) => {
        const socket = io.sockets.sockets.get(socketId);
        if (socket) {
            const clientUpdate = { ...updateData };
            if (clientData.zoomLevel >= CONFIG.ZOOM_THRESHOLD) {
                clientUpdate.busStops = busStops;
            }
            socket.emit('busUpdate', clientUpdate);
        }
    });
}

// API Routes
app.get('/', (req, res) => {
    res.redirect('/liveinvoice.html');
});

app.get('/api/buses', async (req, res) => {
    try {
        const responseData = {
            success: true,
            buses: busData,
            totalBuses: busData.length,
            timestamp: Date.now(),
            dataAge: busData.length > 0 ? (Date.now() / 1000 - Math.max(...busData.map(b => b.timestamp))) : 0
        };
        
        res.json(responseData);
    } catch (error) {
        logger.error(`API /buses error: ${error.message}`);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch bus data',
            buses: [],
            totalBuses: 0
        });
    }
});

app.get('/api/all-stops', async (req, res) => {
    try {
        res.json({
            success: true,
            stops: busStops,
            totalStops: busStops.length
        });
    } catch (error) {
        logger.error(`API /all-stops error: ${error.message}`);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch stops data',
            stops: []
        });
    }
});

app.get('/api/nearest-stops/:lat/:lng', async (req, res) => {
    try {
        const { lat, lng } = req.params;
        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);
        const limit = parseInt(req.query.limit) || 10;
        
        if (isNaN(userLat) || isNaN(userLng)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid coordinates'
            });
        }
        
        const nearestStops = busStops
            .map(stop => ({
                ...stop,
                distance: calculateDistance(userLat, userLng, stop.latitude, stop.longitude)
            }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, limit);
        
        res.json({
            success: true,
            stops: nearestStops,
            userLocation: { latitude: userLat, longitude: userLng }
        });
    } catch (error) {
        logger.error(`API /nearest-stops error: ${error.message}`);
        res.status(500).json({
            success: false,
            error: 'Failed to find nearest stops'
        });
    }
});

app.get('/api/nearest-buses/:lat/:lng', async (req, res) => {
    try {
        const { lat, lng } = req.params;
        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);
        const limit = parseInt(req.query.limit) || 10;
        
        if (isNaN(userLat) || isNaN(userLng)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid coordinates'
            });
        }
        
        const nearestBuses = busData
            .map(bus => ({
                ...bus,
                distance: calculateDistance(userLat, userLng, bus.latitude, bus.longitude)
            }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, limit);
        
        res.json({
            success: true,
            buses: nearestBuses,
            userLocation: { latitude: userLat, longitude: userLng }
        });
    } catch (error) {
        logger.error(`API /nearest-buses error: ${error.message}`);
        res.status(500).json({
            success: false,
            error: 'Failed to find nearest buses'
        });
    }
});

app.post('/api/bookBus', async (req, res) => {
    try {
        const { busNo, routeNo, pickupStop, dropoffStop, userId, fare, ticketType } = req.body;
        
        if (!busNo || !routeNo || !pickupStop || !dropoffStop || !userId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }
        
        const bookingData = {
            busNo,
            routeNo,
            pickupStop,
            dropoffStop,
            userId,
            fare: fare || 0,
            ticketType: ticketType || 'Regular',
            timestamp: new Date(),
            status: 'confirmed',
            bookingId: `BK${Date.now()}`
        };
        
        if (isConnectedToMongo && db) {
            try {
                const result = await db.collection('bookings').insertOne(bookingData);
                logger.info(`Booking recorded: ${bookingData.bookingId}`);
            } catch (dbError) {
                logger.error(`Failed to save booking to DB: ${dbError.message}`);
            }
        }
        
        res.json({
            success: true,
            booking: bookingData,
            message: 'Booking confirmed'
        });
    } catch (error) {
        logger.error(`API /bookBus error: ${error.message}`);
        res.status(500).json({
            success: false,
            error: 'Failed to book bus'
        });
    }
});

app.post('/api/checkBus', async (req, res) => {
    try {
        const { busNo, routeNo, nonTicketHolders, fineCollected } = req.body;
        
        if (!busNo || nonTicketHolders === undefined || fineCollected === undefined) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }
        
        const checkData = {
            busNo,
            routeNo: routeNo || 'Unknown',
            checked: true,
            nonTicketHolders: parseInt(nonTicketHolders) || 0,
            fineCollected: parseFloat(fineCollected) || 0,
            stopsRemaining: 10,
            timestamp: new Date(),
            checkId: `CHK${Date.now()}`
        };
        
        if (isConnectedToMongo && db) {
            try {
                await db.collection('busChecks').updateOne(
                    { busNo },
                    { $set: checkData },
                    { upsert: true }
                );
                logger.info(`Bus check updated: ${checkData.checkId}`);
            } catch (dbError) {
                logger.error(`Failed to save bus check to DB: ${dbError.message}`);
            }
        }
        
        // Update local bus data
        const bus = busData.find(b => b.busNo === busNo);
        if (bus) {
            bus.checked = true;
            bus.nonTicketHolders = checkData.nonTicketHolders;
            bus.fineCollected = checkData.fineCollected;
            bus.stopsRemaining = checkData.stopsRemaining;
        }
        
        broadcastBusUpdate();
        
        res.json({
            success: true,
            check: checkData,
            message: 'Bus check recorded'
        });
    } catch (error) {
        logger.error(`API /checkBus error: ${error.message}`);
        res.status(500).json({
            success: false,
            error: 'Failed to record bus check'
        });
    }
});

app.post('/api/recordAttendance', async (req, res) => {
    try {
        const { busNo, routeNo, conductorId, conductorWaiver } = req.body;
        
        if (!busNo || !conductorId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }
        
        const attendanceData = {
            busNo,
            routeNo: routeNo || 'Unknown',
            conductorId,
            conductorWaiver: conductorWaiver || '',
            timestamp: new Date(),
            attendanceId: `ATT${Date.now()}`
        };
        
        if (isConnectedToMongo && db) {
            try {
                const result = await db.collection('busAttendance').insertOne(attendanceData);
                logger.info(`Attendance recorded: ${attendanceData.attendanceId}`);
            } catch (dbError) {
                logger.error(`Failed to save attendance to DB: ${dbError.message}`);
            }
        }
        
        res.json({
            success: true,
            attendance: attendanceData,
            message: 'Attendance recorded'
        });
    } catch (error) {
        logger.error(`API /recordAttendance error: ${error.message}`);
        res.status(500).json({
            success: false,
            error: 'Failed to record attendance'
        });
    }
});

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'running',
        timestamp: Date.now(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        connections: connectedClients.size,
        busCount: busData.length,
        stopsCount: busStops.length,
        mongodb: isConnectedToMongo,
        csvLoaded: csvDataLoaded
    });
});

// Socket.IO Connection Handler
io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);
    connectedClients.set(socket.id, { zoomLevel: 0, connectedAt: Date.now() });
    
    // Send initial data
    socket.emit('busUpdate', {
        buses: busData,
        timestamp: Date.now(),
        totalBuses: busData.length
    });
    
    socket.on('zoomLevel', (zoom) => {
        const clientData = connectedClients.get(socket.id);
        if (clientData) {
            clientData.zoomLevel = zoom;
            connectedClients.set(socket.id, clientData);
            
            const updateData = {
                buses: busData,
                timestamp: Date.now(),
                totalBuses: busData.length
            };
            
            if (zoom >= CONFIG.ZOOM_THRESHOLD) {
                updateData.busStops = busStops;
            }
            
            socket.emit('busUpdate', updateData);
        }
    });
    
    socket.on('requestUpdate', () => {
        const clientData = connectedClients.get(socket.id);
        const updateData = {
            buses: busData,
            timestamp: Date.now(),
            totalBuses: busData.length
        };
        
        if (clientData && clientData.zoomLevel >= CONFIG.ZOOM_THRESHOLD) {
            updateData.busStops = busStops;
        }
        
        socket.emit('busUpdate', updateData);
    });
    
    socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
        connectedClients.delete(socket.id);
    });
});

// Error Handlers
app.use((err, req, res, next) => {
    logger.error(`Unhandled error: ${err.message}`);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

process.on('uncaughtException', (error) => {
    logger.error(`Uncaught Exception: ${error.message}`);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

// Graceful Shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
        if (db) {
            db.client.close();
        }
        process.exit(0);
    });
});

process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully');
    server.close(() => {
        if (db) {
            db.client.close();
        }
        process.exit(0);
    });
});

// Initialize and Start Server
async function startServer() {
    try {
        logger.info('Starting Live Bus Tracker Server...');
        
        // Initialize components
        await loadCSVData();
        await initializeProtobuf();
        await connectToMongoDB();
        
        // Start the server
        server.listen(CONFIG.PORT, () => {
            logger.info(`🚌 Server running on http://localhost:${CONFIG.PORT}`);
            logger.info(`📊 Dashboard: http://localhost:${CONFIG.PORT}/liveinvoice.html`);
        });
        
        // Start data fetching
        logger.info('Starting bus data fetch cycle...');
        fetchBusData(); // Initial fetch
        setInterval(fetchBusData, CONFIG.BUS_FETCH_INTERVAL);
        
        logger.info('✅ Server initialization complete');
        
    } catch (error) {
        logger.error(`Failed to start server: ${error.message}`);
        process.exit(1);
    }
}

// Start the server
startServer();