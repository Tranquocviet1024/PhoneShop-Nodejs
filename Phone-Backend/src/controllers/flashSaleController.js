const FlashSale = require('../models/FlashSale');
const FlashSaleItem = require('../models/FlashSaleItem');
const Product = require('../models/Product');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const { Op } = require('sequelize');

// Lấy Flash Sale đang active
exports.getActiveFlashSales = async (req, res, next) => {
  try {
    const now = new Date();

    const flashSales = await FlashSale.findAll({
      where: {
        isActive: true,
        startTime: { [Op.lte]: now },
        endTime: { [Op.gte]: now }
      },
      include: [{
        model: FlashSaleItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'image', 'category', 'rating']
        }]
      }],
      order: [['endTime', 'ASC']]
    });

    res.status(200).json(
      new ApiResponse(200, flashSales, 'Active flash sales retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Lấy Flash Sale sắp diễn ra
exports.getUpcomingFlashSales = async (req, res, next) => {
  try {
    const now = new Date();

    const flashSales = await FlashSale.findAll({
      where: {
        isActive: true,
        startTime: { [Op.gt]: now }
      },
      include: [{
        model: FlashSaleItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'image', 'category']
        }]
      }],
      order: [['startTime', 'ASC']],
      limit: 5
    });

    res.status(200).json(
      new ApiResponse(200, flashSales, 'Upcoming flash sales retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Lấy chi tiết một Flash Sale
exports.getFlashSaleById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const flashSale = await FlashSale.findByPk(id, {
      include: [{
        model: FlashSaleItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'image', 'category', 'rating', 'stock', 'description']
        }]
      }]
    });

    if (!flashSale) {
      return next(new ApiError(404, 'Flash sale not found'));
    }

    // Calculate remaining time
    const now = new Date();
    const response = {
      ...flashSale.toJSON(),
      status: now < flashSale.startTime ? 'upcoming' : 
              now > flashSale.endTime ? 'ended' : 'active',
      remainingTime: flashSale.endTime > now ? flashSale.endTime - now : 0
    };

    res.status(200).json(
      new ApiResponse(200, response, 'Flash sale retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Admin: Tạo Flash Sale mới
exports.createFlashSale = async (req, res, next) => {
  try {
    const { name, description, startTime, endTime, bannerImage, items } = req.body;

    if (!name || !startTime || !endTime) {
      return next(new ApiError(400, 'Name, start time and end time are required'));
    }

    if (new Date(startTime) >= new Date(endTime)) {
      return next(new ApiError(400, 'End time must be after start time'));
    }

    const flashSale = await FlashSale.create({
      name,
      description,
      startTime,
      endTime,
      bannerImage,
      isActive: true
    });

    // Add items if provided
    if (items && Array.isArray(items) && items.length > 0) {
      const flashSaleItems = items.map(item => ({
        flashSaleId: flashSale.id,
        productId: item.productId,
        salePrice: item.salePrice,
        originalPrice: item.originalPrice,
        discountPercent: item.discountPercent || Math.round((1 - item.salePrice / item.originalPrice) * 100),
        stockLimit: item.stockLimit || 100
      }));

      await FlashSaleItem.bulkCreate(flashSaleItems);
    }

    const result = await FlashSale.findByPk(flashSale.id, {
      include: [{ model: FlashSaleItem, as: 'items' }]
    });

    res.status(201).json(
      new ApiResponse(201, result, 'Flash sale created successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Admin: Cập nhật Flash Sale
exports.updateFlashSale = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, startTime, endTime, bannerImage, isActive } = req.body;

    const flashSale = await FlashSale.findByPk(id);
    if (!flashSale) {
      return next(new ApiError(404, 'Flash sale not found'));
    }

    if (name) flashSale.name = name;
    if (description !== undefined) flashSale.description = description;
    if (startTime) flashSale.startTime = startTime;
    if (endTime) flashSale.endTime = endTime;
    if (bannerImage !== undefined) flashSale.bannerImage = bannerImage;
    if (isActive !== undefined) flashSale.isActive = isActive;

    await flashSale.save();

    res.status(200).json(
      new ApiResponse(200, flashSale, 'Flash sale updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Admin: Xóa Flash Sale
exports.deleteFlashSale = async (req, res, next) => {
  try {
    const { id } = req.params;

    const flashSale = await FlashSale.findByPk(id);
    if (!flashSale) {
      return next(new ApiError(404, 'Flash sale not found'));
    }

    // Delete items first
    await FlashSaleItem.destroy({ where: { flashSaleId: id } });
    await flashSale.destroy();

    res.status(200).json(
      new ApiResponse(200, null, 'Flash sale deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Admin: Thêm sản phẩm vào Flash Sale
exports.addFlashSaleItem = async (req, res, next) => {
  try {
    const { flashSaleId } = req.params;
    const { productId, salePrice, originalPrice, discountPercent, stockLimit } = req.body;

    const flashSale = await FlashSale.findByPk(flashSaleId);
    if (!flashSale) {
      return next(new ApiError(404, 'Flash sale not found'));
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return next(new ApiError(404, 'Product not found'));
    }

    // Check if product already in this flash sale
    const existing = await FlashSaleItem.findOne({
      where: { flashSaleId, productId }
    });
    if (existing) {
      return next(new ApiError(400, 'Product already in this flash sale'));
    }

    const item = await FlashSaleItem.create({
      flashSaleId,
      productId,
      salePrice: salePrice || product.price * 0.8,
      originalPrice: originalPrice || product.price,
      discountPercent: discountPercent || 20,
      stockLimit: stockLimit || 100
    });

    res.status(201).json(
      new ApiResponse(201, item, 'Product added to flash sale successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Admin: Xóa sản phẩm khỏi Flash Sale
exports.removeFlashSaleItem = async (req, res, next) => {
  try {
    const { flashSaleId, itemId } = req.params;

    const deleted = await FlashSaleItem.destroy({
      where: { id: itemId, flashSaleId }
    });

    if (!deleted) {
      return next(new ApiError(404, 'Flash sale item not found'));
    }

    res.status(200).json(
      new ApiResponse(200, null, 'Product removed from flash sale successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Admin: Lấy tất cả Flash Sales
exports.getAllFlashSales = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    const now = new Date();

    let where = {};
    if (status === 'active') {
      where = {
        isActive: true,
        startTime: { [Op.lte]: now },
        endTime: { [Op.gte]: now }
      };
    } else if (status === 'upcoming') {
      where = {
        isActive: true,
        startTime: { [Op.gt]: now }
      };
    } else if (status === 'ended') {
      where = {
        endTime: { [Op.lt]: now }
      };
    }

    const { count, rows } = await FlashSale.findAndCountAll({
      where,
      include: [{
        model: FlashSaleItem,
        as: 'items',
        attributes: ['id', 'productId', 'salePrice', 'soldCount']
      }],
      order: [['createdAt', 'DESC']],
      offset,
      limit: Number(limit)
    });

    res.status(200).json(
      new ApiResponse(200, {
        flashSales: rows,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(count / limit)
        }
      }, 'Flash sales retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};
