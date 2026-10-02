const express = require('express');
const {
  getMaintenance,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  completeMaintenance,
  getMaintenanceStats,
} = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// Stats before :id
router.get('/stats', authorize('assistant', 'admin'), getMaintenanceStats);

router
  .route('/')
  .get(getMaintenance)
  .post(createMaintenance);

router.get('/:id', getMaintenanceById);
router.put('/:id', authorize('assistant', 'admin'), updateMaintenance);
router.put('/:id/complete', authorize('assistant', 'admin'), completeMaintenance);

module.exports = router;
