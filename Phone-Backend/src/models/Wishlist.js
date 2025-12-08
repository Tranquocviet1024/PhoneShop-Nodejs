const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Wishlist = sequelize.define('Wishlist', {
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
  }
}, {
  timestamps: true,
  tableName: 'wishlists',
  indexes: [
    { fields: ['userId'] },
    { fields: ['productId'] },
    { unique: true, fields: ['userId', 'productId'] } // Mỗi user chỉ thêm 1 sản phẩm 1 lần
  ]
});

module.exports = Wishlist;
