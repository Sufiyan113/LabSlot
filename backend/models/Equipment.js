const mongoose = require('mongoose');

/**
 * Equipment Schema
 * Individual pieces of laboratory equipment that can be booked.
 *
 * Status lifecycle (enforced in controllers/services):
 *   available → booked → issued → available
 *   available → maintenance → available
 *   issued → damaged → maintenance → available
 *   any → retired (terminal)
 */
const equipmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Equipment name is required'],
      trim: true,
      maxlength: [150, 'Name cannot exceed 150 characters'],
    },
    equipmentId: {
      type: String,
      required: [true, 'Equipment ID is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [40, 'Equipment ID cannot exceed 40 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      // Common categories for college labs
      enum: {
        values: [
          'Microcontroller',
          'Sensor',
          'Development Board',
          'Measuring Instrument',
          'Networking',
          'Computing',
          '3D Printing',
          'Power Supply',
          'Miscellaneous',
        ],
        message: 'Invalid category',
      },
    },
    lab: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lab',
      required: [true, 'Lab reference is required'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description is too long'],
      default: '',
    },
    manufacturer: {
      type: String,
      trim: true,
      default: '',
    },
    model: {
      type: String,
      trim: true,
      default: '',
    },
    condition: {
      type: String,
      enum: {
        values: ['excellent', 'good', 'fair', 'poor', 'damaged'],
        message: 'Invalid condition',
      },
      default: 'good',
    },
    status: {
      type: String,
      enum: {
        values: [
          'available',
          'booked',
          'issued',
          'maintenance',
          'damaged',
          'retired',
        ],
        message: 'Invalid equipment status',
      },
      default: 'available',
    },
    purchaseDate: {
      type: Date,
    },
    // QR code will store a data URL or the encoded string (equipmentId based)
    qrCode: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '', // URL or path to image
    },
    totalBookings: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes are too long'],
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for common queries
equipmentSchema.index({ lab: 1, status: 1 });
equipmentSchema.index({ category: 1, status: 1 });
equipmentSchema.index({ status: 1, condition: 1 });
equipmentSchema.index({ name: 'text', equipmentId: 'text', description: 'text' });

// Virtual for maintenance history count (populated later)
equipmentSchema.virtual('maintenanceCount', {
  ref: 'Maintenance',
  localField: '_id',
  foreignField: 'equipment',
  count: true,
});

module.exports = mongoose.model('Equipment', equipmentSchema);
