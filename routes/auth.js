// routes/auth.js (or wherever you put it)
const User = require('../models/User');

router.post('/register', async (req, res) => {
  const { username, password, displayName, email } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    // Check if username already exists
    let user = await User.findOne({ 
      $or: [{ username }, { email }] // optional: also block duplicate email
    });

    if (user) {
      return res.status(400).json({ 
        message: user.username === username 
          ? 'Username already exists' 
          : 'Email already registered' 
      });
    }

    // Create local user
    user = new User({
      provider: 'local',
      username: username.trim().toLowerCase(), // normalize
      password, // hashed by pre-save hook
      email: email?.trim().toLowerCase(),
      displayName: displayName || username,
    });

    await user.save();

    // Auto-login with Passport session
    req.login(user, (err) => {
      if (err) {
        console.error('Login after register failed:', err);
        return res.status(500).json({ message: 'Registration succeeded but login failed' });
      }

      // Return safe user data (never send password)
      const safeUser = {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        photo: user.photo,
        provider: user.provider
      };

      res.status(201).json({ 
        message: 'Registration successful', 
        user: safeUser 
      });
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

router.post('/login', passport.authenticate('local', { 
  failureMessage: true 
}), (req, res) => {
  const safeUser = {
    id: req.user.id,
    username: req.user.username,
    displayName: req.user.displayName,
    email: req.user.email,
    provider: req.user.provider
  };
  res.json({ message: 'Login successful', user: safeUser });
});

// routes/auth.js

// Logout route
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
      // Clear the session cookie
      res.clearCookie('connect.sid'); // Default cookie name for express-session
      // Redirect to home or send JSON response
      res.redirect('/'); // For HTML pages
      // OR if it's an API call:
      // res.json({ message: 'Logged out successfully' });
    });
  });
});