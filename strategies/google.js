// strategies/google.js
const GoogleStrategy = require('passport-google-oauth20').Strategy;

module.exports = function (passport) {
  passport.use(
    'google', // ← explicit name (optional but good practice)
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.NODE_ENV === 'production'
            ? 'https://xgbackend.onrender.com/auth/google/callback'
            : '/auth/google/callback',
        proxy: true,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Your findOrCreate logic (demo version)
          let user = users.find(u => u.provider === 'google' && u.providerId === profile.id);
          if (!user) {
            user = {
              id: users.length + 1,
              provider: 'google',
              providerId: profile.id,
              displayName: profile.displayName,
              email: profile.emails?.[0]?.value,
              photo: profile.photos?.[0]?.value,
            };
            users.push(user);
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
};