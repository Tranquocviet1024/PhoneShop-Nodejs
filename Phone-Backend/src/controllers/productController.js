const Product = require('../models/Product');
const Category = require('../models/Category');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const { Op } = require('sequelize');
const RoleEnum = require('../enums/RoleEnum');
const PermissionEnum = require('../enums/PermissionEnum');
const { logAudit } = require('../middleware/auditMiddleware');

// Get all products with filters and pagination
exports.getAllProducts = async (req, res, next) => {
  try {
    const { category, search, minPrice, maxPrice, page = 1, limit = 10, sort = 'newest' } = req.query;

    // Build filter object
    const where = {};

    if (category) {
      where.category = category;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = Number(minPrice);
      if (maxPrice) where.price[Op.lte] = Number(maxPrice);
    }

    // Determine sort option
    let order = [['createdAt', 'DESC']]; // Default: newest
    if (sort === 'price') {
      order = [['price', 'ASC']];
    } else if (sort === 'rating') {
      order = [['rating', 'DESC']];
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Get products with count
    const { count, rows } = await Product.findAndCountAll({
      where,
      order,
      offset,
      limit: Number(limit),
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json(
      new ApiResponse(200, {
        products: rows,
        pagination: {
          total: count,
          page: Number(page),
          limit: Number(limit),
          totalPages,
        },
      }, 'Products retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Get product by ID
exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      return next(new ApiError(404, 'Product not found'));
    }

    res.status(200).json(
      new ApiResponse(200, product, 'Product retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Search products
exports.searchProducts = async (req, res, next) => {
  try {
    const { q, category } = req.query;

    const where = {};

    if (q) {
      where[Op.or] = [
        { name: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } },
      ];
    }

    if (category) {
      where.category = category;
    }

    const products = await Product.findAll({
      where,
      limit: 20,
    });

    res.status(200).json(
      new ApiResponse(200, products, 'Search results retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Get all categories
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll();

    // Get count of products in each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.count({ where: { category: cat.name } });
        return {
          id: cat.id,
          name: cat.name,
          count,
        };
      })
    );

    res.status(200).json(
      new ApiResponse(200, categoriesWithCount, 'Categories retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Create product (admin only)
exports.createProduct = async (req, res, next) => {
  try {

    const { name, category, price, originalPrice, discount, image, description, specifications, stock } =
      req.body;

    if (!name || !category || !price || !originalPrice || !image || !description) {
      return next(new ApiError(400, 'Missing required fields'));
    }

    // Validate category exists (accept both ID and name)
    let validCategory = null;
    if (Number.isInteger(Number(category))) {
      // If category is numeric, treat as ID
      validCategory = await Category.findByPk(category);
    } else {
      // Otherwise treat as name
      validCategory = await Category.findOne({ where: { name: category } });
    }
    
    if (!validCategory) {
      return next(new ApiError(400, `Category '${category}' not found. Please create category first.`));
    }

    // Use category name for consistency
    const categoryName = validCategory.name;

    const product = await Product.create({
      name,
      category: categoryName,
      price,
      originalPrice,
      discount: discount || 0,
      image,
      description,
      specifications: specifications || [],
      stock: stock || 0,
    });

    // Log audit
    await logAudit(req, 'CREATE', 'Product', product.id, product.name, null, product.toJSON());

    res.status(201).json(
      new ApiResponse(201, product, 'Product created successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Update product (admin only)
exports.updateProduct = async (req, res, next) => {
  try {

    const { id } = req.params;
    const updates = req.body;

    const product = await Product.findByPk(id);
    
    if (!product) {
      return next(new ApiError(404, 'Product not found'));
    }

    // Capture old values for audit
    const oldValues = product.toJSON();

    // If category is being updated, validate it exists (accept both ID and name)
    if (updates.category && updates.category !== product.category) {
      let validCategory = null;
      if (Number.isInteger(Number(updates.category))) {
        // If category is numeric, treat as ID
        validCategory = await Category.findByPk(updates.category);
      } else {
        // Otherwise treat as name
        validCategory = await Category.findOne({ where: { name: updates.category } });
      }
      
      if (!validCategory) {
        return next(new ApiError(400, `Category '${updates.category}' not found`));
      }

      // Use category name
      updates.category = validCategory.name;
    }

    await product.update(updates);

    // Log audit
    await logAudit(req, 'UPDATE', 'Product', product.id, product.name, oldValues, product.toJSON());

    res.status(200).json(
      new ApiResponse(200, product, 'Product updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Delete product (admin only)
exports.deleteProduct = async (req, res, next) => {
  try {

    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      return next(new ApiError(404, 'Product not found'));
    }

    // Capture old values for audit
    const oldValues = product.toJSON();

    await product.destroy();

    // Log audit
    await logAudit(req, 'DELETE', 'Product', id, oldValues.name, oldValues, null);

    res.status(200).json(
      new ApiResponse(200, null, 'Product deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};
