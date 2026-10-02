/**
 * 404 Not Found middleware.
 * Placed after all valid routes. Any request that reaches here
 * has no matching route, so we create a clean 404 response.
 */
const AppError = require('../utils/AppError');

const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};

module.exports = notFound;
