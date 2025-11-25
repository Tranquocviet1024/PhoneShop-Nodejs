/**
 * LogoutRequest DTO
 * Request body for logging out and blacklisting token
 */
class LogoutRequest {
  constructor(token) {
    if (!token || token.trim() === '') {
      throw new Error('Token cannot be empty');
    }
    this.token = token; // Token to blacklist
  }
}

module.exports = LogoutRequest;
