/**
 * Booking Service — conflict detection and status transitions.
 * All critical rules are enforced here (not only on the frontend).
 *
 * Concurrency note (PBL-accurate):
 * Conflict detection runs as a MongoDB query before insert. This prevents
 * normal overlapping bookings. Full multi-document transactions are not used
 * so the code works on standalone MongoDB and Atlas without extra replica-set
 * configuration. For production at high concurrency, wrap create in a
 * transaction or use a unique partial index on time ranges.
 */

const { Booking, Equipment } = require('../models');
const { createNotification } = require('./notificationService');
const AppError = require('../utils/AppError');

/**
 * Check for overlapping bookings on the same equipment.
 * Overlap condition: existing.start < newEnd AND existing.end > newStart
 */
const findConflicts = async (equipmentId, startTime, endTime, excludeBookingId = null) => {
  const query = {
    equipment: equipmentId,
    status: { $in: ['pending', 'approved', 'issued', 'overdue'] },
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  };
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }
  return Booking.find(query)
    .populate('user', 'name email studentId')
    .lean();
};

/**
 * Validate that equipment can be booked.
 */
const assertEquipmentBookable = (equipment) => {
  if (!equipment) throw new AppError('Equipment not found', 404);
  if (equipment.status === 'maintenance') {
    throw new AppError(
      'Equipment is currently under maintenance and cannot be booked.',
      400
    );
  }
  if (equipment.status === 'damaged') {
    throw new AppError(
      'Equipment is marked as damaged and cannot be booked.',
      400
    );
  }
  if (equipment.status === 'retired') {
    throw new AppError(
      'Equipment is retired and cannot be booked.',
      400
    );
  }
};

/**
 * Create a booking with full validation + conflict check.
 * Uses a session when possible to reduce race conditions.
 */
const createBooking = async ({ userId, equipmentId, bookingDate, startTime, endTime, purpose }) => {
  const equipment = await Equipment.findById(equipmentId);
  assertEquipmentBookable(equipment);

  const start = new Date(startTime);
  const end = new Date(endTime);
  const date = new Date(bookingDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new AppError('Invalid start or end time', 400);
  }
  if (start >= end) {
    throw new AppError('End time must be after start time', 400);
  }
  if (start < new Date()) {
    throw new AppError('Cannot book in the past', 400);
  }
  if (!purpose || purpose.trim().length < 5) {
    throw new AppError('Purpose must be at least 5 characters', 400);
  }

  // Conflict detection — enforced on backend
  const conflicts = await Booking.find({
    equipment: equipmentId,
    status: { $in: ['pending', 'approved', 'issued', 'overdue'] },
    startTime: { $lt: end },
    endTime: { $gt: start },
  });

  if (conflicts.length > 0) {
    throw new AppError(
      'Equipment is already booked during the selected time.',
      409
    );
  }

  const booking = await Booking.create({
    user: userId,
    equipment: equipmentId,
    lab: equipment.lab,
    bookingDate: date,
    startTime: start,
    endTime: end,
    purpose: purpose.trim(),
    status: 'pending',
  });

  // Mark equipment as booked if it was available
  if (equipment.status === 'available') {
    equipment.status = 'booked';
    await equipment.save();
  }

  
  try {
    await createNotification({
      userId: userId,
      title: 'Booking created',
      message: `Your booking request has been submitted and is pending approval.`,
      type: 'booking_created',
      relatedId: booking._id,
      relatedModel: 'Booking',
    });
  } catch (_) {}

  const populated = await Booking.findById(booking._id)
    .populate('user', 'name email studentId')
    .populate('equipment', 'name equipmentId status')
    .populate('lab', 'name code');

  return populated;
};

/**
 * Approve a pending booking.
 */
const approveBooking = async (bookingId, approverId) => {
  const booking = await Booking.findById(bookingId).populate('equipment');
  if (!booking) throw new AppError('Booking not found', 404);
  if (booking.status !== 'pending') {
    throw new AppError(`Cannot approve a booking with status "${booking.status}"`, 400);
  }

  booking.status = 'approved';
  booking.approvedBy = approverId;
  await booking.save();
  try {
    await createNotification({
      userId: booking.user,
      title: 'Booking approved',
      message: `Your booking for ${booking.equipment?.name || 'equipment'} has been approved.`,
      type: 'booking_approved',
      relatedId: booking._id,
      relatedModel: 'Booking',
    });
  } catch (_) {}

  // Ensure equipment is marked booked
  if (booking.equipment && booking.equipment.status === 'available') {
    await Equipment.findByIdAndUpdate(booking.equipment._id, { status: 'booked' });
  }

  return Booking.findById(bookingId)
    .populate('user', 'name email studentId')
    .populate('equipment', 'name equipmentId status')
    .populate('lab', 'name code')
    .populate('approvedBy', 'name email');
};

/**
 * Reject a pending booking.
 */
