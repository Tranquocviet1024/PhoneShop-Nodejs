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
    const Wishlist = require('../models/Wishlist');
    const Coupon = require('../models/Coupon');
    const CouponUsage = require('../models/CouponUsage');
    const Notification = require('../models/Notification');
    const SearchHistory = require('../models/SearchHistory');
    const OrderTracking = require('../models/OrderTracking');
    const Category = require('../models/Category');
    const RecentlyViewed = require('../models/RecentlyViewed');
    const FlashSale = require('../models/FlashSale');
    const FlashSaleItem = require('../models/FlashSaleItem');
    const InventoryAlert = require('../models/InventoryAlert');
    const ProductImage = require('../models/ProductImage');
    const ProductVariant = require('../models/ProductVariant');

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

    // Note: Product uses 'category' STRING field for category name
    // No foreign key relationship with Category table

    // Wishlist associations
    User.hasMany(Wishlist, { foreignKey: 'userId' });
    Wishlist.belongsTo(User, { foreignKey: 'userId' });

    Product.hasMany(Wishlist, { foreignKey: 'productId' });
    Wishlist.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

    // Coupon associations
    Coupon.hasMany(CouponUsage, { foreignKey: 'couponId' });
    CouponUsage.belongsTo(Coupon, { foreignKey: 'couponId' });

    User.hasMany(CouponUsage, { foreignKey: 'userId' });
    CouponUsage.belongsTo(User, { foreignKey: 'userId' });

    // Note: CouponUsage.orderId is STRING (stores Order.orderId value like 'ORD-xxx')
    // No foreign key relationship - it's a reference by order code, not by Order.id

    // Notification associations
    User.hasMany(Notification, { foreignKey: 'userId' });
    Notification.belongsTo(User, { foreignKey: 'userId' });

    // Search History associations
    User.hasMany(SearchHistory, { foreignKey: 'userId' });
    SearchHistory.belongsTo(User, { foreignKey: 'userId' });

    // Order Tracking associations
    // Note: OrderTracking.orderId is STRING (stores Order.orderId value like 'ORD-xxx')
    // No foreign key relationship to Order.id - it's a reference by order code
    User.hasMany(OrderTracking, { foreignKey: 'updatedBy', as: 'trackingUpdates' });
    OrderTracking.belongsTo(User, { foreignKey: 'updatedBy', as: 'updater' });

    // Recently Viewed associations
    User.hasMany(RecentlyViewed, { foreignKey: 'userId' });
    RecentlyViewed.belongsTo(User, { foreignKey: 'userId' });
    Product.hasMany(RecentlyViewed, { foreignKey: 'productId' });
    RecentlyViewed.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

    // Flash Sale associations
    FlashSale.hasMany(FlashSaleItem, { foreignKey: 'flashSaleId', as: 'items' });
    FlashSaleItem.belongsTo(FlashSale, { foreignKey: 'flashSaleId' });
    Product.hasMany(FlashSaleItem, { foreignKey: 'productId' });
    FlashSaleItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

    // Inventory Alert associations
    Product.hasMany(InventoryAlert, { foreignKey: 'productId' });
    InventoryAlert.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
    User.hasMany(InventoryAlert, { foreignKey: 'resolvedBy', as: 'resolvedAlerts' });
    InventoryAlert.belongsTo(User, { foreignKey: 'resolvedBy', as: 'resolver' });

    // Product Image associations
    Product.hasMany(ProductImage, { foreignKey: 'productId', as: 'images' });
    ProductImage.belongsTo(Product, { foreignKey: 'productId' });

    // Product Variant associations
    Product.hasMany(ProductVariant, { foreignKey: 'productId', as: 'variants' });
    ProductVariant.belongsTo(Product, { foreignKey: 'productId' });

    // Sync database models
    // In production: sync({ force: false }) - only create if not exists
    // alter: true can cause issues with constraints
    const isProduction = process.env.NODE_ENV === 'production';
    
    // For first deployment, tables need to be created
    // After first successful deployment, this will just verify tables exist
    await sequelize.sync({ force: false, alter: false });
    console.log('✅ Database synchronized');
    return sequelize;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
