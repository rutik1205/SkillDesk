const Order = require('../models/Order');
const Service = require('../models/Service');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { generateOrderNumber } = require('../utils/helpers');
const notificationService = require('./notificationService');

const createOrder = async (clientId, { serviceId, requirements }) => {
  const service = await Service.findById(serviceId).populate('freelancer');
  if (!service) {
    throw ApiError.notFound('Service not found.');
  }
  if (!service.isActive) {
    throw ApiError.badRequest('This service is currently unavailable.');
  }
  if (service.freelancer._id.toString() === clientId.toString()) {
    throw ApiError.badRequest('You cannot order your own service.');
  }

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + service.deliveryTime);

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    service: service._id,
    client: clientId,
    freelancer: service.freelancer._id,
    price: service.price,
    requirements: requirements || '',
    deliveryDate,
    paymentStatus: 'paid', // Demo: auto-mark as paid
  });

  // Increment service order count
  await Service.findByIdAndUpdate(service._id, { $inc: { totalOrders: 1 } });

  // Notify freelancer
  await notificationService.create({
    userId: service.freelancer._id,
    type: 'new_order',
    title: 'New Order Received',
    message: `You have a new order for "${service.title}"`,
    data: { orderId: order._id, serviceId: service._id, fromUser: clientId },
  });

  return order.populate(['service', 'client', 'freelancer']);
};

const getOrders = async (userId, role, query = {}) => {
  const { status, page = 1, limit = 10 } = query;
  const filter = role === 'client' ? { client: userId } : { freelancer: userId };

  if (status) {
    filter.status = status;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('service', 'title images price')
      .populate('client', 'name avatar')
      .populate('freelancer', 'name avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit)),
    Order.countDocuments(filter),
  ]);

  return {
    orders,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

const getOrderById = async (orderId, userId) => {
  const order = await Order.findById(orderId)
    .populate('service')
    .populate('client', 'name avatar email')
    .populate('freelancer', 'name avatar email');

  if (!order) {
    throw ApiError.notFound('Order not found.');
  }

  // Only participants can view the order
  if (
    order.client._id.toString() !== userId.toString() &&
    order.freelancer._id.toString() !== userId.toString()
  ) {
    throw ApiError.forbidden('You are not authorized to view this order.');
  }

  return order;
};

const transitionOrder = async (orderId, userId, role, newStatus, extraData = {}) => {
  const order = await Order.findById(orderId)
    .populate('service', 'title')
    .populate('client', 'name')
    .populate('freelancer', 'name');

  if (!order) {
    throw ApiError.notFound('Order not found.');
  }

  // Verify the right person is performing the action
  const isClient = order.client._id.toString() === userId.toString();
  const isFreelancer = order.freelancer._id.toString() === userId.toString();

  if (!isClient && !isFreelancer) {
    throw ApiError.forbidden('You are not authorized to update this order.');
  }

  // Check role-based permissions for specific transitions
  const freelancerActions = ['accepted', 'rejected', 'in_progress', 'delivered'];
  const clientActions = ['completed', 'revision_requested'];

  if (freelancerActions.includes(newStatus) && !isFreelancer) {
    throw ApiError.forbidden('Only the freelancer can perform this action.');
  }
  if (clientActions.includes(newStatus) && !isClient) {
    throw ApiError.forbidden('Only the client can perform this action.');
  }
  // Cancel: both can cancel depending on state
  if (newStatus === 'cancelled') {
    if (isClient && !['pending', 'accepted'].includes(order.status)) {
      throw ApiError.badRequest('You can only cancel orders that are pending or accepted.');
    }
    if (isFreelancer && order.status !== 'pending') {
      throw ApiError.badRequest('Freelancers can only cancel pending orders.');
    }
  }

  // Strict state machine validation
  if (!order.canTransitionTo(newStatus)) {
    throw ApiError.badRequest(
      `Cannot transition from '${order.status}' to '${newStatus}'.`
    );
  }

  order.status = newStatus;

  // Handle specific transition side effects
  if (newStatus === 'delivered') {
    order.deliveredWork = {
      message: extraData.message || '',
      files: extraData.files || [],
      deliveredAt: new Date(),
    };
  }

  if (newStatus === 'revision_requested') {
    order.revisionMessage = extraData.revisionMessage || '';
  }

  if (newStatus === 'completed') {
    order.completedAt = new Date();
    // Increment freelancer completed orders
    await User.findByIdAndUpdate(order.freelancer._id, {
      $inc: { completedOrders: 1 },
    });
  }

  if (newStatus === 'cancelled' || newStatus === 'rejected') {
    order.paymentStatus = 'refunded';
  }

  await order.save();

  // Send notification to the other party
  const notifyUser = isClient ? order.freelancer._id : order.client._id;
  const notificationTypes = {
    accepted: 'order_accepted',
    rejected: 'order_rejected',
    in_progress: 'order_started',
    delivered: 'delivery_submitted',
    revision_requested: 'revision_requested',
    completed: 'order_completed',
    cancelled: 'order_cancelled',
  };

  const notificationMessages = {
    accepted: `Your order for "${order.service.title}" has been accepted`,
    rejected: `Your order for "${order.service.title}" has been rejected`,
    in_progress: `Work has started on your order for "${order.service.title}"`,
    delivered: `Delivery submitted for "${order.service.title}"`,
    revision_requested: `Revision requested for "${order.service.title}"`,
    completed: `Order for "${order.service.title}" has been completed`,
    cancelled: `Order for "${order.service.title}" has been cancelled`,
  };

  await notificationService.create({
    userId: notifyUser,
    type: notificationTypes[newStatus],
    title: `Order ${newStatus.replace('_', ' ')}`,
    message: notificationMessages[newStatus],
    data: { orderId: order._id, serviceId: order.service._id, fromUser: userId },
  });

  return order;
};

const getOrderStats = async (userId, role) => {
  const filter = role === 'client' ? { client: userId } : { freelancer: userId };

  const stats = await Order.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalValue: { $sum: '$price' },
      },
    },
  ]);

  const result = {
    total: 0,
    pending: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
    totalEarnings: 0,
  };

  stats.forEach((s) => {
    result.total += s.count;
    if (s._id === 'pending') result.pending = s.count;
    if (['accepted', 'in_progress', 'delivered', 'revision_requested'].includes(s._id)) {
      result.active += s.count;
    }
    if (s._id === 'completed') {
      result.completed = s.count;
      result.totalEarnings = s.totalValue;
    }
    if (s._id === 'cancelled' || s._id === 'rejected') {
      result.cancelled += s.count;
    }
  });

  return result;
};

module.exports = { createOrder, getOrders, getOrderById, transitionOrder, getOrderStats };
