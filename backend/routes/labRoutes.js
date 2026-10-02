const express = require('express');
const {
  getLabs, getLab, createLab, updateLab, deleteLab,
} = require('../controllers/labController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // all lab routes require login

router.route('/')
  .get(getLabs)
  .post(authorize('admin'), createLab);

router.route('/:id')
  .get(getLab)
  .put(authorize('admin'), updateLab)
  .delete(authorize('admin'), deleteLab);

module.exports = router;
