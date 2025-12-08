const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SearchHistory = sequelize.define('SearchHistory', {
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
  keyword: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  resultCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  searchedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false,
  tableName: 'search_histories',
  indexes: [
    { fields: ['userId'] },
    { fields: ['keyword'] },
    { fields: ['searchedAt'] }
  ]
});

module.exports = SearchHistory;
