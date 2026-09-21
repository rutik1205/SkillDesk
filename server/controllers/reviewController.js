const asyncHandler = require('../utils/asyncHandler');
const reviewService = require('../services/reviewService');

const createReview = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(req.user._id, req.body);
  res.status(201).json({ success: true, data: { review } });
});

const getServiceReviews = asyncHandler(async (req, res) => {
  const result = await reviewService.getServiceReviews(req.params.serviceId, req.query);
  res.json({ success: true, data: result });
});

const getFreelancerReviews = asyncHandler(async (req, res) => {
  const result = await reviewService.getFreelancerReviews(req.params.freelancerId, req.query);
  res.json({ success: true, data: result });
});

module.exports = { createReview, getServiceReviews, getFreelancerReviews };
