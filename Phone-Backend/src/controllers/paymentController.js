const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const RoleEnum = require('../enums/RoleEnum');
const PermissionEnum = require('../enums/PermissionEnum');
const { payOS } = require('../config/payos');
const crypto = require('crypto');
const { sequelize } = require('../config/database');

const DEFAULT_RETURN_URL = process.env.PAYOS_RETURN_URL || 'http://localhost:3001/payment/success';
const DEFAULT_CANCEL_URL = process.env.PAYOS_CANCEL_URL || 'http://localhost:3001/payment/cancel';

const buildPayOSCallbackUrl = (baseUrl, params = {}) => {
  const target = baseUrl || DEFAULT_RETURN_URL;
  try {
    const url = new URL(target);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, value.toString());
      }
    });
    return url.toString();
  } catch (error) {
    console.warn('Invalid PayOS callback URL provided:', target, error.message);
    return target;
  }
};

const parseOrderItems = (order) => {
  if (!order || !order.items) {
    return [];
  }
  return typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
};

const restoreOrderStockIfNeeded = async (order) => {
  if (!order || order.status === 'cancelled') {
    return;
  }

  const items = parseOrderItems(order);
  for (const item of items) {
    await Product.increment('stock', {
      by: item.quantity,
      where: { id: item.productId }
    });
  }
};

