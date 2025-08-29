import { ButtonInteraction } from "discord.js";
import { ButtonDeferType, Button } from "./index.js";
import { EventData } from "@/models/internal-models.js";
import { VerificationService } from "@/services/verification-service.js";
import { InteractionUtils } from "../utils/index.js";

export class VerificationApproveButton implements Button {
  public ids: string[] = ["verify_approve"];
  public deferType: ButtonDeferType = ButtonDeferType.UPDATE;
  public requireGuild: boolean = true;
  public requireEmbedAuthorTag: boolean = false;

  constructor(private verificationService: VerificationService) {}

  public async execute(
    intr: ButtonInteraction,
    data: EventData,
  ): Promise<void> {
    if (!intr.guild) {
      await InteractionUtils.send(
        intr,
        "This action can only be performed in a server.",
        true,
      );
      return;
    }

    const config = this.verificationService.getGuildConfig(intr.guild.id);
    if (!config) {
      await InteractionUtils.send(
        intr,
        "Verification system is not configured for this server.",
        true,
      );
      return;
    }

    try {
      const member = await intr.guild.members.fetch(intr.user.id);
      if (!member.roles.cache.has(config.adminRoleId)) {
        await InteractionUtils.send(
          intr,
          "You do not have permission to perform this action.",
          true,
        );
        return;
      }
    } catch (error) {
      await InteractionUtils.send(
        intr,
        "Could not verify your permissions.",
        true,
      );
      return;
    }

    const userId = this.extractUserIdFromMessage(intr.message);
    if (!userId) {
      await InteractionUtils.send(
        intr,
        "Could not find user ID in the verification message.",
        true,
      );
      return;
    }

    const verification =
      this.verificationService.getPendingVerification(userId);
    if (!verification) {
      await InteractionUtils.send(
        intr,
        "Verification not found or already processed.",
        true,
      );
      return;
    }

    const success = await this.verificationService.approveVerification(
      intr.guild,
      verification,
      intr.user,
    );

    if (success) {
      // Remove from pending verifications
      this.verificationService.removePendingVerification(userId);

      await intr.update({
        embeds: [
          {
            color: 0x00ff00,
            title: "✅ Verification Approved",
            description: `**User:** ${verification.username}\n**ID:** ${verification.userId}\n**Approved by:** ${intr.user.username}`,
            timestamp: new Date().toISOString(),
            footer: {
              text: "User has been granted access to the server",
            },
          },
        ],
        components: [],
      });
    } else {
      await InteractionUtils.send(
        intr,
        "Failed to approve verification. The user may no longer be in the server or the role may not exist.",
        true,
      );
    }
  }

  private extractUserIdFromMessage(msg: any): string | null {
    const embed = msg.embeds[0];
    if (!embed || !embed.description) return null;

    const match = embed.description.match(/\*\*ID:\*\* (\d+)/);
    return match ? match[1] : null;
  }
}

export class VerificationRejectButton implements Button {
  public ids = ["verify_reject"];
  public deferType: ButtonDeferType = ButtonDeferType.UPDATE;
  public requireGuild: boolean = true;
  public requireEmbedAuthorTag: boolean = false;

  constructor(private verificationService: VerificationService) {}

  public async execute(
    intr: ButtonInteraction,
    data: EventData,
  ): Promise<void> {
    if (!intr.guild) {
      await InteractionUtils.send(
        intr,
        "This action can only be performed in a server.",
        true,
      );
      return;
    }

    const config = this.verificationService.getGuildConfig(intr.guild.id);
    if (!config) {
      await InteractionUtils.send(
        intr,
        "Verification system is not configured for this server.",
        true,
      );
      return;
    }

    try {
      const member = await intr.guild.members.fetch(intr.user.id);
      if (!member.roles.cache.has(config.adminRoleId)) {
        await InteractionUtils.send(
          intr,
          "You do not have permission to perform this action.",
          true,
        );
        return;
      }
    } catch (error) {
      await InteractionUtils.send(
        intr,
        "Could not verify your permissions.",
        true,
      );
      return;
    }

    const userId = this.extractUserIdFromMessage(intr.message);
    if (!userId) {
      await InteractionUtils.send(
        intr,
        "Could not find user ID in the verification message.",
        true,
      );
      return;
    }

    const verification =
      this.verificationService.getPendingVerification(userId);
    if (!verification) {
      await InteractionUtils.send(
        intr,
        "Verification not found or already processed.",
        true,
      );
      return;
    }

    const success = await this.verificationService.rejectVerification(
      intr.guild,
      verification,
      intr.user,
    );

    if (success) {
      this.verificationService.removePendingVerification(userId);
      await intr.update({
        embeds: [
          {
            color: 0xff0000,
            title: "❌ Verification Rejected",
            description: `**User:** ${verification.username}\n**ID:** ${verification.userId}\n**Rejected by:** ${intr.user.username}`,
            timestamp: new Date().toISOString(),
            footer: {
              text: "User has been notified and can submit a new request",
            },
          },
        ],
        components: [],
      });
    } else {
      await InteractionUtils.send(intr, "Failed to reject verification.", true);
    }
  }

  private extractUserIdFromMessage(message: any): string | null {
    const embed = message.embeds[0];
    if (!embed || !embed.description) return null;

    const match = embed.description.match(/\*\*ID:\*\* (\d+)/);
    return match ? match[1] : null;
  }
}
