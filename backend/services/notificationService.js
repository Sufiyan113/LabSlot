const { Notification } = require('../models');

const createNotification = async ({ userId, title, message, type, relatedId, relatedModel }) => {
  return Notification.create({
    user: userId,
    title,
    message,
    type: type || 'system',
    relatedId: relatedId || null,
    relatedModel: relatedModel || null,
  });
};

module.exports = { createNotification };
