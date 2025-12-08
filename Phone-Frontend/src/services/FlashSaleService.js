import axiosInstance from '../api/axiosConfig';

const FlashSaleService = {
  // Get active flash sales
  getActiveFlashSales: async () => {
    const response = await axiosInstance.get('/flash-sales/active');
    return response.data;
  },

  // Get upcoming flash sales
  getUpcomingFlashSales: async () => {
    const response = await axiosInstance.get('/flash-sales/upcoming');
    return response.data;
  },

  // Get flash sale by ID
  getFlashSaleById: async (id) => {
    const response = await axiosInstance.get(`/flash-sales/${id}`);
    return response.data;
  },

  // Admin: Get all flash sales
  getAllFlashSales: async (params = {}) => {
    const response = await axiosInstance.get('/flash-sales', { params });
    return response.data;
  },

  // Admin: Create flash sale
  createFlashSale: async (data) => {
    const response = await axiosInstance.post('/flash-sales', data);
    return response.data;
  },

  // Admin: Update flash sale
  updateFlashSale: async (id, data) => {
    const response = await axiosInstance.put(`/flash-sales/${id}`, data);
    return response.data;
  },

  // Admin: Delete flash sale
  deleteFlashSale: async (id) => {
    const response = await axiosInstance.delete(`/flash-sales/${id}`);
    return response.data;
  },

  // Admin: Add item to flash sale
  addFlashSaleItem: async (flashSaleId, itemData) => {
    const response = await axiosInstance.post(`/flash-sales/${flashSaleId}/items`, itemData);
    return response.data;
  },

  // Admin: Remove item from flash sale
  removeFlashSaleItem: async (flashSaleId, itemId) => {
    const response = await axiosInstance.delete(`/flash-sales/${flashSaleId}/items/${itemId}`);
    return response.data;
  }
};

export default FlashSaleService;
