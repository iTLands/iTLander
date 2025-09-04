import { Message } from "discord.js";
import { RateLimiter } from "discord.js-rate-limiter";

import { EventDataService } from "../services/index";
import { Trigger } from "../triggers/index";
import { Config } from "../config/index";

export class TriggerHandler {
  private rateLimiter = new RateLimiter(
    Config.rateLimiting.triggers.amount,
    Config.rateLimiting.triggers.interval * 1000,
  );

  constructor(
    private triggers: Trigger[],
    private eventDataService: EventDataService,
  ) {}

  public async process(msg: Message): Promise<void> {
    // Check if user is rate limited
    let limited = this.rateLimiter.take(msg.author.id);
    if (limited) {
      return;
    }

    // Find triggers caused by this message
    let triggers = this.triggers.filter((trigger) => {
      if (trigger.requireGuild && !msg.guild) {
        return false;
      }

      if (!trigger.triggered(msg)) {
        return false;
      }

      return true;
    });

    // If this message causes no triggers then return
    if (triggers.length === 0) {
      return;
    }

    // Get data from database
    let data = await this.eventDataService.create({
      user: msg.author,
      channel: msg.channel,
      guild: msg.guild ?? undefined,
    });

    // Execute triggers
    for (let trigger of triggers) {
      await trigger.execute(msg, data);
    }
  }
}
