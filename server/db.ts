import { and, desc, eq, gt, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { academicProfiles, communityNotificationPreferences, communityNotifications, communityPosts, communityReactions, communityReplies, communityReports, InsertUser, roundsAccounts, roundsSessions, studyMaterials, users } from "../drizzle/schema";
import { ENV } from "./_core/env";
import { shouldCreateCommunityNotification, type CommunityNotificationType, type NotificationPreference } from "../shared/notification-rules";
import { canUseStudyMaterial } from "../shared/study-material-permissions";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createRoundsAccount(input: { name: string; email: string; passwordHash: string; role?: "user" | "admin" }) {
  const db = await getDb();
  if (!db) throw new Error("Account storage is temporarily unavailable.");
  const existing = await db.select({ id: roundsAccounts.id }).from(roundsAccounts).where(eq(roundsAccounts.email, input.email)).limit(1);
  if (existing.length) return { duplicate: true as const };
  const openId = `rounds:${crypto.randomUUID()}`;
  await db.insert(users).values({ openId, name: input.name, email: input.email, loginMethod: "rounds", role: input.role ?? "user", lastSignedIn: new Date() });
  const user = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  const userId = user[0]?.id;
  if (!userId) throw new Error("The new Rounds account could not be initialized.");
  await db.insert(roundsAccounts).values({ userId, email: input.email, passwordHash: input.passwordHash });
  return { duplicate: false as const, user: user[0] };
}

export async function getRoundsAccountByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select({ user: users, passwordHash: roundsAccounts.passwordHash }).from(roundsAccounts).innerJoin(users, eq(roundsAccounts.userId, users.id)).where(eq(roundsAccounts.email, email)).limit(1);
  return rows[0];
}

export async function createRoundsSession(userId: number, tokenHash: string, expiresAt: Date) {
  const db = await getDb();
  if (!db) throw new Error("Session storage is temporarily unavailable.");
  await db.insert(roundsSessions).values({ userId, tokenHash, expiresAt });
}

export async function getUserByRoundsSessionHash(tokenHash: string, now = new Date()) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select({ user: users }).from(roundsSessions).innerJoin(users, eq(roundsSessions.userId, users.id)).where(and(eq(roundsSessions.tokenHash, tokenHash), gt(roundsSessions.expiresAt, now))).limit(1);
  return rows[0]?.user;
}

export async function deleteRoundsSession(tokenHash: string) {
  const db = await getDb();
  if (!db) return;
  await db.delete(roundsSessions).where(eq(roundsSessions.tokenHash, tokenHash));
}

export async function markRoundsUserSignedIn(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, userId));
}

export async function promoteRoundsUserToAdmin(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Account storage is temporarily unavailable.");
  await db.update(users).set({ role: "admin", lastSignedIn: new Date() }).where(eq(users.id, userId));
}

export async function getOwnerControlOverview() {
  const db = await getDb();
  if (!db) throw new Error("Platform data is temporarily unavailable.");
  const [learnerRows, profiles, materials, openReports, recentLearners] = await Promise.all([
    db.select({ id: users.id }).from(users).where(eq(users.role, "user")),
    db.select({ program: academicProfiles.program }).from(academicProfiles),
    db.select({ id: studyMaterials.id }).from(studyMaterials),
    db.select({ id: communityReports.id, targetType: communityReports.targetType, targetId: communityReports.targetId, reason: communityReports.reason, createdAt: communityReports.createdAt }).from(communityReports).where(eq(communityReports.status, "open")).orderBy(desc(communityReports.createdAt)).limit(30),
    db.select({ id: users.id, name: users.name, email: users.email, createdAt: users.createdAt, lastSignedIn: users.lastSignedIn, institutionName: academicProfiles.institutionName, program: academicProfiles.program }).from(users).leftJoin(academicProfiles, eq(users.id, academicProfiles.userId)).where(eq(users.role, "user")).orderBy(desc(users.createdAt)).limit(30),
  ]);
  const programDistribution = profiles.reduce<Record<string, number>>((totals, profile) => {
    totals[profile.program] = (totals[profile.program] ?? 0) + 1;
    return totals;
  }, {});
  return { metrics: { learners: learnerRows.length, academicProfiles: profiles.length, studyMaterials: materials.length, openReports: openReports.length }, programDistribution, recentLearners, openReports };
}

