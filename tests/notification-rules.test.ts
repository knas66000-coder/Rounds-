import { describe, expect, it } from "vitest";
import { shouldCreateCommunityNotification } from "../shared/notification-rules";

describe("community notification eligibility", () => {
  const enabled = { reactionAlerts: true, replyAlerts: true };
  it("alerts post owners only when another learner reacts or replies", () => {
    expect(shouldCreateCommunityNotification({ recipientUserId: 4, actorUserId: 7, type: "reaction", preferences: enabled })).toBe(true);
    expect(shouldCreateCommunityNotification({ recipientUserId: 4, actorUserId: 4, type: "reply", preferences: enabled })).toBe(false);
  });

  it("respects a learner's event-specific notification preferences", () => {
    expect(shouldCreateCommunityNotification({ recipientUserId: 4, actorUserId: 7, type: "reaction", preferences: { reactionAlerts: false, replyAlerts: true } })).toBe(false);
    expect(shouldCreateCommunityNotification({ recipientUserId: 4, actorUserId: 7, type: "reply", preferences: { reactionAlerts: false, replyAlerts: true } })).toBe(true);
  });
});
