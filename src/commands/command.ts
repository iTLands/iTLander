import {
  ApplicationCommandOptionChoiceData,
  AutocompleteFocusedOption,
  AutocompleteInteraction,
  CommandInteraction,
  PermissionsString,
} from "discord.js";
import { RateLimiter } from "discord.js-rate-limiter";
import { EventData } from "../models/internal-models.js";

export interface Command {
  names: string[];
  cooldown?: RateLimiter;
  deferType: CommandDeferType;
  requiredClientPerms: PermissionsString[];

  autocomplete?(
    intr: AutocompleteInteraction,
    option: AutocompleteFocusedOption,
  ): Promise<ApplicationCommandOptionChoiceData[]>;
}

export enum CommandDeferType {
  PUBLIC = "PUBLIC", // Everyone can see the "Bot is thinking..."
  HIDDEN = "HIDDEN", // Only user can see the "Bot is thinking..."
  NONE = "NONE", // No deferral
}
