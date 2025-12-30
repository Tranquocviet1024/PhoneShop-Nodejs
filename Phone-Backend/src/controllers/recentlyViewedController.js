const RecentlyViewed = require('../models/RecentlyViewed');
const Product = require('../models/Product');
const { ApiResponse, ApiError } = require('../utils/apiResponse');

// Thêm sản phẩm vào lịch sử xem
exports.addToRecentlyViewed = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const userId = req.userId;

    if (!productId) {
      return next(new ApiError(400, 'Product ID is required'));
    }

    // Check product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return next(new ApiError(404, 'Product not found'));
    }

    // Upsert - update viewedAt if exists, create if not
    const [record, created] = await RecentlyViewed.upsert({
      userId,
      productId,
      viewedAt: new Date()
    });

    // Keep only last 50 viewed products per user
    const count = await RecentlyViewed.count({ where: { userId } });
    if (count > 50) {
      const oldRecords = await RecentlyViewed.findAll({
        where: { userId },
        order: [['viewedAt', 'ASC']],
        limit: count - 50
      });
      await RecentlyViewed.destroy({
        where: { id: oldRecords.map(r => r.id) }
      });
    }

    res.status(200).json(
      new ApiResponse(200, { productId, viewedAt: new Date() }, 'Product added to recently viewed')
    );
  } catch (error) {
    next(error);
  }
};

// Lấy danh sách sản phẩm đã xem gần đây
exports.getRecentlyViewed = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { limit = 10 } = req.query;

    const recentlyViewed = await RecentlyViewed.findAll({
      where: { userId },
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'price', 'originalPrice', 'discount', 'image', 'rating', 'stock']
      }],
      order: [['viewedAt', 'DESC']],
      limit: Number(limit)
    });

    res.status(200).json(
      new ApiResponse(200, recentlyViewed, 'Recently viewed products retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Xóa một sản phẩm khỏi lịch sử xem
exports.removeFromRecentlyViewed = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.userId;

    const deleted = await RecentlyViewed.destroy({
      where: { userId, productId }
    });

    if (!deleted) {
      return next(new ApiError(404, 'Product not found in recently viewed'));
    }

    res.status(200).json(
      new ApiResponse(200, null, 'Product removed from recently viewed')
    );
  } catch (error) {
    next(error);
  }
};

// Xóa toàn bộ lịch sử xem
exports.clearRecentlyViewed = async (req, res, next) => {
  try {
    const userId = req.userId;

    await RecentlyViewed.destroy({
      where: { userId }
    });

    res.status(200).json(
      new ApiResponse(200, null, 'Recently viewed history cleared')
    );
  } catch (error) {
    next(error);
  }
};
