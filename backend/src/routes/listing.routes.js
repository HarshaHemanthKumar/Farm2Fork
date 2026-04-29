const router = require('express').Router();
const ctrl = require('../controllers/listing.controller');
const { validate } = require('../middlewares/validate');
const { authenticate, authorize, optionalAuth } = require('../middlewares/auth');

router.get('/categories', ctrl.getCategories);
router.get('/', optionalAuth, ctrl.getListings);
router.get('/farmer/mine', authenticate, authorize('farmer'), ctrl.getMyListings);
router.get('/:id', optionalAuth, ctrl.getListingById);
router.post('/', authenticate, authorize('farmer'), validate('createListing'), ctrl.createListing);
router.put('/:id', authenticate, authorize('farmer'), validate('updateListing'), ctrl.updateListing);
router.delete('/:id', authenticate, authorize('farmer'), ctrl.deleteListing);

module.exports = router;
