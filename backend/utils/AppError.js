/**
 * Custom operational error class.
 * Use this for expected errors (validation, not-found, conflict, forbidden, etc.)
 * so the global error handler can distinguish them from unexpected programming errors.
 *
 * Example:
 *   throw new AppError('Equipment not found', 404);
 *   throw new AppError('Equipment is already booked during this time', 409);
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // marks this as a trusted, expected error

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
