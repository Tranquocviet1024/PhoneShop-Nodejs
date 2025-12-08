import axiosInstance from '../api/axiosConfig';

const InventoryService = {
  // Check inventory and create alerts
  checkInventory: async (threshold = 10) => {
    const response = await axiosInstance.get('/inventory/check', {
      params: { threshold }
    });
    return response.data;
  },

  // Get inventory alerts
  getAlerts: async (params = {}) => {
    const response = await axiosInstance.get('/inventory/alerts', { params });
    return response.data;
  },

  // Get inventory stats
  getStats: async () => {
    const response = await axiosInstance.get('/inventory/stats');
    return response.data;
  },

  // Resolve alert
  resolveAlert: async (alertId, notes = '') => {
    const response = await axiosInstance.put(`/inventory/alerts/${alertId}/resolve`, { notes });
    return response.data;
  },

  // Update threshold
  updateThreshold: async (productId, threshold) => {
    const response = await axiosInstance.put(`/inventory/threshold/${productId}`, { threshold });
    return response.data;
  }
};

export default InventoryService;
