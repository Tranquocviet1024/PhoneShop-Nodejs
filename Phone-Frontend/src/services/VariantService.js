import axiosInstance from '../api/axiosConfig';

const VariantService = {
  // Get product variants
  getProductVariants: async (productId) => {
    const response = await axiosInstance.get(`/products/${productId}/variants`);
    return response.data;
  },

  // Get variant by options
  getVariantByOptions: async (productId, color, storage) => {
    const response = await axiosInstance.get(`/products/${productId}/variants/find`, {
      params: { color, storage }
    });
    return response.data;
  },

  // Get total stock
  getTotalStock: async (productId) => {
    const response = await axiosInstance.get(`/products/${productId}/variants/stock`);
    return response.data;
  },

  // Admin: Create variant
  createVariant: async (productId, data) => {
    const response = await axiosInstance.post(`/products/${productId}/variants`, data);
    return response.data;
  },

  // Admin: Create bulk variants
  createBulkVariants: async (productId, variants) => {
    const response = await axiosInstance.post(`/products/${productId}/variants/bulk`, { variants });
    return response.data;
  },

  // Admin: Update variant
  updateVariant: async (productId, variantId, data) => {
    const response = await axiosInstance.put(`/products/${productId}/variants/${variantId}`, data);
    return response.data;
  },

  // Admin: Update variant stock
  updateStock: async (productId, variantId, stock, operation = 'set') => {
    const response = await axiosInstance.put(`/products/${productId}/variants/${variantId}/stock`, {
      stock,
      operation
    });
    return response.data;
  },

  // Admin: Delete variant
  deleteVariant: async (productId, variantId) => {
    const response = await axiosInstance.delete(`/products/${productId}/variants/${variantId}`);
    return response.data;
  }
};

export default VariantService;
