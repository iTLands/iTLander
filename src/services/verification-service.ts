import {
  Guild,
  GuildMember,
  TextChannel,
  User,
  EmbedBuilder,
} from "discord.js";
import { EventData } from "@/models/internal-models.js";
import { Logger } from "./logger.js";
import {
  PendingVerification,
  VerificationConfig,
} from "@/models/verification-models.js";

export class VerificationService {
  private pendingVerifications = new Map<string, PendingVerification>();
  private guildConfigs = new Map<string, VerificationConfig>();

  public setPendingVerification(
    userId: string,
    verification: PendingVerification,
  ): void {
    this.pendingVerifications.set(userId, verification);
  }

  public getPendingVerification(
    userId: string,
  ): PendingVerification | undefined {
    return this.pendingVerifications.get(userId);
  }

  public removePendingVerification(userId: string): void {
    this.pendingVerifications.delete(userId);
  }

  public setGuildConfig(config: VerificationConfig): void {
    this.guildConfigs.set(config.guildId, config);
  }

  public getGuildConfig(guildId: string): VerificationConfig | undefined {
    return this.guildConfigs.get(guildId);
  }

  public async approveVerification(
    guild: Guild,
    verification: PendingVerification,
    approvedBy: User,
  ): Promise<boolean> {
    try {
      const config = this.getGuildConfig(guild.id);
      if (!config) return false;

      const member = await guild.members.fetch(verification.userId);
      const role = guild.roles.cache.get(config.verifiedRoleId);

      if (!member || !role) return false;

      await member.roles.add(role);
      // remove pending verification

      try {
        const user = await guild.client.users.fetch(verification.userId);
        const approvedEmed = new EmbedBuilder()
          .setColor(0x00ff00)
          .setTitle("🎉 Verification Approved!")
          .setDescription(
            "Your carnet verification has been approved. Welcome to iTLand!",
          )
          .setFooter({ text: `Approved by ${approvedBy.tag}` })
          .setTimestamp();

        await user.send({ embeds: [approvedEmed] });
      } catch (error) {
        Logger.warn("Could not send approval DM to user", error);
      }
      Logger.info(
        `Verification approved for ${verification.username} by ${approvedBy.tag}`,
      );
      return true;
    } catch (error) {
      Logger.error("Error approving verification", error);
      return false;
    }
  }

  public async rejectVerification(
    guild: Guild,
    verification: PendingVerification,
    rejectedBy: User,
    reason?: string,
  ): Promise<boolean> {
    try {
      this.removePendingVerification(verification.userId);

      // Notify user
      try {
        const user = await guild.client.users.fetch(verification.userId);
        const rejectedEmbed = new EmbedBuilder()
          .setColor(0xff0000)
          .setTitle("❌ Verification Rejected")
          .setDescription("Your university verification was not approved.")
          .addFields(
            {
              name: "🔍 Possible reasons:",
              value:
                reason ||
                `
                                • Image was unclear or unreadable
                                • Invalid or expired student ID
                                • Information didn't match requirements
                                • Not from an accepted institution
                            `,
            },
            {
              name: "🔄 What to do next:",
              value: "You can submit a new, clearer photo of your student ID.",
            },
          )
          .setFooter({ text: `Reviewed by ${rejectedBy.tag}` })
          .setTimestamp();

        await user.send({ embeds: [rejectedEmbed] });
      } catch (error) {
        Logger.warn("Could not send rejection DM to user", error);
      }

      Logger.info(
        `Verification rejected for ${verification.username} by ${rejectedBy.tag}`,
      );
      return true;
    } catch (error) {
      Logger.error("Error rejecting verification", error);
      return false;
    }
  }

  public validateImageSubmission(attachment: any): {
    isValid: boolean;
    error?: string;
  } {
    if (!attachment) {
      return { isValid: false, error: "No attchment found!" };
    }

    if (!attachment.contentType?.startsWith("image/")) {
      return {
        isValid: false,
        error: "Image must be an image (PNG, JPG, JPEG)",
      };
    }

    if (attachment.size > 8 * 1024 * 1024) {
      return { isValid: false, error: "Image must be smaller than 8MB" };
    }

    return { isValid: true };
  }
}
