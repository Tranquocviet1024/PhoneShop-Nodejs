const User = require('../models/User');
const { ApiResponse, ApiError } = require('../utils/apiResponse');

/**
 * GET /profile
 * Get current user's profile information
 */
exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.userId;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['passwordHash'] }
    });

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    res.status(200).json(
      new ApiResponse(200, user, 'Profile retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /profile
 * Update current user's profile information
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { fullName, phone, address } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return next(new ApiError(404, 'User not found'));
    }

    // Update allowed fields only
    if (fullName !== undefined) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;

    await user.save();

    // Return updated user without password
    const userResponse = user.toJSON();
    delete userResponse.passwordHash;

    res.status(200).json(
      new ApiResponse(200, userResponse, 'Profile updated successfully')
    );
  } catch (error) {
    next(error);
  }
};
