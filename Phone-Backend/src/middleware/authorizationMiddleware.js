const { ApiError } = require('../utils/apiResponse');
const RoleEnum = require('../enums/RoleEnum');

/**
 * Middleware to authorize users based on roles
 * Usage: authorizeRole([RoleEnum.ADMIN])
 */
const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Get user from request (set by authenticateToken middleware)
      const user = req.user;

      if (!user) {
        return next(new ApiError(401, 'Unauthorized - No user found'));
      }

      // Check if user role is in allowed roles
      if (!allowedRoles.includes(user.role)) {
        return next(new ApiError(403, 'Forbidden - Insufficient role to access this resource'));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to authorize users based on permissions
 * Usage: authorizePermission(['write_products', 'delete_products'])
 */
const authorizePermission = (allowedPermissions) => {
  return (req, res, next) => {
    try {
      // Get user from request (set by authenticateToken middleware)
      const user = req.user;

      if (!user) {
        return next(new ApiError(401, 'Unauthorized - No user found'));
      }

      // Parse permissions if they're in string format
      const userPermissions = typeof user.permissions === 'string'
        ? JSON.parse(user.permissions)
        : user.permissions || [];

      // Check if user has at least one of the allowed permissions
      const hasPermission = allowedPermissions.some(perm => 
        userPermissions.includes(perm)
      );

      if (!hasPermission) {
        return next(new ApiError(403, 'Forbidden - You do not have the required permissions'));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  authorizeRole,
  authorizePermission,
};
