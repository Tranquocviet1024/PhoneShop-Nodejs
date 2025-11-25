const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'phoneshop',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'root',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false, // Set to console.log to see SQL queries
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Test connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL Database connected successfully');

    // Setup associations
    const User = require('../models/User');
    const Order = require('../models/Order');
    const Review = require('../models/Review');
    const Product = require('../models/Product');
    const Cart = require('../models/Cart');
    const Role = require('../models/Role');
    const UserRole = require('../models/UserRole');
    const AuditLog = require('../models/AuditLog');

    // User associations
    User.hasMany(Order, { foreignKey: 'userId' });
    Order.belongsTo(User, { foreignKey: 'userId' });

    User.hasMany(Review, { foreignKey: 'userId' });
    Review.belongsTo(User, { foreignKey: 'userId' });

    User.hasOne(Cart, { foreignKey: 'userId' });
    Cart.belongsTo(User, { foreignKey: 'userId' });

    // Role and Permission associations
    User.hasMany(UserRole, { foreignKey: 'userId' });
    UserRole.belongsTo(User, { foreignKey: 'userId' });

    Role.hasMany(UserRole, { foreignKey: 'roleId' });
    UserRole.belongsTo(Role, { foreignKey: 'roleId' });

    // Audit log associations
    User.hasMany(AuditLog, { foreignKey: 'userId' });
    AuditLog.belongsTo(User, { foreignKey: 'userId' });

    // Product associations
    Product.hasMany(Review, { foreignKey: 'productId' });
    Review.belongsTo(Product, { foreignKey: 'productId' });

    // Sync database models - use force: false to avoid recreating tables
    // NOTE: alter: true can cause "too many keys" error, use with caution
    await sequelize.sync({ alter: false });
    console.log('✅ Database synchronized');
    return sequelize;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
