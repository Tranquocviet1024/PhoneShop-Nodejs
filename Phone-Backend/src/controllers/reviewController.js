const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const RoleEnum = require('../enums/RoleEnum');
const PermissionEnum = require('../enums/PermissionEnum');
const { Op } = require('sequelize');

// Add review
exports.addReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment } = req.body;

    if (!rating || !title || !comment) {
      return next(new ApiError(400, 'Rating, title, and comment are required'));
    }

    if (rating < 1 || rating > 5) {
      return next(new ApiError(400, 'Rating must be between 1 and 5'));
    }

    // Check if product exists
    const product = await Product.findByPk(productId);

    if (!product) {
      return next(new ApiError(404, 'Product not found'));
    }

    // Check if user has purchased this product (must have completed/delivered order)
    const userOrders = await Order.findAll({
      where: {
        userId: req.userId,
        status: {
          [Op.in]: ['delivered', 'confirmed', 'shipped'] // Allow review after order is confirmed
        },
        paymentStatus: 'completed'
      }
    });

    // Check if any order contains this product
    const hasPurchased = userOrders.some(order => {
      const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      return items.some(item => item.productId === parseInt(productId));
    });

    if (!hasPurchased) {
      return next(new ApiError(403, 'You can only review products you have purchased'));
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      where: {
        productId,
        userId: req.userId,
      }
    });

    if (existingReview) {
      return next(new ApiError(400, 'You have already reviewed this product'));
    }

    const review = await Review.create({
      productId,
      userId: req.userId,
      rating,
      title,
      comment,
    });

    // Update product rating
    const allReviews = await Review.findAll({ where: { productId } });
    const averageRating =
      allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length;

    product.rating = averageRating;
    product.reviews = allReviews.length;
    await product.save();

    res.status(201).json(
      new ApiResponse(201, review, 'Review added successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Get product reviews
exports.getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Check if product exists
    const product = await Product.findByPk(productId);

    if (!product) {
      return next(new ApiError(404, 'Product not found'));
    }

    const offset = (page - 1) * limit;
    
    const { count, rows } = await Review.findAndCountAll({
      where: { productId },
      order: [['createdAt', 'DESC']],
      offset,
      limit: Number(limit),
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json(
      new ApiResponse(200, {
        reviews: rows,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          totalPages,
        },
      }, 'Reviews retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Delete review
exports.deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findByPk(reviewId);

    if (!review) {
      return next(new ApiError(404, 'Review not found'));
    }

    // Check if user is owner or admin
    if (review.userId !== req.userId && req.userRole !== RoleEnum.ADMIN) {
      return next(new ApiError(403, 'You do not have permission to delete this review'));
    }

    const productId = review.productId;

    await review.destroy();

    // Update product rating
    const allReviews = await Review.findAll({ where: { productId } });
    const product = await Product.findByPk(productId);

    if (product) {
      if (allReviews.length > 0) {
        const averageRating =
          allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length;
        product.rating = averageRating;
      } else {
        product.rating = 0;
      }

      product.reviews = allReviews.length;
      await product.save();
    }

    res.status(200).json(
      new ApiResponse(200, null, 'Review deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Update review
exports.updateReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment } = req.body;

    const review = await Review.findByPk(reviewId);

    if (!review) {
      return next(new ApiError(404, 'Review not found'));
    }

    // Check if user is owner or admin
    if (review.userId !== req.userId && req.userRole !== RoleEnum.ADMIN) {
      return next(new ApiError(403, 'You can only edit your own reviews or you must be admin'));
    }

    if (rating && (rating < 1 || rating > 5)) {
      return next(new ApiError(400, 'Rating must be between 1 and 5'));
    }

    if (rating) review.rating = rating;
    if (title) review.title = title;
    if (comment) review.comment = comment;

    await review.save();

    // Update product rating
    const productId = review.productId;
    const allReviews = await Review.findAll({ where: { productId } });
    const product = await Product.findByPk(productId);

    if (product) {
      const averageRating =
        allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length;
      product.rating = averageRating;
      product.reviews = allReviews.length;
      await product.save();
    }

    res.status(200).json(
      new ApiResponse(200, review, 'Review updated successfully')
    );
  } catch (error) {
    next(error);
  }
};
