const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserRole = sequelize.define('UserRole', {
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
    }
  },
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'roles',
      key: 'id'
    }
  },
  // Custom permissions for this user (override role permissions)
  additionalPermissions: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Additional permissions granted to this user'
  },
  // Permissions to deny
  deniedPermissions: {
    type: DataTypes.JSON,
    defaultValue: [],
    comment: 'Permissions denied for this user'
  }
}, {
  timestamps: true,
  tableName: 'user_roles',
  indexes: [
    { fields: ['userId'] },
    { fields: ['roleId'] }
  ]
});

module.exports = UserRole;
