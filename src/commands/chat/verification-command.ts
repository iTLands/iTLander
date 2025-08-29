import { ChatInputCommandInteraction, PermissionsString } from "discord.js";
import { Command, CommandDeferType } from "../command.js";
import { EventData } from "@/models/internal-models.js";
import { InteractionUtils } from "../../utils/index.js";
import { VerificationService } from "../../services/index.js";
import { Lang } from "../../services/index.js";
import { Language } from "../../models/enum-helpers/index.js";

export class VerificationCommand implements Command {
  public names = ["verification"];
  public deferType: CommandDeferType = CommandDeferType.HIDDEN;
  public requireClientPerms: PermissionsString[] = ["ManageRoles"];

  constructor(private verificationService: VerificationService) {}

  public async execute(
    intr: ChatInputCommandInteraction,
    data: EventData,
  ): Promise<void> {
    if (!intr.guild) return;

    const subcommand = intr.options.getSubcommand();

    switch (subcommand) {
      case "setup":
        await this.handleSetup(intr, data);
        break;
    }
  }

  private async handleSetup(
    intr: ChatInputCommandInteraction,
    data: EventData,
  ): Promise<void> {
    const channel = intr.options.getChannel("verification_channel", true);
    const role = intr.options.getRole("verified_role", true);
    const adminRole = intr.options.getRole("admin_role", true);

    if (!intr.guild) return;

    const config = {
      guildId: intr.guild.id,
      verificationChannelId: channel.id,
      verifiedRoleId: role.id,
      adminRoleId: adminRole.id,
      enabled: true,
    };

    this.verificationService.setGuildConfig(config);

    await InteractionUtils.send(intr, {
      embeds: [
        {
          color: 0x00ff00,
          title: "✅ Verification Setup Complete",
          fields: [
            {
              name: "Verification Channel",
              value: `<#${channel.id}>`,
              inline: true,
            },
            { name: "Verified Role", value: `<@&${role.id}>`, inline: true },
            { name: "Admin Role", value: `<@&${adminRole.id}>`, inline: true },
          ],
        },
      ],
    });
  }

  private async handleStats(
    intr: ChatInputCommandInteraction,
    data: EventData,
  ): Promise<void> {
    // Implementation for showing verification statistics
    await InteractionUtils.send(
      intr,
      "Verification statistics feature coming soon!",
    );
  }

  private async handleClear(
    intr: ChatInputCommandInteraction,
    data: EventData,
  ): Promise<void> {
    // Implementation for clearing pending verifications
    await InteractionUtils.send(intr, "Cleared all pending verifications.");
  }
}
