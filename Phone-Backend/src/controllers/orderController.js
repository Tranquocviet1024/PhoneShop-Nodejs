const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const RoleEnum = require('../enums/RoleEnum');
const PermissionEnum = require('../enums/PermissionEnum');
const { logAudit } = require('../middleware/auditMiddleware');
const { sequelize } = require('../config/database');

// Create order
exports.createOrder = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { products, shippingAddress, paymentMethod, totalAmount, shippingCost, tax } = req.body;

    // Validation
    if (!products || products.length === 0) {
      return next(new ApiError(400, 'Products list is required'));
    }

    if (!shippingAddress) {
      return next(new ApiError(400, 'Shipping address is required'));
    }

    if (!paymentMethod) {
      return next(new ApiError(400, 'Payment method is required'));
    }

    // Validate payment method
    const validPaymentMethods = ['credit-card', 'bank-transfer', 'e-wallet', 'cod'];
    if (!validPaymentMethods.includes(paymentMethod)) {
      return next(new ApiError(400, `Invalid payment method. Must be one of: ${validPaymentMethods.join(', ')}`));
    }

    // Verify all products exist and calculate server-side total (prevent price manipulation)
    let serverCalculatedTotal = 0;
    const validatedProducts = [];
    
    for (const item of products) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        return next(new ApiError(400, 'Each product must have productId and quantity >= 1'));
      }
      
      const product = await Product.findByPk(item.productId);
      
      if (!product) {
        return next(new ApiError(400, `Product ${item.productId} not found`));
      }

      // Calculate total from server-side prices
      serverCalculatedTotal += parseFloat(product.price) * item.quantity;
      
      validatedProducts.push({
        productId: item.productId,
        quantity: item.quantity,
        price: parseFloat(product.price), // Use server price
        name: product.name
      });

      // Optional: Show warning if stock is low (but still allow order creation)
      if (product.stock < item.quantity) {
        // Sanitize product name and numbers to prevent log injection
        const sanitizedName = String(product.name).replace(/[\r\n\t]/g, '');
        const sanitizedStock = parseInt(product.stock, 10) || 0;
        const sanitizedQty = parseInt(item.quantity, 10) || 0;
        console.warn(`⚠️  Low stock warning: Product ${sanitizedName} - Available: ${sanitizedStock}, Requested: ${sanitizedQty}`);
      }
    }

    // Validate client total matches server calculation (allow small tolerance for rounding)
    const tolerance = 1; // 1 VND tolerance
    if (totalAmount && Math.abs(serverCalculatedTotal - totalAmount) > tolerance) {
      // ✅ FIXED: Log Injection - Sanitize numeric values and prevent injection
      const sanitizedClientTotal = Number(totalAmount) || 0;
      const sanitizedServerTotal = Number(serverCalculatedTotal) || 0;
      console.warn('Price mismatch detected:', {
        clientSent: sanitizedClientTotal,
        serverCalculated: sanitizedServerTotal,
        difference: Math.abs(sanitizedServerTotal - sanitizedClientTotal)
      });
      // Use server-calculated total for security
    }

    // Create order with orderId (NO stock deduction yet)
    const orderId = `ORD-${Date.now()}`;
    const finalShippingCost = shippingCost || 0;
    const finalTax = tax || 0;
    
    const order = await Order.create({
      userId,
      items: JSON.stringify(validatedProducts),
      shippingInfo: JSON.stringify(shippingAddress),
      paymentMethod,
      totalPrice: serverCalculatedTotal, // Use server-calculated total
      shippingCost: finalShippingCost,
      tax: finalTax,
      finalTotal: serverCalculatedTotal + finalShippingCost + finalTax,
      status: 'pending',
      paymentStatus: 'pending',
    });

    // Log audit
    await logAudit(req, 'CREATE', 'Order', order.id, order.orderId, null, order.toJSON());

    const responseData = {
      orderId: order.orderId,
      internalId: order.id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      totalAmount: parseFloat(order.totalPrice),
      finalTotal: parseFloat(order.finalTotal),
      createdAt: order.createdAt,
      message: 'Order created. Stock will be reserved when payment is confirmed.'
    };

    res.status(201).json(
      new ApiResponse(201, responseData, 'Order created successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Get user orders
exports.getUserOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const where = { userId: req.userId };

    if (status) {
      where.status = status;
    }

    const offset = (page - 1) * limit;
    
    const { count, rows } = await Order.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset,
      limit: Number(limit),
    });

    const totalPages = Math.ceil(count / limit);

    // Format orders data - parse JSON strings and cast numbers
    const formattedOrders = rows.map(order => {
      const orderData = order.toJSON();
      return {
        ...orderData,
        items: typeof orderData.items === 'string' ? JSON.parse(orderData.items) : orderData.items,
        shippingInfo: typeof orderData.shippingInfo === 'string' ? JSON.parse(orderData.shippingInfo) : orderData.shippingInfo,
        totalPrice: parseFloat(orderData.totalPrice),
        shippingCost: parseFloat(orderData.shippingCost),
        tax: parseFloat(orderData.tax),
        finalTotal: parseFloat(orderData.finalTotal)
      };
    });

    res.status(200).json(
      new ApiResponse(200, {
        orders: formattedOrders,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          totalPages,
        },
      }, 'Orders retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Get order by ID
exports.getOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ where: { orderId } });

    if (!order) {
      return next(new ApiError(404, 'Order not found'));
    }

    // Check if user is owner or admin
    if (order.userId !== req.userId && req.userRole !== RoleEnum.ADMIN) {
      return next(new ApiError(403, 'You do not have permission to view this order'));
    }

    // Format order data - parse JSON strings and cast numbers
    const orderData = order.toJSON();
    const formattedOrder = {
      ...orderData,
      items: typeof orderData.items === 'string' ? JSON.parse(orderData.items) : orderData.items,
      shippingInfo: typeof orderData.shippingInfo === 'string' ? JSON.parse(orderData.shippingInfo) : orderData.shippingInfo,
      totalPrice: parseFloat(orderData.totalPrice),
      shippingCost: parseFloat(orderData.shippingCost),
      tax: parseFloat(orderData.tax),
      finalTotal: parseFloat(orderData.finalTotal)
    };

    res.status(200).json(
      new ApiResponse(200, formattedOrder, 'Order retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Cancel order
exports.cancelOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ where: { orderId } });

    if (!order) {
      return next(new ApiError(404, 'Order not found'));
    }

    // Check if user is owner or admin
    if (order.userId !== req.userId && req.userRole !== RoleEnum.ADMIN) {
      return next(new ApiError(403, 'You do not have permission to cancel this order'));
    }

    // Only allow cancellation of pending or confirmed orders
    if (!['pending', 'confirmed'].includes(order.status)) {
      return next(new ApiError(400, 'Order cannot be cancelled in current status'));
    }

    // Only restore stock if payment was completed (stock was deducted)
    // Stock is deducted only when payment is confirmed/completed
    if (order.paymentStatus === 'completed') {
      const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      for (const item of items) {
        const product = await Product.findByPk(item.productId);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
    }

    order.status = 'cancelled';
    await order.save();

    // Format order data - parse JSON strings and cast numbers
    const orderData = order.toJSON();
    const formattedOrder = {
      ...orderData,
      items: typeof orderData.items === 'string' ? JSON.parse(orderData.items) : orderData.items,
      shippingInfo: typeof orderData.shippingInfo === 'string' ? JSON.parse(orderData.shippingInfo) : orderData.shippingInfo,
      totalPrice: parseFloat(orderData.totalPrice),
      shippingCost: parseFloat(orderData.shippingCost),
      tax: parseFloat(orderData.tax),
      finalTotal: parseFloat(orderData.finalTotal)
    };

    res.status(200).json(
      new ApiResponse(200, formattedOrder, 'Order cancelled successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    // Check admin role
    if (req.userRole !== RoleEnum.ADMIN) {
      return next(new ApiError(403, `Only ${RoleEnum.ADMIN} can update order status`));
    }

    const { orderId } = req.params;
    const { status, paymentStatus } = req.body;

    const order = await Order.findOne({ where: { orderId } });

    if (!order) {
      return next(new ApiError(404, 'Order not found'));
    }

    // Define valid status transitions
    const validStatusTransitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['shipped', 'cancelled'],
      'shipped': ['delivered', 'cancelled'],
      'delivered': [], // Final state - cannot change
      'cancelled': [] // Final state - cannot change
    };

    // Validate status transition
    if (status && ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      const currentStatus = order.status;
      const allowedTransitions = validStatusTransitions[currentStatus] || [];
      
      if (currentStatus === status) {
        // Same status, no change needed
      } else if (!allowedTransitions.includes(status)) {
        return next(new ApiError(400, `Cannot change order status from '${currentStatus}' to '${status}'. Allowed: ${allowedTransitions.join(', ') || 'none'}`));
      }
      
      // If cancelling a paid order, restore stock
      if (status === 'cancelled' && order.paymentStatus === 'completed') {
        const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
        for (const item of items) {
          await Product.increment('stock', {
            by: item.quantity,
            where: { id: item.productId }
          });
        }
      }
      
      order.status = status;
    }

    if (paymentStatus && ['pending', 'completed', 'failed'].includes(paymentStatus)) {
      order.paymentStatus = paymentStatus;
    }

    await order.save();

    // Format order data - parse JSON strings and cast numbers
    const orderData = order.toJSON();
    const formattedOrder = {
      ...orderData,
      items: typeof orderData.items === 'string' ? JSON.parse(orderData.items) : orderData.items,
      shippingInfo: typeof orderData.shippingInfo === 'string' ? JSON.parse(orderData.shippingInfo) : orderData.shippingInfo,
      totalPrice: parseFloat(orderData.totalPrice),
      shippingCost: parseFloat(orderData.shippingCost),
      tax: parseFloat(orderData.tax),
      finalTotal: parseFloat(orderData.finalTotal)
    };

    res.status(200).json(
      new ApiResponse(200, formattedOrder, 'Order updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Get all orders (admin only)
exports.getAllOrders = async (req, res, next) => {
  try {
    // Check admin role
    if (req.userRole !== RoleEnum.ADMIN) {
      return next(new ApiError(403, `Only ${RoleEnum.ADMIN} can view all orders`));
    }

    const { status, page = 1, limit = 10 } = req.query;

    const where = {};

    if (status && ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      where.status = status;
    }

    const offset = (page - 1) * limit;
    
    const { count, rows } = await Order.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset,
      limit: Number(limit),
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json(
      new ApiResponse(200, {
        orders: rows,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          totalPages,
        },
      }, 'Orders retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};
