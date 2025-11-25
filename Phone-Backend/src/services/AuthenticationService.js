const User = require('../models/User');
const TokenBlacklist = require('../models/TokenBlacklist');
const { 
  verifyAccessToken, 
  verifyRefreshToken,
  decodeToken,
  generateTokens,
  buildScope 
} = require('../utils/tokenUtils');
const { ApiError } = require('../utils/apiResponse');
const IntrospectResponse = require('../dtos/IntrospectResponse');
const { v4: uuidv4 } = require('uuid');

/**
 * AuthenticationService
 * Similar to Java AuthenticationService
 * Handles token generation, validation, introspection, and logout
 */
class AuthenticationService {
  /**
   * Introspect token - check if valid without throwing exception
   * Similar to Java authenticationService.introspect()
   * @param {object} request - IntrospectRequest with token
   * @returns {IntrospectResponse} { valid: boolean, decoded?: object }
   */
  async introspect(request) {
    try {
      // Check if token is null or empty
      if (!request.token || request.token.trim() === '') {
        return IntrospectResponse.builder()
          .setValid(false)
          .build();
      }

      // Verify token signature and expiration
      const decoded = await this.verifyTokenInternal(request.token, false);

      // Check if token is blacklisted
      const isBlacklisted = await TokenBlacklist.findByPk(decoded.jti);
      if (isBlacklisted) {
        return IntrospectResponse.builder()
          .setValid(false)
          .build();
      }

      // Token is valid
      return IntrospectResponse.builder()
        .setValid(true)
        .setDecoded(decoded)
        .build();
    } catch (error) {
      // Token is invalid (expired, bad signature, etc.)
      return IntrospectResponse.builder()
        .setValid(false)
        .build();
    }
  }

  /**
   * Internal token verification
   * Similar to Java verifierToken()
   * @param {string} token - JWT token
   * @param {boolean} isRefresh - If checking refresh token
   * @returns {object} Decoded token
   * @throws {Error} If token is invalid
   */
  async verifyTokenInternal(token, isRefresh = false) {
    try {
      const secret = isRefresh 
        ? process.env.JWT_REFRESH_SECRET 
        : process.env.JWT_SECRET;

      const decoded = jwt.verify(token, secret);

      // Check expiration (jwt.verify already checks this)
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        throw new Error('Token has expired');
      }

      // Check if token is blacklisted
      const isBlacklisted = await TokenBlacklist.findByPk(decoded.jti);
      if (isBlacklisted) {
        throw new Error('Token has been blacklisted');
      }

      return decoded;
    } catch (error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }

  /**
   * Authenticate user (login)
   * Similar to Java autheticate()
   * @param {object} request - { username, password }
   * @returns {object} { token, isAuthenticated, user }
   * @throws {ApiError} If authentication fails
   */
  async authenticate(request) {
    try {
      // Find user by username
      const user = await User.findOne({
        where: { username: request.username }
      });

      if (!user) {
        throw new ApiError(401, 'Invalid username or password');
      }

      // Compare password
      const isPasswordValid = await user.comparePassword(request.password);
      if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid username or password');
      }

      // Generate token
      const permissions = typeof user.permissions === 'string'
        ? JSON.parse(user.permissions)
        : user.permissions || [];

      const { accessToken, refreshToken } = generateTokens(
        user.id,
        user.role,
        permissions
      );

      return {
        accessToken,
        refreshToken,
        isAuthenticated: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        }
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, `Authentication error: ${error.message}`);
    }
  }

  /**
   * Logout - add token to blacklist
   * Similar to Java logout()
   * @param {object} request - { token }
   * @throws {Error} If logout fails
   */
  async logout(request) {
    try {
      // Validate token
      if (!request.token || request.token.trim() === '') {
        throw new Error('Token cannot be empty');
      }

      // Verify token
      const decoded = decodeToken(request.token);
      if (!decoded || !decoded.jti || !decoded.exp) {
        throw new Error('Invalid token format');
      }

      // Add to blacklist
      const expiryTime = new Date(decoded.exp * 1000);
      await TokenBlacklist.create({
        id: decoded.jti,
        userId: decoded.id,
        expiryTime: expiryTime,
        reason: 'logout'
      });

      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      if (error.message.includes('expired')) {
        // Token already expired, no need to blacklist
        return { success: true, message: 'Token already expired' };
      }
      throw error;
    }
  }

  /**
   * Refresh access token
   * Similar to Java refreshToken()
   * @param {object} request - { token }
   * @returns {object} { accessToken, refreshToken, isAuthenticated }
   * @throws {Error} If refresh fails
   */
  async refreshToken(request) {
    try {
      // Verify refresh token
      const decoded = await this.verifyTokenInternal(request.token, true);

      // Get user
      const user = await User.findByPk(decoded.id);
      if (!user || !user.isActive) {
        throw new Error('User not found or inactive');
      }

      // Blacklist old refresh token
      const expiryTime = new Date(decoded.exp * 1000);
      await TokenBlacklist.create({
        id: decoded.jti,
        userId: decoded.id,
        expiryTime: expiryTime,
        reason: 'refresh'
      });

      // Generate new tokens
      const permissions = typeof user.permissions === 'string'
        ? JSON.parse(user.permissions)
        : user.permissions || [];

      const { accessToken, refreshToken } = generateTokens(
        user.id,
        user.role,
        permissions
      );

      return {
        accessToken,
        refreshToken,
        isAuthenticated: true
      };
    } catch (error) {
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  /**
   * Build scope string from user roles and permissions
   * Similar to Java buildScope()
   * @param {object} user - User object with roles and permissions
   * @returns {string} Space-separated scope string
   */
  buildScope(user) {
    const scopes = [];

    // Add user role
    if (user.role) {
      scopes.push(`ROLE_${user.role.toUpperCase()}`);
    }

    // Add permissions
    const permissions = typeof user.permissions === 'string'
      ? JSON.parse(user.permissions)
      : user.permissions || [];

    if (Array.isArray(permissions)) {
      permissions.forEach(permission => {
        scopes.push(permission.toUpperCase());
      });
    }

    return scopes.join(' ');
  }
}

// Need to import jwt at the top
const jwt = require('jsonwebtoken');

module.exports = AuthenticationService;
