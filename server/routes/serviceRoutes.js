const express = require('express');
const router = express.Router();
const {
  createService, getServices, getServiceById,
  updateService, deleteService, getMyServices, getFeaturedServices,
} = require('../controllers/serviceController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.get('/featured', getFeaturedServices);
router.get('/my-services', auth, authorize('freelancer'), getMyServices);
router.get('/', getServices);
router.get('/:id', getServiceById);
router.post('/', auth, authorize('freelancer'), createService);
router.put('/:id', auth, authorize('freelancer'), updateService);
router.delete('/:id', auth, authorize('freelancer'), deleteService);

module.exports = router;
