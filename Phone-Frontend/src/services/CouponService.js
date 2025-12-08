import axiosInstance from '../api/axiosConfig';

const CouponService = {
  // Validate a coupon code
  validateCoupon: async (code, orderAmount, items = []) => {
    const response = await axiosInstance.post('/coupons/validate', {
      code,
      orderAmount,
      items
    });
    return response.data;
  },

  // Get available coupons for user
  getAvailableCoupons: async () => {
    const response = await axiosInstance.get('/coupons/available');
    return response.data;
  },

  // Admin: Get all coupons
  getAllCoupons: async (params = {}) => {
    const response = await axiosInstance.get('/coupons', { params });
    return response.data;
  },

  // Admin: Create a new coupon
  createCoupon: async (couponData) => {
    const response = await axiosInstance.post('/coupons', couponData);
    return response.data;
  },

  // Admin: Update a coupon
  updateCoupon: async (couponId, couponData) => {
    const response = await axiosInstance.put(`/coupons/${couponId}`, couponData);
    return response.data;
  },

  // Admin: Delete a coupon
  deleteCoupon: async (couponId) => {
    const response = await axiosInstance.delete(`/coupons/${couponId}`);
    return response.data;
  },

  // Apply coupon to order (used during checkout)
  applyCoupon: async (code, cartItems) => {
    const orderAmount = cartItems.reduce((total, item) => 
      total + (item.price * item.quantity), 0
    );
    
    return await CouponService.validateCoupon(code, orderAmount, cartItems);
  }
};

export default CouponService;
