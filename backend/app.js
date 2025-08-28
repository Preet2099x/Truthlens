// app.js
import express from 'express';
import cors from 'cors';
import factCheckRoutes from './routes/factCheckRoutes.js';
import authRoutes from './routes/authRoutes.js'; // <-- add
import helmet from 'helmet'; // optional if installed

const app = express();

// --- Core Middleware ---
app.use(cors());
app.use(express.json());
if (helmet) app.use(helmet());

// --- Health Check Route ---
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- API Routes ---
app.use('/api/verify', factCheckRoutes);
app.use('/api/auth', authRoutes); // <-- add

// --- 404 Handler ---
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

export default app;
