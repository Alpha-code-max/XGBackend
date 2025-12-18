// strategies/local.js
const LocalStrategy = require('passport-local').Strategy;

module.exports = new LocalStrategy(
  { usernameField: 'username', passwordField: 'password' },
  (username, password, done) => {
    // In real app: query DB with hashed password check
    // Here we just reject local logins since we have no local users yet
    return done(null, false, { message: 'Use social login or implement registration' });
    // Example with mock:
    // const user = users.find(u => u.username === username && u.password === password);
    // if (user) return done(null, user);
    // return done(null, false);
  }
);