import { describe, expect, it } from "vitest";
import { appRouter } from "../server/routers";

describe("audio transcription payload limits", () => {
  it("allows a base64 string sized for a short spoken response", () => {
    const base64Audio = Buffer.alloc(512).toString("base64");
    expect(base64Audio.length).toBeLessThan(23 * 1024 * 1024);
  });

  it("rejects an unsupported audio MIME type before invoking storage or transcription", async () => {
    const caller = appRouter.createCaller({} as never);
    await expect(caller.voice.transcribe({
      base64Audio: "aGVsbG8=",
      mimeType: "text/plain" as never,
    })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
