const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate both access and refresh tokens with JWT ID for tracking
 * @param {number} userId - User ID
 * @param {string} role - User role
 * @param {array} permissions - User permissions
 * @returns {object} { accessToken, refreshToken, jti }
 */
const generateTokens = (userId, role = 'user', permissions = []) => {
  const jti = uuidv4(); // Unique JWT ID for tracking/blacklisting

  // Get expiration times - use string format with 's' for seconds
  // JWT library: '3600s' = 3600 seconds = 1 hour
  // If pass number, it treats as milliseconds!
  const accessTokenExpire = `${parseInt(process.env.JWT_EXPIRE || '3600')}s`; // 1 hour
  const refreshTokenExpire = `${parseInt(process.env.JWT_REFRESH_EXPIRE || '86400')}s`; // 1 day

  // Generate Access Token (short-lived)
  const accessToken = jwt.sign(
    {
      id: userId,
      role: role,
      permissions: permissions,
      jti: jti,
      scope: buildScope(role, permissions),
    },
    process.env.JWT_SECRET,
    {
      expiresIn: accessTokenExpire, // Use string with 's' suffix for seconds
      issuer: 'phoneshop.com',
      subject: String(userId),
    }
  );

  // Generate Refresh Token (long-lived)
  const refreshJti = uuidv4();
  const refreshToken = jwt.sign(
    {
      id: userId,
      jti: refreshJti,
      type: 'refresh',
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: refreshTokenExpire, // Use string with 's' suffix for seconds
      issuer: 'phoneshop.com',
      subject: String(userId),
    }
  );

  return {
    accessToken,
    refreshToken,
    jti,
    refreshJti,
    expiresIn: parseInt(process.env.JWT_EXPIRE || '3600'),
    refreshExpiresIn: parseInt(process.env.JWT_REFRESH_EXPIRE || '86400'),
  };
};

/**
 * Verify access token and check if it's blacklisted
 * @param {string} token - JWT token
 * @param {function} checkBlacklist - Function to check if token is blacklisted
 * @returns {object} Decoded token
 */
const verifyAccessToken = async (token, checkBlacklist = null) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if token is blacklisted
    if (checkBlacklist) {
      const isBlacklisted = await checkBlacklist(decoded.jti);
      if (isBlacklisted) {
        throw new Error('Token has been revoked');
      }
    }

    return decoded;
  } catch (error) {
    throw new Error(`Invalid or expired access token: ${error.message}`);
  }
};

/**
 * Verify refresh token and check if it's blacklisted
 * @param {string} token - JWT token
 * @param {function} checkBlacklist - Function to check if token is blacklisted
 * @returns {object} Decoded token
 */
const verifyRefreshToken = async (token, checkBlacklist = null) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // Check if token is blacklisted
    if (checkBlacklist) {
      const isBlacklisted = await checkBlacklist(decoded.jti);
      if (isBlacklisted) {
        throw new Error('Refresh token has been revoked');
      }
    }

    return decoded;
  } catch (error) {
    throw new Error(`Invalid or expired refresh token: ${error.message}`);
  }
};

/**
 * Verify token signature without checking expiration
 * Used for refresh token validation
 * @param {string} token - JWT token
 * @param {string} secret - Secret key
 * @returns {object} Decoded token
 */
const verifyTokenSignature = (token, secret = process.env.JWT_REFRESH_SECRET) => {
  try {
    return jwt.verify(token, secret, { ignoreExpiration: false });
  } catch (error) {
    throw new Error(`Invalid token signature: ${error.message}`);
  }
};

/**
 * Decode token without verification (USE ONLY for non-critical operations like getting expiration)
 * WARNING: Do NOT use decoded data for authentication/authorization decisions
 * @param {string} token - JWT token
 * @returns {object|null} Decoded token or null
 */
const decodeToken = (token) => {
  try {
    // WARNING: This only decodes, does not verify signature!
    // Only use for reading non-sensitive metadata (e.g., expiration time)
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

/**
 * Extract expiration time from token
 * WARNING: Only use for display purposes, verify token before trusting exp claim
 * @param {string} token - JWT token
 * @returns {Date} Expiration date
 */
const getTokenExpiration = (token) => {
  try {
    // WARNING: jwt.decode() does NOT verify signature
    // This is ONLY safe for reading expiration time for display
    // Do NOT use decoded data for security decisions
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return null;
    }
    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
};

/**
 * Build scope string from role and permissions
 * Similar to Java service buildScope() method
 * @param {string} role - User role
 * @param {array} permissions - User permissions
 * @returns {string} Space-separated scope string
 */
const buildScope = (role, permissions = []) => {
  const scopes = [];

  // Add role
  if (role) {
    scopes.push(`ROLE_${role.toUpperCase()}`);
  }

  // Add permissions
  if (Array.isArray(permissions)) {
    permissions.forEach(permission => {
      scopes.push(permission.toUpperCase());
    });
  }

  return scopes.join(' ');
};

/**
 * Introspect token - check if it's valid and not revoked
 * Similar to Java service introspect() method
 * @param {string} token - JWT token
 * @param {function} checkBlacklist - Function to check blacklist
 * @returns {object} { valid: boolean, message: string }
 */
const introspectToken = async (token, checkBlacklist = null) => {
  try {
    // Verify signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check blacklist
    if (checkBlacklist) {
      const isBlacklisted = await checkBlacklist(decoded.jti);
      if (isBlacklisted) {
        return {
          valid: false,
          message: 'Token has been revoked',
          reason: 'blacklisted',
        };
      }
    }

    // Check expiration
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      return {
        valid: false,
        message: 'Token has expired',
        reason: 'expired',
      };
    }

    return {
      valid: true,
      message: 'Token is valid',
      decoded,
    };
  } catch (error) {
    return {
      valid: false,
      message: error.message,
      reason: 'invalid_signature',
    };
  }
};

module.exports = {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  verifyTokenSignature,
  decodeToken,
  getTokenExpiration,
  buildScope,
  introspectToken,
};
