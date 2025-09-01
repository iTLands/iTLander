import {
  CommandInteractionOptionResolver,
  Guild,
  PartialDMChannel,
  User,
  Channel,
} from "discord.js";
import { EventData } from "../models";
import { Language } from "../models/enum-helpers";

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
    let user = options.user;
    // Event language
    let lang =
      options.guild?.preferredLocale &&
      Language.Enabled.includes(options.guild?.preferredLocale)
        ? options.guild?.preferredLocale
        : Language.Default;

    // Guild language
    let langGuild =
      options.guild?.preferredLocale &&
      Language.Enabled.includes(options.guild?.preferredLocale)
        ? options.guild?.preferredLocale
        : Language.Default;

    return new EventData(
      user ?? ({ displayName: "Unknown" } as User),
      lang,
      langGuild,
    );
  }
}
