import { GuildMember, EmbedBuilder } from "discord.js";
import { EventHandler } from "./event-handler.js";
import { Logger, VerificationService } from "../services/index.js";
import { MessageUtils } from "../utils/index.js";

export class VerificationMemberJoinHandler implements EventHandler {
  constructor(private verificationService: VerificationService) {}

  public async process(member: GuildMember): Promise<void> {
    const config = this.verificationService.getGuildConfig(member.guild.id);
    if (!config || !config.enabled) return;

    const welcomeEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("Welcome to iTLand Server!")
      .setDescription(
        "To access the server, you need to verify your student status.",
      )
      .addFields(
        {
          name: "📋 Instructions:",
          value: `
                        1️⃣ Send me a photo of your student ID via **direct message**
                        2️⃣ Make sure your name and university are clearly visible
                        3️⃣ An administrator will review your submission
                        4️⃣ Once approved, you'll get full server access
                    `,
        },
        {
          name: "🔒 Privacy:",
          value:
            "Your information is only reviewed by administrators and deleted after verification.",
        },
      )
      .setFooter({
        text: "Send your student ID photo via DM to get started",
      })
      .setTimestamp();

    try {
      await MessageUtils.send(member.user, welcomeEmbed);
    } catch (error) {
      Logger.warn(
        `Could not send verification DM to ${member.user.tag}`,
        error,
      );
    }
  }
}
