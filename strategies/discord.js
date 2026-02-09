// strategies/discord.js
const DiscordStrategy = require('passport-discord').Strategy;

module.exports = function (passport) {
  passport.use(
    new DiscordStrategy(
      {
        clientID: process.env.DISCORD_CLIENT_ID,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        callbackURL:
          process.env.NODE_ENV === 'production'
            ? 'https://xgbackend.onrender.com/auth/discord/callback'
            : '/auth/discord/callback',
        scope: ['identify', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Replace with real DB logic in production
          // For now using your findOrCreateUser pattern
          const user = findOrCreateUser(profile, 'discord');
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
};