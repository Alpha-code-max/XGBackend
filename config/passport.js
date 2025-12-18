// config/passport.js
const passport = require('passport');
const LocalStrategy = require('./../strategies/local');
const GoogleStrategy = require('./../strategies/google');
const FacebookStrategy = require('./../strategies/facebook');
const DiscordStrategy = require('./../strategies/discord');

let users = []; // In production: replace with DB operations

// Helper to find or create user
function findOrCreateUser(profile, provider) {
  let user = users.find(u => u.provider === provider && u.providerId === profile.id);
  if (!user) {
    user = {
      id: users.length + 1,
      provider,
      providerId: profile.id,
      displayName: profile.displayName || profile.username || profile.name || 'User',
      email: profile.emails?.[0]?.value || null,
      photo: profile.photos?.[0]?.value || null
    };
    users.push(user);
  }
  return user;
}

// Serialize & Deserialize
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = users.find(u => u.id === id);
  done(null, user || false);
});

// Setup strategies
passport.use(LocalStrategy);
passport.use(GoogleStrategy(findOrCreateUser));
// passport.use(FacebookStrategy(findOrCreateUser));
passport.use(DiscordStrategy(findOrCreateUser));

module.exports = { passport, users }; // Export users only for testing/demo