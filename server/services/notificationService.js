const Notification = require('../models/Notification');

const create = async ({ userId, type, title, message, data }) => {
  const notification = await Notification.create({
    user: userId,
    type,
    title,
    message,
    data: data || {},
  });

  // Try to emit via Socket.IO if available
  try {
    const { getIO } = require('../config/socket');
    const io = getIO();
    io.to(userId.toString()).emit('notification:new', notification);
  } catch (err) {
    // Socket.IO might not be initialized yet during seeding
  }

  return notification;
};

const getUserNotifications = async (userId, query = {}) => {
  const { page = 1, limit = 20 } = query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ user: userId })
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit)),
    Notification.countDocuments({ user: userId }),
    Notification.countDocuments({ user: userId, isRead: false }),
  ]);

  return {
    notifications,
    unreadCount,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  };
};

const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true },
    { new: true }
  );
  return notification;
};

const markAllAsRead = async (userId) => {
  await Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true }
  );
  return { message: 'All notifications marked as read.' };
};

module.exports = { create, getUserNotifications, markAsRead, markAllAsRead };
