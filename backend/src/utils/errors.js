/**
 * Custom API Error class for consistent error handling
 */
class AppError extends Error {
  constructor(statusCode, code, message) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Pre-defined error factories
const errors = {
  // Auth errors
  otpExpired: () => new AppError(400, 'AUTH_OTP_EXPIRED', 'OTP has expired. Please request a new one.'),
  otpInvalid: () => new AppError(400, 'AUTH_OTP_INVALID', 'Invalid OTP. Please try again.'),
  otpMaxAttempts: () => new AppError(429, 'AUTH_OTP_MAX_ATTEMPTS', 'Too many OTP attempts. Please request a new one.'),
  unauthorized: () => new AppError(401, 'UNAUTHORIZED', 'Authentication required.'),
  forbidden: () => new AppError(403, 'FORBIDDEN', 'You do not have permission to perform this action.'),

  // Listing errors
  listingNotFound: () => new AppError(404, 'LISTING_NOT_FOUND', 'Listing not found.'),
  listingInsufficientStock: () => new AppError(422, 'LISTING_INSUFFICIENT_STOCK', 'Insufficient stock available.'),
  listingNotActive: () => new AppError(422, 'LISTING_NOT_ACTIVE', 'This listing is no longer active.'),

  // Order errors
  orderNotFound: () => new AppError(404, 'ORDER_NOT_FOUND', 'Order not found.'),
  orderAlreadyConfirmed: () => new AppError(409, 'ORDER_ALREADY_CONFIRMED', 'Order is already confirmed.'),
  orderCannotCancel: () => new AppError(422, 'ORDER_CANNOT_CANCEL', 'This order cannot be cancelled.'),

  // Basket errors
  basketFull: () => new AppError(422, 'BASKET_FULL', 'This basket is already full.'),
  basketLocked: () => new AppError(422, 'BASKET_LOCKED', 'This basket is locked and no longer accepting members.'),
  basketExpired: () => new AppError(422, 'BASKET_EXPIRED', 'This basket has expired.'),
  basketAlreadyMember: () => new AppError(409, 'BASKET_ALREADY_MEMBER', 'You are already a member of this basket.'),

  // Payment errors
  paymentIntentFailed: () => new AppError(422, 'PAYMENT_INTENT_FAILED', 'Payment failed. Please try again.'),
  stripeAccountNotReady: () => new AppError(422, 'STRIPE_ACCOUNT_NOT_READY', 'Stripe account is not ready for payouts.'),

  // Delivery errors
  deliveryNotAvailable: () => new AppError(422, 'DELIVERY_NOT_AVAILABLE', 'No delivery partners available nearby.'),
  deliveryOtpInvalid: () => new AppError(400, 'DELIVERY_OTP_INVALID', 'Invalid delivery OTP.'),

  // Generic
  notFound: (resource = 'Resource') => new AppError(404, 'NOT_FOUND', `${resource} not found.`),
  badRequest: (message) => new AppError(400, 'BAD_REQUEST', message),
  conflict: (message) => new AppError(409, 'CONFLICT', message),
  internal: (message = 'Internal server error') => new AppError(500, 'INTERNAL_ERROR', message),
};

module.exports = { AppError, errors };
