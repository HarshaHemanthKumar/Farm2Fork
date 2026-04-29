const router = require('express').Router();
const ctrl = require('../controllers/order.controller');
const { validate } = require('../middlewares/validate');
const { authenticate, authorize } = require('../middlewares/auth');

router.post('/', authenticate, authorize('consumer'), validate('createOrder'), ctrl.createOrder);
router.post('/confirm-payment', authenticate, authorize('consumer'), validate('confirmPayment'), ctrl.confirmPayment);
router.get('/consumer/mine', authenticate, authorize('consumer'), ctrl.getConsumerOrders);
router.get('/farmer/mine', authenticate, authorize('farmer'), ctrl.getFarmerOrders);
router.get('/:id', authenticate, ctrl.getOrderById);
router.put('/:id/farmer-accept', authenticate, authorize('farmer'), ctrl.farmerAcceptOrder);
router.put('/:id/farmer-ready', authenticate, authorize('farmer'), ctrl.farmerReadyOrder);
router.put('/:id/pickup-confirm', authenticate, authorize('delivery'), ctrl.pickupConfirm);
router.put('/:id/delivery-confirm', authenticate, authorize('delivery'), validate('deliveryOtp'), ctrl.deliveryConfirm);
router.put('/:id/cancel', authenticate, validate('cancelOrder'), ctrl.cancelOrder);

module.exports = router;