export async function resolveCommunityReportAsOwner(reportId: number) {
  const db = await getDb();
  if (!db) throw new Error("Community safety data is temporarily unavailable.");
  const result = await db.update(communityReports).set({ status: "resolved" }).where(and(eq(communityReports.id, reportId), eq(communityReports.status, "open")));
  return result[0].affectedRows > 0;
}

/** Returns only learner-owned records suitable for a private download. Credentials, sessions, raw PDFs, and storage keys are intentionally excluded. */
export async function getRoundsAccountExport(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Account storage is temporarily unavailable.");
  const [userRows, profileRows, materials, posts, replies, preferences] = await Promise.all([
    db.select({ name: users.name, email: users.email, createdAt: users.createdAt, lastSignedIn: users.lastSignedIn }).from(users).where(eq(users.id, userId)).limit(1),
    db.select({ institutionName: academicProfiles.institutionName, program: academicProfiles.program, createdAt: academicProfiles.createdAt, updatedAt: academicProfiles.updatedAt }).from(academicProfiles).where(eq(academicProfiles.userId, userId)).limit(1),
    db.select({ title: studyMaterials.title, mimeType: studyMaterials.mimeType, byteSize: studyMaterials.byteSize, createdAt: studyMaterials.createdAt }).from(studyMaterials).where(eq(studyMaterials.userId, userId)),
    db.select({ kind: communityPosts.kind, content: communityPosts.content, status: communityPosts.status, createdAt: communityPosts.createdAt, updatedAt: communityPosts.updatedAt }).from(communityPosts).where(eq(communityPosts.userId, userId)),
    db.select({ postId: communityReplies.postId, content: communityReplies.content, status: communityReplies.status, createdAt: communityReplies.createdAt, updatedAt: communityReplies.updatedAt }).from(communityReplies).where(eq(communityReplies.userId, userId)),
    db.select({ reactionAlerts: communityNotificationPreferences.reactionAlerts, replyAlerts: communityNotificationPreferences.replyAlerts, updatedAt: communityNotificationPreferences.updatedAt }).from(communityNotificationPreferences).where(eq(communityNotificationPreferences.userId, userId)).limit(1),
  ]);
  const account = userRows[0];
  if (!account) throw new Error("This Rounds account is no longer available.");
  return { schemaVersion: 1, exportedAt: new Date(), account, academicProfile: profileRows[0] ?? null, studyMaterialMetadata: materials, community: { posts, replies }, notificationPreferences: preferences[0] ?? null };
}

export type CommunityFeedItem = {
  id: number;
  userId: number;
  kind: "study_win" | "study_tip" | "encouragement";
  content: string;
  authorName: string;
  createdAt: Date;
  reactionCount: number;
  replyCount: number;
  viewerReacted: boolean;
  canManage: boolean;
};

export async function listCommunityPosts(viewerId: number): Promise<CommunityFeedItem[]> {
  const db = await getDb();
  if (!db) return [];
  const posts = await db.select({ id: communityPosts.id, userId: communityPosts.userId, kind: communityPosts.kind, content: communityPosts.content, createdAt: communityPosts.createdAt, authorName: users.name }).from(communityPosts).innerJoin(users, eq(communityPosts.userId, users.id)).where(eq(communityPosts.status, "active")).orderBy(desc(communityPosts.createdAt)).limit(50);
  const ids = posts.map((post) => post.id);
  if (!ids.length) return [];
  const [reactions, replies] = await Promise.all([
    db.select({ postId: communityReactions.postId, userId: communityReactions.userId }).from(communityReactions).where(inArray(communityReactions.postId, ids)),
    db.select({ postId: communityReplies.postId }).from(communityReplies).where(and(inArray(communityReplies.postId, ids), eq(communityReplies.status, "active"))),
  ]);
  return posts.map((post) => ({
    id: post.id,
    userId: post.userId,
    kind: post.kind,
    content: post.content,
    authorName: post.authorName?.trim() || "Learner",
    createdAt: post.createdAt,
    reactionCount: reactions.filter((reaction) => reaction.postId === post.id).length,
    replyCount: replies.filter((reply) => reply.postId === post.id).length,
    viewerReacted: reactions.some((reaction) => reaction.postId === post.id && reaction.userId === viewerId),
    canManage: post.userId === viewerId,
  }));
}

export async function createCommunityPost(userId: number, kind: "study_win" | "study_tip" | "encouragement", content: string) {
  const db = await getDb();
  if (!db) throw new Error("Community storage is temporarily unavailable.");
  await db.insert(communityPosts).values({ userId, kind, content });
}

