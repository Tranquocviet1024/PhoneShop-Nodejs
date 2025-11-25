const { ApiError } = require('../utils/apiResponse');
const { verifyAccessToken } = require('../utils/tokenUtils');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    let authHeader = req.headers['authorization'];
    
    // Handle case where header might be an array (duplicate headers)
    if (Array.isArray(authHeader)) {
      authHeader = authHeader[0];
    }
    
    // codeql[js/user-controlled-bypass] - False positive: JWT signature is cryptographically verified
    // Validate header format: "Bearer <token>"
    if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      return next(new ApiError(401, 'Invalid authorization header format'));
    }
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
      return next(new ApiError(401, 'Invalid authorization header format'));
    }
    
    // codeql[js/user-controlled-bypass] - False positive: Token is verified via jwt.verify() with secret key
    const token = parts[1];
    if (!token || token.length === 0) {
      return next(new ApiError(401, 'Access token is required'));
    }

    // Blacklist check function - lazy load TokenBlacklist to avoid circular dependency
    const checkBlacklist = async (jti) => {
      const TokenBlacklist = require('../models/TokenBlacklist');
      const blacklistedToken = await TokenBlacklist.findByPk(jti);
      return !!blacklistedToken;
    };

    // Verify token
    const decoded = await verifyAccessToken(token, checkBlacklist);
    req.user = decoded;

    // Get user from database
    const user = await User.findByPk(decoded.id);
    if (!user || !user.isActive) {
      return next(new ApiError(401, 'User not found or account is inactive'));
    }

    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.user = user;
    next();
  } catch (error) {
    next(new ApiError(401, 'Invalid or expired access token'));
  }
};

const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.userRole)) {
      return next(new ApiError(403, 'You do not have permission to access this resource'));
    }
    next();
  };
};

const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const user = await User.findByPk(req.userId);
      const userPermissions = typeof user.permissions === 'string'
        ? JSON.parse(user.permissions)
        : user.permissions || [];

      if (!user || !userPermissions.includes(requiredPermission)) {
        return next(new ApiError(403, `Permission '${requiredPermission}' is required`));
      }
      next();
    } catch (error) {
      next(new ApiError(500, 'Error checking permissions'));
    }
  };
};

module.exports = {
  authenticateToken,
  authorizeRole,
  checkPermission,
};
