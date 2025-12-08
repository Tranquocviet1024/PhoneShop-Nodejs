const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Coupon = sequelize.define('Coupon', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    set(value) {
      this.setDataValue('code', value.toUpperCase());
    }
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  discountType: {
    type: DataTypes.ENUM('percentage', 'fixed'),
    allowNull: false,
    defaultValue: 'percentage'
  },
  discountValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: { min: 0 }
  },
  minOrderAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: { min: 0 }
  },
  maxDiscountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true, // null = không giới hạn
    validate: { min: 0 }
  },
  usageLimit: {
    type: DataTypes.INTEGER,
    defaultValue: null // null = không giới hạn
  },
  usedCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  userUsageLimit: {
    type: DataTypes.INTEGER,
    defaultValue: 1 // Mỗi user dùng được bao nhiêu lần
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  applicableCategories: {
    type: DataTypes.JSON,
    defaultValue: [] // [] = áp dụng tất cả
  },
  applicableProducts: {
    type: DataTypes.JSON,
    defaultValue: [] // [] = áp dụng tất cả
  }
}, {
  timestamps: true,
  tableName: 'coupons',
  indexes: [
    { unique: true, fields: ['code'] },
    { fields: ['isActive'] },
    { fields: ['startDate', 'endDate'] }
  ]
});

module.exports = Coupon;
