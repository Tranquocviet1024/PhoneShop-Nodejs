import api from '../api/axiosConfig';

const OrderService = {
  /**
   * Tạo đơn hàng mới
   * POST /api/orders
   */
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: error.message || 'Có lỗi xảy ra khi tạo đơn hàng',
      };
    }
  },

  /**
   * Lấy danh sách đơn hàng của user hiện tại
   * GET /api/orders
   */
  getOrders: async (params = {}) => {
    try {
      const response = await api.get('/orders', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: error.message || 'Có lỗi xảy ra khi lấy danh sách đơn hàng',
      };
    }
  },

  /**
   * Lấy chi tiết một đơn hàng
   * GET /api/orders/:orderId
   */
  getOrderDetail: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: error.message || 'Có lỗi xảy ra khi lấy chi tiết đơn hàng',
      };
    }
  },

  /**
   * Hủy đơn hàng
   * PUT /api/orders/:orderId/cancel
   */
  cancelOrder: async (orderId) => {
    try {
      const response = await api.put(`/orders/${orderId}/cancel`);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: error.message || 'Có lỗi xảy ra khi hủy đơn hàng',
      };
    }
  },

  /**
   * Cập nhật trạng thái đơn hàng (Admin only)
   * PUT /api/orders/:orderId/status
   */
  updateOrderStatus: async (orderId, statusData) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, statusData);
      return response.data;
    } catch (error) {
      throw error.response?.data || {
        success: false,
        message: error.message || 'Có lỗi xảy ra khi cập nhật trạng thái đơn hàng',
      };
    }
  },
};

export default OrderService;
