/**
 * Migration script to create new tables for 6 new features:
 * 1. Wishlist
 * 2. Coupon / CouponUsage
 * 3. Notification
 * 4. SearchHistory
 * 5. OrderTracking
 * 
 * Run this script with: node scripts/migrate-new-features.js
 */

require('../src/config/database');

// Import all models
const Wishlist = require('../src/models/Wishlist');
const Coupon = require('../src/models/Coupon');
const CouponUsage = require('../src/models/CouponUsage');
const Notification = require('../src/models/Notification');
const SearchHistory = require('../src/models/SearchHistory');
const OrderTracking = require('../src/models/OrderTracking');

async function migrate() {
  try {
    console.log('🚀 Starting migration for new features...\n');

    // Sync new models
    console.log('📦 Creating Wishlist table...');
    await Wishlist.sync({ alter: true });
    console.log('✅ Wishlist table created\n');

    console.log('📦 Creating Coupon table...');
    await Coupon.sync({ alter: true });
    console.log('✅ Coupon table created\n');

    console.log('📦 Creating CouponUsage table...');
    await CouponUsage.sync({ alter: true });
    console.log('✅ CouponUsage table created\n');

    console.log('📦 Creating Notification table...');
    await Notification.sync({ alter: true });
    console.log('✅ Notification table created\n');

    console.log('📦 Creating SearchHistory table...');
    await SearchHistory.sync({ alter: true });
    console.log('✅ SearchHistory table created\n');

    console.log('📦 Creating OrderTracking table...');
    await OrderTracking.sync({ alter: true });
    console.log('✅ OrderTracking table created\n');

    console.log('🎉 Migration completed successfully!');
    console.log('\n📋 Summary of new tables:');
    console.log('   - Wishlists: Store user favorite products');
    console.log('   - Coupons: Store discount coupons');
    console.log('   - CouponUsages: Track coupon usage by users');
    console.log('   - Notifications: Store user notifications');
    console.log('   - SearchHistories: Track user search history');
    console.log('   - OrderTrackings: Track order delivery status');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
