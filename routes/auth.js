const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken'); // 1. Added JWT import
const User = require('../models/User');

// 2. Define generateToken locally within this file
const generateToken = (userPayload, expiresIn = '7d') => {
  // Ensure you have JWT_SECRET in your .env file
  return jwt.sign(userPayload, process.env.JWT_SECRET || 'your_fallback_secret', {
    expiresIn: expiresIn,
  });
};

// POST /auth/register - Local user registration
router.post('/register', async (req, res) => {
  const { username, password, displayName, email } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const existingUser = await User.findOne({
      $or: [{ username: username.trim().toLowerCase() }, { email: email?.trim().toLowerCase() }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: existingUser.username === username.trim().toLowerCase()
          ? 'Username already exists'
          : 'Email already registered'
      });
    }

    const user = new User({
      provider: 'local',
      username: username.trim().toLowerCase(),
      password, 
      email: email?.trim().toLowerCase(),
      displayName: displayName || username,
    });

    await user.save();

    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Registration succeeded but login failed' });
      }

      res.status(201).json({
        message: 'Registration successful',
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          email: user.email,
          provider: user.provider
        }
      });
    });
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// POST /auth/login
router.post('/login', passport.authenticate('local', { failureMessage: true }), (req, res) => {
  res.json({
    message: 'Login successful',
    user: {
      id: req.user.id,
      username: req.user.username,
      displayName: req.user.displayName || req.user.username,
      email: req.user.email,
      provider: req.user.provider
    }
  });
});

// GET /auth/me - Now uses the local generateToken function
router.get('/me', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  // Calling the function defined above
  const token = generateToken({
    id: req.user.id,
    provider: req.user.provider,
    username: req.user.username,
    displayName: req.user.displayName || req.user.username,
    email: req.user.email
  });

  res.json({
    message: 'Authenticated',
    user: {
      id: req.user.id,
      username: req.user.username,
      displayName: req.user.displayName || req.user.username,
      email: req.user.email,
      photo: req.user.photo,
      provider: req.user.provider
    },
    token
  });
});

// GET /auth/logout
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy((err) => {
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  });
});

module.exports = router;
