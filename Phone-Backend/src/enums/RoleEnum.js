/**
 * Role Enumeration
 * Defines all available user roles in the system
 */
const RoleEnum = {
  ADMIN: 'admin',
  USER: 'user',
  STAFF: 'staff',
  MODERATOR: 'moderator'
};

// Make it also usable as array for validation
RoleEnum.values = Object.values(RoleEnum);

// Check if a role is valid
RoleEnum.isValid = (role) => {
  return RoleEnum.values.includes(role);
};

module.exports = RoleEnum;
