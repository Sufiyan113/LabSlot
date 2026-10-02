const { Notification } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });
  sendSuccess(res, 200, 'Notifications retrieved', { notifications, unreadCount });
});

const markAsRead = asyncHandler(async (req, res) => {
  const n = await Notification.findOne({ _id: req.params.id, user: req.user._id });
  if (!n) throw new AppError('Notification not found', 404);
  n.isRead = true;
  await n.save();
  sendSuccess(res, 200, 'Marked as read', { notification: n });
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  sendSuccess(res, 200, 'All notifications marked as read');
});

module.exports = { getNotifications, markAsRead, markAllAsRead };
