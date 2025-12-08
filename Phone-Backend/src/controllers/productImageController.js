const ProductImage = require('../models/ProductImage');
const Product = require('../models/Product');
const { ApiResponse, ApiError } = require('../utils/apiResponse');

// Lấy tất cả ảnh của sản phẩm
exports.getProductImages = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const images = await ProductImage.findAll({
      where: { productId },
      order: [['sortOrder', 'ASC'], ['isPrimary', 'DESC']]
    });

    res.status(200).json(
      new ApiResponse(200, images, 'Product images retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Thêm ảnh cho sản phẩm
exports.addProductImage = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { imageUrl, altText, sortOrder, isPrimary } = req.body;

    const product = await Product.findByPk(productId);
    if (!product) {
      return next(new ApiError(404, 'Product not found'));
    }

    // If setting as primary, unset other primary images
    if (isPrimary) {
      await ProductImage.update(
        { isPrimary: false },
        { where: { productId } }
      );
    }

    const image = await ProductImage.create({
      productId,
      imageUrl,
      altText: altText || product.name,
      sortOrder: sortOrder || 0,
      isPrimary: isPrimary || false
    });

    res.status(201).json(
      new ApiResponse(201, image, 'Product image added successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Thêm nhiều ảnh cùng lúc
exports.addMultipleImages = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { images } = req.body; // Array of { imageUrl, altText, sortOrder }

    const product = await Product.findByPk(productId);
    if (!product) {
      return next(new ApiError(404, 'Product not found'));
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return next(new ApiError(400, 'Images array is required'));
    }

    const existingCount = await ProductImage.count({ where: { productId } });

    const newImages = images.map((img, index) => ({
      productId,
      imageUrl: img.imageUrl,
      altText: img.altText || product.name,
      sortOrder: img.sortOrder || existingCount + index,
      isPrimary: existingCount === 0 && index === 0 // First image is primary if none exists
    }));

    const createdImages = await ProductImage.bulkCreate(newImages);

    res.status(201).json(
      new ApiResponse(201, createdImages, 'Product images added successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Cập nhật ảnh
exports.updateProductImage = async (req, res, next) => {
  try {
    const { productId, imageId } = req.params;
    const { imageUrl, altText, sortOrder, isPrimary } = req.body;

    const image = await ProductImage.findOne({
      where: { id: imageId, productId }
    });

    if (!image) {
      return next(new ApiError(404, 'Image not found'));
    }

    // If setting as primary, unset other primary images
    if (isPrimary && !image.isPrimary) {
      await ProductImage.update(
        { isPrimary: false },
        { where: { productId } }
      );
    }

    if (imageUrl) image.imageUrl = imageUrl;
    if (altText !== undefined) image.altText = altText;
    if (sortOrder !== undefined) image.sortOrder = sortOrder;
    if (isPrimary !== undefined) image.isPrimary = isPrimary;

    await image.save();

    res.status(200).json(
      new ApiResponse(200, image, 'Product image updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Đặt ảnh làm primary
exports.setPrimaryImage = async (req, res, next) => {
  try {
    const { productId, imageId } = req.params;

    const image = await ProductImage.findOne({
      where: { id: imageId, productId }
    });

    if (!image) {
      return next(new ApiError(404, 'Image not found'));
    }

    // Unset all primary images
    await ProductImage.update(
      { isPrimary: false },
      { where: { productId } }
    );

    // Set this image as primary
    image.isPrimary = true;
    await image.save();

    // Update product's main image
    await Product.update(
      { image: image.imageUrl },
      { where: { id: productId } }
    );

    res.status(200).json(
      new ApiResponse(200, image, 'Primary image set successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Xóa ảnh
exports.deleteProductImage = async (req, res, next) => {
  try {
    const { productId, imageId } = req.params;

    const image = await ProductImage.findOne({
      where: { id: imageId, productId }
    });

    if (!image) {
      return next(new ApiError(404, 'Image not found'));
    }

    const wasPrimary = image.isPrimary;
    await image.destroy();

    // If deleted image was primary, set another as primary
    if (wasPrimary) {
      const firstImage = await ProductImage.findOne({
        where: { productId },
        order: [['sortOrder', 'ASC']]
      });
      if (firstImage) {
        firstImage.isPrimary = true;
        await firstImage.save();
      }
    }

    res.status(200).json(
      new ApiResponse(200, null, 'Product image deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Sắp xếp lại thứ tự ảnh
exports.reorderImages = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { imageOrders } = req.body; // Array of { imageId, sortOrder }

    if (!imageOrders || !Array.isArray(imageOrders)) {
      return next(new ApiError(400, 'Image orders array is required'));
    }

    for (const order of imageOrders) {
      await ProductImage.update(
        { sortOrder: order.sortOrder },
        { where: { id: order.imageId, productId } }
      );
    }

    const images = await ProductImage.findAll({
      where: { productId },
      order: [['sortOrder', 'ASC']]
    });

    res.status(200).json(
      new ApiResponse(200, images, 'Images reordered successfully')
    );
  } catch (error) {
    next(error);
  }
};
