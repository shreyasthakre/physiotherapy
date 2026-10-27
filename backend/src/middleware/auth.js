import ApiError from '../utils/ApiError.js';
import { verifyToken } from '../utils/jwt.js';

/**
 * Authenticate a request via the `Authorization: Bearer <token>` header.
 * Attaches the decoded payload to `req.user`.
 */
export const authenticate = (req, _res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(ApiError.unauthorized('Missing or malformed Authorization header'));
  }

  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.sub,
      role: payload.role,
      email: payload.email,
      fullName: payload.fullName,
    };
    return next();
  } catch {
    return next(ApiError.unauthorized('Invalid or expired token'));
  }
};

/**
 * Restrict a route to one or more roles. Must run after `authenticate`.
 * Usage: authorize('admin'), authorize('admin', 'physiotherapist')
 */
export const authorize = (...roles) => (req, _res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (!roles.includes(req.user.role)) {
    return next(ApiError.forbidden('You do not have access to this resource'));
  }
  return next();
};

/**
 * Attach the user if a valid token is present, but never reject.
 * Useful for endpoints that behave differently for logged-in users.
 */
export const optionalAuth = (req, _res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme === 'Bearer' && token) {
    try {
      const payload = verifyToken(token);
      req.user = {
        id: payload.sub,
        role: payload.role,
        email: payload.email,
        fullName: payload.fullName,
      };
    } catch {
      /* ignore invalid token for optional auth */
    }
  }
  return next();
};
