const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;
const REMOTE_API = 'https://bus-19wu.onrender.com';

// Cache for API responses
let cachedBuses = [];
let cachedStops = [];
let lastUpdateTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Sample fallback data
const FALLBACK_BUSES = [
    { busNo: '821UP', latitude: 28.6139, longitude: 77.2090, tripDirection: 'Dwarka to ISBT', routeName: '821UP', routeId: '821' },
    { busNo: '628DW', latitude: 28.6100, longitude: 77.2020, tripDirection: 'Najafgarh to ISBT', routeName: '628', routeId: '628' },
    { busNo: '827UP', latitude: 28.6200, longitude: 77.2150, tripDirection: 'Dwarka to Red Fort', routeName: '827UP', routeId: '827' },
    { busNo: '520UP', latitude: 28.6050, longitude: 77.1950, tripDirection: 'Naraina to ISBT', routeName: '520', routeId: '520' },
    { busNo: '764UP', latitude: 28.6180, longitude: 77.2180, tripDirection: 'Uttam Nagar to CP', routeName: '764', routeId: '764' },
    { busNo: '413UP', latitude: 28.6080, longitude: 77.1980, tripDirection: 'Dwarka to Azadpur', routeName: '413', routeId: '413' }
];

const FALLBACK_STOPS = [
    { stop_name: 'Connaught Place', stop_lat: '28.6315', stop_lon: '77.2167' },
    { stop_name: 'India Gate', stop_lat: '28.6129', stop_lon: '77.2295' },
    { stop_name: 'Red Fort', stop_lat: '28.6562', stop_lon: '77.2410' },
    { stop_name: 'Dwarka More Metro Station', stop_lat: '28.5821', stop_lon: '77.0519' },
    { stop_name: 'ISBT Kashmere Gate', stop_lat: '28.6678', stop_lon: '77.2273' },
    { stop_name: 'Rajiv Chowk', stop_lat: '28.6328', stop_lon: '77.2197' }
];

// Enable CORS for all routes
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Serve static files
app.use(express.static('.'));

// Function to check if cache is valid
function isCacheValid() {
    return lastUpdateTime && (Date.now() - lastUpdateTime) < CACHE_DURATION;
}

// Function to update cache from remote API
async function updateCache() {
    try {
        console.log('Attempting to update cache from remote API...');
        
        // Try to fetch buses
        const busResponse = await fetch(`${REMOTE_API}/api/buses`, {
            timeout: 8000,
            headers: { 'User-Agent': 'Live-Invoice-Proxy/1.0' }
        });
        
        if (busResponse.ok) {
            cachedBuses = await busResponse.json();
            console.log(`✓ Updated cache with ${cachedBuses.length} buses`);
        } else {
            throw new Error(`Bus API error: ${busResponse.status}`);
        }
        
        // Try to fetch stops
        const stopResponse = await fetch(`${REMOTE_API}/api/all-stops`, {
            timeout: 8000,
            headers: { 'User-Agent': 'Live-Invoice-Proxy/1.0' }
        });
        
        if (stopResponse.ok) {
            cachedStops = await stopResponse.json();
            console.log(`✓ Updated cache with ${cachedStops.length} stops`);
        } else {
            throw new Error(`Stop API error: ${stopResponse.status}`);
        }
        
        lastUpdateTime = Date.now();
        return true;
        
    } catch (error) {
        console.error('Cache update failed:', error.message);
        return false;
    }
}

// Proxy endpoints with caching and fallback
app.get('/api/buses', async (req, res) => {
    console.log('Buses API request received');
    
    try {
        // If cache is valid, use it
        if (isCacheValid() && cachedBuses.length > 0) {
            console.log(`Serving ${cachedBuses.length} buses from cache`);
            return res.json(cachedBuses);
        }
        
        // Try to update cache
        const updated = await updateCache();
        
        if (updated && cachedBuses.length > 0) {
            console.log(`Serving fresh ${cachedBuses.length} buses`);
            return res.json(cachedBuses);
        }
        
        // Fallback to demo data
        console.log('Using fallback bus data');
        res.json(FALLBACK_BUSES.map(bus => ({
            ...bus,
            // Add some random variance to positions for demo
            latitude: bus.latitude + (Math.random() - 0.5) * 0.01,
            longitude: bus.longitude + (Math.random() - 0.5) * 0.01,
            timestamp: new Date().toISOString()
        })));
        
    } catch (error) {
        console.error('Buses endpoint error:', error.message);
        res.json(FALLBACK_BUSES);
    }
});

