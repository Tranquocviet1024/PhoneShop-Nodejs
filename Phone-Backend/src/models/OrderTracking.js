const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OrderTracking = sequelize.define('OrderTracking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderId: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM(
      'order_placed',      // Đặt hàng thành công
      'payment_confirmed', // Thanh toán xác nhận
      'processing',        // Đang xử lý
      'picked_up',         // Đã lấy hàng
      'in_transit',        // Đang vận chuyển
      'out_for_delivery',  // Đang giao hàng
      'delivered',         // Đã giao
      'cancelled',         // Đã hủy
      'returned'           // Hoàn trả
    ),
    allowNull: false
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true, // System update có thể null
    references: {
      model: 'users',
      key: 'id'
    }
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  timestamps: true,
  tableName: 'order_trackings',
  indexes: [
    { fields: ['orderId'] },
    { fields: ['status'] },
    { fields: ['createdAt'] }
  ]
});

module.exports = OrderTracking;
