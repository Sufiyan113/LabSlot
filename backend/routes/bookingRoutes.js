const express = require('express');
const {
  createBooking,
  getBookings,
  getBooking,
  cancelBooking,
  approveBooking,
  rejectBooking,
  issueBooking,
  returnBooking,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getBookings)
  .post(authorize('student'), createBooking);

router.get('/:id', getBooking);

router.put('/:id/cancel', cancelBooking); // student own + admin/assistant

router.put('/:id/approve', authorize('assistant', 'admin'), approveBooking);
router.put('/:id/reject', authorize('assistant', 'admin'), rejectBooking);
router.put('/:id/issue', authorize('assistant', 'admin'), issueBooking);
router.put('/:id/return', authorize('assistant', 'admin'), returnBooking);

module.exports = router;
