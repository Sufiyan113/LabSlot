const express = require('express');
const { studentDashboard, assistantDashboard, adminDashboard } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/student', authorize('student'), studentDashboard);
router.get('/assistant', authorize('assistant'), assistantDashboard);
router.get('/admin', authorize('admin'), adminDashboard);

module.exports = router;
