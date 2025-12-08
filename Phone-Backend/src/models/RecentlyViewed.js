const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RecentlyViewed = sequelize.define('RecentlyViewed', {
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
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  viewedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  tableName: 'recently_viewed',
  indexes: [
    { fields: ['userId', 'productId'], unique: true },
    { fields: ['userId', 'viewedAt'] }
  ]
});

module.exports = RecentlyViewed;
