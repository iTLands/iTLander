import {
  Channel,
  CommandInteractionOptionResolver,
  Guild,
  Locale,
  PartialDMChannel,
  User,
} from "discord.js";

import { EventData } from "../models/internal-models.js";

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
    const lang = options.guild?.preferredLocale ?? Locale.SpanishLATAM;
    const langGuild = options.guild?.preferredLocale ?? Locale.SpanishLATAM;

    return new EventData(
      lang,
      langGuild,
      options.user?.id,
      options.guild?.id,
      options.channel?.id,
    );
  }
}
