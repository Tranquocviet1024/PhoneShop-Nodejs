const User = require('../models/User');
const Role = require('../models/Role');
const UserRole = require('../models/UserRole');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const { Op, fn, col } = require('sequelize');
const { sequelize } = require('../config/database');
const RoleEnum = require('../enums/RoleEnum');
const permissionService = require('../services/permissionService');
const bcrypt = require('bcryptjs');

/**
 * GET /admin/stats
 * Get system statistics (total users, products, orders, revenue)
 */
exports.getStats = async (req, res, next) => {
  try {
    // Get total counts
    const totalUsers = await User.count();
    const totalProducts = await Product.count();
    const totalOrders = await Order.count();
    const totalReviews = await Review.count();

    // Get revenue (sum of all completed orders)
    const revenueData = await Order.findAll({
      attributes: [
        [fn('SUM', col('totalPrice')), 'totalRevenue']
      ],
      where: { status: 'completed' },
      raw: true,
    });

    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    // Get pending orders count
    const pendingOrders = await Order.count({
      where: { status: 'pending' }
    });

    // Get active users (users who have placed at least one order)
    const activeUsers = await User.count({
      distinct: true,
      include: [{
        model: Order,
        attributes: [],
        required: true,
      }],
    });

    // Calculate average order value
    const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0;

    res.status(200).json(
      new ApiResponse(200, {
        totalUsers,
        totalProducts,
        totalOrders,
        totalReviews,
        totalRevenue: parseFloat(totalRevenue).toFixed(2),
        pendingOrders,
        activeUsers,
        avgOrderValue: parseFloat(avgOrderValue),
        stats: {
          users: totalUsers,
          products: totalProducts,
          orders: totalOrders,
          reviews: totalReviews,
        }
      }, 'System statistics retrieved')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /admin/orders
 * Get all orders with filters
 * Query: ?page=1&limit=10&status=pending&search=order123&sort=createdAt&order=desc
 */
exports.getOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const search = req.query.search;
    const sort = req.query.sort || 'createdAt';
    const orderDir = req.query.order || 'desc';

    // Build where clause
    const where = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where.id = {
        [Op.like]: `%${search}%`
      };
    }

    // Get orders with pagination
    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'email', 'fullName']
        }
      ],
      order: [[sort, orderDir.toUpperCase()]],
      limit,
      offset: (page - 1) * limit,
    });

    const totalPages = Math.ceil(count / limit);

    // Format orders data - parse JSON strings and cast numbers
    const formattedOrders = rows.map(order => {
      const orderData = order.toJSON();
      return {
        ...orderData,
        items: typeof orderData.items === 'string' ? JSON.parse(orderData.items) : orderData.items,
        shippingInfo: typeof orderData.shippingInfo === 'string' ? JSON.parse(orderData.shippingInfo) : orderData.shippingInfo,
        totalPrice: parseFloat(orderData.totalPrice),
        shippingCost: parseFloat(orderData.shippingCost),
        tax: parseFloat(orderData.tax),
        finalTotal: parseFloat(orderData.finalTotal)
      };
    });

    res.status(200).json(
      new ApiResponse(200, {
        orders: formattedOrders,
        pagination: {
          total: count,
          page,
          limit,
          totalPages,
        }
      }, 'Orders retrieved')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /admin/products
 * Get all products with filters
 * Query: ?page=1&limit=12&category=iPhone&inStock=true&sort=price&order=asc&search=iphone
 */
exports.getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const category = req.query.category;
    const inStock = req.query.inStock === 'true';
    const sort = req.query.sort || 'createdAt';
    const orderDir = req.query.order || 'desc';
    const search = req.query.search;

    // Build where clause
    const where = {};
    if (category) {
      where.category = category;
    }
    if (inStock) {
      where.stock = { [Op.gt]: 0 };
    }
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    // Get products with pagination
    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Review,
          attributes: ['rating'],
          required: false,
        }
      ],
      order: [[sort, orderDir.toUpperCase()]],
      limit,
      offset: (page - 1) * limit,
    });

    const totalPages = Math.ceil(count / limit);

    // Calculate average rating for each product
    const productsWithRating = rows.map(product => {
      const reviews = product.Reviews || [];
      const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

      return {
        ...product.toJSON(),
        averageRating: parseFloat(avgRating),
        reviewCount: reviews.length,
      };
    });

    res.status(200).json(
      new ApiResponse(200, {
        products: productsWithRating,
        pagination: {
          total: count,
          page,
          limit,
          totalPages,
        }
      }, 'Products retrieved')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /admin/users
 * Get all users with filters
 * Query: ?page=1&limit=10&role=USER&search=john&sort=createdAt&order=desc&isActive=true
 */
exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const role = req.query.role;
    const search = req.query.search;
    const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
    const sort = req.query.sort || 'createdAt';
    const orderDir = req.query.order || 'desc';

    // Build where clause
    const where = {};
    if (role) {
      where.role = role;
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    if (search) {
      where[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { fullName: { [Op.like]: `%${search}%` } }
      ];
    }

    // Get users with pagination
    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['passwordHash'] },
      include: [
        {
          model: UserRole,
          include: [
            {
              model: Role,
              attributes: ['id', 'name', 'description']
            }
          ],
          required: false // LEFT JOIN - hiển thị cả user chưa có role
        }
      ],
      order: [[sort, orderDir.toUpperCase()]],
      limit,
      offset: (page - 1) * limit,
    });

    // Format response to include role information from UserRole
    const formattedUsers = rows.map(user => {
      const userData = user.toJSON();
      
      // Get role from UserRole table (new RBAC system)
      if (userData.UserRoles && userData.UserRoles.length > 0) {
        // Convert Role to plain object
        const roleData = userData.UserRoles[0].Role;
        userData.assignedRole = {
          id: roleData.id,
          name: roleData.name,
          description: roleData.description,
          permissions: roleData.permissions
        };
        userData.additionalPermissions = userData.UserRoles[0].additionalPermissions || [];
        userData.deniedPermissions = userData.UserRoles[0].deniedPermissions || [];
      } else {
        userData.assignedRole = null;
        userData.additionalPermissions = [];
        userData.deniedPermissions = [];
      }
      
      // Remove UserRoles from response (already processed)
      delete userData.UserRoles;
      
      return userData;
    });

    const totalPages = Math.ceil(count / limit);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalUsers,
      activeUsers,
      newThisWeek,
      roleDistributionRaw,
      unassignedUsers
    ] = await Promise.all([
      User.count(),
      User.count({ where: { isActive: true } }),
      User.count({ where: { createdAt: { [Op.gte]: sevenDaysAgo } } }),
      UserRole.findAll({
        attributes: [
          [col('Role.name'), 'roleName'],
          [fn('COUNT', col('UserRole.userId')), 'count']
        ],
        include: [
          {
            model: Role,
            attributes: [],
          }
        ],
        group: ['Role.name'],
        raw: true,
      }),
      User.count({
        include: [
          {
            model: UserRole,
            required: false,
          }
        ],
        where: {
          '$UserRoles.id$': {
            [Op.is]: null,
          }
        },
      })
    ]);

    const roleDistribution = roleDistributionRaw.map((role) => ({
      role: role.roleName,
      count: Number(role.count) || 0,
    }));

    if (unassignedUsers > 0) {
      roleDistribution.push({ role: 'UNASSIGNED', count: unassignedUsers });
    }

    const summary = {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      newThisWeek,
      roleDistribution,
      lastUpdated: new Date().toISOString(),
    };

    res.status(200).json(
      new ApiResponse(200, {
        users: formattedUsers,
        pagination: {
          total: count,
          page,
          limit,
          totalPages,
        },
        summary,
      }, 'Users retrieved')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * POST /admin/users
 * Create a new user (by admin)
 * Body: { username, email, password, fullName, roleName, isActive }
 */
exports.createUser = async (req, res, next) => {
  try {
    const { username, email, password, fullName, roleName, isActive } = req.body;

    // Validation
    if (!username || !email || !password) {
      return next(new ApiError(400, 'Username, email, and password are required'));
    }

    // Check if user exists
    const existingUser = await User.findOne({
      where: { [Op.or]: [{ email }, { username }] }
    });

    if (existingUser) {
      return next(new ApiError(400, 'Email or username already exists'));
    }

    // Create user - Password will be hashed by User.beforeCreate hook
    const newUser = await User.create({
      username,
      email,
      passwordHash: password, // Will be hashed by beforeCreate hook
      fullName: fullName || '',
      role: roleName?.toLowerCase() || RoleEnum.USER, // Use provided role or default to USER
      isActive: isActive !== undefined ? isActive : true,
    });

    // Tự động gán role cho user
    if (roleName) {
      const role = await Role.findOne({ where: { name: roleName.toUpperCase() } });
      if (role) {
        await permissionService.assignRoleToUser(newUser.id, role.id);
      }
    } else {
      // Nếu không chỉ định, gán role USER mặc định
      const userRole = await Role.findOne({ where: { name: 'USER' } });
      if (userRole) {
        await permissionService.assignRoleToUser(newUser.id, userRole.id);
      }
    }

    // Get created user with role information
    const createdUser = await User.findByPk(newUser.id, {
      attributes: { exclude: ['passwordHash'] },
      include: [
        {
          model: UserRole,
          include: [
            {
              model: Role,
              attributes: ['id', 'name', 'description', 'permissions']
            }
          ]
        }
      ]
    });

    // Format response
    const userResponse = createdUser.toJSON();
    if (userResponse.UserRoles && userResponse.UserRoles.length > 0) {
      // Convert Role to plain object
      const roleData = userResponse.UserRoles[0].Role;
      userResponse.assignedRole = {
        id: roleData.id,
        name: roleData.name,
        description: roleData.description,
        permissions: roleData.permissions
      };
      userResponse.additionalPermissions = userResponse.UserRoles[0].additionalPermissions || [];
      userResponse.deniedPermissions = userResponse.UserRoles[0].deniedPermissions || [];
    } else {
      userResponse.assignedRole = null;
      userResponse.additionalPermissions = [];
      userResponse.deniedPermissions = [];
    }
    delete userResponse.UserRoles;

    res.status(201).json(
      new ApiResponse(201, userResponse, 'User created successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /admin/users/:id
 * Update user by id (by admin)
 * Body: { username, email, password, fullName, role, isActive }
 */
exports.updateUser = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { username, email, password, fullName, roleName, isActive } = req.body;

    const user = await User.findByPk(id, { transaction: t });
    if (!user) {
      await t.rollback();
      return next(new ApiError(404, "User not found"));
    }

    // Check email
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ where: { email }, transaction: t });
      if (emailExists) {
        await t.rollback();
        return next(new ApiError(400, "Email already exists"));
      }
    }

    // Check username
    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ where: { username }, transaction: t });
      if (usernameExists) {
        await t.rollback();
        return next(new ApiError(400, "Username already exists"));
      }
    }

    // Update fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (fullName) user.fullName = fullName;
    if (isActive !== undefined) user.isActive = isActive;

    if (password) {
      user.passwordHash = await bcrypt.hash(password, 10);   // FIX password hashing
    }

    await user.save({ transaction: t });

    // Update role
    if (roleName) {
      const role = await Role.findOne({
        where: { name: roleName.toUpperCase() },
        transaction: t
      });

      if (!role) {
        await t.rollback();
        return next(new ApiError(400, `Role '${roleName}' not found`));
      }

      await UserRole.destroy({ where: { userId: id }, transaction: t });

      await UserRole.create({
        userId: id,
        roleId: role.id,
        additionalPermissions: [],
        deniedPermissions: []
      }, { transaction: t });
    }

    await t.commit();

    // RETURN UPDATED DATA
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ["passwordHash"] },
      include: [
        {
          model: UserRole,
          include: [{ model: Role, attributes: ["id", "name", "description", "permissions"] }],
        },
      ],
    });

    const result = updatedUser.toJSON();

    // Extract role
    if (result.UserRoles?.length > 0) {
      const role = result.UserRoles[0].Role;
      result.assignedRole = role;
      result.additionalPermissions = result.UserRoles[0].additionalPermissions;
      result.deniedPermissions = result.UserRoles[0].deniedPermissions;
    } else {
      result.assignedRole = null;
      result.additionalPermissions = [];
      result.deniedPermissions = [];
    }

    delete result.UserRoles;

    res.status(200).json(new ApiResponse(200, result, "User updated successfully"));
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

/**
 * DELETE /admin/users/:id
 * Delete user by id (by admin)
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    // Prevent deleting admin user
    if (user.role === RoleEnum.ADMIN) {
      return next(new ApiError(400, 'Cannot delete admin user'));
    }

    await user.destroy();

    res.status(200).json(
      new ApiResponse(200, null, 'User deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};
