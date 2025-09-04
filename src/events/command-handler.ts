import { RateLimiter } from "discord.js-rate-limiter";
import { Config } from "../config";
import { EventHandler } from "./event-handler";
import { EventDataService, Lang, Logger } from "../services";
import { Command } from "../commands";
import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  CommandInteraction,
  NewsChannel,
  TextChannel,
  ThreadChannel,
} from "discord.js";
import { CommandUtils, InteractionUtils } from "../utils";
import path from "path";
import fs from "fs";
import { DiscordLimits, ROOT_DIR } from "../constants";
import { CommandDeferType } from "../commands/command";
import { EventData } from "../models";

const logsPath = path.join(ROOT_DIR, "lang", "logs.json");
const Logs = JSON.parse(fs.readFileSync(logsPath, "utf-8"));

export class CommandHandler implements EventHandler {
  private rateLimiter = new RateLimiter(
    Config.rateLimiting.commands.amount,
    Config.rateLimiting.commands.interval * 1000,
  );

  constructor(
    public commands: Command[],
    private eventDataService: EventDataService,
  ) {}

  public async process(
    intr: CommandInteraction | AutocompleteInteraction,
  ): Promise<void> {
    if (intr.user.id === intr.client.user?.id || intr.user.bot) return;

    let commandParts =
      intr instanceof ChatInputCommandInteraction ||
      intr instanceof AutocompleteInteraction
        ? ([
            intr.commandName,
            intr.options.getSubcommandGroup(false),
            intr.options.getSubcommand(false),
          ].filter(Boolean) as string[])
        : [intr.commandName];

    let commandName = commandParts.join(" ");

    let command = CommandUtils.findCommand(this.commands, commandParts);
    if (!command) {
      Logger.error(
        Logs.error.commandNotFound
          .replaceAll("{INTERACTION_ID}", intr.id)
          .replaceAll("{COMMAND_NAME}", commandName),
      );

      return;
    }

    if (intr instanceof AutocompleteInteraction) {
      if (!command.autocomplete) {
        Logger.error(
          Logs.error.autocompleteNotFound
            .replaceAll("{INTERACTION_ID}", intr.id)
            .replaceAll("{COMMAND_NAME}", commandName),
        );
        return;
      }

      try {
        let option = intr.options.getFocused(true);
        let choices = await command.autocomplete(intr, option);
        await InteractionUtils.respond(
          intr,
          choices?.slice(0, DiscordLimits.CHOICES_PER_AUTOCOMPLETE),
        );
      } catch (error) {
        Logger.error(
          intr.channel instanceof TextChannel ||
            intr.channel instanceof NewsChannel ||
            intr.channel instanceof ThreadChannel
            ? Logs.error.autocompleteGuild
                .replaceAll("{INTERACTION_ID}", intr.id)
                .replaceAll("{OPTION_NAME}", commandName)
                .replaceAll("{COMMAND_NAME}", commandName)
                .replaceAll("{USER_TAG}", intr.user.tag)
                .replaceAll("{USER_ID}", intr.user.id)
                .replaceAll("{CHANNEL_NAME}", intr.channel.name)
                .replaceAll("{CHANNEL_ID}", intr.channel.id)
                .replaceAll("{GUILD_NAME}", intr.guild?.name)
                .replaceAll("{GUILD_ID}", intr.guild?.id)
            : Logs.error.autocompleteOther
                .replaceAll("{INTERACTION_ID}", intr.id)
                .replaceAll("{OPTION_NAME}", commandName)
                .replaceAll("{COMMAND_NAME}", commandName)
                .replaceAll("{USER_TAG}", intr.user.tag)
                .replaceAll("{USER_ID}", intr.user.id),
          error,
        );
      }
      return;
    }

    let limited = this.rateLimiter.take(intr.user.id);
    if (limited) {
      return;
    }

    switch (command.deferType) {
      case CommandDeferType.PUBLIC:
        await InteractionUtils.deferReply(intr, false);
        break;
      case CommandDeferType.HIDDEN:
        await InteractionUtils.deferReply(intr, true);
        break;
    }

    if (command.deferType !== CommandDeferType.NONE && !intr.deferred) {
      return;
    }

    let data = await this.eventDataService.create({
      user: intr.user,
      channel: intr.channel ?? undefined,
      guild: intr?.guild ?? undefined,
      args:
        intr instanceof ChatInputCommandInteraction ? intr.options : undefined,
    });

    try {
      let passesCheck = await CommandUtils.runChecks(command, intr, data);
      if (passesCheck) {
        await command.execute(intr, data);
      }
    } catch (error) {
      await this.sendError(intr, data);

      Logger.error(
        intr.channel instanceof TextChannel ||
          intr.channel instanceof NewsChannel ||
          intr.channel instanceof ThreadChannel
          ? Logs.error.commandGuild
              .replaceAll("{INTERACTION_ID}", intr.id)
              .replaceAll("{COMMAND_NAME}", commandName)
              .replaceAll("{USER_TAG}", intr.user.tag)
              .replaceAll("{USER_ID}", intr.user.id)
              .replaceAll("{CHANNEL_NAME}", intr.channel.name)
              .replaceAll("{CHANNEL_ID}", intr.channel.id)
              .replaceAll("{GUILD_NAME}", intr.guild?.name)
              .replaceAll("{GUILD_ID}", intr.guild?.id)
          : Logs.error.commandOther
              .replaceAll("{INTERACTION_ID}", intr.id)
              .replaceAll("{COMMAND_NAME}", commandName)
              .replaceAll("{USER_TAG}", intr.user.tag)
              .replaceAll("{USER_ID}", intr.user.id),
        error,
      );
    }
  }

  private async sendError(
    intr: CommandInteraction,
    data: EventData,
  ): Promise<void> {
    try {
      await InteractionUtils.send(
        intr,
        Lang.getEmbed("errorEmbeds.command", data.lang, {
          ERROR_CODE: intr.id,
          GUILD_ID: intr.guild?.id ?? Lang.getRef("other.na", data.lang),
          SHARD_ID: (intr.guild?.shardId ?? 0).toString(),
        }),
      );
    } catch (error) {}
  }
}
