import { describe, expect, it } from "vitest";
import { clampSpeechRate, parseVoicePreferences, prepareQuestionSpeech } from "../lib/voice";

describe("voice utilities", () => {
  it("keeps saved speech pace within the accessible range", () => {
    expect(clampSpeechRate(0.2)).toBe(0.72);
    expect(clampSpeechRate(1.6)).toBe(1.15);
    expect(parseVoicePreferences('{"rate":0.88}').rate).toBe(0.88);
  });

  it("prepares an understandable question cue for spoken practice", () => {
    expect(prepareQuestionSpeech("Keep BP ≥ 90°?")).toContain("greater than or equal to 90 degrees");
    expect(prepareQuestionSpeech("What is first?")).toContain("Pause to think");
  });
});
