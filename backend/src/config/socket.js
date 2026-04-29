const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

let io;

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
      methods: ['GET', 'POST']
    }
  });

  // Socket auth middleware — verifies JWT from auth header on connect
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return next(new Error('Authentication required'));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      logger.error('Socket auth error:', err.message);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: user ${socket.userId} (${socket.userRole})`);

    // All users join their own room
    socket.join(`user:${socket.userId}`);

    // Join role-specific room
    if (socket.userRole === 'farmer') {
      socket.join(`farmer:${socket.userId}`);
    }

    // Consumer joins order room
    socket.on('order:join', ({ orderId }) => {
      socket.join(`order:${orderId}`);
      logger.info(`User ${socket.userId} joined order room: ${orderId}`);
    });

    // Delivery partner sends location updates
    socket.on('location:update', ({ lat, lng }) => {
      // Broadcast to relevant order rooms (handled by delivery controller)
      socket.broadcast.emit('delivery:location_raw', {
        deliveryId: socket.userId,
        lat,
        lng
      });
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: user ${socket.userId}`);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

module.exports = { initSocket, getIO };
