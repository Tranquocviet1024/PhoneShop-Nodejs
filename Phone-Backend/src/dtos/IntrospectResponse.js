/**
 * IntrospectResponse DTO
 * Response body for token introspection
 */
class IntrospectResponse {
  constructor(valid, decoded = null) {
    this.valid = valid; // Token validity
    this.decoded = decoded; // Decoded token claims (optional)
  }

  static builder() {
    return {
      valid: false,
      decoded: null,
      setValid(valid) {
        this.valid = valid;
        return this;
      },
      setDecoded(decoded) {
        this.decoded = decoded;
        return this;
      },
      build() {
        return new IntrospectResponse(this.valid, this.decoded);
      }
    };
  }
}

module.exports = IntrospectResponse;
