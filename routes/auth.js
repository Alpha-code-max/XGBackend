// routes/auth.js
const express = require('express');
const router = express.Router();
const passport = require('passport');

const providers = ['google', 'facebook', 'discord'];

// Local login
router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login-failure'
}));

router.get('/login-failure', (req, res) => {
  res.send('Login failed. Wrong credentials or not registered.');
});

// OAuth routes
providers.forEach(provider => {
  const scope = provider === 'google' ? ['profile', 'email'] :
                provider === 'discord' ? ['identify', 'email'] : [];

  router.get(`/${provider}`, passport.authenticate(provider, { scope }));

  router.get(`/${provider}/callback`,
    passport.authenticate(provider, { failureRedirect: '/login-failure' }),
    (req, res) => res.redirect('/')
  );
});

// Logout
router.get('/logout', (req, res, next) => {
  req.logout({ keepSessionInfo: false }, () => {
    res.redirect('/');
  });
});

module.exports = router;