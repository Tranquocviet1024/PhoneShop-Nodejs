const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const RoleEnum = require('../enums/RoleEnum');
const PermissionEnum = require('../enums/PermissionEnum');

// Save cart
exports.saveCart = async (req, res, next) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return next(new ApiError(400, 'Items array is required'));
    }

    // Calculate total price
    let totalPrice = 0;
    for (const item of items) {
      totalPrice += item.price * item.quantity;
    }

    let cart = await Cart.findOne({ where: { userId: req.userId } });

    if (cart) {
      cart.items = JSON.stringify(items);
      cart.totalPrice = totalPrice;
      await cart.save();
    } else {
      cart = await Cart.create({
        userId: req.userId,
        items: JSON.stringify(items),
        totalPrice,
      });
    }

    res.status(200).json(
      new ApiResponse(200, cart, 'Cart saved successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Get cart
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ where: { userId: req.userId } });

    if (!cart) {
      // Return empty cart
      return res.status(200).json(
        new ApiResponse(200, {
          items: [],
          totalPrice: 0,
        }, 'Cart retrieved successfully')
      );
    }

    const items = typeof cart.items === 'string' ? JSON.parse(cart.items) : cart.items;
    cart.items = items;

    res.status(200).json(
      new ApiResponse(200, cart, 'Cart retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Add item to cart
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity < 1) {
      return next(new ApiError(400, 'ProductId and quantity are required'));
    }

    // Check if product exists
    const product = await Product.findByPk(productId);

    if (!product) {
      return next(new ApiError(404, 'Product not found'));
    }

    if (product.stock < quantity) {
      return next(new ApiError(400, 'Insufficient stock'));
    }

    let cart = await Cart.findOne({ where: { userId: req.userId } });

    let items = [];
    if (cart) {
      items = typeof cart.items === 'string' ? JSON.parse(cart.items) : cart.items;
    } else {
      cart = await Cart.create({
        userId: req.userId,
        items: JSON.stringify([]),
        totalPrice: 0,
      });
    }

    // Check if item already in cart
    const existingItem = items.find((item) => item.productId === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      items.push({
        productId,
        quantity,
        price: product.price,
      });
    }

    // Recalculate total price
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    cart.items = JSON.stringify(items);
    cart.totalPrice = totalPrice;
    await cart.save();

    res.status(200).json(
      new ApiResponse(200, cart, 'Item added to cart successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ where: { userId: req.userId } });

    if (!cart) {
      return next(new ApiError(404, 'Cart not found'));
    }

    let items = typeof cart.items === 'string' ? JSON.parse(cart.items) : cart.items;
    items = items.filter((item) => item.productId !== parseInt(productId));

    // Recalculate total price
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    cart.items = JSON.stringify(items);
    cart.totalPrice = totalPrice;
    await cart.save();

    res.status(200).json(
      new ApiResponse(200, cart, 'Item removed from cart successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Clear cart
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ where: { userId: req.userId } });

    if (!cart) {
      return next(new ApiError(404, 'Cart not found'));
    }

    cart.items = JSON.stringify([]);
    cart.totalPrice = 0;
    await cart.save();

    res.status(200).json(
      new ApiResponse(200, cart, 'Cart cleared successfully')
    );
  } catch (error) {
    next(error);
  }
};
