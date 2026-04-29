const jwt = require('jsonwebtoken');
const { errors } = require('../utils/errors');

/**
 * JWT authentication middleware
 * Verifies Bearer token from Authorization header
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw errors.unauthorized();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      phone: decoded.phone
    };

    next();
  } catch (err) {
    if (err.isOperational) {
      next(err);
    } else {
      next(errors.unauthorized());
    }
  }
};

/**
 * Role-based access control middleware
 * @param  {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(errors.forbidden());
    }
    next();
  };
};

/**
 * Optional authentication — sets req.user if token present, doesn't fail otherwise
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = {
        userId: decoded.userId,
        role: decoded.role,
        phone: decoded.phone
      };
    }
  } catch (err) {
    // Token invalid — just proceed without user
  }
  next();
};

module.exports = { authenticate, authorize, optionalAuth };
