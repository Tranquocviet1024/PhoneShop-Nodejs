const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.ENUM('credit-card', 'bank-transfer', 'e-wallet', 'cod', 'payos'),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
    defaultValue: 'pending'
  },
  transactionId: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  // PayOS specific fields
  payosOrderCode: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true,
    comment: 'PayOS order code (idempotency key)'
  },
  payosTransactionId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'PayOS transaction ID'
  },
  paymentUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'PayOS payment URL'
  },
  qrCodeUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'PayOS QR code URL'
  },
  idempotencyKey: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
    comment: 'Idempotency key to prevent duplicate payments'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Additional payment metadata from PayOS'
  }
}, {
  timestamps: true,
  tableName: 'payments',
  indexes: [
    { fields: ['orderId'] },
    { fields: ['userId'] }
  ]
});

module.exports = Payment;
