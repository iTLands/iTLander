import { ChatInputCommandInteraction, PermissionsString } from "discord.js";
import { RateLimiter } from "discord.js-rate-limiter";
import { Command, CommandDeferType } from "../index.js";
import { EventData } from "../../models/internal-models.js";
import { InteractionUtils } from "../../utils/index.js";

export class PingCommand implements Command {
  public names = ["ping"];
  public cooldown = new RateLimiter(1, 5000);
  public deferType = CommandDeferType.HIDDEN;
  public requireClientPerms: PermissionsString[] = [];

  public async execute(
    intr: ChatInputCommandInteraction,
    data: EventData,
  ): Promise<void> {
    const startTime = Date.now();

    await InteractionUtils.send(intr, "🏓 Calculating ping...");

    const endTime = Date.now();
    const botLatency = endTime - startTime;
    const apiLatency = Math.round(intr.client.ws.ping);

    await InteractionUtils.send(intr, {
      embeds: [
        {
          title: "🏓 Pong!",
          fields: [
            {
              name: "Bot Latency",
              value: `${botLatency}ms`,
              inline: true,
            },
            {
              name: "API Latency",
              value: `${apiLatency}ms`,
              inline: true,
            },
          ],
          color: 0x00ff00,
          timestamp: new Date().toISOString(),
        },
      ],
    });
  }
}
