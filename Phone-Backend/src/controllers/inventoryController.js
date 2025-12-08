const InventoryAlert = require('../models/InventoryAlert');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const { Op } = require('sequelize');

// Kiểm tra và tạo alert cho sản phẩm sắp hết hàng
exports.checkInventory = async (req, res, next) => {
  try {
    const { threshold = 10 } = req.query;

    // Find products with low stock
    const lowStockProducts = await Product.findAll({
      where: {
        stock: { [Op.lte]: threshold, [Op.gt]: 0 }
      },
      attributes: ['id', 'name', 'stock', 'category']
    });

    // Find out of stock products
    const outOfStockProducts = await Product.findAll({
      where: { stock: 0 },
      attributes: ['id', 'name', 'stock', 'category']
    });

    // Create alerts for low stock products
    const newAlerts = [];
    for (const product of lowStockProducts) {
      const existingAlert = await InventoryAlert.findOne({
        where: {
          productId: product.id,
          alertType: 'low_stock',
          isResolved: false
        }
      });

      if (!existingAlert) {
        const alert = await InventoryAlert.create({
          productId: product.id,
          alertType: 'low_stock',
          threshold,
          currentStock: product.stock
        });
        newAlerts.push(alert);
      }
    }

    // Create alerts for out of stock products
    for (const product of outOfStockProducts) {
      const existingAlert = await InventoryAlert.findOne({
        where: {
          productId: product.id,
          alertType: 'out_of_stock',
          isResolved: false
        }
      });

      if (!existingAlert) {
        const alert = await InventoryAlert.create({
          productId: product.id,
          alertType: 'out_of_stock',
          threshold: 0,
          currentStock: 0
        });
        newAlerts.push(alert);
      }
    }

    // Notify admins if new alerts created
    if (newAlerts.length > 0) {
      const admins = await User.findAll({
        where: { role: 'admin' },
        attributes: ['id']
      });

      for (const admin of admins) {
        await Notification.create({
          userId: admin.id,
          type: 'stock',
          title: 'Cảnh báo tồn kho',
          message: `Có ${newAlerts.length} sản phẩm cần kiểm tra tồn kho`,
          metadata: { alertCount: newAlerts.length }
        });
      }
    }

    res.status(200).json(
      new ApiResponse(200, {
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts,
        newAlertsCreated: newAlerts.length
      }, 'Inventory checked successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Lấy danh sách alerts
exports.getAlerts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status = 'unresolved', type } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status === 'unresolved') {
      where.isResolved = false;
    } else if (status === 'resolved') {
      where.isResolved = true;
    }
    if (type) {
      where.alertType = type;
    }

    const { count, rows } = await InventoryAlert.findAndCountAll({
      where,
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'image', 'category', 'stock']
      }],
      order: [['createdAt', 'DESC']],
      offset,
      limit: Number(limit)
    });

    res.status(200).json(
      new ApiResponse(200, {
        alerts: rows,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(count / limit)
        }
      }, 'Alerts retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Đánh dấu alert đã xử lý
exports.resolveAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const alert = await InventoryAlert.findByPk(id);
    if (!alert) {
      return next(new ApiError(404, 'Alert not found'));
    }

    alert.isResolved = true;
    alert.resolvedAt = new Date();
    alert.resolvedBy = req.userId;
    if (notes) alert.notes = notes;

    await alert.save();

    res.status(200).json(
      new ApiResponse(200, alert, 'Alert resolved successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Cập nhật threshold mặc định
exports.updateThreshold = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { threshold } = req.body;

    if (threshold === undefined || threshold < 0) {
      return next(new ApiError(400, 'Valid threshold is required'));
    }

    // Update existing unresolved alert threshold
    const alert = await InventoryAlert.findOne({
      where: { productId, isResolved: false }
    });

    if (alert) {
      alert.threshold = threshold;
      await alert.save();
    }

    res.status(200).json(
      new ApiResponse(200, { productId, threshold }, 'Threshold updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Lấy thống kê inventory
exports.getInventoryStats = async (req, res, next) => {
  try {
    const totalProducts = await Product.count();
    const outOfStock = await Product.count({ where: { stock: 0 } });
    const lowStock = await Product.count({ where: { stock: { [Op.between]: [1, 10] } } });
    const healthyStock = await Product.count({ where: { stock: { [Op.gt]: 10 } } });
    const unresolvedAlerts = await InventoryAlert.count({ where: { isResolved: false } });

    res.status(200).json(
      new ApiResponse(200, {
        totalProducts,
        outOfStock,
        lowStock,
        healthyStock,
        unresolvedAlerts,
        stockHealth: {
          outOfStock: Math.round((outOfStock / totalProducts) * 100),
          lowStock: Math.round((lowStock / totalProducts) * 100),
          healthy: Math.round((healthyStock / totalProducts) * 100)
        }
      }, 'Inventory stats retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};
