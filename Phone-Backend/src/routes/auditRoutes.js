const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRole } = require('../middleware/authorizationMiddleware');
const {
  getAuditLogs,
  getEntityAuditLogs,
  getUserAuditLogs,
  getDataChangeHistory,
  getStatistics
} = require('../controllers/auditController');
const RoleEnum = require('../enums/RoleEnum');

const router = express.Router();

// All audit routes require authentication
router.use(authenticateToken);

// Get audit logs (admin only)
router.get('/', authorizeRole([RoleEnum.ADMIN]), getAuditLogs);

// Get statistics (admin only)
router.get('/statistics/summary', authorizeRole([RoleEnum.ADMIN]), getStatistics);

// Get entity audit logs (admin can view all, user can view related to themselves)
router.get('/entity/:entityType/:entityId', getEntityAuditLogs);

// Get data change history
router.get('/changes/:entityType/:entityId', getDataChangeHistory);

// Get user's own audit logs
router.get('/user/:userId', (req, res, next) => {
  // Check if user is viewing their own logs or is admin
  if (req.params.userId !== req.userId.toString() && req.userRole !== RoleEnum.ADMIN) {
    return res.status(403).json({
      success: false,
      message: 'You can only view your own audit logs'
    });
  }
  next();
}, getUserAuditLogs);

module.exports = router;
