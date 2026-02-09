const express = require('express');
const router = express.Router();
const { register, login, getMe, logout } = require('../controllers/authControllers');
const { getAllUsers, getUserById } = require('../controllers/userController'); // new controller
const passport = require('passport');
const { body } = require('express-validator');
const { isAuthenticated, isAdmin } = require('../middleware/auth'); // assuming you have these

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new local user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username: { type: string, minLength: 3, maxLength: 30 }
 *               password: { type: string, minLength: 8 }
 *               email: { type: string, format: email }
 *               displayName: { type: string }
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AuthResponse' }
 *       400:
 *         description: Bad request (validation error or duplicate username/email)
 *       500:
 *         description: Server error
 */
router.post(
  '/register',
  [
    body('username').trim().notEmpty().isLength({ min: 3, max: 30 }),
    body('password').isLength({ min: 8 }),
    body('email').optional().trim().isEmail(),
    body('displayName').optional().trim(),
  ],
  register
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with username and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AuthResponse' }
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', passport.authenticate('local', { session: false }), login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AuthResponse' }
 *       401:
 *         description: Unauthorized
 */
router.get('/me', getMe);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout current session
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post('/logout', logout);

// ────────────────────────────────────────────────
// Google OAuth Routes
// ────────────────────────────────────────────────

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Initiate Google OAuth login
 *     tags: [Authentication, OAuth]
 *     description: Redirects the user to Google's authentication page
 */
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'
  })
);

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [Authentication, OAuth]
 *     description: Google redirects here after authentication
 *     responses:
 *       302:
 *         description: Redirects to home or dashboard on success
 *       401:
 *         description: Authentication failed
 */
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/?error=google_failed',
    failureMessage: true,
  }),
  (req, res) => {
    const token = req.user ? generateToken(req.user) : null;
    res.redirect(`/?token=${token || ''}`);
  }
);

// ────────────────────────────────────────────────
// Discord OAuth Routes
// ────────────────────────────────────────────────

/**
 * @swagger
 * /auth/discord:
 *   get:
 *     summary: Initiate Discord OAuth login
 *     tags: [Authentication, OAuth]
 *     description: Redirects the user to Discord's authentication page
 */
router.get('/discord',
  passport.authenticate('discord', {
    scope: ['identify', 'email']
  })
);

/**
 * @swagger
 * /auth/discord/callback:
 *   get:
 *     summary: Discord OAuth callback
 *     tags: [Authentication, OAuth]
 *     description: Discord redirects here after authentication
 *     responses:
 *       302:
 *         description: Redirects to home or dashboard on success
 *       401:
 *         description: Authentication failed
 */
router.get('/discord/callback',
  passport.authenticate('discord', {
    failureRedirect: '/?error=discord_failed',
    failureMessage: true,
  }),
  (req, res) => {
    const token = req.user ? generateToken(req.user) : null;
    res.redirect(`/?token=${token || ''}`);
  }
);

// ────────────────────────────────────────────────
// User Management Routes (Protected)
// ────────────────────────────────────────────────

/**
 * @swagger
 * /auth/users:
 *   get:
 *     summary: Get list of all users
 *     tags: [Users, Admin]
 *     description: Returns a list of all registered users (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Unauthorized - not authenticated
 *       403:
 *         description: Forbidden - insufficient permissions
 *       500:
 *         description: Server error
 */
router.get('/users', isAuthenticated, isAdmin, getAllUsers);

/**
 * @swagger
 * /auth/users/{id}:
 *   get:
 *     summary: Get details of a specific user
 *     tags: [Users, Admin]
 *     description: Returns information about a single user by ID (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/users/:id', isAuthenticated, isAdmin, getUserById);

module.exports = router;