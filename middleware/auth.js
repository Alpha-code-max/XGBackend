const { generateToken } = require('../middleware/auth');

// After successful OAuth callback or a new endpoint
app.get('/api/auth/me', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not logged in' });
  }

  // Generate JWT with user info
  const token = generateToken({
    id: req.user.id,
    provider: req.user.provider,
    displayName: req.user.displayName,
    email: req.user.email
  });

  res.json({
    message: 'Authenticated',
    user: {
      id: req.user.id,
      displayName: req.user.displayName,
      email: req.user.email,
      photo: req.user.photo
    },
    token // Send JWT to client
  });
});