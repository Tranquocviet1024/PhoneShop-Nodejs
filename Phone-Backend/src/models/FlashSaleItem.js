const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FlashSaleItem = sequelize.define('FlashSaleItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  flashSaleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'flash_sales',
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
  salePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  originalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  discountPercent: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 0, max: 100 }
  },
  stockLimit: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100
  },
  soldCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true,
  tableName: 'flash_sale_items',
  indexes: [
    { fields: ['flashSaleId', 'productId'], unique: true },
    { fields: ['productId'] }
  ]
});

module.exports = FlashSaleItem;
