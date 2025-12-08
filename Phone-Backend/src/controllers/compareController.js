const Product = require('../models/Product');
const { ApiResponse, ApiError } = require('../utils/apiResponse');

// So sánh sản phẩm (tối đa 4 sản phẩm)
exports.compareProducts = async (req, res, next) => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds)) {
      return next(new ApiError(400, 'Product IDs array is required'));
    }

    if (productIds.length < 2) {
      return next(new ApiError(400, 'At least 2 products are required for comparison'));
    }

    if (productIds.length > 4) {
      return next(new ApiError(400, 'Maximum 4 products can be compared at once'));
    }

    const products = await Product.findAll({
      where: { id: productIds },
      attributes: [
        'id', 'name', 'category', 'price', 'originalPrice', 'discount',
        'image', 'description', 'specifications', 'stock', 'rating'
      ]
    });

    if (products.length < 2) {
      return next(new ApiError(404, 'Not enough products found'));
    }

    // Extract all unique specification keys
    const allSpecKeys = new Set();
    products.forEach(product => {
      if (product.specifications && Array.isArray(product.specifications)) {
        product.specifications.forEach(spec => {
          if (spec.name) allSpecKeys.add(spec.name);
        });
      }
    });

    // Build comparison matrix
    const comparisonData = {
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        originalPrice: p.originalPrice,
        discount: p.discount,
        image: p.image,
        rating: p.rating,
        stock: p.stock
      })),
      specifications: Array.from(allSpecKeys).map(specName => {
        const row = { name: specName };
        products.forEach(product => {
          const spec = product.specifications?.find(s => s.name === specName);
          row[`product_${product.id}`] = spec?.value || '-';
        });
        return row;
      }),
      basicComparison: [
        {
          name: 'Giá bán',
          ...Object.fromEntries(products.map(p => [`product_${p.id}`, p.price]))
        },
        {
          name: 'Giá gốc',
          ...Object.fromEntries(products.map(p => [`product_${p.id}`, p.originalPrice]))
        },
        {
          name: 'Giảm giá',
          ...Object.fromEntries(products.map(p => [`product_${p.id}`, `${p.discount || 0}%`]))
        },
        {
          name: 'Đánh giá',
          ...Object.fromEntries(products.map(p => [`product_${p.id}`, p.rating ? `${p.rating}/5` : 'Chưa có']))
        },
        {
          name: 'Tình trạng',
          ...Object.fromEntries(products.map(p => [`product_${p.id}`, p.stock > 0 ? 'Còn hàng' : 'Hết hàng']))
        }
      ]
    };

    res.status(200).json(
      new ApiResponse(200, comparisonData, 'Products comparison retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Lấy sản phẩm tương tự để so sánh
exports.getSimilarProducts = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { limit = 5 } = req.query;

    const product = await Product.findByPk(productId);
    if (!product) {
      return next(new ApiError(404, 'Product not found'));
    }

    // Find products in same category with similar price range
    const priceRange = {
      min: Number(product.price) * 0.7,
      max: Number(product.price) * 1.3
    };

    const { Op } = require('sequelize');
    const similarProducts = await Product.findAll({
      where: {
        id: { [Op.ne]: productId },
        category: product.category,
        price: {
          [Op.between]: [priceRange.min, priceRange.max]
        }
      },
      attributes: ['id', 'name', 'price', 'image', 'rating'],
      limit: Number(limit),
      order: [['rating', 'DESC']]
    });

    res.status(200).json(
      new ApiResponse(200, similarProducts, 'Similar products retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};