export async function toggleCommunityReaction(userId: number, postId: number) {
  const db = await getDb();
  if (!db) throw new Error("Community storage is temporarily unavailable.");
  const post = await db.select({ id: communityPosts.id }).from(communityPosts).where(and(eq(communityPosts.id, postId), eq(communityPosts.status, "active"))).limit(1);
  if (!post.length) return { active: false, missing: true };
  const existing = await db.select({ id: communityReactions.id }).from(communityReactions).where(and(eq(communityReactions.postId, postId), eq(communityReactions.userId, userId))).limit(1);
  if (existing.length) {
    await db.delete(communityReactions).where(eq(communityReactions.id, existing[0].id));
    return { active: false, missing: false };
  }
  await db.insert(communityReactions).values({ postId, userId });
  return { active: true, missing: false };
}

export async function listCommunityReplies(postId: number, viewerId: number) {
  const db = await getDb();
  if (!db) return [];
  const replies = await db.select({ id: communityReplies.id, userId: communityReplies.userId, content: communityReplies.content, createdAt: communityReplies.createdAt, authorName: users.name }).from(communityReplies).innerJoin(users, eq(communityReplies.userId, users.id)).where(and(eq(communityReplies.postId, postId), eq(communityReplies.status, "active"))).orderBy(desc(communityReplies.createdAt));
  return replies.map((reply) => ({ ...reply, authorName: reply.authorName?.trim() || "Learner", canManage: reply.userId === viewerId }));
}

export async function createCommunityReply(userId: number, postId: number, content: string) {
  const db = await getDb();
  if (!db) throw new Error("Community storage is temporarily unavailable.");
  const post = await db.select({ id: communityPosts.id }).from(communityPosts).where(and(eq(communityPosts.id, postId), eq(communityPosts.status, "active"))).limit(1);
  if (!post.length) return false;
  await db.insert(communityReplies).values({ userId, postId, content });
  return true;
}

export async function deleteCommunityPost(userId: number, postId: number) {
  const db = await getDb();
  if (!db) throw new Error("Community storage is temporarily unavailable.");
  const result = await db.update(communityPosts).set({ status: "deleted" }).where(and(eq(communityPosts.id, postId), eq(communityPosts.userId, userId), eq(communityPosts.status, "active")));
  return result[0].affectedRows > 0;
}

export async function deleteCommunityReply(userId: number, replyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Community storage is temporarily unavailable.");
  const result = await db.update(communityReplies).set({ status: "deleted" }).where(and(eq(communityReplies.id, replyId), eq(communityReplies.userId, userId), eq(communityReplies.status, "active")));
  return result[0].affectedRows > 0;
}

export async function createCommunityReport(reporterId: number, targetType: "post" | "reply", targetId: number, reason: "privacy" | "harassment" | "exam_content" | "solicitation" | "other") {
  const db = await getDb();
  if (!db) throw new Error("Community storage is temporarily unavailable.");
  await db.insert(communityReports).values({ reporterId, targetType, targetId, reason });
}

const defaultNotificationPreferences: NotificationPreference = { reactionAlerts: true, replyAlerts: true };

export async function getCommunityNotificationPreferences(userId: number): Promise<NotificationPreference> {
  const db = await getDb();
  if (!db) return defaultNotificationPreferences;
  const existing = await db.select({ reactionAlerts: communityNotificationPreferences.reactionAlerts, replyAlerts: communityNotificationPreferences.replyAlerts }).from(communityNotificationPreferences).where(eq(communityNotificationPreferences.userId, userId)).limit(1);
  if (existing.length) return existing[0];
  await db.insert(communityNotificationPreferences).values({ userId });
  return defaultNotificationPreferences;
}

export async function updateCommunityNotificationPreferences(userId: number, preferences: NotificationPreference): Promise<NotificationPreference> {
  const db = await getDb();
  if (!db) throw new Error("Notification preferences are temporarily unavailable.");
  const existing = await db.select({ id: communityNotificationPreferences.id }).from(communityNotificationPreferences).where(eq(communityNotificationPreferences.userId, userId)).limit(1);
  if (existing.length) await db.update(communityNotificationPreferences).set(preferences).where(eq(communityNotificationPreferences.id, existing[0].id));
  else await db.insert(communityNotificationPreferences).values({ userId, ...preferences });
  return preferences;
}

