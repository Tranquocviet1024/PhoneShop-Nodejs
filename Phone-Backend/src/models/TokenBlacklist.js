const { DataTypes } = require('sequelize');
const db = require('../config/database');

const TokenBlacklist = db.sequelize.define(
  'TokenBlacklist',
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      comment: 'JWT ID (jti claim)',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'User who owns this token',
      index: true,
    },
    expiryTime: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Token expiration time',
      index: true,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'logout',
      comment: 'Reason for blacklisting (logout, password_change, etc.)',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: 'When token was blacklisted',
    },
  },
  {
    tableName: 'token_blacklist',
    timestamps: false,
    indexes: [
      {
        fields: ['userId'],
        name: 'idx_user_id',
      },
      {
        fields: ['expiryTime'],
        name: 'idx_expiry_time',
      },
    ],
  }
);

module.exports = TokenBlacklist;
