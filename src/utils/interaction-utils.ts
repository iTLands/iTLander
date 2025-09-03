import {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  CommandInteraction,
  DiscordAPIError,
  RESTJSONErrorCodes as DiscordApiErrors,
  EmbedBuilder,
  InteractionReplyOptions,
  InteractionResponse,
  InteractionUpdateOptions,
  Message,
  MessageComponentInteraction,
  MessageFlags,
  ModalSubmitInteraction,
  WebhookMessageEditOptions,
} from "discord.js";

const IGNORE_ERRORS = [
  DiscordApiErrors.UnknownMessage,
  DiscordApiErrors.UnknownChannel,
  DiscordApiErrors.UnknownChannel,
  DiscordApiErrors.UnknownUser,
  DiscordApiErrors.UnknownInteraction,
  DiscordApiErrors.CannotSendMessagesToThisUser, // User blocked bot or DM disabled
  DiscordApiErrors.ReactionWasBlocked, // User blocked bot or DM disabled
  DiscordApiErrors.MaximumActiveThreads,
];

export class InteractionUtils {
  public static async deferReply(
    intr:
      | CommandInteraction
      | MessageComponentInteraction
      | ModalSubmitInteraction,
    hidden: boolean = false,
  ): Promise<InteractionResponse | undefined> {
    try {
      return await intr.deferReply({
        flags: hidden ? MessageFlags.Ephemeral : undefined,
      });
    } catch (error) {
      this.handleDiscordErrors(error);
    }
  }

  public static async deferUpdate(
    intr: MessageComponentInteraction | ModalSubmitInteraction,
  ): Promise<InteractionResponse | undefined> {
    try {
      return await intr.deferUpdate();
    } catch (error) {
      this.handleDiscordErrors(error);
    }
  }

  public static async send(
    intr:
      | CommandInteraction
      | MessageComponentInteraction
      | ModalSubmitInteraction,
    content: string | EmbedBuilder | InteractionReplyOptions,
    hidden: boolean = false,
  ): Promise<Message | undefined> {
    try {
      let options: InteractionReplyOptions =
        typeof content === "string"
          ? { content }
          : content instanceof EmbedBuilder
            ? {
                embeds: [content],
              }
            : content;

      if (intr.deferred || intr.replied) {
        return await intr.followUp({
          ...options,
          flags: hidden ? MessageFlags.Ephemeral : undefined,
        });
      } else {
        await intr.reply({
          ...options,
          flags: hidden ? MessageFlags.Ephemeral : undefined,
        });
        return intr.fetchReply();
      }
    } catch (error) {
      this.handleDiscordErrors(error);
    }
  }

  public static async respond(
    intr: AutocompleteInteraction,
    choices: ApplicationCommandOptionChoiceData[] = [],
  ): Promise<void> {
    try {
      return await intr.respond(choices);
    } catch (error) {
      this.handleDiscordErrors(error);
    }
  }

  public static async editReply(
    intr:
      | CommandInteraction
      | MessageComponentInteraction
      | ModalSubmitInteraction,
    content: string | EmbedBuilder | WebhookMessageEditOptions,
  ): Promise<Message | undefined> {
    try {
      let options: WebhookMessageEditOptions =
        typeof content == "string"
          ? { content }
          : content instanceof EmbedBuilder
            ? { embeds: [content] }
            : content;
      return await intr.editReply(options);
    } catch (error) {
      this.handleDiscordErrors(error);
    }
  }

  public static async update(
    intr: MessageComponentInteraction,
    content: string | EmbedBuilder | InteractionUpdateOptions,
  ): Promise<Message | undefined> {
    try {
      let options: InteractionUpdateOptions =
        typeof content == "string"
          ? { content }
          : content instanceof EmbedBuilder
            ? { embeds: [content] }
            : content;
      await intr.update({ ...options });
      return intr.fetchReply();
    } catch (error) {
      this.handleDiscordErrors(error);
    }
  }

  private static handleDiscordErrors(error: any): Error | undefined {
    if (
      error instanceof DiscordAPIError &&
      typeof error.code == "number" &&
      IGNORE_ERRORS.includes(error.code)
    ) {
      return;
    }
    throw error;
  }
}
