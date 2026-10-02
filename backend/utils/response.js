/**
 * Consistent API response helpers.
 *
 * Success shape:
 * {
 *   success: true,
 *   message: "...",
 *   data: { ... } | [ ... ]
 * }
 *
 * Error shape:
 * {
 *   success: false,
 *   message: "...",
 *   errors: [ ... ]   // optional validation details
 * }
 */

/**
 * Send a successful response.
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status (default 200)
 * @param {string} message - Human-readable message
 * @param {*} data - Payload (object, array, or null)
 */
const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
  const payload = {
    success: true,
    message,
  };

  if (data !== null && data !== undefined) {
    payload.data = data;
  }

  return res.status(statusCode).json(payload);
};

/**
 * Send an error response.
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status (default 500)
 * @param {string} message - Human-readable error message
 * @param {*} errors - Optional extra error details (validation array, etc.)
 */
const sendError = (res, statusCode = 500, message = 'Server Error', errors = null) => {
  const payload = {
    success: false,
    message,
  };

  if (errors !== null && errors !== undefined) {
    payload.errors = errors;
  }

  return res.status(statusCode).json(payload);
};

module.exports = {
  sendSuccess,
  sendError,
};
