import {
  BaseMessageOptions,
  EmbedBuilder,
  Message,
  PartialGroupDMChannel,
  RESTJSONErrorCodes as DiscordApiErrors,
  TextBasedChannel,
  User,
  DiscordAPIError,
  EmojiResolvable,
  MessageReaction,
  StartThreadOptions,
  ThreadChannel,
} from "discord.js";

const IGNORED_ERRORS = [
  DiscordApiErrors.UnknownMessage,
  DiscordApiErrors.UnknownChannel,
  DiscordApiErrors.UnknownGuild,
  DiscordApiErrors.UnknownUser,
  DiscordApiErrors.UnknownInteraction,
  DiscordApiErrors.MaximumNumberOfPinsReachedForTheChannel,
  DiscordApiErrors.CannotSendMessagesToThisUser, // User blocked bot or DM disabled
  DiscordApiErrors.ReactionWasBlocked, // User blocked bot or DM disabled
  DiscordApiErrors.MaximumActiveThreads,
];
export class MessageUtils {
  public static async send(
    target: User | TextBasedChannel,
    content: string | EmbedBuilder | BaseMessageOptions,
  ): Promise<Message | undefined> {
    if (target instanceof PartialGroupDMChannel) return;
    try {
      let options: BaseMessageOptions =
        typeof content === "string"
          ? { content }
          : content instanceof EmbedBuilder
            ? { embeds: [content] }
            : content;
      return await target.send(options);
    } catch (error) {
      this.handleDiscordError(error);
    }
  }

  public static async reply(
    msg: Message,
    content: string | EmbedBuilder | BaseMessageOptions,
  ): Promise<Message | undefined> {
    try {
      let options: BaseMessageOptions =
        typeof content === "string"
          ? { content }
          : content instanceof EmbedBuilder
            ? { embeds: [content] }
            : content;
      return await msg.reply(options);
    } catch (error) {
      this.handleDiscordError(error);
    }
  }

  public static async edit(
    msg: Message,
    content: string | EmbedBuilder | BaseMessageOptions,
  ): Promise<Message | undefined> {
    try {
      let options: BaseMessageOptions =
        typeof content === "string"
          ? { content }
          : content instanceof EmbedBuilder
            ? { embeds: [content] }
            : content;
      return await msg.edit(options);
    } catch (error) {
      this.handleDiscordError(error);
    }
  }

  public static async react(
    msg: Message,
    emoji: EmojiResolvable,
  ): Promise<MessageReaction | undefined> {
    try {
      return await msg.react(emoji);
    } catch (error) {
      this.handleDiscordError(error);
    }
  }

  public static async pin(
    msg: Message,
    pinned: boolean = true,
  ): Promise<Message | undefined> {
    try {
      return pinned ? await msg.pin() : await msg.unpin();
    } catch (error) {
      this.handleDiscordError(error);
    }
  }

  public static async startThread(
    msg: Message,
    options: StartThreadOptions,
  ): Promise<ThreadChannel | undefined> {
    try {
      return await msg.startThread(options);
    } catch (error) {
      this.handleDiscordError(error);
    }
  }

  public static async delete(msg: Message): Promise<Message | undefined> {
    try {
      return await msg.delete();
    } catch (error) {
      this.handleDiscordError(error);
    }
  }

  private static handleDiscordError(error: any): Error | undefined {
    if (
      error instanceof DiscordAPIError &&
      typeof error.code == "number" &&
      IGNORED_ERRORS.includes(error.code)
    ) {
      return;
    } else {
      throw error;
    }
  }
}
