import axiosInstance from '../api/axiosConfig';

const NotificationService = {
  // Get user's notifications
  getNotifications: async (params = {}) => {
    const response = await axiosInstance.get('/notifications', { params });
    return response.data;
  },

  // Get unread notification count
  getUnreadCount: async () => {
    const response = await axiosInstance.get('/notifications', { 
      params: { isRead: false, limit: 1 } 
    });
    return response.data?.pagination?.total || 0;
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    const response = await axiosInstance.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await axiosInstance.put('/notifications/read-all');
    return response.data;
  },

  // Delete a notification
  deleteNotification: async (notificationId) => {
    const response = await axiosInstance.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  // Admin: Send promotion notification to all users
  sendPromotionNotification: async (title, message, couponCode = null) => {
    const response = await axiosInstance.post('/notifications/promotion', {
      title,
      message,
      couponCode
    });
    return response.data;
  },

  // Get notification icon based on type
  getNotificationIcon: (type) => {
    const icons = {
      order: '📦',
      promotion: '🎁',
      system: '⚙️',
      stock: '📢',
      payment: '💳'
    };
    return icons[type] || '🔔';
  },

  // Get notification color based on type
  getNotificationColor: (type) => {
    const colors = {
      order: 'blue',
      promotion: 'green',
      system: 'gray',
      stock: 'orange',
      payment: 'purple'
    };
    return colors[type] || 'gray';
  }
};

export default NotificationService;
