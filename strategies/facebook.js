// strategies/facebook.js
const FacebookStrategy = require('passport-facebook').Strategy;

module.exports = function(findOrCreateUser) {
  return new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: '/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'emails', 'photos']
  }, (accessToken, refreshToken, profile, done) => {
    const user = findOrCreateUser(profile, 'facebook');
    return done(null, user);
  });
};