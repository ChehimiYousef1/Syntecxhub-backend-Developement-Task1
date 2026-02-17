const AppError = require("../utils/AppError");

/**
 * Professional NotFound Middleware
 * Handles all unknown routes.
 * Works well with centralized error handler.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const notFound = (req, res, next) => {
  const { method, originalUrl } = req;

  // Create a developer-friendly error message
  const message = `[NOT FOUND] ${method} ${originalUrl} - This route does not exist`;

  // Optional: Log unknown route (for development / monitoring)
  if (process.env.NODE_ENV !== "production") {
    console.warn(message);
  }

  // Create AppError (custom error class)
  const error = new AppError(message, 404);

  // Pass to centralized error handler
  next(error);
};

module.exports = notFound;
