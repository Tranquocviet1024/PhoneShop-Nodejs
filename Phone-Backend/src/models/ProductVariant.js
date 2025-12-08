const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProductVariant = sequelize.define('ProductVariant', {
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
  sku: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false // e.g., "iPhone 15 Pro - 256GB - Titan Đen"
  },
  color: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  colorCode: {
    type: DataTypes.STRING(7), // Hex color code e.g., #FF0000
    allowNull: true
  },
  storage: {
    type: DataTypes.STRING(50),
    allowNull: true // e.g., "128GB", "256GB", "512GB"
  },
  ram: {
    type: DataTypes.STRING(50),
    allowNull: true // e.g., "8GB", "12GB"
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  originalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: { min: 0 }
  },
  image: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  tableName: 'product_variants',
  indexes: [
    { fields: ['productId'] },
    { fields: ['sku'], unique: true },
    { fields: ['color'] },
    { fields: ['storage'] }
  ]
});

module.exports = ProductVariant;
