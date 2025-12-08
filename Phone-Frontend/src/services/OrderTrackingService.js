import axiosInstance from '../api/axiosConfig';

const OrderTrackingService = {
  // Get tracking history for an order
  getOrderTracking: async (orderId) => {
    const response = await axiosInstance.get(`/order-tracking/${orderId}`);
    return response.data;
  },

  // Admin/Staff: Add tracking event
  addTrackingEvent: async (orderId, trackingData) => {
    const response = await axiosInstance.post(`/order-tracking/${orderId}`, trackingData);
    return response.data;
  },

  // Admin/Staff: Update shipping location
  updateShippingLocation: async (orderId, location, description = '') => {
    const response = await axiosInstance.put(`/order-tracking/${orderId}/location`, {
      location,
      description
    });
    return response.data;
  },

  // Admin: Get orders by tracking status
  getOrdersByStatus: async (status, params = {}) => {
    const response = await axiosInstance.get(`/order-tracking/status/${status}`, { params });
    return response.data;
  },

  // Get status display info
  getStatusInfo: (status) => {
    const statusMap = {
      order_placed: {
        label: 'Đã đặt hàng',
        icon: '📝',
        color: '#6c757d',
        description: 'Đơn hàng đã được tạo'
      },
      confirmed: {
        label: 'Đã xác nhận',
        icon: '✅',
        color: '#17a2b8',
        description: 'Đơn hàng đã được xác nhận'
      },
      processing: {
        label: 'Đang xử lý',
        icon: '⚙️',
        color: '#007bff',
        description: 'Đơn hàng đang được chuẩn bị'
      },
      packed: {
        label: 'Đã đóng gói',
        icon: '📦',
        color: '#6f42c1',
        description: 'Đơn hàng đã được đóng gói'
      },
      shipped: {
        label: 'Đã gửi',
        icon: '🚚',
        color: '#fd7e14',
        description: 'Đơn hàng đã được giao cho đơn vị vận chuyển'
      },
      in_transit: {
        label: 'Đang vận chuyển',
        icon: '🛫',
        color: '#20c997',
        description: 'Đơn hàng đang trên đường giao'
      },
      out_for_delivery: {
        label: 'Đang giao hàng',
        icon: '🏍️',
        color: '#e83e8c',
        description: 'Shipper đang giao hàng đến bạn'
      },
      delivered: {
        label: 'Đã giao',
        icon: '✨',
        color: '#28a745',
        description: 'Đơn hàng đã được giao thành công'
      },
      cancelled: {
        label: 'Đã hủy',
        icon: '❌',
        color: '#dc3545',
        description: 'Đơn hàng đã bị hủy'
      },
      returned: {
        label: 'Đã trả hàng',
        icon: '↩️',
        color: '#6c757d',
        description: 'Đơn hàng đã được trả lại'
      }
    };
    return statusMap[status] || {
      label: status,
      icon: '📋',
      color: '#6c757d',
      description: ''
    };
  },

  // Get tracking progress percentage
  getProgressPercentage: (status) => {
    const progressMap = {
      order_placed: 10,
      confirmed: 20,
      processing: 35,
      packed: 50,
      shipped: 65,
      in_transit: 75,
      out_for_delivery: 90,
      delivered: 100,
      cancelled: 0,
      returned: 0
    };
    return progressMap[status] || 0;
  },

  // Format tracking date
  formatTrackingDate: (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
};

export default OrderTrackingService;
