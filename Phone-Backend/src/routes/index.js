const express = require('express');

const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const categoryRoutes = require('./categoryRoutes');
const orderRoutes = require('./orderRoutes');
const userRoutes = require('./userRoutes');
const reviewRoutes = require('./reviewRoutes');
const cartRoutes = require('./cartRoutes');
const paymentRoutes = require('./paymentRoutes');
const adminRoutes = require('./adminRoutes');
const uploadRoutes = require('./uploadRoutes');
const profileRoutes = require('./profileRoutes');
const roleRoutes = require('./roleRoutes');
const auditRoutes = require('./auditRoutes');
const ocrRoutes = require('./ocrRoutes');
const wishlistRoutes = require('./wishlistRoutes');
const couponRoutes = require('./couponRoutes');
const notificationRoutes = require('./notificationRoutes');
const searchHistoryRoutes = require('./searchHistoryRoutes');
const orderTrackingRoutes = require('./orderTrackingRoutes');
const compareRoutes = require('./compareRoutes');
const recentlyViewedRoutes = require('./recentlyViewedRoutes');
const flashSaleRoutes = require('./flashSaleRoutes');
const inventoryRoutes = require('./inventoryRoutes');
const reportRoutes = require('./reportRoutes');
const productImageRoutes = require('./productImageRoutes');
const variantRoutes = require('./variantRoutes');

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);
router.use('/users', userRoutes);
router.use('/reviews', reviewRoutes);
router.use('/cart', cartRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);
router.use('/roles', roleRoutes);
router.use('/audit', auditRoutes);
router.use('/ocr', ocrRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/coupons', couponRoutes);
router.use('/notifications', notificationRoutes);
router.use('/search-history', searchHistoryRoutes);
router.use('/order-tracking', orderTrackingRoutes);
router.use('/compare', compareRoutes);
router.use('/recently-viewed', recentlyViewedRoutes);
router.use('/flash-sales', flashSaleRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/reports', reportRoutes);
router.use('/products', productImageRoutes); // Product images routes
router.use('/products', variantRoutes); // Product variants routes

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
