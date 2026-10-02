/**
 * Generate a signed JWT for a user.
 * Payload contains only the user id (and optionally role for convenience).
 * Secret and expiry come from environment variables.
 */
const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

module.exports = generateToken;
