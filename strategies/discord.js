// strategies/discord.js
const DiscordStrategy = require('passport-discord').Strategy;

module.exports = function(findOrCreateUser) {
  return new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: '/auth/discord/callback',
    scope: ['identify', 'email']
  }, (accessToken, refreshToken, profile, done) => {
    const user = findOrCreateUser(profile, 'discord');
    return done(null, user);
  });
};