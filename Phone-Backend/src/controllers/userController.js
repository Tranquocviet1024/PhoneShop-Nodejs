const User = require('../models/User');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const bcryptjs = require('bcryptjs');
const RoleEnum = require('../enums/RoleEnum');
const PermissionEnum = require('../enums/PermissionEnum');

// Get user profile
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    res.status(200).json(
      new ApiResponse(200, user, 'User profile retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Update user profile
exports.updateUserProfile = async (req, res, next) => {
  try {
    const { fullName, phone, address } = req.body;

    const user = await User.findByPk(req.userId);

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (address) user.address = address;

    await user.save();

    res.status(200).json(
      new ApiResponse(200, user, 'Profile updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Change password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return next(new ApiError(400, 'All password fields are required'));
    }

    if (newPassword !== confirmPassword) {
      return next(new ApiError(400, 'New password and confirm password do not match'));
    }

    if (newPassword.length < 6) {
      return next(new ApiError(400, 'New password must be at least 6 characters'));
    }

    // Get user
    const user = await User.findByPk(req.userId);

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return next(new ApiError(401, 'Current password is incorrect'));
    }

    // Update password
    user.passwordHash = newPassword;
    await user.save();

    res.status(200).json(
      new ApiResponse(200, null, 'Password changed successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Get user by ID (admin)
exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    res.status(200).json(
      new ApiResponse(200, user, 'User retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role } = req.query;

    const where = {};

    if (role) {
      // Validate role using RoleEnum
      if (!RoleEnum.isValid(role)) {
        return next(new ApiError(400, `Invalid role. Allowed values: ${RoleEnum.values.join(', ')}`));
      }
      where.role = role;
    }

    const offset = (page - 1) * limit;
    
    const { count, rows } = await User.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset,
      limit: Number(limit),
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json(
      new ApiResponse(200, {
        users: rows,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          totalPages,
        },
      }, 'Users retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Update user role and permissions (admin only)
exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, permissions } = req.body;

    const user = await User.findByPk(id);

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    // Validate and update role using RoleEnum
    if (role) {
      if (!RoleEnum.isValid(role)) {
        return next(new ApiError(400, `Invalid role. Allowed values: ${RoleEnum.values.join(', ')}`));
      }
      user.role = role;
      // Automatically assign default permissions for the role
      user.permissions = PermissionEnum.defaultByRole[role.toLowerCase()];
    }

    // Optionally allow custom permissions if explicitly provided and valid
    if (permissions && Array.isArray(permissions)) {
      const invalidPermissions = permissions.filter(p => !PermissionEnum.isValid(p));
      if (invalidPermissions.length > 0) {
        return next(new ApiError(400, `Invalid permissions: ${invalidPermissions.join(', ')}`));
      }
      user.permissions = permissions;
    }

    await user.save();

    res.status(200).json(
      new ApiResponse(200, user, 'User role updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Deactivate user account
exports.deactivateAccount = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    user.isActive = false;
    await user.save();

    res.status(200).json(
      new ApiResponse(200, null, 'Account deactivated successfully')
    );
  } catch (error) {
    next(error);
  }
};
