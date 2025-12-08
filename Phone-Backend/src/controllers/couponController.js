const Coupon = require('../models/Coupon');
const CouponUsage = require('../models/CouponUsage');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const { Op } = require('sequelize');

// Validate và áp dụng mã giảm giá
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, orderAmount, products } = req.body;

    if (!code) {
      return next(new ApiError(400, 'Coupon code is required'));
    }

    const coupon = await Coupon.findOne({
      where: { code: code.toUpperCase() }
    });

    if (!coupon) {
      return next(new ApiError(404, 'Mã giảm giá không tồn tại'));
    }

    // Kiểm tra trạng thái
    if (!coupon.isActive) {
      return next(new ApiError(400, 'Mã giảm giá đã ngừng hoạt động'));
    }

    // Kiểm tra thời gian
    const now = new Date();
    if (now < new Date(coupon.startDate)) {
      return next(new ApiError(400, 'Mã giảm giá chưa có hiệu lực'));
    }
    if (now > new Date(coupon.endDate)) {
      return next(new ApiError(400, 'Mã giảm giá đã hết hạn'));
    }

    // Kiểm tra số lần sử dụng tổng
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return next(new ApiError(400, 'Mã giảm giá đã hết lượt sử dụng'));
    }

    // Kiểm tra số lần user đã dùng
    const userUsageCount = await CouponUsage.count({
      where: { couponId: coupon.id, userId: req.userId }
    });
    if (userUsageCount >= coupon.userUsageLimit) {
      return next(new ApiError(400, 'Bạn đã sử dụng hết lượt cho mã này'));
    }

    // Kiểm tra giá trị đơn hàng tối thiểu
    if (orderAmount && orderAmount < coupon.minOrderAmount) {
      return next(new ApiError(400, `Đơn hàng tối thiểu ${coupon.minOrderAmount.toLocaleString('vi-VN')}đ để sử dụng mã này`));
    }

    // Tính toán số tiền giảm
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (orderAmount * coupon.discountValue) / 100;
      // Áp dụng giới hạn giảm tối đa
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = parseFloat(coupon.maxDiscountAmount);
      }
    } else {
      discountAmount = parseFloat(coupon.discountValue);
    }

    res.status(200).json(
      new ApiResponse(200, {
        valid: true,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: parseFloat(coupon.discountValue),
          maxDiscountAmount: coupon.maxDiscountAmount ? parseFloat(coupon.maxDiscountAmount) : null,
          minOrderAmount: parseFloat(coupon.minOrderAmount)
        },
        discountAmount: Math.round(discountAmount),
        finalAmount: Math.max(0, orderAmount - discountAmount)
      }, 'Mã giảm giá hợp lệ')
    );
  } catch (error) {
    next(error);
  }
};

// Lấy danh sách coupon có sẵn cho user
exports.getAvailableCoupons = async (req, res, next) => {
  try {
    const now = new Date();

    const coupons = await Coupon.findAll({
      where: {
        isActive: true,
        startDate: { [Op.lte]: now },
        endDate: { [Op.gte]: now },
        [Op.or]: [
          { usageLimit: null },
          { usedCount: { [Op.lt]: sequelize.col('usageLimit') } }
        ]
      },
      attributes: ['id', 'code', 'description', 'discountType', 'discountValue', 'minOrderAmount', 'maxDiscountAmount', 'endDate'],
      order: [['discountValue', 'DESC']]
    });

    // Lọc những coupon user còn có thể dùng
    const availableCoupons = [];
    for (const coupon of coupons) {
      const userUsageCount = await CouponUsage.count({
        where: { couponId: coupon.id, userId: req.userId }
      });
      if (userUsageCount < (coupon.userUsageLimit || 1)) {
        availableCoupons.push(coupon);
      }
    }

    res.status(200).json(
      new ApiResponse(200, availableCoupons, 'Available coupons retrieved')
    );
  } catch (error) {
    next(error);
  }
};

// ============ ADMIN FUNCTIONS ============

// Tạo coupon mới
exports.createCoupon = async (req, res, next) => {
  try {
    const {
      code, description, discountType, discountValue,
      minOrderAmount, maxDiscountAmount, usageLimit,
      userUsageLimit, startDate, endDate,
      applicableCategories, applicableProducts
    } = req.body;

    if (!code || !discountValue || !endDate) {
      return next(new ApiError(400, 'Code, discount value and end date are required'));
    }

    // Kiểm tra code đã tồn tại
    const existing = await Coupon.findOne({ where: { code: code.toUpperCase() } });
    if (existing) {
      return next(new ApiError(400, 'Coupon code already exists'));
    }

    const coupon = await Coupon.create({
      code,
      description,
      discountType: discountType || 'percentage',
      discountValue,
      minOrderAmount: minOrderAmount || 0,
      maxDiscountAmount: maxDiscountAmount || null,
      usageLimit: usageLimit || null,
      userUsageLimit: userUsageLimit || 1,
      startDate: startDate || new Date(),
      endDate,
      applicableCategories: applicableCategories || [],
      applicableProducts: applicableProducts || []
    });

    res.status(201).json(
      new ApiResponse(201, coupon, 'Coupon created successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Lấy tất cả coupons (admin)
exports.getAllCoupons = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status === 'active') {
      where.isActive = true;
      where.endDate = { [Op.gte]: new Date() };
    } else if (status === 'expired') {
      where.endDate = { [Op.lt]: new Date() };
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    const { count, rows } = await Coupon.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset,
      limit: Number(limit)
    });

    res.status(200).json(
      new ApiResponse(200, {
        coupons: rows,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(count / limit)
        }
      }, 'Coupons retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Cập nhật coupon
exports.updateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      return next(new ApiError(404, 'Coupon not found'));
    }

    await coupon.update(updates);

    res.status(200).json(
      new ApiResponse(200, coupon, 'Coupon updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Xóa coupon
exports.deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      return next(new ApiError(404, 'Coupon not found'));
    }

    await coupon.destroy();

    res.status(200).json(
      new ApiResponse(200, null, 'Coupon deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};
