const Review = require('../models/Review');
const Order = require('../models/Order');
const ApiError = require('../utils/ApiError');
const notificationService = require('./notificationService');

const createReview = async (clientId, { orderId, rating, comment }) => {
  const order = await Order.findById(orderId).populate('service');
  if (!order) {
    throw ApiError.notFound('Order not found.');
  }

  // Only the client of this order can review
  if (order.client.toString() !== clientId.toString()) {
    throw ApiError.forbidden('You can only review orders you placed.');
  }

  // Must be completed
  if (order.status !== 'completed') {
    throw ApiError.badRequest('You can only review completed orders.');
  }

  // Check for existing review
  const existing = await Review.findOne({ order: orderId });
  if (existing) {
    throw ApiError.conflict('You have already reviewed this order.');
  }

  const review = await Review.create({
    order: orderId,
    service: order.service._id,
    client: clientId,
    freelancer: order.freelancer,
    rating,
    comment,
  });

  // Notify freelancer
  await notificationService.create({
    userId: order.freelancer,
    type: 'new_review',
    title: 'New Review',
    message: `You received a ${rating}-star review for "${order.service.title}"`,
    data: { serviceId: order.service._id, fromUser: clientId },
  });

  return review.populate('client', 'name avatar');
};

const getServiceReviews = async (serviceId, query = {}) => {
  const { page = 1, limit = 10 } = query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [reviews, total] = await Promise.all([
    Review.find({ service: serviceId })
      .populate('client', 'name avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit)),
    Review.countDocuments({ service: serviceId }),
  ]);

  return {
    reviews,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

const getFreelancerReviews = async (freelancerId, query = {}) => {
  const { page = 1, limit = 10 } = query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [reviews, total] = await Promise.all([
    Review.find({ freelancer: freelancerId })
      .populate('client', 'name avatar')
      .populate('service', 'title')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit)),
    Review.countDocuments({ freelancer: freelancerId }),
  ]);

  return {
    reviews,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

module.exports = { createReview, getServiceReviews, getFreelancerReviews };
