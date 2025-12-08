const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InventoryAlert = sequelize.define('InventoryAlert', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  alertType: {
    type: DataTypes.ENUM('low_stock', 'out_of_stock', 'back_in_stock'),
    allowNull: false
  },
  threshold: {
    type: DataTypes.INTEGER,
    defaultValue: 10 // Alert when stock < threshold
  },
  currentStock: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  isResolved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resolvedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'inventory_alerts',
  indexes: [
    { fields: ['productId'] },
    { fields: ['alertType'] },
    { fields: ['isResolved'] }
  ]
});

module.exports = InventoryAlert;
