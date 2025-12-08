const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FlashSale = sequelize.define('FlashSale', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  bannerImage: {
    type: DataTypes.STRING(500),
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'flash_sales',
  indexes: [
    { fields: ['startTime', 'endTime'] },
    { fields: ['isActive'] }
  ]
});

module.exports = FlashSale;
