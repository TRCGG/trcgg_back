require('dotenv').config();

/**
 * discord oauth2 설정
 */
module.exports = {
  clientId: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  redirectUri: process.env.DISCORD_REDIRECT_URI,
  apiBaseUrl: 'https://discord.com/api',
  scopes: ['identify', 'guilds'],
};