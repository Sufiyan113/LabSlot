/**
 * Health-check routes.
 * Used by developers, monitoring tools, and load balancers
 * to verify that the server and database are reachable.
 */
const express = require('express');
const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Basic liveness check
 * @access  Public
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const dbState = mongoose.connection.readyState;
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    const dbStatus =
      dbState === 1 ? 'connected' : dbState === 2 ? 'connecting' : 'disconnected';

    sendSuccess(res, 200, 'LabSlot API is running', {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: dbStatus,
      uptime: `${Math.floor(process.uptime())}s`,
    });
  })
);

module.exports = router;
