const User = require('../models/User');
const Role = require('../models/Role');
const TokenBlacklist = require('../models/TokenBlacklist');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  getTokenExpiration,
  introspectToken,
  buildScope,
} = require('../utils/tokenUtils');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const RoleEnum = require('../enums/RoleEnum');
const PermissionEnum = require('../enums/PermissionEnum');
const permissionService = require('../services/permissionService');
const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../config/email');

// Sign Up
exports.signup = async (req, res, next) => {
  try {
    const { username, email, passwordHash, fullName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { username }]
      }
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return next(new ApiError(409, 'Email already registered'));
      }
      return next(new ApiError(409, 'Username already taken'));
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      passwordHash,
      fullName,
      role: RoleEnum.USER,
      permissions: PermissionEnum.defaultByRole[RoleEnum.USER],
    });

    // Tự động gán role USER mặc định
    const userRole = await Role.findOne({ where: { name: 'USER' } });
    if (userRole) {
      await permissionService.assignRoleToUser(user.id, userRole.id);
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    // Return response
    res.status(201).json(
      new ApiResponse(201, {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      }, 'Signup successful')
    );
  } catch (error) {
    next(error);
  }
};

// Sign In
exports.signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ApiError(400, 'Email and password are required'));
    }

    // Find user
    const user = await User.findOne({ where: { email } });

    if (!user || !user.isActive) {
      return next(new ApiError(401, 'Invalid email or password'));
    }

    // Compare passwords
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return next(new ApiError(401, 'Invalid email or password'));
    }

    // Get user permissions
    const permissions = typeof user.permissions === 'string'
      ? JSON.parse(user.permissions)
      : user.permissions;

    // Generate tokens with permissions
    const { accessToken, refreshToken, jti, refreshJti, expiresIn } = generateTokens(
      user.id,
      user.role,
      permissions
    );

    // Log audit
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');
    await permissionService.logAudit(
      user.id,
      'LOGIN',
      'User',
      user.id,
      user.username,
      null,
      null,
      ipAddress,
      userAgent
    );

    // Return response
    res.status(200).json(
      new ApiResponse(200, {
        accessToken,
        refreshToken,
        expiresIn,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          permissions,
        },
      }, 'Signin successful')
    );
  } catch (error) {
    next(error);
  }
};

// Verify Token
exports.verifyToken = async (req, res, next) => {
  try {
    let authHeader = req.headers['authorization'];
    
    // Handle case where header might be an array (duplicate headers)
    if (Array.isArray(authHeader)) {
      authHeader = authHeader[0];
    }
    
    // Validate header format
    if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      return next(new ApiError(400, 'Invalid authorization header format'));
    }
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
      return next(new ApiError(400, 'Invalid authorization header format'));
    }
    
    const token = parts[1];
    if (!token || token.length === 0) {
      return next(new ApiError(400, 'Token is required'));
    }

    try {
      const checkBlacklist = async (jti) => {
        return await TokenBlacklist.findByPk(jti);
      };

      const decoded = await verifyAccessToken(token, checkBlacklist);
      const user = await User.findByPk(decoded.id);

      if (!user || !user.isActive) {
        return next(new ApiError(401, 'User not found'));
      }

      res.status(200).json(
        new ApiResponse(200, {
          valid: true,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
          },
        }, 'Token is valid')
      );
    } catch (error) {
      return next(new ApiError(401, 'Invalid or expired token'));
    }
  } catch (error) {
    next(error);
  }
};

// Introspect Token - Check if token is valid without full verification
// Similar to Java service introspect() method
exports.introspect = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return next(new ApiError(400, 'Token is required'));
    }

    // Check blacklist
    const checkBlacklist = async (jti) => {
      return await TokenBlacklist.findByPk(jti);
    };

    // Introspect token
    const result = await introspectToken(token, checkBlacklist);

    res.status(200).json(
      new ApiResponse(200, result, 'Token introspection completed')
    );
  } catch (error) {
    next(error);
  }
};