export async function createCommunityNotificationForPostOwner(actorUserId: number, postId: number, type: CommunityNotificationType): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const post = await db.select({ userId: communityPosts.userId }).from(communityPosts).where(and(eq(communityPosts.id, postId), eq(communityPosts.status, "active"))).limit(1);
  if (!post.length) return false;
  const preferences = await getCommunityNotificationPreferences(post[0].userId);
  if (!shouldCreateCommunityNotification({ recipientUserId: post[0].userId, actorUserId, type, preferences })) return false;
  await db.insert(communityNotifications).values({ userId: post[0].userId, actorUserId, postId, type });
  return true;
}

export async function listCommunityNotifications(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const notifications = await db.select().from(communityNotifications).where(eq(communityNotifications.userId, userId)).orderBy(desc(communityNotifications.createdAt)).limit(50);
  return notifications.map((notification) => ({
    id: notification.id,
    postId: notification.postId,
    type: notification.type,
    read: notification.readAt !== null,
    createdAt: notification.createdAt,
    title: notification.type === "reaction" ? "Your study update received encouragement" : "Your study update has a new reply",
    detail: notification.type === "reaction" ? "A learner encouraged your progress." : "A learner shared a supportive response.",
  }));
}

export async function communityNotificationUnreadCount(userId: number) {
  const notifications = await listCommunityNotifications(userId);
  return notifications.filter((notification) => !notification.read).length;
}

export async function markCommunityNotificationRead(userId: number, notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Notifications are temporarily unavailable.");
  await db.update(communityNotifications).set({ readAt: new Date() }).where(and(eq(communityNotifications.id, notificationId), eq(communityNotifications.userId, userId)));
}

export async function markAllCommunityNotificationsRead(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Notifications are temporarily unavailable.");
  const notifications = await db.select({ id: communityNotifications.id, readAt: communityNotifications.readAt }).from(communityNotifications).where(eq(communityNotifications.userId, userId));
  const unreadIds = notifications.filter((notification) => notification.readAt === null).map((notification) => notification.id);
  if (unreadIds.length) await db.update(communityNotifications).set({ readAt: new Date() }).where(inArray(communityNotifications.id, unreadIds));
}

export async function listStudyMaterials(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ id: studyMaterials.id, title: studyMaterials.title, mimeType: studyMaterials.mimeType, byteSize: studyMaterials.byteSize, createdAt: studyMaterials.createdAt }).from(studyMaterials).where(eq(studyMaterials.userId, userId)).orderBy(desc(studyMaterials.createdAt));
}

export async function createStudyMaterial(userId: number, input: { title: string; storageKey: string; mimeType: string; byteSize: number }) {
  const db = await getDb();
  if (!db) throw new Error("Study material storage is temporarily unavailable.");
  const result = await db.insert(studyMaterials).values({ userId, ...input });
  return Number(result[0].insertId);
}

export async function getOwnedStudyMaterial(userId: number, materialId: number) {
  const db = await getDb();
  if (!db) throw new Error("Study material storage is temporarily unavailable.");
  const material = await db.select().from(studyMaterials).where(and(eq(studyMaterials.id, materialId), eq(studyMaterials.userId, userId))).limit(1);
  return material[0] && canUseStudyMaterial(material[0].userId, userId) ? material[0] : null;
}

export async function deleteOwnedStudyMaterial(userId: number, materialId: number) {
  const db = await getDb();
  if (!db) throw new Error("Study material storage is temporarily unavailable.");
  const result = await db.delete(studyMaterials).where(and(eq(studyMaterials.id, materialId), eq(studyMaterials.userId, userId)));
  return result[0].affectedRows > 0;
}

export async function getAcademicProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const profile = await db.select({ institutionName: academicProfiles.institutionName, program: academicProfiles.program, updatedAt: academicProfiles.updatedAt }).from(academicProfiles).where(eq(academicProfiles.userId, userId)).limit(1);
  return profile[0] ?? null;
}

export async function saveAcademicProfile(userId: number, input: { institutionName: string; program: string }) {
  const db = await getDb();
  if (!db) throw new Error("Academic profile storage is temporarily unavailable.");
  const existing = await db.select({ id: academicProfiles.id }).from(academicProfiles).where(eq(academicProfiles.userId, userId)).limit(1);
  if (existing.length) await db.update(academicProfiles).set(input).where(eq(academicProfiles.id, existing[0].id));
  else await db.insert(academicProfiles).values({ userId, ...input });
  return getAcademicProfile(userId);
}
