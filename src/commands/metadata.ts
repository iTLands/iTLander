import {
  ApplicationCommandType,
  InteractionContextType,
  RESTPostAPIApplicationCommandsJSONBody,
} from "discord.js";
import { Lang } from "../services";

export const ChatCommandMetadata: {
  [command: string]: RESTPostAPIApplicationCommandsJSONBody;
} = {
  PING: {
    type: ApplicationCommandType.ChatInput,
    name: "ping",
    description: "Check the bot's ping and latency",
    contexts: [InteractionContextType.Guild, InteractionContextType.BotDM],
    default_member_permissions: undefined,
  },
};
