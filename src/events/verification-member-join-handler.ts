import { GuildMember } from "discord.js";
import { EventHandler } from "./event-handler";
import { MessageUtils } from "../utils";
import { Logger } from "../services";

export class VerificationMemberJoinHandler implements EventHandler {
  constructor() {}

  public async process(member: GuildMember): Promise<void> {
    try {
      MessageUtils.send(
        member.user,
        `Hi ${member.user.displayName}, we are currently working on the verification service to approve that you are a student at ITLA`,
      );
    } catch (error) {
      Logger.warn(
        `Could not send verification DM to ${member.user.displayName}`,
        error,
      );
    }
  }
}
