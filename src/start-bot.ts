import { CustomClient } from "./extensions/custom-client";
import { Config } from "./config";
import { GatewayIntentBits } from "discord.js";
import { Bot } from "./models/bot";
import { Logger } from "./services";
import { DatabaseFactory } from "./services/database/factory-db";

async function start(): Promise<void> {
  const client = new CustomClient({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.DirectMessageReactions,
    ],
    enforceNonce: true,
  });

  const bot = new Bot(Config.discord.token!, client, Config.discord.guildId!);
  await bot.start();

  if (Config.database.enabled) {
    const db = DatabaseFactory.type(Config.database.type || "json");
    db.init();
  }
}

process.on("unhandledRejection", (reason, _promise) => {
  Logger.error("Unhandled rejection at:", reason);
});

start().catch((error) => {
  Logger.error("Failed to start bot:", error);
  process.exit(1);
});
