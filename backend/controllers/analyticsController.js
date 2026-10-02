const { User, Lab, Equipment, Booking, Maintenance } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

const getOverview = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalLabs,
    totalEquipment,
    activeBookings,
    pendingRequests,
    maintenanceItems,
    students,
    assistants,
  ] = await Promise.all([
    User.countDocuments(),
    Lab.countDocuments(),
    Equipment.countDocuments(),
    Booking.countDocuments({ status: { $in: ['approved', 'issued', 'overdue'] } }),
    Booking.countDocuments({ status: 'pending' }),
    Maintenance.countDocuments({ status: { $in: ['reported', 'in-progress'] } }),
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'assistant' }),
  ]);

  const equipmentByStatus = await Equipment.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  sendSuccess(res, 200, 'Overview analytics', {
    totalUsers,
    totalLabs,
    totalEquipment,
    activeBookings,
    pendingRequests,
    maintenanceItems,
    students,
    assistants,
    equipmentByStatus: equipmentByStatus.reduce((acc, i) => {
      acc[i._id] = i.count;
      return acc;
    }, {}),
  });
});

const getBookingAnalytics = asyncHandler(async (req, res) => {
  const byStatus = await Booking.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  // Last 6 months trend
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthly = await Booking.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const mostBooked = await Booking.aggregate([
    { $group: { _id: '$equipment', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
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
  ]);

  sendSuccess(res, 200, 'Booking analytics', {
    byStatus: byStatus.reduce((a, i) => ({ ...a, [i._id]: i.count }), {}),
    monthly: monthly.map((m) => ({
      year: m._id.year,
      month: m._id.month,
      count: m.count,
      label: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
    })),
    mostBooked,
  });
});

const getEquipmentAnalytics = asyncHandler(async (req, res) => {
  const byStatus = await Equipment.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const byCategory = await Equipment.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  const byCondition = await Equipment.aggregate([
    { $group: { _id: '$condition', count: { $sum: 1 } } },
  ]);

  sendSuccess(res, 200, 'Equipment analytics', {
    byStatus: byStatus.reduce((a, i) => ({ ...a, [i._id]: i.count }), {}),
    byCategory,
    byCondition: byCondition.reduce((a, i) => ({ ...a, [i._id]: i.count }), {}),
  });
});

const getLabAnalytics = asyncHandler(async (req, res) => {
  const labs = await Lab.find().select('name code').lean();
  const usage = await Promise.all(
    labs.map(async (lab) => {
      const eqCount = await Equipment.countDocuments({ lab: lab._id });
      const bookingCount = await Booking.countDocuments({ lab: lab._id });
      return { ...lab, equipmentCount: eqCount, bookingCount };
    })
  );
  sendSuccess(res, 200, 'Lab analytics', { labs: usage });
});

module.exports = {
  getOverview,
  getBookingAnalytics,
  getEquipmentAnalytics,
  getLabAnalytics,
};
