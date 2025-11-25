const Role = require('../models/Role');
const UserRole = require('../models/UserRole');
const User = require('../models/User');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const permissionService = require('../services/permissionService');
const PermissionEnum = require('../enums/PermissionEnum');

/**
 * Get all roles
 */
exports.getAllRoles = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Role.findAndCountAll({
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json(
      new ApiResponse(200, {
        roles: rows,
        pagination: { total: count, page: Number(page), limit: Number(limit), totalPages }
      }, 'Roles retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get role by ID
 */
exports.getRoleById = async (req, res, next) => {
  try {
    const { roleId } = req.params;

    const role = await Role.findByPk(roleId, {
      include: [
        {
          model: UserRole,
          attributes: ['userId'],
          include: [
            {
              model: User,
              attributes: ['id', 'username', 'email', 'fullName']
            }
          ]
        }
      ]
    });

    if (!role) {
      return next(new ApiError(404, 'Role not found'));
    }

    res.status(200).json(
      new ApiResponse(200, role, 'Role retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Create new role
 */
exports.createRole = async (req, res, next) => {
  try {
    const { name, description, permissions } = req.body;

    // Validate required fields
    if (!name) {
      return next(new ApiError(400, 'Role name is required'));
    }

    if (!Array.isArray(permissions)) {
      return next(new ApiError(400, 'Permissions must be an array'));
    }

    // Validate permissions
    const invalidPermissions = permissions.filter(p => !PermissionEnum.isValid(p));
    if (invalidPermissions.length > 0) {
      return next(new ApiError(400, `Invalid permissions: ${invalidPermissions.join(', ')}`));
    }

    const role = await Role.create({
      name,
      description,
      permissions
    });

    res.status(201).json(
      new ApiResponse(201, role, 'Role created successfully')
    );
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return next(new ApiError(400, 'Role name already exists'));
    }
    next(error);
  }
};

/**
 * Update role
 */
exports.updateRole = async (req, res, next) => {
  try {
    const { roleId } = req.params;
    const { name, description, permissions, isActive } = req.body;

    const role = await Role.findByPk(roleId);
    if (!role) {
      return next(new ApiError(404, 'Role not found'));
    }

    // Validate permissions if provided
    if (permissions && !Array.isArray(permissions)) {
      return next(new ApiError(400, 'Permissions must be an array'));
    }

    if (permissions) {
      const invalidPermissions = permissions.filter(p => !PermissionEnum.isValid(p));
      if (invalidPermissions.length > 0) {
        return next(new ApiError(400, `Invalid permissions: ${invalidPermissions.join(', ')}`));
      }
    }

    await role.update({
      ...(name && { name }),
      ...(description && { description }),
      ...(permissions && { permissions }),
      ...(typeof isActive !== 'undefined' && { isActive })
    });

    res.status(200).json(
      new ApiResponse(200, role, 'Role updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete role
 */
exports.deleteRole = async (req, res, next) => {
  try {
    const { roleId } = req.params;

    const role = await Role.findByPk(roleId);
    if (!role) {
      return next(new ApiError(404, 'Role not found'));
    }

    // Check if role is assigned to users
    const userCount = await UserRole.count({ where: { roleId } });
    if (userCount > 0) {
      return next(new ApiError(400, `Cannot delete role. It is assigned to ${userCount} users`));
    }

    await role.destroy();

    res.status(200).json(
      new ApiResponse(200, null, 'Role deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Assign role to user
 */
exports.assignRoleToUser = async (req, res, next) => {
  try {
    const { userId, roleId } = req.body;

    if (!userId || !roleId) {
      return next(new ApiError(400, 'userId and roleId are required'));
    }

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    // Check if role exists
    const role = await Role.findByPk(roleId);
    if (!role) {
      return next(new ApiError(404, 'Role not found'));
    }

    const userRole = await permissionService.assignRoleToUser(userId, roleId);

    res.status(201).json(
      new ApiResponse(201, userRole, 'Role assigned to user successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Remove role from user
 */
exports.removeRoleFromUser = async (req, res, next) => {
  try {
    const { userId, roleId } = req.params;

    const removed = await permissionService.removeRoleFromUser(userId, roleId);

    if (removed === 0) {
      return next(new ApiError(404, 'User role relationship not found'));
    }

    res.status(200).json(
      new ApiResponse(200, null, 'Role removed from user successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get user permissions
 */
exports.getUserPermissions = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    const permissions = await permissionService.getUserPermissions(userId);
    const userRoles = await UserRole.findAll({
      where: { userId },
      include: [
        {
          model: Role,
          attributes: ['id', 'name', 'permissions']
        }
      ]
    });

    res.status(200).json(
      new ApiResponse(200, {
        userId,
        roles: userRoles,
        permissions,
        totalPermissions: permissions.length
      }, 'User permissions retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Grant permission to user
 */
exports.grantPermission = async (req, res, next) => {
  try {
    const { userId, roleId, permission } = req.body;

    if (!userId || !roleId || !permission) {
      return next(new ApiError(400, 'userId, roleId, and permission are required'));
    }

    if (!PermissionEnum.isValid(permission)) {
      return next(new ApiError(400, `Invalid permission: ${permission}`));
    }

    const userRole = await permissionService.grantPermissionToUser(userId, roleId, permission);

    res.status(200).json(
      new ApiResponse(200, userRole, 'Permission granted successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Revoke permission from user
 */
exports.revokePermission = async (req, res, next) => {
  try {
    const { userId, roleId, permission } = req.body;

    if (!userId || !roleId || !permission) {
      return next(new ApiError(400, 'userId, roleId, and permission are required'));
    }

    if (!PermissionEnum.isValid(permission)) {
      return next(new ApiError(400, `Invalid permission: ${permission}`));
    }

    const userRole = await permissionService.revokePermissionFromUser(userId, roleId, permission);

    res.status(200).json(
      new ApiResponse(200, userRole, 'Permission revoked successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Deny permission for user (block a permission from role)
 */
exports.denyPermission = async (req, res, next) => {
  try {
    const { userId, roleId, permission } = req.body;

    if (!userId || !roleId || !permission) {
      return next(new ApiError(400, 'userId, roleId, and permission are required'));
    }

    if (!PermissionEnum.isValid(permission)) {
      return next(new ApiError(400, `Invalid permission: ${permission}`));
    }

    const userRole = await permissionService.denyPermissionForUser(userId, roleId, permission);

    res.status(200).json(
      new ApiResponse(200, userRole, 'Permission denied successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Allow permission for user (remove from denied list)
 */
exports.allowPermission = async (req, res, next) => {
  try {
    const { userId, roleId, permission } = req.body;

    if (!userId || !roleId || !permission) {
      return next(new ApiError(400, 'userId, roleId, and permission are required'));
    }

    if (!PermissionEnum.isValid(permission)) {
      return next(new ApiError(400, `Invalid permission: ${permission}`));
    }

    const userRole = await permissionService.allowPermissionForUser(userId, roleId, permission);

    res.status(200).json(
      new ApiResponse(200, userRole, 'Permission allowed successfully')
    );
  } catch (error) {
    next(error);
  }
};
