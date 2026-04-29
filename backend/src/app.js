require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const logger = require('./utils/logger');
const { sequelize } = require('./models');
const { initSocket } = require('./config/socket');
const { initFirebase } = require('./config/firebase');
const errorHandler = require('./middlewares/errorHandler');

// Route imports
const authRoutes = require('./routes/auth.routes');
const listingRoutes = require('./routes/listing.routes');
const orderRoutes = require('./routes/order.routes');
const basketRoutes = require('./routes/basket.routes');
const deliveryRoutes = require('./routes/delivery.routes');
const stripeRoutes = require('./routes/stripe.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Initialize Firebase Admin
initFirebase();

// ======================
// MIDDLEWARE
// ======================

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Stripe webhook needs raw body — must be BEFORE express.json()
app.use('/api/v1/stripe/webhook', express.raw({ type: 'application/json' }));

// JSON body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// HTTP request logging
app.use(morgan('combined', {
  stream: { write: (message) => logger.info(message.trim()) }
}));

// Global rate limiting: 100 requests per minute per IP
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' }
  }
});
app.use('/api/', apiLimiter);

// ======================
// ROUTES
// ======================

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      service: 'Farm2Fork API',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/listings', listingRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/baskets', basketRoutes);
app.use('/api/v1/delivery', deliveryRoutes);
app.use('/api/v1/stripe', stripeRoutes);
app.use('/api/v1/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.originalUrl} not found` }
  });
});

// Global error handler — MUST be last middleware
app.use(errorHandler);

// ======================
// START SERVER
// ======================

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('✅ PostgreSQL connected');

    // Sync models (create tables if they don't exist)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      logger.info('✅ Database models synced');
    }

    // Start background jobs
    try {
      const { startBasketExpiryScheduler } = require('./jobs/basket-expiry.job');
      await startBasketExpiryScheduler();
      logger.info('✅ Background jobs started');
    } catch (err) {
      logger.warn('⚠️ Background jobs failed to start (Redis may not be running):', err.message);
    }

    // Start HTTP server — bind to 0.0.0.0 so physical devices on the LAN can connect
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 Farm2Fork API server running on 0.0.0.0:${PORT}`);
      logger.info(`📋 Health check: http://localhost:${PORT}/api/v1/health`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    logger.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
