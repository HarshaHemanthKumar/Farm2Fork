const router = require('express').Router();
const ctrl = require('../controllers/stripe.controller');
const { authenticate, authorize } = require('../middlewares/auth');

router.post('/farmer/onboard', authenticate, authorize('farmer'), ctrl.onboardFarmer);
router.get('/farmer/status', authenticate, authorize('farmer'), ctrl.getFarmerStatus);

// Webhook needs raw body — configured in app.js with express.raw()
router.post('/webhook', ctrl.handleWebhook);

module.exports = router;
