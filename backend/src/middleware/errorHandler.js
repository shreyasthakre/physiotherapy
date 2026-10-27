import config from '../config/index.js';
import logger from '../utils/logger.js';
import ApiError from '../utils/ApiError.js';

/** 404 handler for unmatched routes. */
export const notFoundHandler = (req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

/** Central error-handling middleware. Must have 4 args. */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let details = err.details;

  // Map common PostgreSQL error codes to friendly responses.
  if (err.code === '23505') {
    statusCode = 409;
    message = 'A record with these details already exists';
  } else if (err.code === '23503') {
    statusCode = 400;
    message = 'Referenced record does not exist';
  } else if (err.code === '22P02') {
    statusCode = 400;
    message = 'Invalid input syntax';
  }

  if (statusCode >= 500) {
    logger.error(err.stack || err.message);
  }

  res.status(statusCode).json({
    error: {
      message,
      ...(details ? { details } : {}),
      ...(config.isProd ? {} : { stack: err.stack }),
    },
  });
};