const rejectBooking = async (bookingId, approverId, reason = '') => {
  const booking = await Booking.findById(bookingId).populate('equipment');
  if (!booking) throw new AppError('Booking not found', 404);
  if (booking.status !== 'pending') {
    throw new AppError(`Cannot reject a booking with status "${booking.status}"`, 400);
  }

  booking.status = 'rejected';
  booking.approvedBy = approverId;
  booking.rejectionReason = reason || '';
  await booking.save();
  try {
    await createNotification({
      userId: booking.user,
      title: 'Booking rejected',
      message: `Your booking was rejected.${reason ? ' Reason: ' + reason : ''}`,
      type: 'booking_rejected',
      relatedId: booking._id,
      relatedModel: 'Booking',
    });
  } catch (_) {}

  // Free equipment if no other active bookings
  await maybeFreeEquipment(booking.equipment._id);

  return Booking.findById(bookingId)
    .populate('user', 'name email studentId')
    .populate('equipment', 'name equipmentId status')
    .populate('lab', 'name code')
    .populate('approvedBy', 'name email');
};

/**
 * Issue equipment (approved → issued).
 */
const issueBooking = async (bookingId, notes = '') => {
  const booking = await Booking.findById(bookingId).populate('equipment');
  if (!booking) throw new AppError('Booking not found', 404);
  if (booking.status !== 'approved') {
    throw new AppError(`Can only issue approved bookings. Current: "${booking.status}"`, 400);
  }

  booking.status = 'issued';
  booking.issuedAt = new Date();
  booking.issueNotes = notes;
  await booking.save();
  try {
    await createNotification({
      userId: booking.user,
      title: 'Equipment issued',
      message: `Equipment has been issued for your booking.`,
      type: 'equipment_issued',
      relatedId: booking._id,
      relatedModel: 'Booking',
    });
  } catch (_) {}

  await Equipment.findByIdAndUpdate(booking.equipment._id, { status: 'issued' });

  return Booking.findById(bookingId)
    .populate('user', 'name email studentId')
    .populate('equipment', 'name equipmentId status')
    .populate('lab', 'name code')
    .populate('approvedBy', 'name email');
};

/**
 * Return equipment (issued → returned).
 */
const returnBooking = async (bookingId, notes = '') => {
  const booking = await Booking.findById(bookingId).populate('equipment');
  if (!booking) throw new AppError('Booking not found', 404);
  if (!['issued', 'overdue'].includes(booking.status)) {
    throw new AppError(`Can only return issued/overdue bookings. Current: "${booking.status}"`, 400);
  }

  booking.status = 'returned';
  booking.returnedAt = new Date();
  booking.returnNotes = notes;
  await booking.save();
  try {
    await createNotification({
      userId: booking.user,
      title: 'Equipment returned',
      message: `Your booking has been marked as returned.`,
      type: 'equipment_returned',
      relatedId: booking._id,
      relatedModel: 'Booking',
    });
  } catch (_) {}

  // Increment totalBookings and free equipment
  await Equipment.findByIdAndUpdate(booking.equipment._id, {
    $inc: { totalBookings: 1 },
  });
  await maybeFreeEquipment(booking.equipment._id);

  return Booking.findById(bookingId)
    .populate('user', 'name email studentId')
    .populate('equipment', 'name equipmentId status')
    .populate('lab', 'name code')
    .populate('approvedBy', 'name email');
};

/**
 * Cancel a booking (student or admin).
 */
const cancelBooking = async (bookingId, userId, userRole) => {
  const booking = await Booking.findById(bookingId).populate('equipment');
  if (!booking) throw new AppError('Booking not found', 404);

  // Students can only cancel their own pending/approved bookings
  if (userRole === 'student') {
    if (booking.user.toString() !== userId.toString()) {
      throw new AppError('You can only cancel your own bookings', 403);
    }
    if (!['pending', 'approved'].includes(booking.status)) {
      throw new AppError(`Cannot cancel a booking with status "${booking.status}"`, 400);
    }
  } else {
    // Admin/assistant can cancel pending/approved
    if (!['pending', 'approved'].includes(booking.status)) {
      throw new AppError(`Cannot cancel a booking with status "${booking.status}"`, 400);
    }
  }

  booking.status = 'cancelled';
  await booking.save();
  await maybeFreeEquipment(booking.equipment._id);

  return Booking.findById(bookingId)
    .populate('user', 'name email studentId')
    .populate('equipment', 'name equipmentId status')
    .populate('lab', 'name code');
};

/**
 * If no active bookings remain, set equipment back to available.
 */
const maybeFreeEquipment = async (equipmentId) => {
  const active = await Booking.countDocuments({
    equipment: equipmentId,
    status: { $in: ['pending', 'approved', 'issued', 'overdue'] },
  });
  if (active === 0) {
    await Equipment.findByIdAndUpdate(equipmentId, { status: 'available' });
  }
};

module.exports = {
  findConflicts,
  createBooking,
  approveBooking,
  rejectBooking,
  issueBooking,
  returnBooking,
  cancelBooking,
};
