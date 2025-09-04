import {
  ChatInputCommandInteraction,
  Colors,
  EmbedBuilder,
  PermissionsString,
} from "discord.js";
import { Command, CommandDeferType } from "../command";
import { EventData } from "../../models";
import { InteractionUtils } from "../../utils";

export class PingCommand implements Command {
  public names = ["ping"];
  public deferType: CommandDeferType = CommandDeferType.HIDDEN;
  public requireClientPerms: PermissionsString[] = [];

  public async execute(
    intr: ChatInputCommandInteraction,
    data: EventData,
  ): Promise<void> {
    const start = Date.now();

    await new Promise((resolve) => setTimeout(resolve, 1));
    const roundTripLatency = Date.now() - start;
    const wsLatency = intr.client.ws.ping;

    const rttIndicator = this.getRttStatus(roundTripLatency);
    const wsIndicator = this.getWsStatus(wsLatency);

    const embedColor = this.getEmbedColor(roundTripLatency, wsLatency);

    const embed = new EmbedBuilder()
      .setTitle("🏓 Pong!")
      .setColor(embedColor)
      .setDescription("Latency and connection metrics")
      .addFields([
        {
          name: "Connection Metrics",
          value: [
            `${rttIndicator.emoji} **Round Trip:** \`${roundTripLatency}ms\` *(${rttIndicator.status})*`,
            `${wsIndicator.emoji} **WebSocket:** \`${wsLatency}ms\` *(${wsIndicator.status})*`,
            `📊 **Uptime:** \`${this.formatUptime(process.uptime())}\``,
          ].join("\n"),
          inline: false,
        },
        {
          name: "Performance Rating",
          value: this.getOverallRating(roundTripLatency, wsLatency),
          inline: false,
        },
        {
          name: "🌐 Server Region",
          value: "`Auto-Selected`",
          inline: true,
        },
      ])
      .setFooter({
        text: `Requested by ${intr.user.displayName}`,
        iconURL: intr.user.displayAvatarURL({ size: 32 }),
      })
      .setTimestamp();

    await InteractionUtils.editReply(intr, embed);
  }

  private getRttStatus(latency: number): { emoji: string; status: string } {
    if (latency < 50) return { emoji: "🟢", status: "Excellent" };
    if (latency < 100) return { emoji: "🟡", status: "Good" };
    if (latency < 200) return { emoji: "🟠", status: "Fair" };
    if (latency < 500) return { emoji: "🔴", status: "Poor" };
    return { emoji: "⚫", status: "Critical" };
  }

  private getWsStatus(ping: number): { emoji: string; status: string } {
    if (ping < 0) return { emoji: "⚫", status: "Unknown" };
    if (ping < 50) return { emoji: "🟢", status: "Excellent" };
    if (ping < 100) return { emoji: "🟡", status: "Good" };
    if (ping < 200) return { emoji: "🟠", status: "Fair" };
    if (ping < 500) return { emoji: "🔴", status: "Poor" };
    return { emoji: "⚫", status: "Critical" };
  }

  private getEmbedColor(rtt: number, ws: number): number {
    const maxLatency = Math.max(rtt, ws);
    if (maxLatency < 50) return Colors.Green;
    if (maxLatency < 100) return Colors.Yellow;
    if (maxLatency < 200) return Colors.Orange;
    if (maxLatency < 500) return Colors.Red;
    return Colors.DarkRed;
  }

  private getOverallRating(rtt: number, ws: number): string {
    const avgLatency = (rtt + ws) / 2;
    if (avgLatency < 50) return "🚀 **Blazing Fast**";
    if (avgLatency < 100) return "⚡ **Fast**";
    if (avgLatency < 200) return "✅ **Normal**";
    if (avgLatency < 500) return "⚠️ **Slow**";
    return "❌ **Critical**";
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  }
}
