/**
 * Bot Configuration
 *
 * Centralizes all configuration options for the bot.
 * Values are loaded from environment variables with sensible defaults.
 */

import dotenv from "dotenv";
dotenv.configDotenv();

export const Config = {
  // Environment
  environment: process.env.NODE_ENV,
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",

  // Discord bot
  discord: {
    token: process.env.DISCORD_BOT_TOKEN,
    applicationId: process.env.DISCORD_BOT_APPLICATION_ID,
    guildId: process.env.GUILD_ID,
    inviteUrl: process.env.DISCORD_INVITE_URL || null,
  },

  database: {
    enabled: process.env.DATABASE_ENABLED === "true",
    type: process.env.DATABASE_TYPE || "json",
    jsonPath: process.env.JSON_DB_PATH || "./data",
  },

  logging: {
    pretty: true,
  },
};
