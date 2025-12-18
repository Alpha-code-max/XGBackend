// strategies/local.js
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

module.exports = new LocalStrategy(
  {
    usernameField: 'username',
    passwordField: 'password',
  },
  async (username, password, done) => {
    try {
      // Find user by username (only local users have username)
      const user = await User.findOne({ username });

      if (!user) {
        return done(null, false, { message: 'Incorrect username' });
      }

      if (user.provider !== 'local') {
        return done(null, false, { message: 'This account uses social login' });
      }

      // Compare password
      const isMatch = await user.comparePassword(password);

      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password' });
      }

      // Success
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
);