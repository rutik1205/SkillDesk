const asyncHandler = require('../utils/asyncHandler');
const notificationService = require('../services/notificationService');

const getNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.getUserNotifications(
    req.user._id,
    req.query
  );
  res.json({ success: true, data: result });
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(
    req.params.id,
    req.user._id
  );
  res.json({ success: true, data: { notification } });
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user._id);
  res.json({ success: true, data: result });
});

module.exports = { getNotifications, markAsRead, markAllAsRead };
