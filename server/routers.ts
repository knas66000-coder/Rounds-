import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { transcribeAudio } from "./_core/voiceTranscription";
import { storageGetSignedUrl, storagePut } from "./storage";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

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

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
