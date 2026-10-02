const mongoose = require('mongoose');

/**
 * Booking Schema
 * Core of the system. Enforces time-based conflict detection in the service layer.
 *
 * Status lifecycle:
 *   pending → approved → issued → returned
 *   pending → rejected
 *   pending / approved → cancelled
 *   issued → overdue (can be set by cron or manual check)
 */
const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User (student) is required'],
    },
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      required: [true, 'Equipment is required'],
    },
    lab: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lab',
      required: [true, 'Lab is required'],
    },
    // Date of the booking (YYYY-MM-DD conceptually)
    bookingDate: {
      type: Date,
      required: [true, 'Booking date is required'],
    },
    // Stored as Date objects for easy range comparison
    // Example: 2025-10-15T10:00:00.000Z
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
      validate: {
        validator: function (value) {
          return this.startTime < value;
        },
        message: 'End time must be after start time',
      },
    },
    purpose: {
      type: String,
      required: [true, 'Purpose of booking is required'],
      trim: true,
      minlength: [5, 'Purpose must be at least 5 characters'],
      maxlength: [500, 'Purpose cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: {
        values: [
          'pending',
          'approved',
          'rejected',
          'cancelled',
          'issued',
          'returned',
          'overdue',
        ],
        message: 'Invalid booking status',
      },
      default: 'pending',
    },
    // Who approved / rejected the request
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [300, 'Rejection reason is too long'],
      default: '',
    },
    issuedAt: {
      type: Date,
      default: null,
    },
    returnedAt: {
      type: Date,
      default: null,
    },
    // Optional notes from assistant when issuing/returning
    issueNotes: {
      type: String,
      trim: true,
      default: '',
    },
    returnNotes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// ============================================================
// CRITICAL INDEXES FOR CONFLICT DETECTION & PERFORMANCE
// ============================================================

// Compound index used by conflict-detection query:
// Find all bookings for a given equipment that overlap a time range
// and are in an active state (pending / approved / issued / overdue)
bookingSchema.index({ equipment: 1, startTime: 1, endTime: 1 });

// Fast lookup of a student's bookings
bookingSchema.index({ user: 1, status: 1, bookingDate: -1 });

// Assistant dashboard: pending requests for a lab
bookingSchema.index({ lab: 1, status: 1, bookingDate: 1 });

// Analytics: monthly booking counts
bookingSchema.index({ createdAt: 1 });
bookingSchema.index({ status: 1, bookingDate: 1 });

/**
 * Static helper that will be used by the booking service
 * to detect overlapping bookings.
 *
 * Overlap condition (standard interval overlap):
 *   existing.startTime < newEndTime  AND  existing.endTime > newStartTime
 *
 * We exclude the current booking when updating, and only consider
 * statuses that actually block the equipment.
 */
bookingSchema.statics.findConflicts = async function (
  equipmentId,
  startTime,
  endTime,
  excludeBookingId = null
) {
  const query = {
    equipment: equipmentId,
    status: { $in: ['pending', 'approved', 'issued', 'overdue'] },
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  return this.find(query)
    .populate('user', 'name email studentId')
    .populate('equipment', 'name equipmentId')
    .lean();
};

module.exports = mongoose.model('Booking', bookingSchema);
