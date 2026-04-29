const router = require('express').Router();
const ctrl = require('../controllers/delivery.controller');
const { validate } = require('../middlewares/validate');
const { authenticate, authorize } = require('../middlewares/auth');

router.put('/availability', authenticate, authorize('delivery'), validate('updateAvailability'), ctrl.updateAvailability);
router.get('/assignments/mine', authenticate, authorize('delivery'), ctrl.getMyAssignments);
router.put('/assignments/:id/respond', authenticate, authorize('delivery'), validate('respondAssignment'), ctrl.respondToAssignment);
router.put('/location', authenticate, authorize('delivery'), validate('updateLocation'), ctrl.updateLocation);

module.exports = router;
