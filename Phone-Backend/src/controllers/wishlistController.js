const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { ApiResponse, ApiError } = require('../utils/apiResponse');

// Lấy danh sách yêu thích
exports.getWishlist = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Wishlist.findAndCountAll({
      where: { userId: req.userId },
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'price', 'originalPrice', 'discount', 'image', 'stock', 'rating']
      }],
      order: [['createdAt', 'DESC']],
      offset,
      limit: Number(limit)
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json(
      new ApiResponse(200, {
        items: rows,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          totalPages
        }
      }, 'Wishlist retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Thêm sản phẩm vào yêu thích
exports.addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return next(new ApiError(400, 'Product ID is required'));
    }

    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findByPk(productId);
    if (!product) {
      return next(new ApiError(404, 'Product not found'));
    }

    // Kiểm tra đã có trong wishlist chưa
    const existing = await Wishlist.findOne({
      where: { userId: req.userId, productId }
    });

    if (existing) {
      return next(new ApiError(400, 'Product already in wishlist'));
    }

    const wishlistItem = await Wishlist.create({
      userId: req.userId,
      productId
    });

    res.status(201).json(
      new ApiResponse(201, wishlistItem, 'Added to wishlist successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Xóa sản phẩm khỏi yêu thích
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const item = await Wishlist.findOne({
      where: { userId: req.userId, productId }
    });

    if (!item) {
      return next(new ApiError(404, 'Item not found in wishlist'));
    }

    await item.destroy();

    res.status(200).json(
      new ApiResponse(200, null, 'Removed from wishlist successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Kiểm tra sản phẩm có trong wishlist không
exports.checkWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const item = await Wishlist.findOne({
      where: { userId: req.userId, productId }
    });

    res.status(200).json(
      new ApiResponse(200, { inWishlist: !!item }, 'Check completed')
    );
  } catch (error) {
    next(error);
  }
};

// Xóa toàn bộ wishlist
exports.clearWishlist = async (req, res, next) => {
  try {
    await Wishlist.destroy({
      where: { userId: req.userId }
    });

    res.status(200).json(
      new ApiResponse(200, null, 'Wishlist cleared successfully')
    );
  } catch (error) {
    next(error);
  }
};
