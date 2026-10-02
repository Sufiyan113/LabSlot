/**
 * Temporary test routes for verifying authentication & authorization.
 * These routes exist only to make Phase 4 testing easy.
 * They can be removed or kept for development.
 */
const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { sendSuccess } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// Any logged-in user
router.get(
  '/student-or-higher',
  protect,
  asyncHandler(async (req, res) => {
    sendSuccess(res, 200, 'Access granted (any authenticated user)', {
      user: { id: req.user._id, name: req.user.name, role: req.user.role },
    });
  })
);

// Assistant or Admin only
router.get(
  '/assistant-only',
  protect,
  authorize('assistant', 'admin'),
  asyncHandler(async (req, res) => {
    sendSuccess(res, 200, 'Access granted (assistant or admin)', {
      user: { id: req.user._id, name: req.user.name, role: req.user.role },
    });
  })
);

// Admin only
router.get(
  '/admin-only',
  protect,
  authorize('admin'),
  asyncHandler(async (req, res) => {
    sendSuccess(res, 200, 'Access granted (admin only)', {
      user: { id: req.user._id, name: req.user.name, role: req.user.role },
    });
  })
);

module.exports = router;
