import {
  ApplicationCommandType,
  ApplicationCommandOptionType,
  InteractionContextType,
  PermissionFlagsBits,
  PermissionsBitField,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
  RESTPostAPIContextMenuApplicationCommandsJSONBody,
  ChannelType,
} from "discord.js";

import { Args } from "./index.js";
import { Language } from "../models/enum-helpers/index.js";
import { Lang } from "../services/index.js";

export const ChatCommandMetadata: {
  [command: string]: RESTPostAPIChatInputApplicationCommandsJSONBody;
} = {
  PING: {
    type: ApplicationCommandType.ChatInput,
    name: "ping",
    name_localizations: Lang.getRefLocalizationMap("chatCommands.dev"),
    description: "Check the bot's ping and latency",
    contexts: [InteractionContextType.Guild, InteractionContextType.BotDM],
    default_member_permissions: undefined,
  },
  VERIFICATION: {
    type: ApplicationCommandType.ChatInput,
    name: "verification",
    description: "Manage university verification system",
    dm_permission: false,
    default_member_permissions: PermissionsBitField.resolve([
      PermissionFlagsBits.ManageRoles,
    ]).toString(),
    options: [
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: "setup",
        description: "Set up verification system for this server",
        options: [
          {
            type: ApplicationCommandOptionType.Channel,
            name: "verification_channel",
            description: "Channel where verification requests will be sent",
            required: true,
            channel_types: [ChannelType.GuildText],
          },
          {
            type: ApplicationCommandOptionType.Role,
            name: "verified_role",
            description: "Role to give to verified users",
            required: true,
          },
          {
            type: ApplicationCommandOptionType.Role,
            name: "admin_role",
            description: "Role that can approve/reject verifications",
            required: true,
          },
        ],
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: "stats",
        description: "Show verification statistics",
      },
      {
        type: ApplicationCommandOptionType.Subcommand,
        name: "clear",
        description: "Clear all pending verifications",
      },
    ],
  },

  DEV: {
    type: ApplicationCommandType.ChatInput,
    name: Lang.getRef("chatCommands.dev", Language.Default),
    name_localizations: Lang.getRefLocalizationMap("chatCommands.dev"),
    description: Lang.getRef("commandDescs.dev", Language.Default),
    description_localizations: Lang.getRefLocalizationMap("commandDescs.dev"),
    dm_permission: true,
    default_member_permissions: PermissionsBitField.resolve([
      PermissionFlagsBits.Administrator,
    ]).toString(),
    options: [
      {
        ...Args.DEV_COMMAND,
        required: true,
      },
    ],
  },
  HELP: {
    type: ApplicationCommandType.ChatInput,
    name: Lang.getRef("chatCommands.help", Language.Default),
    name_localizations: Lang.getRefLocalizationMap("chatCommands.help"),
    description: Lang.getRef("commandDescs.help", Language.Default),
    description_localizations: Lang.getRefLocalizationMap("commandDescs.help"),
    dm_permission: true,
    default_member_permissions: undefined,
    options: [
      {
        ...Args.HELP_OPTION,
        required: true,
      },
    ],
  },
  INFO: {
    type: ApplicationCommandType.ChatInput,
    name: Lang.getRef("chatCommands.info", Language.Default),
    name_localizations: Lang.getRefLocalizationMap("chatCommands.info"),
    description: Lang.getRef("commandDescs.info", Language.Default),
    description_localizations: Lang.getRefLocalizationMap("commandDescs.info"),
    dm_permission: true,
    default_member_permissions: undefined,
    options: [
      {
        ...Args.INFO_OPTION,
        required: true,
      },
    ],
  },
  TEST: {
    type: ApplicationCommandType.ChatInput,
    name: Lang.getRef("chatCommands.test", Language.Default),
    name_localizations: Lang.getRefLocalizationMap("chatCommands.test"),
    description: Lang.getRef("commandDescs.test", Language.Default),
    description_localizations: Lang.getRefLocalizationMap("commandDescs.test"),
    dm_permission: true,
    default_member_permissions: undefined,
  },
};

export const MessageCommandMetadata: {
  [command: string]: RESTPostAPIContextMenuApplicationCommandsJSONBody;
} = {
  VIEW_DATE_SENT: {
    type: ApplicationCommandType.Message,
    name: Lang.getRef("messageCommands.viewDateSent", Language.Default),
    name_localizations: Lang.getRefLocalizationMap(
      "messageCommands.viewDateSent",
    ),
    default_member_permissions: undefined,
    dm_permission: true,
  },
};

export const UserCommandMetadata: {
  [command: string]: RESTPostAPIContextMenuApplicationCommandsJSONBody;
} = {
  VIEW_DATE_JOINED: {
    type: ApplicationCommandType.User,
    name: Lang.getRef("userCommands.viewDateJoined", Language.Default),
    name_localizations: Lang.getRefLocalizationMap(
      "userCommands.viewDateJoined",
    ),
    default_member_permissions: undefined,
    dm_permission: true,
  },
};
