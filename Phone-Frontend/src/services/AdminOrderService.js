import api from '../api/axiosConfig';

const AdminOrderService = {
  /**
   * Lấy danh sách tất cả đơn hàng (Admin only)
   * GET /api/admin/orders
   */
  getOrders: async (params = {}) => {
    try {
      const response = await api.get('/admin/orders', { params });
      console.log('📦 AdminOrderService.getOrders response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ AdminOrderService.getOrders error:', error);
      throw error.response?.data || {
        success: false,
        message: error.message || 'Có lỗi xảy ra khi lấy danh sách đơn hàng',
      };
    }
  },

  /**
   * Lấy chi tiết một đơn hàng (Admin only)
   * GET /api/admin/orders/:orderId
   */
  getOrderDetail: async (orderId) => {
    try {
      const response = await api.get(`/admin/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: error.message || 'Có lỗi xảy ra khi lấy chi tiết đơn hàng',
      };
    }
  },

  /**
   * Cập nhật trạng thái đơn hàng (Admin only)
   * PUT /api/admin/orders/:orderId/status
   */
  updateOrderStatus: async (orderId, statusData) => {
    try {
      const response = await api.put(`/admin/orders/${orderId}/status`, statusData);
      console.log('✅ Order status updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      throw error.response?.data || {
        success: false,
        message: error.message || 'Có lỗi xảy ra khi cập nhật trạng thái đơn hàng',
      };
    }
  },

  /**
   * Hủy đơn hàng (Admin only)
   * PUT /api/admin/orders/:orderId/cancel
   */
  cancelOrder: async (orderId) => {
    try {
      const response = await api.put(`/admin/orders/${orderId}/cancel`);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: error.message || 'Có lỗi xảy ra khi hủy đơn hàng',
      };
    }
  },
};

export default AdminOrderService;
