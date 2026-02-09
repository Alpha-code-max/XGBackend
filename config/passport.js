// config/passport.js
const passport = require('passport');
const LocalStrategy = require('../strategies/local')
const GoogleStrategy = require('../strategies/google');
const DiscordStrategy = require('../strategies/discord');
// const FacebookStrategy = require('../strategies/facebook');

// In-memory users (demo only – replace with DB in production)
let users = [];

function findOrCreateUser(profile, provider) {
  let user = users.find(u => u.provider === provider && u.providerId === profile.id);
  if (!user) {
    user = {
      id: users.length + 1,
      provider,
      providerId: profile.id,
      displayName: profile.displayName || profile.username || profile.name || 'User',
      email: profile.emails?.[0]?.value || null,
      photo: profile.photos?.[0]?.value || null,
    };
    users.push(user);
  }
  return user;
}

// Serialize / Deserialize
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = users.find(u => u.id === id);
  done(null, user || false);
});

// Register strategies – pass passport instance

LocalStrategy(passport)
GoogleStrategy(passport);     // ← pass passport
DiscordStrategy(passport);    // ← pass passport
// FacebookStrategy(passport); // uncomment when ready

module.exports = passport;