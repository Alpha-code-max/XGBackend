const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validationResult } = require('express-validator');

const generateToken = (user) => {
  const payload = {
    id: user._id,
    username: user.username,
    email: user.email,
    provider: user.provider,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

const formatUser = (user) => ({
  id: user._id,
  username: user.username,
  displayName: user.displayName || user.username,
  email: user.email,
  provider: user.provider,
  photo: user.photo || null,
});

/**
 * POST /auth/register
 */
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password, email, displayName } = req.body;

  try {
    const existing = await User.findOne({
      $or: [
        { username: username.toLowerCase() },
        ...(email ? [{ email: email.toLowerCase() }] : []),
      ],
    });

    if (existing) {
      return res.status(400).json({
        message: existing.username === username.toLowerCase()
          ? 'Username already taken'
          : 'Email already registered',
      });
    }

    const user = new User({
      provider: 'local',
      username: username.toLowerCase(),
      password, // ← should be hashed in User model pre-save hook!
      email: email?.toLowerCase(),
      displayName: displayName || username,
    });

    await user.save();

    const token = generateToken(user);

    return res.status(201).json({
      message: 'Registration successful',
      user: formatUser(user),
      token,
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Registration failed' });
  }
};

/**
 * POST /auth/login (called after passport.authenticate)
 */
const login = (req, res) => {
  const token = generateToken(req.user);

  res.json({
    message: 'Login successful',
    user: formatUser(req.user),
    token,
  });
};

/**
 * GET /auth/me
 */
const getMe = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const token = generateToken(req.user);

  res.json({
    message: 'Authenticated',
    user: formatUser(req.user),
    token, // optional - client can use it to refresh
  });
};

/**
 * POST /auth/logout
 */
const logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout error' });
    }

    req.session?.destroy(() => {
      res.clearCookie('sid'); // updated to match your session cookie name
      res.json({ message: 'Logged out successfully' });
    });
  });
};

module.exports = {
  register,
  login,
  getMe,
  logout,
};