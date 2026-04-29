const router = require('express').Router();
const ctrl = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate, authorize('admin'));

router.get('/users', ctrl.getUsers);
router.get('/listings', ctrl.getAdminListings);
router.get('/orders', ctrl.getAdminOrders);
router.put('/users/:id/verify', ctrl.verifyFarmer);
router.put('/users/:id/deactivate', ctrl.deactivateUser);
router.get('/analytics', ctrl.getAnalytics);

module.exports = router;
