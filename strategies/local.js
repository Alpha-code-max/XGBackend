// strategies/local.js
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // adjust path

module.exports = function (passport) {
  passport.use(
    'local',
    new LocalStrategy(
      {
        usernameField: 'username',    // or 'email' if you prefer
        passwordField: 'password',
      },
      async (username, password, done) => {
        try {
          const user = await User.findOne({ username: username.toLowerCase() });

          if (!user) {
            return done(null, false, { message: 'Incorrect username' });
          }

          // Compare password (assuming it's hashed in the model)
          const isMatch = await bcrypt.compare(password, user.password);

          if (!isMatch) {
            return done(null, false, { message: 'Incorrect password' });
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
};