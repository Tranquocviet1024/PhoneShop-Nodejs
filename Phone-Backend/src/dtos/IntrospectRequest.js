/**
 * IntrospectRequest DTO
 * Request body for introspecting token validity
 */
class IntrospectRequest {
  constructor(token) {
    if (!token || token.trim() === '') {
      throw new Error('Token cannot be empty');
    }
    this.token = token;
  }

  static builder() {
    return {
      token: null,
      setToken(token) {
        this.token = token;
        return this;
      },
      build() {
        return new IntrospectRequest(this.token);
      }
    };
  }
}

module.exports = IntrospectRequest;
