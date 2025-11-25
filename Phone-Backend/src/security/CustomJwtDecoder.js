const jwt = require('jsonwebtoken');
const IntrospectRequest = require('../dtos/IntrospectRequest');

/**
 * CustomJwtDecoder
 * Similar to Java CustomJwtDecoder with JwtDecoder interface
 * Validates token using introspection before decoding
 */
class CustomJwtDecoder {
  constructor(authenticationService, jwtSecret) {
    this.authenticationService = authenticationService;
    this.jwtSecret = jwtSecret || process.env.JWT_SECRET;
  }

  /**
   * Decode and validate token
   * Similar to Java's decode() method
   * @param {string} token - JWT token
   * @returns {object} Decoded token claims
   * @throws {Error} If token is invalid or expired
   */
  async decode(token) {
    try {
      // Step 1: Introspect token first (similar to Java implementation)
      const introspectRequest = IntrospectRequest.builder()
        .setToken(token)
        .build();

      const introspectResponse = await this.authenticationService.introspect(introspectRequest);

      // Step 2: If introspection fails, throw error
      if (!introspectResponse.valid) {
        throw new Error('Token is invalid or revoked');
      }

      // Step 3: Decode token using JWT library
      const decoded = jwt.verify(token, this.jwtSecret);

      return decoded;
    } catch (error) {
      throw new Error(`JWT decode failed: ${error.message}`);
    }
  }

  /**
   * Decode token without verification (for testing)
   * @param {string} token - JWT token
   * @returns {object} Decoded token claims
   */
  decodeUnsafe(token) {
    return jwt.decode(token);
  }
}

module.exports = CustomJwtDecoder;