app.get('/api/all-stops', async (req, res) => {
    console.log('Stops API request received');
    
    try {
        // If cache is valid, use it
        if (isCacheValid() && cachedStops.length > 0) {
            console.log(`Serving ${cachedStops.length} stops from cache`);
            return res.json(cachedStops);
        }
        
        // Try to update cache if buses were updated (stops usually come together)
        if (!isCacheValid()) {
            await updateCache();
        }
        
        if (cachedStops.length > 0) {
            console.log(`Serving ${cachedStops.length} stops`);
            return res.json(cachedStops);
        }
        
        // Fallback to demo data
        console.log('Using fallback stops data');
        res.json(FALLBACK_STOPS);
        
    } catch (error) {
        console.error('Stops endpoint error:', error.message);
        res.json(FALLBACK_STOPS);
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        remoteAPI: REMOTE_API,
        cache: {
            buses: cachedBuses.length,
            stops: cachedStops.length,
            lastUpdate: lastUpdateTime ? new Date(lastUpdateTime).toISOString() : null,
            isValid: isCacheValid()
        }
    });
});

// Cache status endpoint
app.get('/cache-status', (req, res) => {
    res.json({
        cache: {
            buses: cachedBuses.length,
            stops: cachedStops.length,
            lastUpdate: lastUpdateTime ? new Date(lastUpdateTime).toISOString() : null,
            isValid: isCacheValid(),
            cacheAge: lastUpdateTime ? Date.now() - lastUpdateTime : null
        },
        fallbackData: {
            buses: FALLBACK_BUSES.length,
            stops: FALLBACK_STOPS.length
        }
    });
});

// Test remote connectivity
app.get('/test-remote', async (req, res) => {
    const results = {
        timestamp: new Date().toISOString(),
        tests: {}
    };
    
    try {
        // Test buses endpoint
        const busesStart = Date.now();
        const busesResponse = await fetch(`${REMOTE_API}/api/buses`, { timeout: 5000 });
        results.tests.buses = {
            status: busesResponse.status,
            ok: busesResponse.ok,
            responseTime: Date.now() - busesStart,
            error: null
        };
        
        if (busesResponse.ok) {
            const buses = await busesResponse.json();
            results.tests.buses.count = buses.length;
        }
    } catch (error) {
        results.tests.buses = {
            status: null,
            ok: false,
            responseTime: null,
            error: error.message
        };
    }
    
    try {
        // Test stops endpoint
        const stopsStart = Date.now();
        const stopsResponse = await fetch(`${REMOTE_API}/api/all-stops`, { timeout: 5000 });
        results.tests.stops = {
            status: stopsResponse.status,
            ok: stopsResponse.ok,
            responseTime: Date.now() - stopsStart,
            error: null
        };
        
        if (stopsResponse.ok) {
            const stops = await stopsResponse.json();
            results.tests.stops.count = stops.length;
        }
    } catch (error) {
        results.tests.stops = {
            status: null,
            ok: false,
            responseTime: null,
            error: error.message
        };
    }
    
    res.json(results);
});

app.listen(PORT, async () => {
    console.log(`🚀 Proxy server running at http://localhost:${PORT}`);
    console.log(`📡 Proxying requests to: ${REMOTE_API}`);
    console.log(`🌐 Access your app at: http://localhost:${PORT}/liveinvoice.html`);
    console.log(`🔍 Health check: http://localhost:${PORT}/health`);
    console.log(`📊 Cache status: http://localhost:${PORT}/cache-status`);
    console.log(`🧪 Test remote: http://localhost:${PORT}/test-remote`);
    console.log('');
    
    // Try to populate cache on startup
    console.log('Attempting initial cache population...');
    const success = await updateCache();
    
    if (success) {
        console.log('✅ Cache populated successfully');
    } else {
        console.log('⚠️  Using fallback data (remote API unavailable)');
    }
    
    // Set up periodic cache refresh
    setInterval(async () => {
        console.log('🔄 Periodic cache refresh...');
        await updateCache();
    }, CACHE_DURATION);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Proxy server shutting down...');
    process.exit(0);
});