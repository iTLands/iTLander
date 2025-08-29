export interface PendingVerification {
  userId: string;
  username: string;
  imageUrl: string;
  timeStamp: Date;
  guildId: string;
  messageId?: string;
}

export interface VerificationConfig {
  guildId: string;
  verificationChannelId: string;
  verifiedRoleId: string;
  adminRoleId: string;
  enabled: boolean;
}
