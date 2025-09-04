import {
  ActivityType,
  AutocompleteInteraction,
  Client,
  CommandInteraction,
  Events,
  Guild,
  GuildMember,
  Interaction,
  Message,
} from "discord.js";
import { Logger } from "../services/index";
import path from "path";
import fs from "fs";
import { ROOT_DIR } from "../constants";
import { CustomClient } from "../extensions/custom-client";
import {
  CommandHandler,
  MessageHandler,
  VerificationMemberJoinHandler,
} from "../events";

const logsPath = path.join(ROOT_DIR, "lang", "logs.json");
const Logs = JSON.parse(fs.readFileSync(logsPath, "utf-8"));

export class Bot {
  private isReady: boolean = false;

  constructor(
    private token: string,
    private client: CustomClient,
    private guildId: string,
    private commandHandler: CommandHandler,
    private verificationMemberJoinHandler: VerificationMemberJoinHandler,
    private messageHandler: MessageHandler,
  ) {}

  public async start(): Promise<void> {
    this.registerListener();
    await this.login(this.token);
  }

  private registerListener(): void {
    this.client.once(Events.ClientReady, () => this.onReady());
    this.client.on(Events.MessageCreate, (msg: Message) => this.onMessage(msg));
    // this.client.on(Events.InteractionCreate, (intr: Interaction) => {
    //   this.onInteraction(intr);
    // });
    this.client.on(Events.GuildMemberAdd, (member: GuildMember) =>
      this.onGuildMemberAdd(member),
    );
  }

  private async login(token: string): Promise<void> {
    try {
      await this.client.login(token);
    } catch (error) {
      Logger.error(Logs.error.clientLogin, error);
    }
  }

  private async onGuildMemberAdd(member: GuildMember): Promise<void> {
    if (!this.isReady) return;
    try {
      await this.verificationMemberJoinHandler.process(member);
    } catch (error) {}
  }

  private async onInteraction(intr: Interaction): Promise<void> {
    if (!this.isReady) {
      return;
    }

    if (
      intr instanceof CommandInteraction ||
      intr instanceof AutocompleteInteraction
    ) {
      try {
        await this.commandHandler.process(intr);
      } catch (error) {
        Logger.error(Logs.error.command, error);
      }
    } else {
      try {
        //TODO: Add button interaction handler
      } catch (error) {
        Logger.error(Logs.error.button, error);
      }
    }
  }

  private async onMessage(msg: Message): Promise<void> {
    if (!this.isReady) return;
    try {
      //TODO: add partials
      await this.messageHandler.process(msg);
    } catch (error) {
      Logger.error(Logs.error.message, error);
    }
  }

  private onReady(): void {
    let userTag = this.client.user?.tag;
    let memberCount = this.client.guilds.cache.get(this.guildId)?.memberCount;

    Logger.info(Logs.info.clientLogin.replaceAll("{USER_TAG}", userTag));

    this.isReady = true;
    Logger.info(Logs.info.clientReady);

    this.client.setPresence(
      "ITLA",
      `Helping to connect ${memberCount} members`,
      ActivityType.Competing,
      "https://discord.gg/st69Y3NzA6",
    );
  }
}
