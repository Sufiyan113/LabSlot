/**
 * Booking Controller
 */
const { Booking } = require('../models');
const bookingService = require('../services/bookingService');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');

/**
 * @desc    Create booking request
 * @route   POST /api/bookings
 * @access  Student
 */
const createBooking = asyncHandler(async (req, res) => {
  const { equipment, bookingDate, startTime, endTime, purpose } = req.body;

  if (!equipment || !bookingDate || !startTime || !endTime || !purpose) {
    throw new AppError('Equipment, date, start time, end time and purpose are required', 400);
  }

  const booking = await bookingService.createBooking({
    userId: req.user._id,
    equipmentId: equipment,
    bookingDate,
    startTime,
    endTime,
    purpose,
  });

  sendSuccess(res, 201, 'Booking request submitted successfully', { booking });
});

/**
 * @desc    Get bookings (role-filtered)
 * @route   GET /api/bookings
 * @access  Private
 */
const getBookings = asyncHandler(async (req, res) => {
  const { status, lab, equipment, from, to } = req.query;
  const filter = {};

  // Role-based scoping
  if (req.user.role === 'student') {
    filter.user = req.user._id;
  }
  // Assistant and admin see all (assistant could be scoped to assigned labs later)

  if (status) filter.status = status;
  if (lab) filter.lab = lab;
  if (equipment) filter.equipment = equipment;
  if (from || to) {
    filter.bookingDate = {};
    if (from) filter.bookingDate.$gte = new Date(from);
    if (to) filter.bookingDate.$lte = new Date(to);
  }

  const bookings = await Booking.find(filter)
    .populate('user', 'name email studentId department')
    .populate('equipment', 'name equipmentId status condition category')
    .populate('lab', 'name code building roomNumber')
    .populate('approvedBy', 'name email')
    .sort({ createdAt: -1 })
    .lean();

  sendSuccess(res, 200, 'Bookings retrieved successfully', { bookings });
});

/**
 * @desc    Get single booking
 * @route   GET /api/bookings/:id
 * @access  Private
 */
const getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('user', 'name email studentId department phone')
    .populate('equipment', 'name equipmentId status condition category manufacturer model')
    .populate('lab', 'name code building roomNumber')
    .populate('approvedBy', 'name email');

  if (!booking) throw new AppError('Booking not found', 404);

  // Students can only view their own
  if (req.user.role === 'student' && booking.user._id.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to view this booking', 403);
  }

  sendSuccess(res, 200, 'Booking retrieved successfully', { booking });
});

/**
 * @desc    Cancel booking
 * @route   PUT /api/bookings/:id/cancel
 * @access  Student (own) / Admin / Assistant
 */
const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.cancelBooking(
    req.params.id,
    req.user._id,
    req.user.role
  );
  sendSuccess(res, 200, 'Booking cancelled successfully', { booking });
});

/**
 * @desc    Approve booking
 * @route   PUT /api/bookings/:id/approve
 * @access  Assistant / Admin
 */
const approveBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.approveBooking(req.params.id, req.user._id);
  sendSuccess(res, 200, 'Booking approved successfully', { booking });
});

/**
 * @desc    Reject booking
 * @route   PUT /api/bookings/:id/reject
 * @access  Assistant / Admin
 */
const rejectBooking = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const booking = await bookingService.rejectBooking(req.params.id, req.user._id, reason);
  sendSuccess(res, 200, 'Booking rejected', { booking });
});

/**
 * @desc    Issue equipment
 * @route   PUT /api/bookings/:id/issue
 * @access  Assistant / Admin
 */
const issueBooking = asyncHandler(async (req, res) => {
  const { notes } = req.body;
  const booking = await bookingService.issueBooking(req.params.id, notes);
  sendSuccess(res, 200, 'Equipment issued successfully', { booking });
});

/**
 * @desc    Return equipment
 * @route   PUT /api/bookings/:id/return
 * @access  Assistant / Admin
 */
const returnBooking = asyncHandler(async (req, res) => {
  const { notes } = req.body;
  const booking = await bookingService.returnBooking(req.params.id, notes);
  sendSuccess(res, 200, 'Equipment returned successfully', { booking });
});

module.exports = {
  createBooking,
  getBookings,
  getBooking,
  cancelBooking,
  approveBooking,
  rejectBooking,
  issueBooking,
  returnBooking,
};
