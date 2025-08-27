import { Locale } from "discord.js";

export class EventData {
  constructor(
    public lang: Locale,
    public langGuild: Locale,
    public userId?: string,
    public guildId?: string,
    public channelId?: string,
  ) {}
}
