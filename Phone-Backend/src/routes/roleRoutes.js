const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/authorizationMiddleware');
const { requirePermission } = require('../middleware/permissionMiddleware');
const {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  assignRoleToUser,
  removeRoleFromUser,
  getUserPermissions,
  grantPermission,
  revokePermission,
  denyPermission,
  allowPermission
} = require('../controllers/roleController');
const RoleEnum = require('../enums/RoleEnum');
const PermissionEnum = require('../enums/PermissionEnum');

const router = express.Router();

// Public routes (chỉ cần authenticated)
router.get('/', authenticateToken, getAllRoles);
router.get('/:roleId', authenticateToken, getRoleById);

// Protected routes (require authentication and admin role)
router.use(authenticateToken);
router.use(authorizeRole([RoleEnum.ADMIN]));

// Roles management (ADMIN only)
router.post('/', createRole);
router.put('/:roleId', updateRole);
router.delete('/:roleId', deleteRole);

// User-Role assignment
router.post('/user/assign', assignRoleToUser);
router.delete('/user/:userId/role/:roleId', removeRoleFromUser);

// User permissions
router.get('/user/:userId/permissions', getUserPermissions);
router.post('/user/grant-permission', grantPermission);
router.post('/user/revoke-permission', revokePermission);
router.post('/user/deny-permission', denyPermission);
router.post('/user/allow-permission', allowPermission);

module.exports = router;
