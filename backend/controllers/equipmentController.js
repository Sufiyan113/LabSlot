/**
 * Equipment Controller
 */
const { Equipment, Lab, Booking } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');
const QRCode = require('qrcode');

/**
 * @desc    Get all equipment (search, filter by lab/category/status/condition)
 * @route   GET /api/equipment
 * @access  Private
 */
const getEquipment = asyncHandler(async (req, res) => {
  const { search, lab, category, status, condition } = req.query;
  const filter = {};

  if (lab) filter.lab = lab;
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (condition) filter.condition = condition;
  if (search) {
    filter.$or = [
      { name: new RegExp(search, 'i') },
      { equipmentId: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
      { manufacturer: new RegExp(search, 'i') },
    ];
  }

  const equipment = await Equipment.find(filter)
    .populate('lab', 'name code building roomNumber')
    .sort({ name: 1 })
    .lean();

  sendSuccess(res, 200, 'Equipment retrieved successfully', { equipment });
});

/**
 * @desc    Get single equipment by ID or equipmentId
 * @route   GET /api/equipment/:id
 * @access  Private
 */
const getEquipmentById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Support both MongoDB _id and human equipmentId
  let equipment = await Equipment.findById(id)
    .populate('lab', 'name code building floor roomNumber department')
    .lean()
    .catch(() => null);

  if (!equipment) {
    equipment = await Equipment.findOne({ equipmentId: id.toUpperCase() })
      .populate('lab', 'name code building floor roomNumber department')
      .lean();
  }

  if (!equipment) return next(new AppError('Equipment not found', 404));

  sendSuccess(res, 200, 'Equipment retrieved successfully', { equipment });
});

/**
 * @desc    Get availability slots for an equipment on a given date
 * @route   GET /api/equipment/:id/availability
 * @access  Private
 */
const getAvailability = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { date } = req.query; // YYYY-MM-DD

  if (!date) return next(new AppError('Date query parameter is required (YYYY-MM-DD)', 400));

  let equipment = await Equipment.findById(id).catch(() => null);
  if (!equipment) {
    equipment = await Equipment.findOne({ equipmentId: id.toUpperCase() });
  }
  if (!equipment) return next(new AppError('Equipment not found', 404));

  // Equipment not bookable
  if (['maintenance', 'damaged', 'retired'].includes(equipment.status)) {
    return sendSuccess(res, 200, 'Equipment is not available for booking', {
      available: false,
      reason: `Equipment status is "${equipment.status}"`,
      slots: [],
    });
  }

  const dayStart = new Date(`${date}T00:00:00.000Z`);
  const dayEnd = new Date(`${date}T23:59:59.999Z`);

  const bookings = await Booking.find({
    equipment: equipment._id,
    status: { $in: ['pending', 'approved', 'issued', 'overdue'] },
    startTime: { $lt: dayEnd },
    endTime: { $gt: dayStart },
  })
    .select('startTime endTime status purpose user')
    .populate('user', 'name studentId')
    .sort({ startTime: 1 })
    .lean();

  sendSuccess(res, 200, 'Availability retrieved', {
    available: equipment.status === 'available' || equipment.status === 'booked',
    equipmentStatus: equipment.status,
    date,
    bookings,
  });
});

/**
 * @desc    Create equipment
 * @route   POST /api/equipment
 * @access  Admin
 */
const createEquipment = asyncHandler(async (req, res, next) => {
  const {
    name, equipmentId, category, lab, description,
    manufacturer, model, condition, status, purchaseDate, image, notes,
  } = req.body;

  if (!name || !equipmentId || !category || !lab) {
    return next(new AppError('Name, equipmentId, category and lab are required', 400));
  }

  const labExists = await Lab.findById(lab);
  if (!labExists) return next(new AppError('Lab not found', 404));

  const existing = await Equipment.findOne({ equipmentId: equipmentId.toUpperCase() });
  if (existing) return next(new AppError('Equipment ID already exists', 409));

  const equipment = await Equipment.create({
    name,
    equipmentId: equipmentId.toUpperCase(),
    category,
    lab,
    description,
    manufacturer,
    model,
    condition: condition || 'good',
    status: status || 'available',
    purchaseDate,
    image,
    notes,
  });

  const populated = await Equipment.findById(equipment._id).populate('lab', 'name code');
  sendSuccess(res, 201, 'Equipment created successfully', { equipment: populated });
});

/**
 * @desc    Update equipment
 * @route   PUT /api/equipment/:id
 * @access  Admin / Assistant (limited fields for assistant)
 */
const updateEquipment = asyncHandler(async (req, res, next) => {
  const equipment = await Equipment.findById(req.params.id);
  if (!equipment) return next(new AppError('Equipment not found', 404));

  // Assistants can only update status, condition, notes
  const isAdmin = req.user.role === 'admin';
  const allowedForAssistant = ['status', 'condition', 'notes'];
  const allFields = [
    'name', 'equipmentId', 'category', 'lab', 'description',
    'manufacturer', 'model', 'condition', 'status', 'purchaseDate',
    'image', 'notes',
  ];

  const fields = isAdmin ? allFields : allowedForAssistant;

  fields.forEach((f) => {
    if (req.body[f] !== undefined) {
      equipment[f] = f === 'equipmentId' ? req.body[f].toUpperCase() : req.body[f];
    }
  });

  await equipment.save();
  const populated = await Equipment.findById(equipment._id).populate('lab', 'name code');
  sendSuccess(res, 200, 'Equipment updated successfully', { equipment: populated });
});

/**
 * @desc    Delete equipment
 * @route   DELETE /api/equipment/:id
 * @access  Admin
 */
const deleteEquipment = asyncHandler(async (req, res, next) => {
  const equipment = await Equipment.findById(req.params.id);
  if (!equipment) return next(new AppError('Equipment not found', 404));

  // Check active bookings
  const activeBookings = await Booking.countDocuments({
    equipment: equipment._id,
    status: { $in: ['pending', 'approved', 'issued', 'overdue'] },
  });
  if (activeBookings > 0) {
    return next(
      new AppError(
        `Cannot delete. Equipment has ${activeBookings} active booking(s). Cancel or complete them first.`,
        400
      )
    );
  }

  await equipment.deleteOne();
  sendSuccess(res, 200, 'Equipment deleted successfully');
});


/**
 * @desc    Generate/refresh QR code for equipment
 * @route   POST /api/equipment/:id/qr
 * @access  Admin
 */
const generateQR = asyncHandler(async (req, res, next) => {
  const equipment = await Equipment.findById(req.params.id);
  if (!equipment) return next(new AppError('Equipment not found', 404));

  // Encode a frontend URL that opens equipment details (scannable by phone cameras)
  const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
  const equipmentUrl = `${clientUrl}/equipment/${equipment.equipmentId}`;
  const dataUrl = await QRCode.toDataURL(equipmentUrl, { width: 300, margin: 2, errorCorrectionLevel: 'M' });
  equipment.qrCode = dataUrl;
  await equipment.save();

  sendSuccess(res, 200, 'QR code generated', {
    qrCode: dataUrl,
    equipmentId: equipment.equipmentId,
    url: equipmentUrl,
  });
});

module.exports = {
  getEquipment,
  getEquipmentById,
  getAvailability,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  generateQR,
};
