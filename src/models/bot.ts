import {
  AutocompleteInteraction,
  ButtonInteraction,
  Client,
  CommandInteraction,
  Events,
  Guild,
  Interaction,
  Message,
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  RateLimitData,
  RESTEvents,
  User,
} from "discord.js";
import { createRequire } from "node:module";

import { CommandHandler } from "../events/index.js";
import { Logger } from "../services/index.js";

const require = createRequire(import.meta.url);
let Config = require("../../config/config.json");

export class Bot {
  private ready = false;

  constructor(
    private token: string,
    private client: Client,
    private commandHandler: CommandHandler,
  ) {}

  public async start(): Promise<void> {
    this.registerListeners();
    await this.login(this.token);
  }

  private registerListeners(): void {
    this.client.on(Events.ClientReady, () => this.onReady());

    // Add this listener for handling slash commands
    this.client.on(Events.InteractionCreate, (intr: Interaction) =>
      this.onInteraction(intr),
    );
  }

  private async login(token: string): Promise<void> {
    try {
      await this.client.login(token);
    } catch (error) {
      Logger.error("Fail to login:", error);
      return;
    }
  }

  private async onReady(): Promise<void> {
    let userTag = this.client.user?.tag;
    Logger.info(`Bot Initialize as ${userTag}`);

    this.ready = true;
    Logger.info("Client Ready");
  }

  // Add this new method to handle interactions
  private async onInteraction(intr: Interaction): Promise<void> {
    if (intr.isCommand() || intr.isAutocomplete()) {
      await this.commandHandler.process(intr);
    }
  }
}
