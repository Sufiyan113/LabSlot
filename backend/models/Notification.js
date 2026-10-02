const mongoose = require('mongoose');

/**
 * Notification Schema
 * In-app notifications for students, assistants, and admins.
 */
const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [120, 'Title is too long'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [500, 'Message is too long'],
    },
    type: {
      type: String,
      enum: {
        values: [
          'booking_created',
          'booking_approved',
          'booking_rejected',
          'booking_cancelled',
          'equipment_issued',
          'equipment_returned',
          'return_reminder',
          'maintenance_reported',
          'maintenance_updated',
          'system',
        ],
        message: 'Invalid notification type',
      },
      default: 'system',
    },
    // Optional link to related resource (booking id, equipment id, etc.)
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    relatedModel: {
      type: String,
      enum: ['Booking', 'Equipment', 'Maintenance', 'Lab', null],
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient unread count & listing
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
