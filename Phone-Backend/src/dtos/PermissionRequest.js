/**
 * PermissionRequest DTO
 * Request body for creating/updating permissions
 */
class PermissionRequest {
  constructor(name, description) {
    this.name = name; // Permission name
    this.description = description; // Permission description
  }
}

module.exports = PermissionRequest;
