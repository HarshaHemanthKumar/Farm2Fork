const router = require('express').Router();
const ctrl = require('../controllers/basket.controller');
const { validate } = require('../middlewares/validate');
const { authenticate, authorize, optionalAuth } = require('../middlewares/auth');

router.post('/', authenticate, authorize('consumer'), validate('createBasket'), ctrl.createBasket);
router.get('/', optionalAuth, ctrl.getBaskets);
router.get('/:id', ctrl.getBasketById);
router.post('/:id/join', authenticate, authorize('consumer'), validate('joinBasket'), ctrl.joinBasket);
router.post('/:id/lock', authenticate, authorize('consumer'), ctrl.lockBasket);

module.exports = router;
