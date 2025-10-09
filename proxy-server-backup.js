const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3002;

// CORS configuration
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.static('.'));

// Proxy endpoint for bus data
app.get('/api/buses', async (req, res) => {
    try {
        const response = await axios.get('https://bus-19wu.onrender.com/api/buses', {
            timeout: 10000
        });
        res.json(response.data);
    } catch (error) {
        console.error('Proxy error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch bus data',
            buses: []
        });
    }
});

// Proxy endpoint for stops data
app.get('/api/all-stops', async (req, res) => {
    try {
        const response = await axios.get('https://bus-19wu.onrender.com/api/all-stops', {
            timeout: 10000
        });
        res.json(response.data);
    } catch (error) {
        console.error('Proxy error:', error.message);
        res.status(500).json({
            error: 'Failed to fetch stops data',
            stops: []
        });
    }
});

app.listen(PORT, () => {
    console.log(`🔄 Proxy Server running on http://localhost:${PORT}`);
});