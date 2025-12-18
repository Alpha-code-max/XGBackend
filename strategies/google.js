// strategies/google.js
const GoogleStrategy = require('passport-google-oauth20').Strategy;

module.exports = function(findOrCreateUser) {
  // Determine callback URL based on environment
  // In production (Render), use absolute HTTPS URL
  // In development (localhost), keep relative so it works on http
  const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER;
  
  const callbackURL = isProduction
    ? 'https://xgbackend.onrender.com/auth/google/callback'
    : '/auth/google/callback';

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_SECRET_ID) {
    throw new Error('Missing GOOGLE_CLIENT_ID or GOOGLE_SECRET_ID in environment variables');
  }

  return new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET_ID,
    callbackURL: callbackURL,
    // Optional: helps with proxy/protocol issues on hosting platforms
    proxy: true
  }, (accessToken, refreshToken, profile, done) => {
    const user = findOrCreateUser(profile, 'google');
    return done(null, user);
  });
};