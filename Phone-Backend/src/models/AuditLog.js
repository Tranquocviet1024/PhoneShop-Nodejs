const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'User who performed the action'
  },
  action: {
    type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW'),
    allowNull: false,
    comment: 'Type of action performed'
  },
  entityType: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Type of entity (Product, Order, User, etc.)'
  },
  entityId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'ID of the entity being modified'
  },
  entityName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Name/identifier of the entity'
  },
  changes: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Object containing before/after values for UPDATE'
  },
  // For UPDATE: { before: {...}, after: {...} }
  oldValues: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Previous values before update'
  },
  newValues: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'New values after update'
  },
  status: {
    type: DataTypes.ENUM('SUCCESS', 'FAILURE'),
    defaultValue: 'SUCCESS'
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'IP address of the request'
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'User agent of the browser'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'audit_logs',
  indexes: [
    { fields: ['userId', 'createdAt'] },
    { fields: ['entityType', 'entityId'] },
    { fields: ['action'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = AuditLog;
