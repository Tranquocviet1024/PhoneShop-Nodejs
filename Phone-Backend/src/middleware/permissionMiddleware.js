const { ApiError } = require('../utils/apiResponse');
const permissionService = require('../services/permissionService');

/**
 * Middleware to check if user has specific permission
 * Usage: app.post('/api/products', requirePermission('create_product'), createProduct)
 */
exports.requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.userId) {
        return next(new ApiError(401, 'Access token is required'));
      }

      const hasPermission = await permissionService.hasPermission(req.userId, permission);

      if (!hasPermission) {
        return next(new ApiError(403, `Permission denied. Required: ${permission}`));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user has any of multiple permissions
 */
exports.requireAnyPermission = (permissions) => {
  return async (req, res, next) => {
    try {
      if (!req.userId) {
        return next(new ApiError(401, 'Access token is required'));
      }

      const hasPermission = await permissionService.hasAnyPermission(req.userId, permissions);

      if (!hasPermission) {
        return next(new ApiError(403, `Permission denied. Required one of: ${permissions.join(', ')}`));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user has all permissions
 */
exports.requireAllPermissions = (permissions) => {
  return async (req, res, next) => {
    try {
      if (!req.userId) {
        return next(new ApiError(401, 'Access token is required'));
      }

      const hasPermission = await permissionService.hasAllPermissions(req.userId, permissions);

      if (!hasPermission) {
        return next(new ApiError(403, `Permission denied. Required all of: ${permissions.join(', ')}`));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to automatically log audit trail
 */
exports.auditLog = (entityType) => {
  return async (req, res, next) => {
    // Store original request body for audit purposes
    req.oldValues = null;
    req.auditEntityType = entityType;

    // Intercept res.json to log audit after response is sent
    const originalJson = res.json;
    res.json = function(data) {
      // Log audit asynchronously
      if (req.userId && req.method !== 'GET') {
        const action = getActionFromMethod(req.method);
        const entityId = req.params.id || (data.data && data.data.id) || 0;
        
        permissionService.logAudit(
          req.userId,
          action,
          entityType,
          entityId,
          req.body.name || data.data?.name || '',
          req.oldValues,
          req.body || data.data,
          req.ip,
          req.headers['user-agent']
        ).catch(err => console.error('Audit log error:', err));
      }

      return originalJson.call(this, data);
    };

    next();
  };
};

function getActionFromMethod(method) {
  const actions = {
    'POST': 'CREATE',
    'PUT': 'UPDATE',
    'DELETE': 'DELETE',
    'GET': 'VIEW'
  };
  return actions[method] || 'VIEW';
}
