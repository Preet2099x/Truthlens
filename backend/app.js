// app.js
import express from 'express';
import cors from 'cors';
import factCheckRoutes from './routes/factCheckRoutes.js';

const app = express();

// --- Core Middleware ---
app.use(cors());
app.use(express.json());

// --- Health Check Route ---
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- API Routes ---
app.use('/api/verify', factCheckRoutes); // Changed this back to /api/verify as requested

// --- 404 Handler ---
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

export default app; // Use export