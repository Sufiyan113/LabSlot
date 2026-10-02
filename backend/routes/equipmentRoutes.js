const express = require('express');
const {
  getEquipment,
  getEquipmentById,
  getAvailability,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  generateQR,
} = require('../controllers/equipmentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getEquipment)
  .post(authorize('admin'), createEquipment);

router.get('/:id/availability', getAvailability);
router.post('/:id/qr', authorize('admin'), generateQR);

router.route('/:id')
  .get(getEquipmentById)
  .put(authorize('admin', 'assistant'), updateEquipment)
  .delete(authorize('admin'), deleteEquipment);

module.exports = router;
