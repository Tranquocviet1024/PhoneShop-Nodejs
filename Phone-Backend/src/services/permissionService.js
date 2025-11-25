const User = require('../models/User');
const Role = require('../models/Role');
const UserRole = require('../models/UserRole');
const AuditLog = require('../models/AuditLog');

/**
 * Get all permissions for a user
 * Combines: role permissions + additional permissions - denied permissions
 */
exports.getUserPermissions = async (userId) => {
  try {
    const userRoles = await UserRole.findAll({
      where: { userId },
      include: [
        {
          model: Role,
          attributes: ['permissions']
        }
      ]
    });

    if (!userRoles || userRoles.length === 0) {
      return [];
    }

    // Collect all permissions
    let permissions = new Set();
    let deniedPermissions = new Set();

    for (const userRole of userRoles) {
      // Add role permissions
      if (userRole.Role && userRole.Role.permissions) {
        userRole.Role.permissions.forEach(p => permissions.add(p));
      }

      // Add additional permissions
      if (userRole.additionalPermissions) {
        userRole.additionalPermissions.forEach(p => permissions.add(p));
      }

      // Mark denied permissions
      if (userRole.deniedPermissions) {
        userRole.deniedPermissions.forEach(p => deniedPermissions.add(p));
      }
    }

    // Remove denied permissions
    deniedPermissions.forEach(p => permissions.delete(p));

    return Array.from(permissions);
  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
};

/**
 * Check if user has permission
 */
exports.hasPermission = async (userId, permission) => {
  const permissions = await exports.getUserPermissions(userId);
  return permissions.includes(permission);
};

/**
 * Check if user has any of multiple permissions
 */
exports.hasAnyPermission = async (userId, permissions) => {
  const userPermissions = await exports.getUserPermissions(userId);
  return permissions.some(p => userPermissions.includes(p));
};

/**
 * Check if user has all permissions
 */
exports.hasAllPermissions = async (userId, permissions) => {
  const userPermissions = await exports.getUserPermissions(userId);
  return permissions.every(p => userPermissions.includes(p));
};

/**
 * Assign role to user
 * Each user can only have ONE primary role at a time
 * When assigning a new role, it removes all existing roles first
 */
exports.assignRoleToUser = async (userId, roleId, additionalPermissions = []) => {
  try {
    // Remove all existing roles for this user (user can only have 1 role)
    await UserRole.destroy({
      where: { userId }
    });

    // Create new role assignment
    const userRole = await UserRole.create({
      userId,
      roleId,
      additionalPermissions: additionalPermissions || [],
      deniedPermissions: []
    });

    return userRole;
  } catch (error) {
    throw new Error(`Error assigning role: ${error.message}`);
  }
};

/**
 * Remove role from user
 */
exports.removeRoleFromUser = async (userId, roleId) => {
  return await UserRole.destroy({
    where: { userId, roleId }
  });
};

/**
 * Grant additional permission to user
 */
exports.grantPermissionToUser = async (userId, roleId, permission) => {
  try {
    const userRole = await UserRole.findOne({
      where: { userId, roleId }
    });

    if (!userRole) {
      throw new Error('User role not found');
    }

    const permissions = new Set(userRole.additionalPermissions || []);
    permissions.add(permission);

    await userRole.update({
      additionalPermissions: Array.from(permissions)
    });

    return userRole;
  } catch (error) {
    throw new Error(`Error granting permission: ${error.message}`);
  }
};

/**
 * Revoke permission from user
 */
exports.revokePermissionFromUser = async (userId, roleId, permission) => {
  try {
    const userRole = await UserRole.findOne({
      where: { userId, roleId }
    });

    if (!userRole) {
      throw new Error('User role not found');
    }

    const permissions = new Set(userRole.additionalPermissions || []);
    permissions.delete(permission);

    await userRole.update({
      additionalPermissions: Array.from(permissions)
    });

    return userRole;
  } catch (error) {
    throw new Error(`Error revoking permission: ${error.message}`);
  }
};

/**
 * Deny permission for user (block permission from role)
 */
exports.denyPermissionForUser = async (userId, roleId, permission) => {
  try {
    const userRole = await UserRole.findOne({
      where: { userId, roleId }
    });

    if (!userRole) {
      throw new Error('User role not found');
    }

    const deniedPermissions = new Set(userRole.deniedPermissions || []);
    deniedPermissions.add(permission);

    // Also remove from additionalPermissions if exists
    const additionalPermissions = new Set(userRole.additionalPermissions || []);
    additionalPermissions.delete(permission);

    await userRole.update({
      deniedPermissions: Array.from(deniedPermissions),
      additionalPermissions: Array.from(additionalPermissions)
    });

    return userRole;
  } catch (error) {
    throw new Error(`Error denying permission: ${error.message}`);
  }
};

/**
 * Allow permission for user (remove from denied list)
 */
exports.allowPermissionForUser = async (userId, roleId, permission) => {
  try {
    const userRole = await UserRole.findOne({
      where: { userId, roleId }
    });

    if (!userRole) {
      throw new Error('User role not found');
    }

    const deniedPermissions = new Set(userRole.deniedPermissions || []);
    deniedPermissions.delete(permission);

    await userRole.update({
      deniedPermissions: Array.from(deniedPermissions)
    });

    return userRole;
  } catch (error) {
    throw new Error(`Error allowing permission: ${error.message}`);
  }
};

/**
 * Log audit trail for data changes
 */
exports.logAudit = async (userId, action, entityType, entityId, entityName, oldValues, newValues, ipAddress, userAgent) => {
  try {
    // Calculate changes
    const changes = {};
    if (oldValues && newValues) {
      for (const key in newValues) {
        if (oldValues[key] !== newValues[key]) {
          changes[key] = {
            before: oldValues[key],
            after: newValues[key]
          };
        }
      }
    }

    const audit = await AuditLog.create({
      userId,
      action,
      entityType,
      entityId,
      entityName,
      oldValues,
      newValues,
      changes: Object.keys(changes).length > 0 ? changes : null,
      ipAddress,
      userAgent,
      status: 'SUCCESS'
    });

    return audit;
  } catch (error) {
    console.error('Error logging audit:', error);
    return null;
  }
};

/**
 * Get audit logs for an entity
 */
exports.getEntityAuditLogs = async (entityType, entityId, limit = 50) => {
  try {
    return await AuditLog.findAll({
      where: { entityType, entityId },
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email', 'fullName']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit
    });
  } catch (error) {
    throw new Error(`Error getting audit logs: ${error.message}`);
  }
};

/**
 * Get audit logs for a user
 */
exports.getUserAuditLogs = async (userId, limit = 50) => {
  try {
    return await AuditLog.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit
    });
  } catch (error) {
    throw new Error(`Error getting user audit logs: ${error.message}`);
  }
};

/**
 * Get all audit logs with filters
 */
exports.getAuditLogs = async (filters = {}, limit = 100, offset = 0) => {
  try {
    const where = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.action) where.action = filters.action;
    if (filters.entityType) where.entityType = filters.entityType;
    if (filters.status) where.status = filters.status;

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt[sequelize.Op.gte] = filters.startDate;
      if (filters.endDate) where.createdAt[sequelize.Op.lte] = filters.endDate;
    }

    return await AuditLog.findAndCountAll({
      where,
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email', 'fullName']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
  } catch (error) {
    throw new Error(`Error getting audit logs: ${error.message}`);
  }
};
