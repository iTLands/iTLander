import { REST } from "@discordjs/rest";
import { Options, Partials } from "discord.js";
import { createRequire } from "node:module";
import "reflect-metadata";

import { CustomClient } from "./extensions/custom-client.js";
import { Bot } from "./models/bot.js";
import { Command } from "./commands/command.js";

// Import your commands
import { PingCommand, VerificationCommand } from "./commands/chat/index.js";
// Import more commands here...

// Import handlers
import { CommandHandler } from "./events/command-handler.js";

// Import services
import { EventDataService } from "./services/event-data-service.js";
import { Logger } from "./services/logger.js";
import { CommandRegistrationService } from "./services/command-registration-service.js";
import {
  ChatCommandMetadata,
  MessageCommandMetadata,
  UserCommandMetadata,
} from "./commands/metadata.js";
import { VerificationService } from "./services/verification-service.js";
import {
  VerificationApproveButton,
  VerificationRejectButton,
} from "./buttons/verification-buttons.js";
import { Button } from "./buttons/index.js";
import { VerificationMemberJoinHandler } from "./events/verification-member-join-handler.js";
import { ButtonHandler } from "./events/button-handler.js";
import { MessageHandler } from "./events/message-handler.js";
import { TriggerHandler } from "./events/trigger-handler.js";
import { Trigger } from "./triggers/trigger.js";

// Import jobs

const require = createRequire(import.meta.url);
let Config = require("../config/config.json");
let Logs = require("../lang/logs.json");

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
  const verificationService = new VerificationService();

  // Commands
  const commands: Command[] = [
    new PingCommand(),
    new VerificationCommand(verificationService),
    // Add more commands here...
  ];

  // Buttons
  let buttons: Button[] = [
    new VerificationApproveButton(verificationService),
    new VerificationRejectButton(verificationService),
  ];

  // Triggers
  let triggers: Trigger[] = [];

  // Jobs

  // Event handlers
  const verificationMemberJoinHandler = new VerificationMemberJoinHandler(
    verificationService,
  );
  const commandHandler = new CommandHandler(commands, eventDataService);
  const buttonHandler = new ButtonHandler(buttons, eventDataService);
  const verificationMessageHandler = new VerificationMemberJoinHandler(
    verificationService,
  );
  const triggerHandler = new TriggerHandler(triggers, eventDataService);
  const messageHandler = new MessageHandler(triggerHandler);

  // Create and start bot
  const bot = new Bot(Config.client.token, client, commandHandler);

  // Register
  if (process.argv[2] == "commands") {
    try {
      let rest = new REST({ version: "10" }).setToken(Config.client.token);
      let commandRegistrationService = new CommandRegistrationService(rest);
      let localCmds = [
        ...Object.values(ChatCommandMetadata).sort((a, b) =>
          a.name > b.name ? 1 : -1,
        ),
        ...Object.values(MessageCommandMetadata).sort((a, b) =>
          a.name > b.name ? 1 : -1,
        ),
        ...Object.values(UserCommandMetadata).sort((a, b) =>
          a.name > b.name ? 1 : -1,
        ),
      ];

      // let localCmds = CommandUtils.extractAllCommandMetadata(commands);

      await commandRegistrationService.process(localCmds, process.argv);
    } catch (error) {
      Logger.error(Logs.error.commandAction, error);
    }
    // Wait for any final logs to be written.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    process.exit();
  }
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
