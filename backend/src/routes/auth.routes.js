const router = require('express').Router();
const { sendOtp, verifyOtp, register, logout } = require('../controllers/auth.controller');
const { validate } = require('../middlewares/validate');
const { authenticate } = require('../middlewares/auth');
const rateLimit = require('express-rate-limit');

// Rate limit: 5 OTP requests per hour per IP
const otpRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many OTP requests. Try again later.' } }
});

router.post('/otp/send', otpRateLimit, validate('sendOtp'), sendOtp);
router.post('/otp/verify', validate('verifyOtp'), verifyOtp);
router.post('/register', validate('register'), register);
router.post('/logout', authenticate, logout);

module.exports = router;
