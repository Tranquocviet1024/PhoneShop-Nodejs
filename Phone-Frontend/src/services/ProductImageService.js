import axiosInstance from '../api/axiosConfig';

const ProductImageService = {
  // Get product images
  getProductImages: async (productId) => {
    const response = await axiosInstance.get(`/products/${productId}/images`);
    return response.data;
  },

  // Admin: Add single image
  addImage: async (productId, imageData) => {
    const response = await axiosInstance.post(`/products/${productId}/images`, imageData);
    return response.data;
  },

  // Admin: Add multiple images
  addMultipleImages: async (productId, images) => {
    const response = await axiosInstance.post(`/products/${productId}/images/bulk`, { images });
    return response.data;
  },

  // Admin: Update image
  updateImage: async (productId, imageId, data) => {
    const response = await axiosInstance.put(`/products/${productId}/images/${imageId}`, data);
    return response.data;
  },

  // Admin: Set primary image
  setPrimaryImage: async (productId, imageId) => {
    const response = await axiosInstance.put(`/products/${productId}/images/${imageId}/primary`);
    return response.data;
  },

  // Admin: Delete image
  deleteImage: async (productId, imageId) => {
    const response = await axiosInstance.delete(`/products/${productId}/images/${imageId}`);
    return response.data;
  },

  // Admin: Reorder images
  reorderImages: async (productId, imageOrders) => {
    const response = await axiosInstance.put(`/products/${productId}/images/reorder`, { imageOrders });
    return response.data;
  }
};

export default ProductImageService;
