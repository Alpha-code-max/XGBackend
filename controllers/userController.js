// controllers/userController.js
const User = require('../models/User');

/**
 * GET /auth/users
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password -__v') // exclude sensitive fields
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (err) {
    console.error('Get all users error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users',
    });
  }
};

/**
 * GET /auth/users/:id
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    console.error('Get user by ID error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
};