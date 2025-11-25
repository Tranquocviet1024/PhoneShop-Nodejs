const permissionService = require('../services/permissionService');

/**
 * Middleware to automatically log audit trail
 * Wrap controller actions to capture before/after data
 */
const auditMiddleware = (action, entityType) => {
  return async (req, res, next) => {
    const originalJson = res.json;
    
    // Override res.json to capture response
    res.json = function(data) {
      // Only log successful operations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Extract entity information from response
        const responseData = data.data || data;
        let entityId = null;
        let entityName = null;
        
        // Try to extract entity info from different response structures
        if (responseData) {
          entityId = responseData.id || req.params.id || req.params.productId || req.params.orderId || req.params.userId;
          entityName = responseData.name || responseData.username || responseData.orderId || responseData.title;
        }

        // Get IP and User Agent
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.get('user-agent');

        // Log audit asynchronously (don't block response)
        setImmediate(async () => {
          try {
            await permissionService.logAudit(
              req.userId,
              action,
              entityType,
              entityId,
              entityName,
              req.oldValues || null,
              req.newValues || responseData,
              ipAddress,
              userAgent
            );
          } catch (error) {
            console.error('Error logging audit:', error);
          }
        });
      }

      // Call original json
      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Helper to capture old values before update/delete
 */
const captureOldValues = (Model) => {
  return async (req, res, next) => {
    try {
      const id = req.params.id || req.params.productId || req.params.orderId || req.params.userId;
      if (id) {
        const record = await Model.findByPk(id);
        if (record) {
          req.oldValues = record.toJSON();
        }
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Manual audit log helper for complex operations
 */
const logAudit = async (req, action, entityType, entityId, entityName, oldValues = null, newValues = null) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');

    await permissionService.logAudit(
      req.userId,
      action,
      entityType,
      entityId,
      entityName,
      oldValues,
      newValues,
      ipAddress,
      userAgent
    );
  } catch (error) {
    console.error('Error logging audit:', error);
  }
};

module.exports = {
  auditMiddleware,
  captureOldValues,
  logAudit
};
