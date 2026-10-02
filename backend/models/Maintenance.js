const mongoose = require('mongoose');

/**
 * Maintenance Schema
 * Tracks reported issues, damage, and scheduled maintenance work.
 */
const maintenanceSchema = new mongoose.Schema(
  {
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      required: [true, 'Equipment is required'],
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter is required'],
    },
    issue: {
      type: String,
      required: [true, 'Issue title is required'],
      trim: true,
      maxlength: [150, 'Issue title is too long'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description is too long'],
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'critical'],
        message: 'Invalid priority',
      },
      default: 'medium',
    },
    status: {
      type: String,
      enum: {
        values: ['reported', 'in-progress', 'completed'],
        message: 'Invalid maintenance status',
      },
      default: 'reported',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // usually a lab assistant
      default: null,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    resolutionNotes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Resolution notes are too long'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
maintenanceSchema.index({ equipment: 1, status: 1 });
maintenanceSchema.index({ status: 1, priority: 1 });
maintenanceSchema.index({ reportedBy: 1 });
maintenanceSchema.index({ assignedTo: 1, status: 1 });

module.exports = mongoose.model('Maintenance', maintenanceSchema);
