export type NotificationPreference = { reactionAlerts: boolean; replyAlerts: boolean };
export type CommunityNotificationType = "reaction" | "reply";

export function shouldCreateCommunityNotification({ recipientUserId, actorUserId, type, preferences }: { recipientUserId: number; actorUserId: number; type: CommunityNotificationType; preferences: NotificationPreference }): boolean {
  if (recipientUserId === actorUserId) return false;
  return type === "reaction" ? preferences.reactionAlerts : preferences.replyAlerts;
}
