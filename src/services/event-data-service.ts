import {
  Channel,
  CommandInteractionOptionResolver,
  Guild,
  Locale,
  PartialDMChannel,
  User,
} from "discord.js";

import { EventData } from "../models/internal-models.js";
import { Language } from "../models/enum-helpers/language.js";

export class EventDataService {
  public async create(
    options: {
      user?: User;
      channel?: Channel | PartialDMChannel;
      guild?: Guild;
      args?: Omit<
        CommandInteractionOptionResolver,
        "getMessage" | "getFocused"
      >;
    } = {},
  ): Promise<EventData> {
    const lang =
      options.guild?.preferredLocale &&
      Language.Enabled.includes(options.guild.preferredLocale)
        ? options.guild.preferredLocale
        : Language.Default;
    const langGuild =
      options.guild?.preferredLocale &&
      Language.Enabled.includes(options.guild.preferredLocale)
        ? options.guild.preferredLocale
        : Language.Default;

    return new EventData(
      lang,
      langGuild,
      options.user?.id,
      options.guild?.id,
      options.channel?.id,
    );
  }
}
