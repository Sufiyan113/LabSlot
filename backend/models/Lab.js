const mongoose = require('mongoose');

/**
 * Lab Schema
 * Represents a physical laboratory in the college.
 */
const labSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Lab name is required'],
      trim: true,
      maxlength: [120, 'Lab name cannot exceed 120 characters'],
    },
    code: {
      type: String,
      required: [true, 'Lab code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [20, 'Lab code cannot exceed 20 characters'],
    },
    building: {
      type: String,
      required: [true, 'Building is required'],
      trim: true,
    },
    floor: {
      type: String,
      trim: true,
      default: '',
    },
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description is too long'],
      default: '',
    },
    capacity: {
      type: Number,
      min: [1, 'Capacity must be at least 1'],
      default: 30,
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'under_renovation'],
        message: 'Invalid lab status',
      },
      default: 'active',
    },
    // Optional: assistants assigned to this lab (for future filtering)
    assistants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: count of equipment belonging to this lab
labSchema.virtual('equipmentCount', {
  ref: 'Equipment',
  localField: '_id',
  foreignField: 'lab',
  count: true,
});

// Indexes
labSchema.index({ department: 1, status: 1 });
labSchema.index({ name: 'text', code: 'text', description: 'text' }); // text search

module.exports = mongoose.model('Lab', labSchema);
