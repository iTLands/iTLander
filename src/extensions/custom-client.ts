import { ActivityType, Client, ClientOptions, Presence } from "discord.js";

export class CustomClient extends Client {
  constructor(clientOptions: ClientOptions) {
    super(clientOptions);
  }

  public setPresence(
    name: string,
    state: string,
    type: Exclude<ActivityType, ActivityType.Custom>,
    url: string,
  ): Presence {
    return this.user!.setPresence({
      activities: [
        {
          name,
          state,
          type,
          url,
        },
      ],
    });
  }
}
