const express = require('express');
const router = express.Router();
const {
  createOrder, getOrders, getOrderById,
  acceptOrder, rejectOrder, startOrder, deliverOrder,
  requestRevision, completeOrder, cancelOrder, getOrderStats,
} = require('../controllers/orderController');
const auth = require('../middleware/auth');

router.use(auth); // All order routes require authentication

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/stats', getOrderStats);
router.get('/:id', getOrderById);
router.put('/:id/accept', acceptOrder);
router.put('/:id/reject', rejectOrder);
router.put('/:id/start', startOrder);
router.put('/:id/deliver', deliverOrder);
router.put('/:id/revision', requestRevision);
router.put('/:id/complete', completeOrder);
router.put('/:id/cancel', cancelOrder);

module.exports = router;
