/**
 * Global error-handling middleware.
 * Must be registered LAST in the Express middleware chain.
 *
 * Handles:
 * - AppError (operational errors we throw ourselves)
 * - Mongoose validation errors
 * - Mongoose CastError (invalid ObjectId)
 * - Duplicate key errors (E11000)
 * - JWT errors (prepared for Phase 4)
 * - Unexpected errors (never leak stack traces in production)
 */
const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.name = err.name;

  // Log full error in development for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  // ----- Mongoose bad ObjectId -----
  if (err.name === 'CastError') {
    const message = `Resource not found with id: ${err.value}`;
    error = new AppError(message, 404);
  }

  // ----- Mongoose duplicate key -----
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `Duplicate value for ${field}. Please use another value.`;
    error = new AppError(message, 409);
  }

  // ----- Mongoose validation error -----
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors || {}).map((e) => e.message);
    const message = messages.join('. ') || 'Validation failed';
    error = new AppError(message, 400);
  }

  // ----- JWT errors (ready for Phase 4) -----
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token. Please log in again.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    error = new AppError('Your token has expired. Please log in again.', 401);
  }

  const statusCode = error.statusCode || 500;
  const message =
    error.isOperational || process.env.NODE_ENV === 'development'
      ? error.message || 'Server Error'
      : 'Something went wrong. Please try again later.';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      // Extra debug info only in development
      error: err.message,
      stack: err.stack,
    }),
  });
};

module.exports = errorHandler;
