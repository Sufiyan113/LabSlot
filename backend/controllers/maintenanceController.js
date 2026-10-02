/**
 * Maintenance Controller
 * Lifecycle: reported → in-progress → completed
 * On create: equipment.status → maintenance (or damaged if priority critical + body.markDamaged)
 * On complete: equipment.status → available (unless retired)
 */
const { Maintenance, Equipment, Notification } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');

/**
 * @desc    List maintenance records
 * @route   GET /api/maintenance
 * @access  Private (students: own reports only; assistant/admin: all, filterable)
 */
const getMaintenance = asyncHandler(async (req, res) => {
  const { status, priority, equipment } = req.query;
  const filter = {};

  if (req.user.role === 'student') {
    filter.reportedBy = req.user._id;
  }
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (equipment) filter.equipment = equipment;

  const records = await Maintenance.find(filter)
    .populate('equipment', 'name equipmentId status lab condition')
    .populate('reportedBy', 'name email role')
    .populate('assignedTo', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  sendSuccess(res, 200, 'Maintenance records retrieved', { maintenance: records });
});

/**
 * @desc    Get single maintenance record
 * @route   GET /api/maintenance/:id
 * @access  Private
 */
const getMaintenanceById = asyncHandler(async (req, res) => {
  const record = await Maintenance.findById(req.params.id)
    .populate('equipment', 'name equipmentId status condition lab')
    .populate('reportedBy', 'name email role')
    .populate('assignedTo', 'name email');

  if (!record) throw new AppError('Maintenance record not found', 404);

  if (
    req.user.role === 'student' &&
    record.reportedBy._id.toString() !== req.user._id.toString()
  ) {
    throw new AppError('Not authorized to view this record', 403);
  }

  sendSuccess(res, 200, 'Maintenance retrieved', { maintenance: record });
});

/**
 * @desc    Report equipment problem
 * @route   POST /api/maintenance
 * @access  Private (any authenticated user)
 */
const createMaintenance = asyncHandler(async (req, res) => {
  const { equipment, issue, description, priority, markDamaged } = req.body;

  if (!equipment || !issue || !description) {
    throw new AppError('Equipment, issue and description are required', 400);
  }

  const eq = await Equipment.findById(equipment);
  if (!eq) throw new AppError('Equipment not found', 404);

  if (eq.status === 'retired') {
    throw new AppError('Cannot report issues on retired equipment', 400);
  }

  const record = await Maintenance.create({
    equipment,
    reportedBy: req.user._id,
    issue: issue.trim(),
    description: description.trim(),
    priority: priority || 'medium',
    status: 'reported',
  });

  // Equipment lifecycle: damaged or maintenance
  if (markDamaged === true || priority === 'critical') {
    eq.status = 'damaged';
  } else {
    eq.status = 'maintenance';
  }
  await eq.save();

  await Notification.create({
    user: req.user._id,
    title: 'Maintenance reported',
    message: `Issue reported for ${eq.name}: ${issue}`,
    type: 'maintenance_reported',
    relatedId: record._id,
    relatedModel: 'Maintenance',
  });

  const populated = await Maintenance.findById(record._id)
    .populate('equipment', 'name equipmentId status')
    .populate('reportedBy', 'name email');

  sendSuccess(res, 201, 'Maintenance record created', { maintenance: populated });
});

/**
 * @desc    Update maintenance (status, assign, priority, notes)
 * @route   PUT /api/maintenance/:id
 * @access  Assistant, Admin
 */
const updateMaintenance = asyncHandler(async (req, res) => {
  const record = await Maintenance.findById(req.params.id);
  if (!record) throw new AppError('Maintenance record not found', 404);
  if (record.status === 'completed') {
    throw new AppError('Cannot update a completed maintenance record', 400);
  }

  const { status, priority, assignedTo, resolutionNotes } = req.body;

  if (priority) record.priority = priority;
  if (assignedTo !== undefined) record.assignedTo = assignedTo || null;
  if (resolutionNotes !== undefined) record.resolutionNotes = resolutionNotes;

  if (status && status !== record.status) {
    if (status === 'in-progress') {
      record.status = 'in-progress';
      if (!record.startedAt) record.startedAt = new Date();
      if (!record.assignedTo) record.assignedTo = req.user._id;
      // Keep equipment under maintenance
      await Equipment.findByIdAndUpdate(record.equipment, { status: 'maintenance' });
    } else if (status === 'completed') {
      record.status = 'completed';
      record.completedAt = new Date();
      if (!record.assignedTo) record.assignedTo = req.user._id;
      await Equipment.findByIdAndUpdate(record.equipment, { status: 'available' });
      await Notification.create({
        user: record.reportedBy,
        title: 'Maintenance completed',
        message: `Maintenance completed: ${record.issue}`,
        type: 'maintenance_updated',
        relatedId: record._id,
        relatedModel: 'Maintenance',
      });
    } else if (status === 'reported') {
      record.status = 'reported';
    } else {
      throw new AppError(`Invalid status transition to "${status}"`, 400);
    }
  }

  await record.save();

  const populated = await Maintenance.findById(record._id)
    .populate('equipment', 'name equipmentId status')
    .populate('reportedBy', 'name email')
    .populate('assignedTo', 'name email');

  sendSuccess(res, 200, 'Maintenance updated', { maintenance: populated });
});

/**
 * @desc    Complete maintenance
 * @route   PUT /api/maintenance/:id/complete
 * @access  Assistant, Admin
 */
const completeMaintenance = asyncHandler(async (req, res) => {
  const record = await Maintenance.findById(req.params.id);
  if (!record) throw new AppError('Maintenance record not found', 404);
  if (record.status === 'completed') throw new AppError('Already completed', 400);

  record.status = 'completed';
  record.completedAt = new Date();
  if (req.body.resolutionNotes) record.resolutionNotes = req.body.resolutionNotes;
  if (!record.assignedTo) record.assignedTo = req.user._id;
  if (!record.startedAt) record.startedAt = record.createdAt;
  await record.save();

  // Free equipment (do not override retired)
  const eq = await Equipment.findById(record.equipment);
  if (eq && eq.status !== 'retired') {
    eq.status = 'available';
    await eq.save();
  }

  await Notification.create({
    user: record.reportedBy,
    title: 'Maintenance completed',
    message: `Maintenance completed: ${record.issue}`,
    type: 'maintenance_updated',
    relatedId: record._id,
    relatedModel: 'Maintenance',
  });

  const populated = await Maintenance.findById(record._id)
    .populate('equipment', 'name equipmentId status')
    .populate('reportedBy', 'name email')
    .populate('assignedTo', 'name email');

  sendSuccess(res, 200, 'Maintenance completed', { maintenance: populated });
});

/**
 * @desc    Maintenance stats for dashboards
 * @route   GET /api/maintenance/stats
 * @access  Assistant, Admin
 */
const getMaintenanceStats = asyncHandler(async (req, res) => {
  const [total, reported, inProgress, completed, critical] = await Promise.all([
    Maintenance.countDocuments(),
    Maintenance.countDocuments({ status: 'reported' }),
    Maintenance.countDocuments({ status: 'in-progress' }),
    Maintenance.countDocuments({ status: 'completed' }),
    Maintenance.countDocuments({
      priority: 'critical',
      status: { $in: ['reported', 'in-progress'] },
    }),
  ]);

  const active = reported + inProgress;

  sendSuccess(res, 200, 'Maintenance stats', {
    stats: { total, reported, inProgress, completed, active, critical },
  });
});

module.exports = {
  getMaintenance,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  completeMaintenance,
  getMaintenanceStats,
};