// Confirm payment
exports.confirmPayment = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { orderId, paymentMethod, transactionId } = req.body;

    if (!orderId || !paymentMethod) {
      await transaction.rollback();
      return next(new ApiError(400, 'OrderId and paymentMethod are required'));
    }

    // Find order WITH LOCK
    const order = await Order.findOne({ 
      where: { orderId },
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    if (!order) {
      await transaction.rollback();
      return next(new ApiError(404, 'Order not found'));
    }

    // Check if user is owner or admin
    if (order.userId !== req.userId && req.userRole !== RoleEnum.ADMIN) {
      await transaction.rollback();
      return next(new ApiError(403, 'You do not have permission to confirm this payment'));
    }

    // Check if order already paid
    if (order.paymentStatus === 'completed') {
      await transaction.rollback();
      return next(new ApiError(400, 'Order is already paid'));
    }

    // Parse order items
    const orderItems = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;

    // LOCK AND VERIFY STOCK for all products
    for (const item of orderItems) {
      const product = await Product.findByPk(item.productId, {
        lock: transaction.LOCK.UPDATE,
        transaction
      });

      if (!product) {
        await transaction.rollback();
        return next(new ApiError(400, `Product ${item.productId} not found`));
      }

      if (product.stock < item.quantity) {
        await transaction.rollback();
        // Cancel order due to insufficient stock
        await Order.update(
          { 
            status: 'cancelled',
            paymentStatus: 'failed'
          },
          { where: { orderId } }
        );
        return next(new ApiError(400, `Insufficient stock for product: ${product.name}. Available: ${product.stock}, Required: ${item.quantity}. Order has been cancelled.`));
      }
    }

    // Deduct stock ATOMICALLY
    for (const item of orderItems) {
      await Product.decrement('stock', {
        by: item.quantity,
        where: { id: item.productId },
        transaction
      });
    }

    // Create or update payment
    let payment = await Payment.findOne({ 
      where: { orderId },
      transaction
    });

    if (!payment) {
      payment = await Payment.create({
        orderId,
        userId: req.userId,
        amount: order.finalTotal,
        paymentMethod,
        transactionId: transactionId || null,
        status: 'completed',
      }, { transaction });
    } else {
      payment.paymentMethod = paymentMethod;
      payment.transactionId = transactionId || null;
      payment.status = 'completed';
      await payment.save({ transaction });
    }

    // Update order payment status
    order.paymentStatus = 'completed';
    order.status = 'confirmed';
    await order.save({ transaction });

    // Commit all changes
    await transaction.commit();

    res.status(200).json(
      new ApiResponse(200, payment, 'Payment confirmed successfully')
    );
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

// Get payment status
exports.getPaymentStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;

    const payment = await Payment.findOne({ where: { orderId } });

    if (!payment) {
      return next(new ApiError(404, 'Payment not found'));
    }

    // Check if user is owner or admin
    if (payment.userId !== req.userId && req.userRole !== RoleEnum.ADMIN) {
      return next(new ApiError(403, 'You do not have permission to view this payment'));
    }

    res.status(200).json(
      new ApiResponse(200, payment, 'Payment status retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Get all payments (admin only)
exports.getAllPayments = async (req, res, next) => {
  try {
    // Check admin role
    if (req.userRole !== RoleEnum.ADMIN) {
      return next(new ApiError(403, `Only ${RoleEnum.ADMIN} can view all payments`));
    }

    const { status, page = 1, limit = 10 } = req.query;

    const where = {};

    if (status && ['pending', 'completed', 'failed'].includes(status)) {
      where.status = status;
    }

    const offset = (page - 1) * limit;
    
    const { count, rows } = await Payment.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset,
      limit: Number(limit),
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json(
      new ApiResponse(200, {
        payments: rows,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          totalPages,
        },
      }, 'Payments retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Create PayOS payment link
 * POST /api/payments/payos/create
 */
exports.createPayOSPayment = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { orderId, description, idempotencyKey } = req.body;

    if (!orderId) {
      await transaction.rollback();
      return next(new ApiError(400, 'OrderId is required'));
    }

    // Find order WITH LOCK
    const order = await Order.findOne({ 
      where: { orderId },
      lock: transaction.LOCK.UPDATE,
      transaction
    });
    
    if (!order) {
      await transaction.rollback();
      return next(new ApiError(404, 'Order not found'));
    }

    // Check if user is owner
    if (order.userId !== req.userId) {
      await transaction.rollback();
      return next(new ApiError(403, 'You do not have permission to pay for this order'));
    }

    // Check if order is already paid
    if (order.paymentStatus === 'completed') {
      await transaction.rollback();
      return next(new ApiError(400, 'Order is already paid'));
    }

    // Generate idempotency key if not provided
    const finalIdempotencyKey = idempotencyKey || crypto.randomUUID();

    // Check for existing payment with same idempotency key
    const existingPayment = await Payment.findOne({
      where: { idempotencyKey: finalIdempotencyKey },
      transaction
    });

    if (existingPayment) {
      await transaction.rollback();
      // Return existing payment (idempotency protection)
      return res.status(200).json(
        new ApiResponse(200, {
          payment: existingPayment,
          isExisting: true,
          message: 'Payment already created with this idempotency key'
        }, 'Payment retrieved (idempotent)')
      );
    }

    // Parse order items
    const orderItems = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;

    // LOCK AND VERIFY STOCK for all products
    for (const item of orderItems) {
      const product = await Product.findByPk(item.productId, {
        lock: transaction.LOCK.UPDATE,
        transaction
      });

      if (!product) {
        await transaction.rollback();
        return next(new ApiError(400, `Product ${item.productId} not found`));
      }

      if (product.stock < item.quantity) {
        await transaction.rollback();
        // Cancel order due to insufficient stock
        await Order.update(
          { 
            status: 'cancelled',
            paymentStatus: 'failed'
          },
          { where: { orderId } }
        );
        return next(new ApiError(400, `Insufficient stock for product: ${product.name}. Available: ${product.stock}, Required: ${item.quantity}. Order has been cancelled.`));
      }
    }

    // Deduct stock ATOMICALLY
    for (const item of orderItems) {
      await Product.decrement('stock', {
        by: item.quantity,
        where: { id: item.productId },
        transaction
      });
    }

    // Generate unique PayOS order code (6 digits)
    const payosOrderCode = Date.now().toString().slice(-10);

    // Create payment record first (with pending status)
    const payment = await Payment.create({
      orderId,
      userId: req.userId,
      amount: order.finalTotal,
      paymentMethod: 'payos',
      status: 'pending',
      payosOrderCode,
      idempotencyKey: finalIdempotencyKey,
      metadata: {
        orderInfo: order.toJSON(),
        createdBy: req.userId,
        createdAt: new Date().toISOString()
      }
    }, { transaction });

    // Build description (PayOS allows max 25 chars)
    const rawDescription = description || `Thanh toan ${orderId}`;
    const normalizedDescription = rawDescription.replace(/\s+/g, ' ').trim();
    const payosDescription = normalizedDescription.length > 25
      ? normalizedDescription.slice(0, 25)
      : normalizedDescription;

    // Prepare PayOS payment data
    const paymentData = {
      orderCode: Number(payosOrderCode),
      amount: Math.round(order.finalTotal), // PayOS requires integer
      description: payosDescription,
      returnUrl: buildPayOSCallbackUrl(DEFAULT_RETURN_URL, {
        orderCode: payosOrderCode,
        orderId: order.orderId,
        status: 'success'
      }),
      cancelUrl: buildPayOSCallbackUrl(DEFAULT_CANCEL_URL, {
        orderCode: payosOrderCode,
        orderId: order.orderId,
        status: 'cancelled'
      }),
      items: [
        {
          name: `Đơn hàng ${orderId}`,
          quantity: 1,
          price: Math.round(order.finalTotal)
        }
      ]
    };

    // Create PayOS payment link (outside transaction - external API call)
    const payosResponse = await payOS.paymentRequests.create(paymentData);

    // Update payment with PayOS response
    await payment.update({
      paymentUrl: payosResponse.checkoutUrl,
      qrCodeUrl: payosResponse.qrCode,
      payosTransactionId: payosResponse.paymentLinkId,
      metadata: {
        ...payment.metadata,
        payosResponse: payosResponse
      }
    }, { transaction });

    // Commit transaction (stock deducted, payment created)
    await transaction.commit();

    res.status(201).json(
      new ApiResponse(201, {
        payment,
        checkoutUrl: payosResponse.checkoutUrl,
        qrCode: payosResponse.qrCode,
        paymentLinkId: payosResponse.paymentLinkId
      }, 'PayOS payment link created successfully. Stock reserved.')
    );
  } catch (error) {
    await transaction.rollback();
    console.error('PayOS payment creation error:', error);
    next(new ApiError(500, `Failed to create payment: ${error.message}`));
  }
};

/**
 * PayOS webhook handler
 * POST /api/payments/payos/webhook
 */
exports.payosWebhook = async (req, res, next) => {
  try {
    const webhookData = req.body;
    console.log('PayOS Webhook received:', JSON.stringify(webhookData, null, 2));

    const { orderCode, code, desc, data } = webhookData;

    // Find payment by PayOS order code
    const payment = await Payment.findOne({
      where: { payosOrderCode: orderCode.toString() }
    });

    if (!payment) {
      console.error('Payment not found for orderCode:', orderCode);
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Find associated order
    const order = await Order.findOne({ where: { orderId: payment.orderId } });

    // Update payment status based on webhook
    if (code === '00') {
      // Payment successful
      await payment.update({
        status: 'completed',
        transactionId: data?.transactionDateTime || data?.id,
        metadata: {
          ...payment.metadata,
          webhookData: data,
          completedAt: new Date().toISOString()
        }
      });

      // Update order status
      if (order) {
        await order.update({
          paymentStatus: 'completed',
          status: 'confirmed'
        });
      }
    } else {
      // Payment failed or cancelled
      await payment.update({
        status: code === '02' ? 'cancelled' : 'failed',
        metadata: {
          ...payment.metadata,
          webhookData: { code, desc, data },
          failedAt: new Date().toISOString(),
          failureReason: desc
        }
      });

      if (order) {
        await restoreOrderStockIfNeeded(order);
        await order.update({
          paymentStatus: 'failed',
          status: 'cancelled'
        });
      }
    }

    res.status(200).json({
      error: 0,
      message: 'Webhook processed successfully',
      data: { orderCode }
    });
  } catch (error) {
    console.error('PayOS webhook error:', error);
    res.status(500).json({
      error: 1,
      message: error.message
    });
  }
};

/**
 * Check PayOS payment status
 * GET /api/payments/payos/:orderCode/status
 */
exports.checkPayOSStatus = async (req, res, next) => {
  try {
    const { orderCode } = req.params;

    // Find payment
    const payment = await Payment.findOne({
      where: { payosOrderCode: orderCode }
    });

    if (!payment) {
      return next(new ApiError(404, 'Payment not found'));
    }

    // Check permission
    if (payment.userId !== req.userId && req.userRole !== RoleEnum.ADMIN) {
      return next(new ApiError(403, 'You do not have permission to view this payment'));
    }

    // Query PayOS for latest status
    try {
      const paymentInfo = await payOS.paymentRequests.get(Number(orderCode));
      
      // Update local payment status if different
      if (paymentInfo.status === 'PAID' && payment.status !== 'completed') {
        await payment.update({
          status: 'completed',
          transactionId: paymentInfo.transactions?.[0]?.transactionDateTime,
          metadata: {
            ...payment.metadata,
            payosInfo: paymentInfo
          }
        });

        // Update order
        const order = await Order.findOne({ where: { orderId: payment.orderId } });
        if (order) {
          await order.update({
            paymentStatus: 'completed',
            status: 'confirmed'
          });
        }
      }

      res.status(200).json(
        new ApiResponse(200, {
          payment,
          payosInfo: paymentInfo
        }, 'Payment status retrieved')
      );
    } catch (payosError) {
      // If PayOS API fails, return local payment status
      res.status(200).json(
        new ApiResponse(200, {
          payment,
          note: 'PayOS API unavailable, showing local status'
        }, 'Payment status retrieved (local)')
      );
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel PayOS payment
 * POST /api/payments/payos/:orderCode/cancel
 */
exports.cancelPayOSPayment = async (req, res, next) => {
  try {
    const { orderCode } = req.params;
    const { cancellationReason } = req.body;

    // Find payment
    const payment = await Payment.findOne({
      where: { payosOrderCode: orderCode }
    });

    if (!payment) {
      return next(new ApiError(404, 'Payment not found'));
    }

    // Check permission
    if (payment.userId !== req.userId && req.userRole !== RoleEnum.ADMIN) {
      return next(new ApiError(403, 'You do not have permission to cancel this payment'));
    }

    // Check if already completed
    if (payment.status === 'completed') {
      return next(new ApiError(400, 'Cannot cancel completed payment'));
    }

    // Cancel payment via PayOS
    try {
      await payOS.paymentRequests.cancel(Number(orderCode), cancellationReason);
      
      await payment.update({
        status: 'cancelled',
        metadata: {
          ...payment.metadata,
          cancellationReason,
          cancelledAt: new Date().toISOString(),
          cancelledBy: req.userId
        }
      });

      const order = await Order.findOne({ where: { orderId: payment.orderId } });
      if (order) {
        await restoreOrderStockIfNeeded(order);
        await order.update({
          paymentStatus: 'failed',
          status: 'cancelled'
        });
      }

      res.status(200).json(
        new ApiResponse(200, payment, 'Payment cancelled successfully')
      );
    } catch (payosError) {
      console.error('PayOS cancellation error:', payosError);
      return next(new ApiError(500, `Failed to cancel payment: ${payosError.message}`));
    }
  } catch (error) {
    next(error);
  }
};
