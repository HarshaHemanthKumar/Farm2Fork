const Joi = require('joi');

// Phone number pattern: E.164 format for India
const phonePattern = /^\+91[6-9]\d{9}$/;

const schemas = {
  // Auth schemas
  sendOtp: Joi.object({
    phone: Joi.string().pattern(phonePattern).required()
      .messages({ 'string.pattern.base': 'Phone must be a valid Indian number in +91XXXXXXXXXX format' })
  }),

  verifyOtp: Joi.object({
    phone: Joi.string().pattern(phonePattern).required(),
    otp: Joi.string().length(6).pattern(/^\d+$/).required()
  }),

  register: Joi.object({
    phone: Joi.string().pattern(phonePattern).required(),
    name: Joi.string().min(2).max(100).required(),
    role: Joi.string().valid('farmer', 'consumer', 'delivery').required(),
    fcm_token: Joi.string().allow(null, ''),
    // Farmer-specific
    farm_name: Joi.string().max(150).when('role', { is: 'farmer', then: Joi.required() }),
    farm_address: Joi.string().when('role', { is: 'farmer', then: Joi.required() }),
    farm_lat: Joi.number().when('role', { is: 'farmer', then: Joi.required() }),
    farm_lng: Joi.number().when('role', { is: 'farmer', then: Joi.required() }),
    farm_size_acres: Joi.number().min(0).allow(null),
    // Delivery-specific
    vehicle_type: Joi.string().valid('bike', 'auto', 'van').when('role', { is: 'delivery', then: Joi.required() }),
    vehicle_number: Joi.string().max(20).when('role', { is: 'delivery', then: Joi.required() }),
    license_number: Joi.string().max(30).when('role', { is: 'delivery', then: Joi.required() }),
    service_radius_km: Joi.number().integer().min(1).max(50).default(10),
    // Consumer-specific
    pincode: Joi.string().length(6).pattern(/^\d+$/).when('role', { is: 'consumer', then: Joi.optional() })
  }),

  // Listing schemas
  createListing: Joi.object({
    title: Joi.string().max(200).required(),
    description: Joi.string().allow(null, ''),
    category_id: Joi.string().uuid().required(),
    price_per_kg: Joi.number().positive().required(),
    unit: Joi.string().valid('kg', 'dozen', 'piece', 'bunch').default('kg'),
    available_qty: Joi.number().positive().required(),
    min_order_qty: Joi.number().positive().default(0.5),
    harvest_date: Joi.date().required(),
    expiry_date: Joi.date().greater(Joi.ref('harvest_date')).required(),
    is_organic: Joi.boolean().default(false),
    pincode: Joi.string().length(6).pattern(/^\d+$/).required(),
    images: Joi.array().items(Joi.string()).max(3)
  }),

  updateListing: Joi.object({
    title: Joi.string().max(200),
    description: Joi.string().allow(null, ''),
    category_id: Joi.string().uuid(),
    price_per_kg: Joi.number().positive(),
    unit: Joi.string().valid('kg', 'dozen', 'piece', 'bunch'),
    available_qty: Joi.number().min(0),
    min_order_qty: Joi.number().positive(),
    harvest_date: Joi.date(),
    expiry_date: Joi.date(),
    is_organic: Joi.boolean(),
    pincode: Joi.string().length(6).pattern(/^\d+$/),
    status: Joi.string().valid('draft', 'active', 'sold_out', 'expired'),
    images: Joi.array().items(Joi.string()).max(3)
  }).min(1),

  // Order schemas
  createOrder: Joi.object({
    listing_id: Joi.string().uuid().required(),
    quantity: Joi.number().positive().required(),
    delivery_address: Joi.string().required(),
    delivery_lat: Joi.number().required(),
    delivery_lng: Joi.number().required(),
    delivery_instructions: Joi.string().allow(null, ''),
    basket_id: Joi.string().uuid().allow(null)
  }),

  confirmPayment: Joi.object({
    order_id: Joi.string().uuid().required(),
    payment_intent_id: Joi.string().required()
  }),

  cancelOrder: Joi.object({
    reason: Joi.string().required()
  }),

  deliveryOtp: Joi.object({
    otp: Joi.string().length(6).pattern(/^\d+$/).required()
  }),

  // Basket schemas
  createBasket: Joi.object({
    listing_id: Joi.string().uuid().required(),
    name: Joi.string().max(150).required(),
    target_families: Joi.number().integer().min(2).default(10),
    min_total_kg: Joi.number().positive().required(),
    expires_at: Joi.date().greater('now').required(),
    pincode: Joi.string().length(6).pattern(/^\d+$/).required(),
    delivery_address: Joi.string().required(),
    delivery_lat: Joi.number().required(),
    delivery_lng: Joi.number().required(),
    notes: Joi.string().allow(null, '')
  }),

  joinBasket: Joi.object({
    quantity_kg: Joi.number().positive().required()
  }),

  // Delivery schemas
  updateAvailability: Joi.object({
    is_available: Joi.boolean().required(),
    lat: Joi.number().required(),
    lng: Joi.number().required()
  }),

  updateLocation: Joi.object({
    lat: Joi.number().required(),
    lng: Joi.number().required()
  }),

  respondAssignment: Joi.object({
    accepted: Joi.boolean().required()
  }),

  // Review schemas
  createReview: Joi.object({
    order_id: Joi.string().uuid().required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().allow(null, ''),
    type: Joi.string().valid('consumer_to_farmer', 'consumer_to_delivery', 'farmer_to_consumer').required()
  })
};

/**
 * Validation middleware factory
 * @param {string} schemaName - Name of the schema in the schemas object
 */
const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return next(new Error(`Validation schema '${schemaName}' not found`));
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.details.map(d => d.message).join(', ')
        }
      });
    }

    req.validatedBody = value;
    next();
  };
};

module.exports = { validate, schemas };
