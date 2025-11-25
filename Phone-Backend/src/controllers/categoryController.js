const Category = require('../models/Category');
const { ApiResponse, ApiError } = require('../utils/apiResponse');

/**
 * GET /api/categories
 * Get all categories with optional filters
 */
exports.getAllCategories = async (req, res, next) => {
  try {
    const { search, sort = 'createdAt', order = 'desc' } = req.query;

    const where = {};
    if (search) {
      // For ENUM field, use exact match
      where.name = search;
    }

    const categories = await Category.findAll({
      where,
      order: [[sort, order.toUpperCase()]],
      attributes: ['id', 'name', 'description', 'createdAt', 'updatedAt']
    });

    res.status(200).json(
      new ApiResponse(200, categories, 'Categories retrieved')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/categories/:id
 * Get category by ID
 */
exports.getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      return next(new ApiError(404, 'Category not found'));
    }

    res.status(200).json(
      new ApiResponse(200, category, 'Category retrieved')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/categories
 * Create new category (ADMIN ONLY)
 */
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    // Validate required fields
    if (!name) {
      return next(new ApiError(400, 'Category name is required'));
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      return next(new ApiError(409, `Category '${name}' already exists`));
    }

    // Create category
    const category = await Category.create({
      name,
      description: description || null
    });

    res.status(201).json(
      new ApiResponse(201, category, 'Category created successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/categories/:id
 * Update category (ADMIN ONLY)
 */
exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Find category
    const category = await Category.findByPk(id);
    if (!category) {
      return next(new ApiError(404, 'Category not found'));
    }

    // Validate if changing name
    if (name && name !== category.name) {
      // Check if new name already exists
      const existingCategory = await Category.findOne({ where: { name } });
      if (existingCategory) {
        return next(new ApiError(409, `Category '${name}' already exists`));
      }

      category.name = name;
    }

    if (description !== undefined) {
      category.description = description;
    }

    await category.save();

    res.status(200).json(
      new ApiResponse(200, category, 'Category updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/categories/:id
 * Delete category (ADMIN ONLY)
 */
exports.deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find category
    const category = await Category.findByPk(id);
    if (!category) {
      return next(new ApiError(404, 'Category not found'));
    }

    // Check if category has products
    const Product = require('../models/Product');
    const productCount = await Product.count({ where: { category: category.name } });
    if (productCount > 0) {
      return next(new ApiError(400, `Cannot delete category with ${productCount} products`));
    }

    await category.destroy();

    res.status(200).json(
      new ApiResponse(200, null, 'Category deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/categories/enum/values
 * Get all available categories
 */
exports.getCategoryEnumValues = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      attributes: ['id', 'name', 'description'],
      order: [['name', 'ASC']]
    });

    res.status(200).json(
      new ApiResponse(200, {
        categories: categories
      }, 'Categories retrieved')
    );
  } catch (error) {
    next(error);
  }
};
