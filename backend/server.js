/**
 * LabSlot Backend — Entry Point
 *
 * Responsibilities:
 * 1. Load environment variables
 * 2. Connect to MongoDB
 * 3. Create and configure the Express app
 * 4. Register global middleware
 * 5. Mount routes
 * 6. Register 404 + error handlers
 * 7. Start the HTTP server with graceful shutdown
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

// --------------------------------------------------
// Validate required environment variables early
// --------------------------------------------------
const requiredEnv = ['MONGO_URI', 'JWT_SECRET'];
const missing = requiredEnv.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  console.error('Copy .env.example to .env and fill in the values.');
  process.exit(1);
}

// --------------------------------------------------
// Connect to Database
// --------------------------------------------------
connectDB();

// --------------------------------------------------
// Create Express App
// --------------------------------------------------
const app = express();

// --------------------------------------------------
// Global Middleware
// --------------------------------------------------

// Security headers
app.use(helmet());

// CORS — allow the React frontend origin
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// --------------------------------------------------
// Routes
// --------------------------------------------------

// Health check (public, no auth)
app.use('/api/health', require('./routes/healthRoutes'));

// Authentication routes (Phase 4)
app.use('/api/auth', require('./routes/authRoutes'));

// Temporary role-test routes (helpful for Phase 4 verification)

// Labs & Equipment (Phase 6)
app.use('/api/labs', require('./routes/labRoutes'));
app.use('/api/equipment', require('./routes/equipmentRoutes'));

// Bookings (Phase 7)
app.use('/api/bookings', require('./routes/bookingRoutes'));

// Maintenance, Notifications, Analytics, Dashboard (Phases 8-12)
app.use('/api/maintenance', require('./routes/maintenanceRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/users', require('./routes/userRoutes'));


// Root welcome message
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to LabSlot API',
    version: '1.0.0',
    docs: '/api/health',
  });
});

// --------------------------------------------------
// 404 Handler (must be after all routes)
// --------------------------------------------------
app.use(notFound);

// --------------------------------------------------
// Global Error Handler (must be last)
// --------------------------------------------------
app.use(errorHandler);

// --------------------------------------------------
// Start Server
// --------------------------------------------------
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('================================================');
  console.log(`  LabSlot Backend running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`  Server listening on port ${PORT}`);
  console.log(`  Health check: http://localhost:${PORT}/api/health`);
  console.log('================================================');
});

// --------------------------------------------------
// Graceful Shutdown
// --------------------------------------------------
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed.');
    // Mongoose connection is closed automatically on process exit
    process.exit(0);
  });

  // Force exit if shutdown takes too long
  setTimeout(() => {
    console.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Catch unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  server.close(() => process.exit(1));
});

// Catch uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

module.exports = app; // useful for testing later
