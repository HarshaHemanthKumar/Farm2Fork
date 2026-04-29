const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const axios = require('axios');
const { User, FarmerProfile, DeliveryProfile, OtpSession } = require('../models');
const stripeService = require('../services/stripe.service');
const { asyncHandler, successResponse, createdResponse } = require('../utils/helpers');
const { errors } = require('../utils/errors');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * Generate JWT token
 */
function generateToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role, phone: user.phone },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * POST /auth/otp/send
 * Generate and send OTP via Twilio SMS
 */
const sendOtp = asyncHandler(async (req, res) => {
  const { phone } = req.validatedBody;

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hash = await bcrypt.hash(otp, 10);

  // Also hash the dev bypass OTP '123456' so it always works in dev
  const devHash = process.env.NODE_ENV === 'development'
    ? await bcrypt.hash('123456', 10)
    : null;

  // Store OTP session
  await OtpSession.create({
    phone,
    otp_hash: hash,
    expires_at: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  });

  // In dev mode, also store a bypass session with OTP 123456
  if (devHash) {
    await OtpSession.create({
      phone,
      otp_hash: devHash,
      expires_at: new Date(Date.now() + 10 * 60 * 1000)
    });
  }

  // Send via Twilio (skip in dev mode)
  if (process.env.NODE_ENV !== 'development') {
    try {
      const twilio = require('twilio')(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      await twilio.messages.create({
        body: `Your Farm2Fork verification code is: ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone
      });
      logger.info(`OTP sent via Twilio to ${phone}`);
    } catch (err) {
      logger.error('Twilio error:', err.message);
      // Don't fail the request — OTP is still in DB for verification
    }
  } else {
    // In development, log the OTP and remind about bypass
    logger.info(`[DEV] OTP for ${phone}: ${otp} (bypass: 123456)`);
  }

  successResponse(res, null, 'OTP sent successfully');
});

/**
 * POST /auth/otp/verify
 * Verify OTP and return JWT or needsRegistration flag
 */
const verifyOtp = asyncHandler(async (req, res) => {
  const { phone, otp } = req.validatedBody;

  // Find latest unused OTP session for this phone
  const session = await OtpSession.findOne({
    where: {
      phone,
      is_used: false,
      expires_at: { [Op.gt]: new Date() }
    },
    order: [['created_at', 'DESC']]
  });

  if (!session) {
    throw errors.otpExpired();
  }

  // Rate limit check
  if (session.attempt_count >= 5) {
    throw errors.otpMaxAttempts();
  }

  // Verify OTP
  const isValid = await bcrypt.compare(otp, session.otp_hash);

  if (!isValid) {
    await session.update({ attempt_count: session.attempt_count + 1 });
    throw errors.otpInvalid();
  }

  // Mark as used
  await session.update({ is_used: true });

  // Check if user exists
  const user = await User.findOne({
    where: { phone },
    include: [
      { model: FarmerProfile, as: 'farmerProfile' },
      { model: DeliveryProfile, as: 'deliveryProfile' }
    ]
  });

  if (user) {
    const token = generateToken(user);
    return successResponse(res, { token, user });
  }

  // User doesn't exist — needs registration
  successResponse(res, { needsRegistration: true, phone });
});

/**
 * POST /auth/register
 * Create new user with role-specific profile
 */
const register = asyncHandler(async (req, res) => {
  const data = req.validatedBody;

  // Check if phone already exists
  const existing = await User.findOne({ where: { phone: data.phone } });
  if (existing) {
    throw errors.conflict('A user with this phone number already exists');
  }

  // Create user
  const user = await User.create({
    phone: data.phone,
    name: data.name,
    role: data.role,
    fcm_token: data.fcm_token || null
  });

  // Create role-specific profile
  if (data.role === 'farmer') {
    await FarmerProfile.create({
      user_id: user.id,
      farm_name: data.farm_name,
      farm_address: data.farm_address,
      farm_lat: data.farm_lat,
      farm_lng: data.farm_lng,
      farm_size_acres: data.farm_size_acres || null
    });
  } else if (data.role === 'delivery') {
    await DeliveryProfile.create({
      user_id: user.id,
      vehicle_type: data.vehicle_type,
      vehicle_number: data.vehicle_number,
      license_number: data.license_number,
      service_radius_km: data.service_radius_km || 10
    });
  } else if (data.role === 'consumer') {
    // Create Stripe customer for consumers
    try {
      const customer = await stripeService.createCustomer(data.name, data.phone);
      await user.update({ stripe_customer_id: customer.id });
    } catch (err) {
      logger.warn('Stripe customer creation failed (non-blocking):', err.message);
    }
  }

  // Reload with associations
  const fullUser = await User.findByPk(user.id, {
    include: [
      { model: FarmerProfile, as: 'farmerProfile' },
      { model: DeliveryProfile, as: 'deliveryProfile' }
    ]
  });

  const token = generateToken(fullUser);
  createdResponse(res, { token, user: fullUser }, 'Registration successful');
});

/**
 * POST /auth/logout
 * Invalidate FCM token
 */
const logout = asyncHandler(async (req, res) => {
  await User.update({ fcm_token: null }, { where: { id: req.user.userId } });
  successResponse(res, null, 'Logged out successfully');
});

module.exports = { sendOtp, verifyOtp, register, logout };
