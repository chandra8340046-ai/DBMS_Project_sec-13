import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { connectDB, getDbStatus } from './config/db.js';
import propertyRoutes from './routes/propertyRoutes.js';
import enquiryRoutes from './routes/enquiryRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_DIST = path.join(__dirname, '../frontend/dist');

// Process error protection
process.on('unhandledRejection', (reason) => {
  console.warn('Unhandled rejection handled:', reason?.message || reason);
});
process.on('uncaughtException', (err) => {
  console.warn('Uncaught exception handled:', err?.message || err);
});

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB in background
connectDB().catch((err) => {
  console.warn('DB connection attempt:', err.message);
});

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// API Routes
app.get('/api/health', (req, res) => {
  const dbInfo = getDbStatus();
  res.json({
    status: 'online',
    server: 'EstateX Unified Full-Stack App',
    port: PORT,
    database: dbInfo,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/properties', propertyRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/auth', authRoutes);

// SERVE FRONTEND ON THE SAME PORT (Single-Port Architecture)
if (fs.existsSync(FRONTEND_DIST)) {
  app.use(express.static(FRONTEND_DIST));

  // Catch-all route to serve the React SPA
  app.get('*', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('EstateX Backend is running. Frontend build not found. Run npm run build in frontend.');
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Handled server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`\n================================================================`);
  console.log(`🌟 EstateX Full-Stack App Running on ONE PORT: http://localhost:${PORT}`);
  console.log(`👉 Open http://localhost:${PORT} in your browser to use the app!`);
  console.log(`================================================================\n`);
});
