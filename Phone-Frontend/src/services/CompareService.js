import axiosInstance from '../api/axiosConfig';

const CompareService = {
  // Compare products
  compareProducts: async (productIds) => {
    const response = await axiosInstance.post('/compare', { productIds });
    return response.data;
  },

  // Get similar products for comparison
  getSimilarProducts: async (productId, limit = 5) => {
    const response = await axiosInstance.get(`/compare/similar/${productId}`, {
      params: { limit }
    });
    return response.data;
  }
};

export default CompareService;
