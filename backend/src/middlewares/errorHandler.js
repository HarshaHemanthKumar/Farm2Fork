const logger = require('../utils/logger');

/**
 * Global error handler middleware — registered last in Express app
 * Formats all errors to standard response structure per PRD Section 15
 */
const errorHandler = (err, req, res, next) => {
  logger.error(`${err.code || 'INTERNAL_ERROR'}: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.userId
  });

  // Joi validation errors
  if (err.isJoi || err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.details ? err.details.map(d => d.message).join(', ') : err.message
      }
    });
  }

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.errors ? err.errors.map(e => e.message).join(', ') : err.message
      }
    });
  }

  // Operational errors (our AppError instances)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message
      }
    });
  }

  // Unknown / unhandled errors
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : err.message
    }
  });
};

module.exports = errorHandler;
