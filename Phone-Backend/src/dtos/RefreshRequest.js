/**
 * RefreshRequest DTO
 * Request body for refreshing access token
 */
class RefreshRequest {
  constructor(token) {
    this.token = token; // Refresh token
  }
}

module.exports = RefreshRequest;
