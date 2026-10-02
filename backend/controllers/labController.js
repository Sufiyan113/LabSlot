/**
 * Lab Controller
 */
const { Lab, Equipment } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');

/**
 * @desc    Get all labs (with optional search & status filter)
 * @route   GET /api/labs
 * @access  Private
 */
const getLabs = asyncHandler(async (req, res) => {
  const { search, status, department } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (department) filter.department = new RegExp(department, 'i');
  if (search) {
    filter.$or = [
      { name: new RegExp(search, 'i') },
      { code: new RegExp(search, 'i') },
      { description: new RegExp(search, 'i') },
      { building: new RegExp(search, 'i') },
    ];
  }

  const labs = await Lab.find(filter)
    .populate('equipmentCount')
    .sort({ name: 1 })
    .lean();

  // Attach real equipment counts (virtual may not work with lean in all cases)
  const labsWithCount = await Promise.all(
    labs.map(async (lab) => {
      const count = await Equipment.countDocuments({ lab: lab._id });
      return { ...lab, equipmentCount: count };
    })
  );

  sendSuccess(res, 200, 'Labs retrieved successfully', { labs: labsWithCount });
});

/**
 * @desc    Get single lab by ID
 * @route   GET /api/labs/:id
 * @access  Private
 */
const getLab = asyncHandler(async (req, res, next) => {
  const lab = await Lab.findById(req.params.id).lean();
  if (!lab) return next(new AppError('Lab not found', 404));

  const equipmentCount = await Equipment.countDocuments({ lab: lab._id });
  const equipment = await Equipment.find({ lab: lab._id })
    .select('name equipmentId category status condition image')
    .sort({ name: 1 })
    .lean();

  sendSuccess(res, 200, 'Lab retrieved successfully', {
    lab: { ...lab, equipmentCount, equipment },
  });
});

/**
 * @desc    Create lab
 * @route   POST /api/labs
 * @access  Admin
 */
const createLab = asyncHandler(async (req, res, next) => {
  const { name, code, building, floor, roomNumber, department, description, capacity, status } =
    req.body;

  if (!name || !code || !building || !roomNumber || !department) {
    return next(new AppError('Name, code, building, room number and department are required', 400));
  }

  const existing = await Lab.findOne({ code: code.toUpperCase() });
  if (existing) return next(new AppError('Lab code already exists', 409));

  const lab = await Lab.create({
    name,
    code: code.toUpperCase(),
    building,
    floor,
    roomNumber,
    department,
    description,
    capacity,
    status: status || 'active',
  });

  sendSuccess(res, 201, 'Lab created successfully', { lab });
});

/**
 * @desc    Update lab
 * @route   PUT /api/labs/:id
 * @access  Admin
 */
const updateLab = asyncHandler(async (req, res, next) => {
  const lab = await Lab.findById(req.params.id);
  if (!lab) return next(new AppError('Lab not found', 404));

  const fields = [
    'name', 'code', 'building', 'floor', 'roomNumber',
    'department', 'description', 'capacity', 'status',
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) {
      lab[f] = f === 'code' ? req.body[f].toUpperCase() : req.body[f];
    }
  });

  await lab.save();
  sendSuccess(res, 200, 'Lab updated successfully', { lab });
});

/**
 * @desc    Delete lab
 * @route   DELETE /api/labs/:id
 * @access  Admin
 */
const deleteLab = asyncHandler(async (req, res, next) => {
  const lab = await Lab.findById(req.params.id);
  if (!lab) return next(new AppError('Lab not found', 404));

  const eqCount = await Equipment.countDocuments({ lab: lab._id });
  if (eqCount > 0) {
    return next(
      new AppError(
        `Cannot delete lab. It has ${eqCount} equipment item(s). Remove or reassign them first.`,
        400
      )
    );
  }

  await lab.deleteOne();
  sendSuccess(res, 200, 'Lab deleted successfully');
});

module.exports = { getLabs, getLab, createLab, updateLab, deleteLab };
