import axiosInstance from '../api/axiosConfig';

const RecentlyViewedService = {
  // Get recently viewed products
  getRecentlyViewed: async (limit = 10) => {
    const response = await axiosInstance.get('/recently-viewed', {
      params: { limit }
    });
    return response.data;
  },

  // Track/Add product to recently viewed (alias for addToRecentlyViewed)
  trackView: async (productId) => {
    const response = await axiosInstance.post('/recently-viewed', { productId });
    return response.data;
  },

  // Add product to recently viewed
  addToRecentlyViewed: async (productId) => {
    const response = await axiosInstance.post('/recently-viewed', { productId });
    return response.data;
  },

  // Remove from recently viewed
  removeFromRecentlyViewed: async (productId) => {
    const response = await axiosInstance.delete(`/recently-viewed/${productId}`);
    return response.data;
  },

  // Clear all recently viewed
  clearRecentlyViewed: async () => {
    const response = await axiosInstance.delete('/recently-viewed/clear');
    return response.data;
  }
};

export default RecentlyViewedService;
