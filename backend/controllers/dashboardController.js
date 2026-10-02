/**
 * Role-based dashboard statistics — all counts from MongoDB.
 * Routes are protected with protect + authorize(role).
 */
const { Booking, Equipment, Maintenance, Lab, User, Notification } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

/**
 * @desc    Student dashboard
 * @route   GET /api/dashboard/student
 * @access  Student
 */
const studentDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [active, pending, completed, upcoming, availableEq, recent, unread] = await Promise.all([
    Booking.countDocuments({ user: userId, status: { $in: ['approved', 'issued'] } }),
    Booking.countDocuments({ user: userId, status: 'pending' }),
    Booking.countDocuments({ user: userId, status: 'returned' }),
    Booking.find({
      user: userId,
      status: { $in: ['approved', 'issued', 'pending'] },
      startTime: { $gte: new Date() },
    })
      .populate('equipment', 'name equipmentId')
      .populate('lab', 'name code')
      .sort({ startTime: 1 })
      .limit(5)
      .lean(),
    Equipment.countDocuments({ status: 'available' }),
    Booking.find({ user: userId })
      .populate('equipment', 'name equipmentId')
      .sort({ updatedAt: -1 })
      .limit(5)
      .lean(),
    Notification.countDocuments({ user: userId, isRead: false }),
  ]);

  sendSuccess(res, 200, 'Student dashboard', {
    stats: {
      activeBookings: active,
      pendingRequests: pending,
      completed,
      availableEquipment: availableEq,
      unreadNotifications: unread,
    },
    upcoming,
    recentActivity: recent,
  });
});

/**
 * @desc    Assistant dashboard
 * @route   GET /api/dashboard/assistant
 * @access  Assistant
 */
const assistantDashboard = asyncHandler(async (req, res) => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [pendingCount, pendingList, todayBookings, issued, overdue, maintenance, criticalMaint, recent, criticalList] =
    await Promise.all([
      Booking.countDocuments({ status: 'pending' }),
      Booking.find({ status: 'pending' })
        .populate('user', 'name studentId email')
        .populate('equipment', 'name equipmentId')
        .populate('lab', 'name code')
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
      Booking.find({
        bookingDate: { $gte: todayStart, $lte: todayEnd },
        status: { $in: ['pending', 'approved', 'issued'] },
      })
        .populate('user', 'name studentId')
        .populate('equipment', 'name equipmentId')
        .sort({ startTime: 1 })
        .lean(),
      Booking.countDocuments({ status: 'issued' }),
      Booking.countDocuments({ status: 'overdue' }),
      Maintenance.countDocuments({ status: { $in: ['reported', 'in-progress'] } }),
      Maintenance.countDocuments({
        priority: 'critical',
        status: { $in: ['reported', 'in-progress'] },
      }),
      Booking.find()
        .populate('user', 'name')
        .populate('equipment', 'name equipmentId')
        .sort({ updatedAt: -1 })
        .limit(8)
        .lean(),
      Maintenance.find({
        status: { $in: ['reported', 'in-progress'] },
      })
        .populate('equipment', 'name equipmentId status')
        .sort({ priority: -1, createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

  // Issued list for quick return actions
  const issuedList = await Booking.find({ status: { $in: ['issued', 'overdue'] } })
    .populate('user', 'name studentId')
    .populate('equipment', 'name equipmentId')
    .sort({ issuedAt: -1 })
    .limit(8)
    .lean();

  sendSuccess(res, 200, 'Assistant dashboard', {
    stats: {
      pendingRequests: pendingCount,
      todayBookings: todayBookings.length,
      issued,
      overdue,
      maintenanceItems: maintenance,
      criticalMaintenance: criticalMaint,
    },
    pendingList,
    todayBookings,
    issuedList,
    maintenanceAlerts: criticalList,
    recentActivity: recent,
  });
});

/**
 * @desc    Admin dashboard
 * @route   GET /api/dashboard/admin
 * @access  Admin
 */
const adminDashboard = asyncHandler(async (req, res) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [
    totalUsers,
    totalStudents,
    totalAssistants,
    totalLabs,
    totalEquipment,
    activeBookings,
    pendingRequests,
    maintenanceItems,
    criticalMaintenance,
    completedMaintenance,
    equipmentByStatus,
    recentBookings,
    monthly,
    mostBooked,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'assistant' }),
    Lab.countDocuments(),
    Equipment.countDocuments(),
    Booking.countDocuments({ status: { $in: ['approved', 'issued', 'overdue'] } }),
    Booking.countDocuments({ status: 'pending' }),
    Maintenance.countDocuments({ status: { $in: ['reported', 'in-progress'] } }),
    Maintenance.countDocuments({
      priority: 'critical',
      status: { $in: ['reported', 'in-progress'] },
    }),
    Maintenance.countDocuments({ status: 'completed' }),
    Equipment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Booking.find()
      .populate('user', 'name')
      .populate('equipment', 'name equipmentId')
      .sort({ createdAt: -1 })
      .limit(8)
      .lean(),
    Booking.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    Booking.aggregate([
      { $group: { _id: '$equipment', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'equipment',
          localField: '_id',
          foreignField: '_id',
          as: 'eq',
        },
      },
      { $unwind: { path: '$eq', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          count: 1,
          name: '$eq.name',
          equipmentId: '$eq.equipmentId',
        },
      },
    ]),
  ]);

  // Lab utilization
  const labs = await Lab.find().select('name code').lean();
  const labUtilization = await Promise.all(
    labs.map(async (lab) => {
      const equipmentCount = await Equipment.countDocuments({ lab: lab._id });
      const bookingCount = await Booking.countDocuments({ lab: lab._id });
      return {
        _id: lab._id,
        name: lab.name,
        code: lab.code,
        equipmentCount,
        bookingCount,
      };
    })
  );

  sendSuccess(res, 200, 'Admin dashboard', {
    stats: {
      totalUsers,
      totalStudents,
      totalAssistants,
      totalLabs,
      totalEquipment,
      activeBookings,
      pendingRequests,
      maintenanceItems,
      criticalMaintenance,
      completedMaintenance,
    },
    equipmentByStatus: equipmentByStatus.reduce((a, i) => {
      a[i._id] = i.count;
      return a;
    }, {}),
    monthly: monthly.map((m) => ({
      year: m._id.year,
      month: m._id.month,
      count: m.count,
      label: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
    })),
    mostBooked,
    labUtilization,
    recentBookings,
  });
});

module.exports = { studentDashboard, assistantDashboard, adminDashboard };
