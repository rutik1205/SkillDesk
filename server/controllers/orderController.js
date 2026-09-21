const asyncHandler = require('../utils/asyncHandler');
const orderService = require('../services/orderService');

const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.user._id, req.body);
  res.status(201).json({ success: true, data: { order } });
});

const getOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getOrders(req.user._id, req.user.role, req.query);
  res.json({ success: true, data: result });
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id, req.user._id);
  res.json({ success: true, data: { order } });
});

const acceptOrder = asyncHandler(async (req, res) => {
  const order = await orderService.transitionOrder(
    req.params.id, req.user._id, req.user.role, 'accepted'
  );
  res.json({ success: true, data: { order } });
});

const rejectOrder = asyncHandler(async (req, res) => {
  const order = await orderService.transitionOrder(
    req.params.id, req.user._id, req.user.role, 'rejected'
  );
  res.json({ success: true, data: { order } });
});

const startOrder = asyncHandler(async (req, res) => {
  const order = await orderService.transitionOrder(
    req.params.id, req.user._id, req.user.role, 'in_progress'
  );
  res.json({ success: true, data: { order } });
});

const deliverOrder = asyncHandler(async (req, res) => {
  const order = await orderService.transitionOrder(
    req.params.id, req.user._id, req.user.role, 'delivered',
    { message: req.body.message, files: req.body.files }
  );
  res.json({ success: true, data: { order } });
});

const requestRevision = asyncHandler(async (req, res) => {
  const order = await orderService.transitionOrder(
    req.params.id, req.user._id, req.user.role, 'revision_requested',
    { revisionMessage: req.body.revisionMessage }
  );
  res.json({ success: true, data: { order } });
});

const completeOrder = asyncHandler(async (req, res) => {
  const order = await orderService.transitionOrder(
    req.params.id, req.user._id, req.user.role, 'completed'
  );
  res.json({ success: true, data: { order } });
});

const cancelOrder = asyncHandler(async (req, res) => {
  const order = await orderService.transitionOrder(
    req.params.id, req.user._id, req.user.role, 'cancelled'
  );
  res.json({ success: true, data: { order } });
});

const getOrderStats = asyncHandler(async (req, res) => {
  const stats = await orderService.getOrderStats(req.user._id, req.user.role);
  res.json({ success: true, data: { stats } });
});

module.exports = {
  createOrder, getOrders, getOrderById,
  acceptOrder, rejectOrder, startOrder, deliverOrder,
  requestRevision, completeOrder, cancelOrder, getOrderStats,
};
