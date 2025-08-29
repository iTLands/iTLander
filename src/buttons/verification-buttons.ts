import { ButtonInteraction } from "discord.js";
import { ButtonDeferType, Button } from "./index.js";
import { EventData } from "@/models/internal-models.js";
import { VerificationService } from "@/services/verification-service.js";
import { InteractionUtils } from "../utils/index.js";

export class VerificationApproveButton implements Button {
  public ids: string[] = ["verify_approve"];
  public deferType: ButtonDeferType.UPDATE;
  public requireGuild: boolean = true;
  public requireEmbedAuthorTag: boolean = false;

  constructor(private verificationService: VerificationService) {}

  public async execute(
    intr: ButtonInteraction,
    data: EventData,
  ): Promise<void> {
    if (!intr.guild) return;

    const config = this.verificationService.getGuildConfig(intr.guild.id);
    const member = await intr.guild.members.fetch(intr.user.id);

    if (!config || !member.roles.cache.has(config.adminRoleId)) {
      await InteractionUtils.send(
        intr,
        "You do not have permission to perform this action.",
        true,
      );
      return;
    }

    const userId = this.extractUserIdFromMessage(intr.message);
    if (!userId) return;

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
      await intr.update({
        embeds: [
          {
            color: 0x00ff00,
            title: "✅ Verification Approved",
            description: `**User:** ${verification.username}\n**Approved by:** ${intr.user.tag}`,
            timestamp: new Date().toISOString(),
          },
        ],
        components: [],
      });
    } else {
      await InteractionUtils.send(
        intr,
        "Failed to approve verification.",
        true,
      );
    }
  }

  private extractUserIdFromMessage(msg: any): string | null {
    const embed = msg.embeds[0];
    if (!embed) return null;

    const match = embed.description?.match(/\*\*ID:\*\* (\d+)/);
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
    if (!intr.guild) return;

    const config = this.verificationService.getGuildConfig(intr.guild.id);
    const member = await intr.guild.members.fetch(intr.user.id);
    if (!config || !member.roles.cache.has(config.adminRoleId)) {
      await InteractionUtils.send(
        intr,
        "You do not have permission to perfom this action.",
        true,
      );
      return;
    }

    const userId = this.extractUserIdFromMessage(intr.message);
    if (!userId) return;

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
      await intr.update({
        embeds: [
          {
            color: 0xff0000,
            title: "❌ Verification Rejected",
            description: `**User:** ${verification.username}\n**Approved by:** ${intr.user.tag}`,
            timestamp: new Date().toISOString(),
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
    if (!embed) return null;

    const match = embed.description?.match(/\*\*ID:\*\* (\d+)/);
    return match ? match[1] : null;
  }
}
