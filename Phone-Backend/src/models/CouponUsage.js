const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CouponUsage = sequelize.define('CouponUsage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  couponId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'coupons',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  orderId: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  timestamps: true,
  tableName: 'coupon_usages',
  indexes: [
    { fields: ['couponId'] },
    { fields: ['userId'] },
    { fields: ['orderId'] }
  ]
});

module.exports = CouponUsage;
