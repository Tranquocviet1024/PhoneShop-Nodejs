const Notification = require('../models/Notification');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const { Op } = require('sequelize');

// Lấy thông báo của user
exports.getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const offset = (page - 1) * limit;

    const where = { userId: req.userId };
    if (unreadOnly === 'true') {
      where.isRead = false;
    }

    const { count, rows } = await Notification.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset,
      limit: Number(limit)
    });

    // Đếm số chưa đọc
    const unreadCount = await Notification.count({
      where: { userId: req.userId, isRead: false }
    });

    res.status(200).json(
      new ApiResponse(200, {
        notifications: rows,
        unreadCount,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(count / limit)
        }
      }, 'Notifications retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Đánh dấu đã đọc một thông báo
exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({
      where: { id, userId: req.userId }
    });

    if (!notification) {
      return next(new ApiError(404, 'Notification not found'));
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.status(200).json(
      new ApiResponse(200, notification, 'Marked as read')
    );
  } catch (error) {
    next(error);
  }
};

// Đánh dấu tất cả đã đọc
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.update(
      { isRead: true, readAt: new Date() },
      { where: { userId: req.userId, isRead: false } }
    );

    res.status(200).json(
      new ApiResponse(200, null, 'All notifications marked as read')
    );
  } catch (error) {
    next(error);
  }
};

// Xóa thông báo
exports.deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({
      where: { id, userId: req.userId }
    });

    if (!notification) {
      return next(new ApiError(404, 'Notification not found'));
    }

    await notification.destroy();

    res.status(200).json(
      new ApiResponse(200, null, 'Notification deleted')
    );
  } catch (error) {
    next(error);
  }
};

// Xóa tất cả thông báo đã đọc
exports.deleteReadNotifications = async (req, res, next) => {
  try {
    await Notification.destroy({
      where: { userId: req.userId, isRead: true }
    });

    res.status(200).json(
      new ApiResponse(200, null, 'Read notifications deleted')
    );
  } catch (error) {
    next(error);
  }
};

// ============ UTILITY FUNCTIONS ============

// Tạo thông báo (internal use)
exports.createNotification = async (userId, type, title, message, data = {}) => {
  try {
    return await Notification.create({
      userId,
      type,
      title,
      message,
      data
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Tạo thông báo đơn hàng
exports.createOrderNotification = async (userId, orderId, status) => {
  const statusMessages = {
    'pending': { title: 'Đặt hàng thành công', message: `Đơn hàng ${orderId} đã được tạo thành công. Vui lòng thanh toán để hoàn tất.` },
    'confirmed': { title: 'Đơn hàng đã xác nhận', message: `Đơn hàng ${orderId} đã được xác nhận và đang được xử lý.` },
    'shipped': { title: 'Đơn hàng đang giao', message: `Đơn hàng ${orderId} đã được giao cho đơn vị vận chuyển.` },
    'delivered': { title: 'Giao hàng thành công', message: `Đơn hàng ${orderId} đã được giao thành công. Cảm ơn bạn đã mua hàng!` },
    'cancelled': { title: 'Đơn hàng đã hủy', message: `Đơn hàng ${orderId} đã bị hủy.` }
  };

  const info = statusMessages[status];
  if (info) {
    return await exports.createNotification(userId, 'order', info.title, info.message, { orderId, status });
  }
  return null;
};

// Tạo thông báo thanh toán
exports.createPaymentNotification = async (userId, orderId, status, amount) => {
  const statusMessages = {
    'completed': { title: 'Thanh toán thành công', message: `Thanh toán ${amount.toLocaleString('vi-VN')}đ cho đơn hàng ${orderId} thành công.` },
    'failed': { title: 'Thanh toán thất bại', message: `Thanh toán cho đơn hàng ${orderId} không thành công. Vui lòng thử lại.` }
  };

  const info = statusMessages[status];
  if (info) {
    return await exports.createNotification(userId, 'payment', info.title, info.message, { orderId, status, amount });
  }
  return null;
};

// Gửi thông báo khuyến mãi cho nhiều user (admin)
exports.sendPromotionNotification = async (req, res, next) => {
  try {
    const { userIds, title, message, data } = req.body;

    if (!title || !message) {
      return next(new ApiError(400, 'Title and message are required'));
    }

    // Validate userIds - convert to array if needed
    let targetUserIds = userIds;
    if (!userIds || (Array.isArray(userIds) && userIds.length === 0)) {
      // If no userIds provided, send to all active users
      const User = require('../models/User');
      const users = await User.findAll({ 
        where: { isActive: true },
        attributes: ['id']
      });
      targetUserIds = users.map(u => u.id);
    } else if (!Array.isArray(userIds)) {
      // If single userId provided, convert to array
      targetUserIds = [userIds];
    }

    const notifications = [];
    for (const userId of targetUserIds) {
      const notification = await Notification.create({
        userId,
        type: 'promotion',
        title,
        message,
        data: data || {}
      });
      notifications.push(notification);
    }

    res.status(201).json(
      new ApiResponse(201, { count: notifications.length }, 'Promotion notifications sent')
    );
  } catch (error) {
    next(error);
  }
};
