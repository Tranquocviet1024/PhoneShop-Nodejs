const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProductImage = sequelize.define('ProductImage', {
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
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  altText: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isPrimary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  tableName: 'product_images',
  indexes: [
    { fields: ['productId'] },
    { fields: ['productId', 'isPrimary'] }
  ]
});

module.exports = ProductImage;
