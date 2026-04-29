/**
 * Wrap async route handlers to catch errors and forward to Express error handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Standard success response
 */
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message
  });
};

/**
 * Standard created response
 */
const createdResponse = (res, data, message = 'Created successfully') => {
  return successResponse(res, data, message, 201);
};

module.exports = { asyncHandler, successResponse, createdResponse };
