const OrderTracking = require('../models/OrderTracking');
const Order = require('../models/Order');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const notificationController = require('./notificationController');

// Lấy lịch sử tracking của đơn hàng
exports.getOrderTracking = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    // Kiểm tra order tồn tại và thuộc về user
    const order = await Order.findOne({ where: { orderId } });
    if (!order) {
      return next(new ApiError(404, 'Order not found'));
    }

    // Kiểm tra quyền (owner hoặc admin)
    if (order.userId !== req.userId && req.userRole !== 'admin') {
      return next(new ApiError(403, 'Access denied'));
    }

    const tracking = await OrderTracking.findAll({
      where: { orderId },
      order: [['createdAt', 'ASC']]
    });

    // Tính toán trạng thái hiện tại
    const latestStatus = tracking.length > 0 ? tracking[tracking.length - 1] : null;

    res.status(200).json(
      new ApiResponse(200, {
        order: {
          orderId: order.orderId,
          status: order.status,
          paymentStatus: order.paymentStatus,
          createdAt: order.createdAt
        },
        currentStatus: latestStatus?.status || 'order_placed',
        timeline: tracking,
        estimatedDelivery: calculateEstimatedDelivery(latestStatus?.status)
      }, 'Order tracking retrieved')
    );
  } catch (error) {
    next(error);
  }
};

// Thêm tracking event (admin/system)
exports.addTrackingEvent = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status, location, description, metadata } = req.body;

    // Kiểm tra order tồn tại
    const order = await Order.findOne({ where: { orderId } });
    if (!order) {
      return next(new ApiError(404, 'Order not found'));
    }

    const trackingEvent = await OrderTracking.create({
      orderId,
      status,
      location,
      description,
      updatedBy: req.userId,
      metadata: metadata || {}
    });

    // Cập nhật trạng thái order nếu cần
    const orderStatusMap = {
      'payment_confirmed': 'confirmed',
      'processing': 'confirmed',
      'picked_up': 'shipped',
      'in_transit': 'shipped',
      'out_for_delivery': 'shipped',
      'delivered': 'delivered',
      'cancelled': 'cancelled'
    };

    if (orderStatusMap[status]) {
      order.status = orderStatusMap[status];
      await order.save();
    }

    // Gửi thông báo cho user
    await notificationController.createOrderNotification(
      order.userId,
      orderId,
      orderStatusMap[status] || order.status
    );

    res.status(201).json(
      new ApiResponse(201, trackingEvent, 'Tracking event added')
    );
  } catch (error) {
    next(error);
  }
};

// Cập nhật vị trí vận chuyển (carrier API integration)
exports.updateShippingLocation = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { location, description } = req.body;

    const order = await Order.findOne({ where: { orderId } });
    if (!order) {
      return next(new ApiError(404, 'Order not found'));
    }

    // Lấy trạng thái hiện tại
    const latestTracking = await OrderTracking.findOne({
      where: { orderId },
      order: [['createdAt', 'DESC']]
    });

    const trackingEvent = await OrderTracking.create({
      orderId,
      status: latestTracking?.status || 'in_transit',
      location,
      description: description || `Đơn hàng đang ở ${location}`,
      updatedBy: req.userId,
      metadata: { type: 'location_update' }
    });

    res.status(201).json(
      new ApiResponse(201, trackingEvent, 'Shipping location updated')
    );
  } catch (error) {
    next(error);
  }
};

// Lấy tất cả đơn hàng theo trạng thái tracking (admin)
exports.getOrdersByTrackingStatus = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Subquery để lấy trạng thái mới nhất của mỗi order
    const { sequelize } = require('../config/database');
    
    // ✅ FIXED: SQL Injection vulnerability - Use parameterized query
    const whereClause = status ? 'WHERE t.status = :status' : '';
    const replacements = {
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10)
    };
    
    if (status) {
      replacements.status = status;
    }
    
    const orders = await sequelize.query(`
      SELECT o.*, t.status as trackingStatus, t.location, t.createdAt as lastUpdate
      FROM orders o
      LEFT JOIN (
        SELECT orderId, status, location, createdAt,
               ROW_NUMBER() OVER (PARTITION BY orderId ORDER BY createdAt DESC) as rn
        FROM order_trackings
      ) t ON o.orderId = t.orderId AND t.rn = 1
      ${whereClause}
      ORDER BY o.createdAt DESC
      LIMIT :limit OFFSET :offset
    `, { 
      replacements,
      type: sequelize.QueryTypes.SELECT 
    });

    res.status(200).json(
      new ApiResponse(200, orders, 'Orders retrieved')
    );
  } catch (error) {
    next(error);
  }
};

// Helper function - Tính thời gian giao hàng dự kiến
function calculateEstimatedDelivery(currentStatus) {
  const deliveryDays = {
    'order_placed': 5,
    'payment_confirmed': 4,
    'processing': 3,
    'picked_up': 3,
    'in_transit': 2,
    'out_for_delivery': 1,
    'delivered': 0
  };

  const days = deliveryDays[currentStatus] || 5;
  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + days);
  
  return {
    date: estimatedDate,
    daysRemaining: days,
    message: days === 0 ? 'Đã giao hàng' : `Dự kiến ${days} ngày`
  };
}

// Tạo tracking event ban đầu khi tạo order
exports.createInitialTracking = async (orderId, userId) => {
  try {
    return await OrderTracking.create({
      orderId,
      status: 'order_placed',
      description: 'Đơn hàng đã được tạo thành công',
      updatedBy: userId
    });
  } catch (error) {
    console.error('Error creating initial tracking:', error);
    return null;
  }
};
