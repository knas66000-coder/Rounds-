import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { transcribeAudio } from "./_core/voiceTranscription";
import { storageGetSignedUrl, storagePut } from "./storage";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { validateCommunityText } from "../shared/community-safety";

const MAX_AUDIO_BYTES = 16 * 1024 * 1024;
const supportedAudioTypes = ["audio/m4a", "audio/mp4", "audio/webm", "audio/wav", "audio/mpeg", "audio/ogg"] as const;

function extensionForAudioType(mimeType: (typeof supportedAudioTypes)[number]) {
  const extensions: Record<(typeof supportedAudioTypes)[number], string> = {
    "audio/m4a": "m4a",
    "audio/mp4": "m4a",
    "audio/webm": "webm",
    "audio/wav": "wav",
    "audio/mpeg": "mp3",
    "audio/ogg": "ogg",
  };
  return extensions[mimeType];
}

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  voice: router({
    transcribe: publicProcedure
      .input(z.object({
        base64Audio: z.string().min(1).max(23 * 1024 * 1024),
        mimeType: z.enum(supportedAudioTypes),
      }))
      .mutation(async ({ input }) => {
        const audioBytes = Buffer.from(input.base64Audio, "base64");
        if (audioBytes.length === 0 || audioBytes.length > MAX_AUDIO_BYTES) {
          throw new TRPCError({
            code: "PAYLOAD_TOO_LARGE",
            message: "Please keep each spoken answer under 16 MB.",
          });
        }

        const filename = `rounds-transcriptions/${crypto.randomUUID()}.${extensionForAudioType(input.mimeType)}`;
        const stored = await storagePut(filename, audioBytes, input.mimeType);
        const audioUrl = await storageGetSignedUrl(stored.key);
        const result = await transcribeAudio({
          audioUrl,
          language: "en",
          prompt: "Transcribe a nursing student's spoken NCLEX practice answer. Preserve clinical terms, vital-sign values, medication names, and abbreviations exactly when possible.",
        });

        if ("error" in result) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: result.error,
            cause: result,
          });
        }

        return { text: result.text.trim(), language: result.language ?? "en" };
      }),
  }),

  community: router({
    list: protectedProcedure.query(({ ctx }) => db.listCommunityPosts(ctx.user.id)),
    createPost: protectedProcedure.input(z.object({ kind: z.enum(["study_win", "study_tip", "encouragement"]), content: z.string().min(2).max(600) })).mutation(async ({ ctx, input }) => {
      const checked = validateCommunityText(input.content, 600);
      if (!checked.valid) throw new TRPCError({ code: "BAD_REQUEST", message: checked.message });
      await db.createCommunityPost(ctx.user.id, input.kind, checked.value);
      return { success: true };
    }),
    toggleReaction: protectedProcedure.input(z.object({ postId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const result = await db.toggleCommunityReaction(ctx.user.id, input.postId);
      if (result.missing) throw new TRPCError({ code: "NOT_FOUND", message: "This study update is no longer available." });
      if (result.active) await db.createCommunityNotificationForPostOwner(ctx.user.id, input.postId, "reaction");
      return result;
    }),
    listReplies: protectedProcedure.input(z.object({ postId: z.number().int().positive() })).query(({ ctx, input }) => db.listCommunityReplies(input.postId, ctx.user.id)),
    createReply: protectedProcedure.input(z.object({ postId: z.number().int().positive(), content: z.string().min(2).max(400) })).mutation(async ({ ctx, input }) => {
      const checked = validateCommunityText(input.content, 400);
      if (!checked.valid) throw new TRPCError({ code: "BAD_REQUEST", message: checked.message });
      const created = await db.createCommunityReply(ctx.user.id, input.postId, checked.value);
      if (!created) throw new TRPCError({ code: "NOT_FOUND", message: "This study update is no longer available." });
      await db.createCommunityNotificationForPostOwner(ctx.user.id, input.postId, "reply");
      return { success: true };
    }),
    deletePost: protectedProcedure.input(z.object({ postId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const deleted = await db.deleteCommunityPost(ctx.user.id, input.postId);
      if (!deleted) throw new TRPCError({ code: "FORBIDDEN", message: "Only your own active study update can be deleted." });
      return { success: true };
    }),
    deleteReply: protectedProcedure.input(z.object({ replyId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const deleted = await db.deleteCommunityReply(ctx.user.id, input.replyId);
      if (!deleted) throw new TRPCError({ code: "FORBIDDEN", message: "Only your own active reply can be deleted." });
      return { success: true };
    }),
    report: protectedProcedure.input(z.object({ targetType: z.enum(["post", "reply"]), targetId: z.number().int().positive(), reason: z.enum(["privacy", "harassment", "exam_content", "solicitation", "other"]) })).mutation(async ({ ctx, input }) => {
      await db.createCommunityReport(ctx.user.id, input.targetType, input.targetId, input.reason);
      return { success: true };
    }),
  }),

  notifications: router({
    list: protectedProcedure.query(({ ctx }) => db.listCommunityNotifications(ctx.user.id)),
    unreadCount: protectedProcedure.query(({ ctx }) => db.communityNotificationUnreadCount(ctx.user.id)),
    markRead: protectedProcedure.input(z.object({ notificationId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      await db.markCommunityNotificationRead(ctx.user.id, input.notificationId);
      return { success: true };
    }),
    markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
      await db.markAllCommunityNotificationsRead(ctx.user.id);
      return { success: true };
    }),
    preferences: protectedProcedure.query(({ ctx }) => db.getCommunityNotificationPreferences(ctx.user.id)),
    updatePreferences: protectedProcedure.input(z.object({ reactionAlerts: z.boolean(), replyAlerts: z.boolean() })).mutation(({ ctx, input }) => db.updateCommunityNotificationPreferences(ctx.user.id, input)),
  }),

});

export type AppRouter = typeof appRouter;
