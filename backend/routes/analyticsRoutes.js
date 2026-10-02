const express = require('express');
const {
  getOverview, getBookingAnalytics, getEquipmentAnalytics, getLabAnalytics,
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect);
router.use(authorize('admin'));

router.get('/overview', getOverview);
router.get('/bookings', getBookingAnalytics);
router.get('/equipment', getEquipmentAnalytics);
router.get('/labs', getLabAnalytics);

module.exports = router;
