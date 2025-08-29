import {
  Message,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  TextChannel,
} from "discord.js";
import { EventHandler } from "./index.js";
import { VerificationService } from "../services/verification-service.js";
import { MessageUtils } from "../utils/index.js";
import { Logger } from "../services/index.js";

export class VerificationMessageHandler implements EventHandler {
  constructor(private verificationService: VerificationService) {}

  public async process(msg: Message): Promise<void> {
    // Only process DMs with attachments
    if (msg.guild || !msg.attachments.size || msg.author.bot) return;

    // Check if user is in any guild with verification enabled
    const guildsWithVerification = await this.getGuildsWithVerification(
      msg.author.id,
    );
    if (guildsWithVerification.length === 0) return;

    const attachment = msg.attachments.first();
    if (!attachment) return;

    const validation =
      this.verificationService.validateImageSubmission(attachment);
    if (!validation.isValid) {
      const errorEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle("❌ Invalid Submission")
        .setDescription(validation.error!)
        .setFooter({ text: "Please try again with a valid image" });

      await MessageUtils.reply(msg, errorEmbed);
      return;
    }

    // Check if user already has pending verification
    if (this.verificationService.getPendingVerification(msg.author.id)) {
      const errorEmbed = new EmbedBuilder()
        .setColor(0xffaa00)
        .setTitle("⏳ Verification Pending")
        .setDescription(
          "You already have a verification request in progress. Please wait for admin review.",
        )
        .setFooter({ text: "Contact an administrator if you need help" });

      await MessageUtils.reply(msg, errorEmbed);
      return;
    }

    // Process the verification for all applicable guilds
    for (const guild of guildsWithVerification) {
      await this.processVerificationForGuild(msg, attachment, guild);
    }
  }

  private async getGuildsWithVerification(userId: string): Promise<any[]> {
    // Implementation to find guilds where user needs verification
    // This would need to be implemented based on how you track guild memberships
    return [];
  }

  private async processVerificationForGuild(
    msg: Message,
    attachment: any,
    guild: any,
  ): Promise<void> {
    const config = this.verificationService.getGuildConfig(guild.id);
    if (!config) return;

    const verification = {
      userId: msg.author.id,
      username: msg.author.tag,
      imageUrl: attachment.url,
      timeStamp: new Date(),
      guildId: guild.id,
    };

    this.verificationService.setPendingVerification(
      msg.author.id,
      verification,
    );

    // Send confirmation to user
    const confirmEmbed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle("✅ Verification Submitted")
      .setDescription(
        "Your student ID has been received and will be reviewed by an administrator.",
      )
      .addFields({
        name: "⏰ Review Time:",
        value: "Typically 2-24 hours",
      })
      .setFooter({ text: "You will be notified when the review is complete" })
      .setTimestamp();

    await MessageUtils.reply(msg, confirmEmbed);

    // Send to verification channel
    await this.sendToVerificationChannel(verification, config);
  }

  private async sendToVerificationChannel(
    verification: any,
    config: any,
  ): Promise<void> {
    try {
      const guild = await this.getBotClient().guilds.fetch(config.guildId);
      const channel = guild.channels.cache.get(
        config.verificationChannelId,
      ) as TextChannel;

      if (!channel) {
        Logger.error(
          `Verification channel not found: ${config.verificationChannelId}`,
        );
        return;
      }

      const verificationEmbed = new EmbedBuilder()
        .setColor(0xffaa00)
        .setTitle("🎓 New Verification Request")
        .setDescription(
          `**User:** ${verification.username}\n**ID:** ${verification.userId}`,
        )
        .setImage(verification.imageUrl)
        .setFooter({
          text: "Review the image and use buttons to approve/reject",
        })
        .setTimestamp(verification.timestamp);

      const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("verify_approve")
          .setLabel("✅ Approve")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId("verify_reject")
          .setLabel("❌ Reject")
          .setStyle(ButtonStyle.Danger),
      );

      await channel.send({
        embeds: [verificationEmbed],
        components: [actionRow],
      });

      Logger.info(`Verification request sent for ${verification.username}`);
    } catch (error) {
      Logger.error("Error sending verification to channel", error);
    }
  }

  private getBotClient(): any {
    // This would need to be implemented to get the Discord client instance
    // You might need to pass this through the constructor or use a singleton
    throw new Error("getBotClient not implemented");
  }
}
