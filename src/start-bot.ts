import { CustomClient } from "./extensions/custom-client";
import { Config } from "./config";
import { GatewayIntentBits, REST } from "discord.js";
import { Bot } from "./models";
import { Command } from "./commands";
import {
  CommandRegistrationService,
  EventDataService,
  Logger,
} from "./services";
import { DatabaseFactory } from "./services/database/factory-db";
import { PingCommand } from "./commands/chat";
import { ChatCommandMetadata } from "./commands";
import { CommandHandler } from "./events";

async function start(): Promise<void> {
  let eventDataService = new EventDataService();
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

  let commands: Command[] = [new PingCommand()];

  // Events
  const commandHandler = new CommandHandler(commands, eventDataService);

  const bot = new Bot(
    Config.discord.token!,
    client,
    Config.discord.guildId!,
    commandHandler,
  );

  // Register
  if (process.argv[2] == "commands") {
    try {
      let rest = new REST({ version: "10" }).setToken(Config.discord.token!);
      let commandRegistrationService = new CommandRegistrationService(rest);

      let localCmds = [
        ...Object.values(ChatCommandMetadata).sort((a, b) =>
          a.name > b.name ? 1 : -1,
        ),
      ];

      await commandRegistrationService.process(localCmds, process.argv);
    } catch (error) {
      Logger.error("Error while trying regist commands", error);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    process.exit();
  }

  if (Config.database.enabled) {
    const db = DatabaseFactory.type(Config.database.type);
    db.init();
  }
  await bot.start();
}

process.on("unhandledRejection", (reason, _promise) => {
  Logger.error("Unhandled rejection at:", reason);
});

start().catch((error) => {
  Logger.error("Failed to start bot:", error);
  process.exit(1);
});
