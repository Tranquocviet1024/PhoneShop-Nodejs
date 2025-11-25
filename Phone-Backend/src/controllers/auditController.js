const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const { Op } = require('sequelize');
const permissionService = require('../services/permissionService');

/**
 * Get audit logs with filters
 */
exports.getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, action, entityType, userId, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    if (userId) where.userId = parseInt(userId);

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const { count, rows } = await AuditLog.findAndCountAll({
      where,
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email', 'fullName']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json(
      new ApiResponse(200, {
        logs: rows,
        pagination: { total: count, page: Number(page), limit: Number(limit), totalPages }
      }, 'Audit logs retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get audit logs for specific entity
 */
exports.getEntityAuditLogs = async (req, res, next) => {
  try {
    const { entityType, entityId } = req.params;
    const { limit = 50 } = req.query;

    const logs = await permissionService.getEntityAuditLogs(entityType, parseInt(entityId), Number(limit));

    res.status(200).json(
      new ApiResponse(200, logs, 'Entity audit logs retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get audit logs for specific user
 */
exports.getUserAuditLogs = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await AuditLog.findAndCountAll({
      where: { userId: parseInt(userId) },
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json(
      new ApiResponse(200, {
        logs: rows,
        pagination: { total: count, page: Number(page), limit: Number(limit), totalPages }
      }, 'User audit logs retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get data change history for entity
 */
exports.getDataChangeHistory = async (req, res, next) => {
  try {
    const { entityType, entityId } = req.params;

    const logs = await AuditLog.findAll({
      where: {
        entityType,
        entityId: parseInt(entityId),
        action: { [Op.in]: ['CREATE', 'UPDATE', 'DELETE'] }
      },
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email', 'fullName']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    // Format the response to show change history
    const history = logs.map(log => ({
      id: log.id,
      timestamp: log.createdAt,
      action: log.action,
      actor: log.User,
      oldValues: log.oldValues,
      newValues: log.newValues,
      changes: log.changes,
      description: log.description
    }));

    res.status(200).json(
      new ApiResponse(200, history, 'Data change history retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get statistics
 */
exports.getStatistics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    // Count by action
    const actionCounts = await AuditLog.findAll({
      attributes: ['action', [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']],
      where,
      group: ['action'],
      raw: true
    });

    // Count by entity type
    const entityTypeCounts = await AuditLog.findAll({
      attributes: ['entityType', [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']],
      where,
      group: ['entityType'],
      raw: true
    });

    // Most active users
    const activeUsers = await AuditLog.findAll({
      attributes: ['userId', [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']],
      where,
      group: ['userId'],
      include: [
        {
          model: User,
          attributes: ['username', 'email'],
          required: true
        }
      ],
      order: [[require('sequelize').fn('COUNT', require('sequelize').col('id')), 'DESC']],
      limit: 10,
      raw: true,
      subQuery: false
    });

    res.status(200).json(
      new ApiResponse(200, {
        actionCounts,
        entityTypeCounts,
        activeUsers,
        period: { startDate, endDate }
      }, 'Statistics retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};