// Refresh Access Token - Also blacklist old refresh token
exports.refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    // Validate refresh token is a non-empty string
    if (!refreshToken || typeof refreshToken !== 'string' || refreshToken.trim().length === 0) {
      return next(new ApiError(400, 'Valid refresh token is required'));
    }

    try {
      // Verify refresh token
      const checkBlacklist = async (jti) => {
        return await TokenBlacklist.findByPk(jti);
      };

      const decoded = await verifyRefreshToken(refreshToken, checkBlacklist);
      const user = await User.findByPk(decoded.id);

      if (!user || !user.isActive) {
        return next(new ApiError(401, 'User not found'));
      }

      // Blacklist the old refresh token
      const oldExpiration = getTokenExpiration(refreshToken);
      if (decoded.jti && oldExpiration) {
        await TokenBlacklist.create({
          id: decoded.jti,
          userId: user.id,
          expiryTime: oldExpiration,
          reason: 'token_refresh',
        });
      }

      // Get user permissions
      const permissions = typeof user.permissions === 'string'
        ? JSON.parse(user.permissions)
        : user.permissions;

      // Generate new tokens
      const { accessToken: newAccessToken, refreshToken: newRefreshToken, expiresIn } = generateTokens(
        user.id,
        user.role,
        permissions
      );

      res.status(200).json(
        new ApiResponse(200, {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          expiresIn,
          user: {
            id: user.id,
            role: user.role,
            permissions,
          },
        }, 'Access token refreshed successfully')
      );
    } catch (error) {
      return next(new ApiError(401, `Invalid or expired refresh token: ${error.message}`));
    }
  } catch (error) {
    next(error);
  }
};

// Check Permission
exports.checkPermission = async (req, res, next) => {
  try {
    const { permission } = req.body;

    if (!permission) {
      return next(new ApiError(400, 'Permission name is required'));
    }

    const user = await User.findByPk(req.userId);

    if (!user) {
      return next(new ApiError(401, 'User not found'));
    }

    const permissions = typeof user.permissions === 'string' 
      ? JSON.parse(user.permissions) 
      : user.permissions;
    const hasPermission = permissions.includes(permission);

    res.status(200).json(
      new ApiResponse(200, {
        hasPermission,
        permission,
        userPermissions: permissions,
      }, 'Permission check completed')
    );
  } catch (error) {
    next(error);
  }
};

// Logout - Blacklist the token (similar to Java service)
exports.logout = async (req, res, next) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
      return next(new ApiError(400, 'Token is required'));
    }

    try {
      // Decode the token
      const decoded = decodeToken(token);

      if (!decoded || !decoded.jti) {
        return next(new ApiError(401, 'Invalid token'));
      }

      // Get token expiration
      const expirationTime = getTokenExpiration(token);

      // Add token to blacklist
      if (expirationTime && expirationTime > new Date()) {
        await TokenBlacklist.create({
          id: decoded.jti,
          userId: decoded.id || req.userId,
          expiryTime: expirationTime,
          reason: 'logout',
        });

        return res.status(200).json(
          new ApiResponse(200, null, 'Logout successful - token blacklisted')
        );
      } else {
        // Token already expired
        return res.status(200).json(
          new ApiResponse(200, null, 'Logout successful - token already expired')
        );
      }
    } catch (error) {
      console.error('Logout error:', error.message);
      return res.status(200).json(
        new ApiResponse(200, null, 'Logout completed')
      );
    }
  } catch (error) {
    next(error);
  }
};

// Check Role
exports.checkRole = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.userId);

    if (!user) {
      return next(new ApiError(401, 'User not found'));
    }

    const permissions = typeof user.permissions === 'string' 
      ? JSON.parse(user.permissions) 
      : user.permissions;

    res.status(200).json(
      new ApiResponse(200, {
        role: user.role,
        permissions: permissions,
      }, 'Role information retrieved')
    );
  } catch (error) {
    next(error);
  }
};

// Request Password Reset
exports.requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new ApiError(400, 'Email is required'));
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.status(200).json(
        new ApiResponse(200, null, 'If the email exists, a password reset link has been sent')
      );
    }

    // Generate reset token (32 bytes = 64 hex characters)
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token before storing (security best practice)
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Set token expiry (1 hour from now)
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save hashed token and expiry to database
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Send email with unhashed token
    try {
      await sendPasswordResetEmail(user.email, resetToken, user.fullName || user.username);
      
      res.status(200).json(
        new ApiResponse(200, {
          message: 'Password reset email sent',
          // Only for development/testing - remove in production
          ...(process.env.NODE_ENV === 'development' && { resetToken })
        }, 'If the email exists, a password reset link has been sent')
      );
    } catch (emailError) {
      // Clear token if email fails
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
      
      console.error('Email sending failed:', emailError);
      return next(new ApiError(500, 'Failed to send password reset email. Please try again later.'));
    }
  } catch (error) {
    next(error);
  }
};

// Reset Password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return next(new ApiError(400, 'Token and new password are required'));
    }

    if (newPassword.length < 6) {
      return next(new ApiError(400, 'Password must be at least 6 characters long'));
    }

    // Hash the token from URL to compare with stored hashed token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: {
          [Op.gt]: new Date() // Token not expired
        }
      }
    });

    if (!user) {
      return next(new ApiError(400, 'Invalid or expired reset token'));
    }

    // Update password (will be hashed by beforeUpdate hook)
    user.passwordHash = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json(
      new ApiResponse(200, null, 'Password has been reset successfully. You can now login with your new password.')
    );
  } catch (error) {
    next(error);
  }
};
