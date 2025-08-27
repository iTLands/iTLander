import { Options, Partials } from "discord.js";
import { createRequire } from "node:module";
import "reflect-metadata";

import { CustomClient } from "./extensions/custom-client.js";
import { Bot } from "./models/bot.js";
import { Command } from "./commands/command.js";

// Import your commands
import { PingCommand } from "./commands/chat/index.js";
// Import more commands here...

// Import handlers
import { CommandHandler } from "./events/command-handler.js";

// Import services
import { EventDataService } from "./services/event-data-service.js";
import { Logger } from "./services/logger.js";

// Import jobs

const require = createRequire(import.meta.url);
const Config = require("../config/config.json");

async function start(): Promise<void> {
  Logger.info("Starting bot...");

  // Create client
  const client = new CustomClient({
    intents: Config.client.intents,
    partials: Config.client.partials.map(
      (partial: string) => Partials[partial as keyof typeof Partials],
    ),
  });

  // Services
  const eventDataService = new EventDataService();

  // Commands
  const commands: Command[] = [
    new PingCommand(),
    // Add more commands here...
  ];

  // Jobs

  // Event handlers

  const commandHandler = new CommandHandler(commands, eventDataService);

  // Create and start bot
  const bot = new Bot(Config.client.token, client, commandHandler);

  await bot.start();
}

// Error handling
process.on("unhandledRejection", (reason, _promise) => {
  Logger.error("Unhandled rejection at:", reason);
});

start().catch((error) => {
  Logger.error("Failed to start bot:", error);
  process.exit(1);
});
