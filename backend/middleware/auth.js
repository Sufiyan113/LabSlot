/**
 * Authentication & Authorization middleware.
 *
 * protect  – verifies JWT and attaches the user to req.user
 * authorize – restricts access to specific roles
 */
const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { User } = require('../models');

/**
 * Protect routes – user must be logged in with a valid token.
 * Expects header: Authorization: Bearer <token>
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Not authorized. Please log in.', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Load user (exclude password)
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new AppError('User belonging to this token no longer exists.', 401));
    }

    if (!user.isActive) {
      return next(new AppError('Your account has been deactivated. Contact admin.', 401));
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    // jwt.verify throws JsonWebTokenError or TokenExpiredError
    // These are already handled by the global errorHandler
    return next(new AppError('Not authorized. Token is invalid or expired.', 401));
  }
});

/**
 * Restrict route to specific roles.
 * Usage: authorize('admin') or authorize('assistant', 'admin')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Not authorized. Please log in.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Role '${req.user.role}' is not allowed to access this resource.`,
          403
        )
      );
    }

    next();
  };
};

module.exports = {
  protect,
  authorize,
};
