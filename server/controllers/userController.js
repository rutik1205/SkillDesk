const asyncHandler = require('../utils/asyncHandler');
const userService = require('../services/userService');

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.json({ success: true, data: { user } });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user._id, req.body);
  res.json({ success: true, data: { user } });
});

const getFreelancers = asyncHandler(async (req, res) => {
  const result = await userService.getFreelancers(req.query);
  res.json({ success: true, data: result });
});

module.exports = { getUserProfile, updateProfile, getFreelancers };
