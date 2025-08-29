import {
  AutocompleteInteraction,
  ButtonInteraction,
  Client,
  CommandInteraction,
  Events,
  Guild,
  GuildMember,
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

import {
  ButtonHandler,
  CommandHandler,
  MessageHandler,
  VerificationMemberJoinHandler,
} from "../events/index.js";
import { Logger } from "../services/index.js";
import { PartialUtils } from "../utils/partial-utils.js";

const require = createRequire(import.meta.url);
let Config = require("../../config/config.json");

export class Bot {
  private ready = false;

  constructor(
    private token: string,
    private client: Client,
    private commandHandler: CommandHandler,
    private buttonHandler?: ButtonHandler,
    private messageHandler?: MessageHandler,
    private verificationMemberJoinHandler?: VerificationMemberJoinHandler,
  ) {}

  public async start(): Promise<void> {
    this.registerListeners();
    await this.login(this.token);
  }

  private registerListeners(): void {
    this.client.once(Events.ClientReady, () => this.onReady());
    this.client.on(Events.MessageCreate, (msg: Message) => this.onMessage(msg));
    this.client.on(Events.InteractionCreate, (intr: Interaction) =>
      this.onInteraction(intr),
    );
    if (this.verificationMemberJoinHandler) {
      this.client.on(Events.GuildMemberAdd, (member: GuildMember) =>
        this.onGuildMemberAdd(member),
      );
    }
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

  private async onMessage(msg: Message): Promise<void> {
    try {
      msg = await PartialUtils.fillMessage(msg);
      if (!msg) {
        return;
      }

      await this.messageHandler.process(msg);
    } catch (error) {
      Logger.error("Something went wrong with message handler", error);
    }
  }

  private async onGuildMemberAdd(member: GuildMember): Promise<void> {
    if (this.verificationMemberJoinHandler) {
      await this.verificationMemberJoinHandler.process(member);
    }
  }

  // Add this new method to handle interactions
  private async onInteraction(intr: Interaction): Promise<void> {
    if (intr.isCommand() || intr.isAutocomplete()) {
      await this.commandHandler.process(intr);
    } else if (intr.isButton()) {
      await this.buttonHandler?.process(intr);
    }
  }
}
