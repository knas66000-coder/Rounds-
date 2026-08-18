import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/** Rounds-native learner credentials. Passwords are one-way scrypt hashes only. */
export const roundsAccounts = mysqlTable("rounds_accounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [uniqueIndex("rounds_accounts_user").on(table.userId), uniqueIndex("rounds_accounts_email").on(table.email)]);

/** Opaque Rounds sessions. Only a SHA-256 hash of each bearer token is persisted. */
export const roundsSessions = mysqlTable("rounds_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tokenHash: varchar("tokenHash", { length: 64 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [uniqueIndex("rounds_sessions_token_hash").on(table.tokenHash)]);

export const communityPosts = mysqlTable("community_posts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  kind: mysqlEnum("kind", ["study_win", "study_tip", "encouragement"]).notNull(),
  content: varchar("content", { length: 600 }).notNull(),
  status: mysqlEnum("status", ["active", "deleted"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const communityReactions = mysqlTable("community_reactions", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["encourage"]).default("encourage").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [uniqueIndex("community_reaction_user_post").on(table.postId, table.userId)]);

export const communityReplies = mysqlTable("community_replies", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  userId: int("userId").notNull(),
  content: varchar("content", { length: 400 }).notNull(),
  status: mysqlEnum("status", ["active", "deleted"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const communityReports = mysqlTable("community_reports", {
  id: int("id").autoincrement().primaryKey(),
  reporterId: int("reporterId").notNull(),
  targetType: mysqlEnum("targetType", ["post", "reply"]).notNull(),
  targetId: int("targetId").notNull(),
  reason: mysqlEnum("reason", ["privacy", "harassment", "exam_content", "solicitation", "other"]).notNull(),
  status: mysqlEnum("status", ["open", "resolved"]).default("open").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const communityNotificationPreferences = mysqlTable("community_notification_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  reactionAlerts: boolean("reactionAlerts").default(true).notNull(),
  replyAlerts: boolean("replyAlerts").default(true).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [uniqueIndex("community_notification_preferences_user").on(table.userId)]);

export const communityNotifications = mysqlTable("community_notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  actorUserId: int("actorUserId").notNull(),
  postId: int("postId").notNull(),
  type: mysqlEnum("type", ["reaction", "reply"]).notNull(),
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const studyMaterials = mysqlTable("study_materials", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  storageKey: varchar("storageKey", { length: 512 }).notNull(),
  mimeType: varchar("mimeType", { length: 120 }).notNull(),
  byteSize: int("byteSize").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/** Extracted, privacy-scoped text sections used only by the owner's Rounds PDF Reader. */
export const studyMaterialSections = mysqlTable("study_material_sections", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  materialId: int("materialId").notNull(),
  position: int("position").notNull(),
  heading: varchar("heading", { length: 180 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => [uniqueIndex("study_material_sections_position").on(table.materialId, table.position)]);

export const academicProfiles = mysqlTable("academic_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  institutionName: varchar("institutionName", { length: 120 }).notNull(),
  program: varchar("program", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => [uniqueIndex("academic_profiles_user").on(table.userId)]);

export type CommunityPost = typeof communityPosts.$inferSelect;
export type CommunityReply = typeof communityReplies.$inferSelect;
export type CommunityNotification = typeof communityNotifications.$inferSelect;
export type StudyMaterial = typeof studyMaterials.$inferSelect;
export type StudyMaterialSection = typeof studyMaterialSections.$inferSelect;
export type AcademicProfile = typeof academicProfiles.$inferSelect;
export type RoundsAccount = typeof roundsAccounts.$inferSelect;
export type RoundsSession = typeof roundsSessions.$inferSelect;
