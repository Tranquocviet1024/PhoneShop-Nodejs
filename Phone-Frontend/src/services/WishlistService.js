import axiosInstance from '../api/axiosConfig';

const WishlistService = {
  // Get user's wishlist
  getWishlist: async () => {
    const response = await axiosInstance.get('/wishlist');
    return response.data;
  },

  // Add product to wishlist
  addToWishlist: async (productId) => {
    const response = await axiosInstance.post('/wishlist', { productId });
    return response.data;
  },

  // Remove product from wishlist
  removeFromWishlist: async (productId) => {
    const response = await axiosInstance.delete(`/wishlist/${productId}`);
    return response.data;
  },

  // Check if product is in wishlist
  checkWishlist: async (productId) => {
    const response = await axiosInstance.get(`/wishlist/check/${productId}`);
    return response.data;
  },

  // Clear entire wishlist
  clearWishlist: async () => {
    const response = await axiosInstance.delete('/wishlist/clear');
    return response.data;
  },

  // Toggle wishlist (add if not exists, remove if exists)
  toggleWishlist: async (productId) => {
    try {
      const checkResponse = await WishlistService.checkWishlist(productId);
      if (checkResponse.data?.inWishlist) {
        return await WishlistService.removeFromWishlist(productId);
      } else {
        return await WishlistService.addToWishlist(productId);
      }
    } catch (error) {
      // If check fails, try to add
      return await WishlistService.addToWishlist(productId);
    }
  }
};

export default WishlistService;
