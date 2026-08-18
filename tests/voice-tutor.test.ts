import { describe, expect, it } from "vitest";
import { buildVoiceTutorSystemPrompt, normalizeVoiceTutorHistory, normalizeVoiceTutorResponse, voiceTutorSafetyRedirect } from "../shared/voice-tutor";

describe("Rounds Voice Tutor safeguards", () => {
  it("redirects patient-specific, dosing, and emergency requests without model generation", () => {
    expect(voiceTutorSafetyRedirect("What should I give my patient with chest pain?")).toContain("not patient-specific");
    expect(voiceTutorSafetyRedirect("What dose should I administer?")).toContain("not patient-specific");
    expect(voiceTutorSafetyRedirect("This is an overdose emergency")).toContain("not patient-specific");
    expect(voiceTutorSafetyRedirect("Explain the purpose of an adaptive review round.")).toBeNull();
  });

  it("limits retained local context and keeps the tutor instruction study-focused", () => {
    const history = Array.from({ length: 9 }, (_, index) => ({ role: index % 2 ? "assistant" as const : "user" as const, content: `Turn ${index}` }));
    expect(normalizeVoiceTutorHistory(history)).toHaveLength(6);
    expect(buildVoiceTutorSystemPrompt()).toContain("general educational study support only");
  });

  it("accepts only a concise reply with an allowed study action", () => {
    const response = normalizeVoiceTutorResponse({ reply: "Adaptive Review lets you revisit questions that need another pass. Would you like to open it?", action: "adaptive_review" });
    expect(response).toEqual({ reply: "Adaptive Review lets you revisit questions that need another pass. Would you like to open it?", action: "adaptive_review", safetyRedirect: false });
    expect(normalizeVoiceTutorResponse({ reply: "Too short", action: "delete_everything" })).toBeNull();
  });
});
