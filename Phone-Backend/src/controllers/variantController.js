const ProductVariant = require('../models/ProductVariant');
const Product = require('../models/Product');
const { ApiResponse, ApiError } = require('../utils/apiResponse');

// Lấy tất cả variants của sản phẩm
exports.getProductVariants = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const variants = await ProductVariant.findAll({
      where: { productId, isActive: true },
      order: [['storage', 'ASC'], ['color', 'ASC']]
    });

    // Group variants by options for frontend
    const colors = [...new Set(variants.filter(v => v.color).map(v => ({
      name: v.color,
      code: v.colorCode
    })))];
    
    const storages = [...new Set(variants.filter(v => v.storage).map(v => v.storage))];

    res.status(200).json(
      new ApiResponse(200, {
        variants,
        options: {
          colors: colors.filter((c, i, arr) => arr.findIndex(x => x.name === c.name) === i),
          storages
        }
      }, 'Product variants retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Lấy variant theo color và storage
exports.getVariantByOptions = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { color, storage } = req.query;

    const where = { productId, isActive: true };
    if (color) where.color = color;
    if (storage) where.storage = storage;

    const variant = await ProductVariant.findOne({ where });

    if (!variant) {
      return next(new ApiError(404, 'Variant not found'));
    }

    res.status(200).json(
      new ApiResponse(200, variant, 'Variant retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Admin: Tạo variant mới
exports.createVariant = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { sku, name, color, colorCode, storage, ram, price, originalPrice, stock, image } = req.body;

    const product = await Product.findByPk(productId);
    if (!product) {
      return next(new ApiError(404, 'Product not found'));
    }

    // Check SKU uniqueness
    if (sku) {
      const existingSku = await ProductVariant.findOne({ where: { sku } });
      if (existingSku) {
        return next(new ApiError(400, 'SKU already exists'));
      }
    }

    const variant = await ProductVariant.create({
      productId,
      sku: sku || `${productId}-${Date.now()}`,
      name: name || `${product.name} - ${storage || ''} ${color || ''}`.trim(),
      color,
      colorCode,
      storage,
      ram,
      price: price || product.price,
      originalPrice: originalPrice || product.originalPrice,
      stock: stock || 0,
      image,
      isActive: true
    });

    res.status(201).json(
      new ApiResponse(201, variant, 'Variant created successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Admin: Tạo nhiều variants cùng lúc
exports.createBulkVariants = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { variants } = req.body;

    const product = await Product.findByPk(productId);
    if (!product) {
      return next(new ApiError(404, 'Product not found'));
    }

    if (!variants || !Array.isArray(variants) || variants.length === 0) {
      return next(new ApiError(400, 'Variants array is required'));
    }

    const variantsToCreate = variants.map((v, index) => ({
      productId,
      sku: v.sku || `${productId}-${Date.now()}-${index}`,
      name: v.name || `${product.name} - ${v.storage || ''} ${v.color || ''}`.trim(),
      color: v.color,
      colorCode: v.colorCode,
      storage: v.storage,
      ram: v.ram,
      price: v.price || product.price,
      originalPrice: v.originalPrice || product.originalPrice,
      stock: v.stock || 0,
      image: v.image,
      isActive: true
    }));

    const createdVariants = await ProductVariant.bulkCreate(variantsToCreate);

    res.status(201).json(
      new ApiResponse(201, createdVariants, 'Variants created successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Admin: Cập nhật variant
exports.updateVariant = async (req, res, next) => {
  try {
    const { productId, variantId } = req.params;
    const updates = req.body;

    const variant = await ProductVariant.findOne({
      where: { id: variantId, productId }
    });

    if (!variant) {
      return next(new ApiError(404, 'Variant not found'));
    }

    // Check SKU uniqueness if changing
    if (updates.sku && updates.sku !== variant.sku) {
      const existingSku = await ProductVariant.findOne({ where: { sku: updates.sku } });
      if (existingSku) {
        return next(new ApiError(400, 'SKU already exists'));
      }
    }

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        variant[key] = updates[key];
      }
    });

    await variant.save();

    res.status(200).json(
      new ApiResponse(200, variant, 'Variant updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Admin: Xóa variant (soft delete)
exports.deleteVariant = async (req, res, next) => {
  try {
    const { productId, variantId } = req.params;

    const variant = await ProductVariant.findOne({
      where: { id: variantId, productId }
    });

    if (!variant) {
      return next(new ApiError(404, 'Variant not found'));
    }

    variant.isActive = false;
    await variant.save();

    res.status(200).json(
      new ApiResponse(200, null, 'Variant deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Admin: Cập nhật stock cho variant
exports.updateVariantStock = async (req, res, next) => {
  try {
    const { productId, variantId } = req.params;
    const { stock, operation = 'set' } = req.body; // operation: set, add, subtract

    const variant = await ProductVariant.findOne({
      where: { id: variantId, productId }
    });

    if (!variant) {
      return next(new ApiError(404, 'Variant not found'));
    }

    if (operation === 'add') {
      variant.stock += stock;
    } else if (operation === 'subtract') {
      variant.stock = Math.max(0, variant.stock - stock);
    } else {
      variant.stock = stock;
    }

    await variant.save();

    res.status(200).json(
      new ApiResponse(200, variant, 'Variant stock updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Lấy tổng stock của tất cả variants
exports.getTotalStock = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const variants = await ProductVariant.findAll({
      where: { productId, isActive: true },
      attributes: ['id', 'sku', 'name', 'stock', 'color', 'storage']
    });

    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

    res.status(200).json(
      new ApiResponse(200, {
        totalStock,
        variants: variants.map(v => ({
          id: v.id,
          sku: v.sku,
          name: v.name,
          stock: v.stock,
          color: v.color,
          storage: v.storage
        }))
      }, 'Total stock retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};
