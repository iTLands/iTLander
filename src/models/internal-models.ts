import { Locale, User } from "discord.js";

export class EventData {
  //INFO: you can add any data you want to store
  // information needed for commands/events

  constructor(
    //INFO: User data
    public user: User,

    //INFO: Event language
    public lang: Locale,

    //INFO: Guild language
    public langGuild: Locale,
  ) {}
}
