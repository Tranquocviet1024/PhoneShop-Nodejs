/**
 * InValidateToken DTO
 * Represents a blacklisted/revoked token
 */
class InValidateToken {
  constructor(id, expiryTime) {
    this.id = id; // JWT ID (jti)
    this.expiryTime = expiryTime; // Token expiration time
  }
}

module.exports = InValidateToken;
