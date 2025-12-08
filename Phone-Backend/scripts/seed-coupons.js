/**
 * Seed script to create sample coupons
 * Run with: node scripts/seed-coupons.js
 */

const { sequelize } = require('../src/config/database');
const Coupon = require('../src/models/Coupon');

const sampleCoupons = [
  {
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 500000,
    maxDiscountAmount: 200000,
    usageLimit: 1000,
    startDate: new Date(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    isActive: true,
    description: 'Giảm 10% cho khách hàng mới'
  },
  {
    code: 'FLASHSALE50',
    discountType: 'percentage',
    discountValue: 50,
    minOrderAmount: 2000000,
    maxDiscountAmount: 500000,
    usageLimit: 100,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    isActive: true,
    description: 'Flash Sale - Giảm 50% tối đa 500K'
  },
  {
    code: 'FREESHIP',
    discountType: 'fixed',
    discountValue: 30000,
    minOrderAmount: 300000,
    maxDiscountAmount: 30000,
    usageLimit: 500,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    isActive: true,
    description: 'Miễn phí vận chuyển'
  },
  {
    code: 'VIP20',
    discountType: 'percentage',
    discountValue: 20,
    minOrderAmount: 1000000,
    maxDiscountAmount: 1000000,
    usageLimit: 50,
    startDate: new Date(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
    isActive: true,
    description: 'Mã VIP giảm 20%'
  },
  {
    code: 'NEWYEAR2024',
    discountType: 'percentage',
    discountValue: 15,
    minOrderAmount: 500000,
    maxDiscountAmount: 300000,
    usageLimit: 200,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31'),
    isActive: false,
    description: 'Khuyến mãi đầu năm 2024'
  },
  {
    code: 'SUMMER100K',
    discountType: 'fixed',
    discountValue: 100000,
    minOrderAmount: 1500000,
    maxDiscountAmount: 100000,
    usageLimit: 300,
    startDate: new Date(),
    endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
    isActive: true,
    description: 'Mùa hè giảm ngay 100K'
  }
];

async function seedCoupons() {
  try {
    console.log('🚀 Starting coupon seeding...\n');

    // Check if coupons already exist
    const existingCount = await Coupon.count();
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing coupons. Skipping seed.`);
      console.log('   To re-seed, manually delete existing coupons first.');
      process.exit(0);
    }

    // Create sample coupons
    for (const couponData of sampleCoupons) {
      await Coupon.create(couponData);
      console.log(`✅ Created coupon: ${couponData.code}`);
    }

    console.log(`\n🎉 Successfully created ${sampleCoupons.length} sample coupons!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedCoupons();
