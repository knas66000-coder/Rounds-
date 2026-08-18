import { describe, expect, it } from "vitest";
import { parseVoicePreferences, prepareLocalSpeech, rankInstalledEnglishVoices, resolveRoundsVoice } from "../lib/voice";

const voices = [
  { identifier: "ja-default", name: "Japanese English", language: "ja-JP", quality: "Enhanced" as const },
  { identifier: "gb-default", name: "British default", language: "en-GB", quality: "Default" as const },
  { identifier: "us-enhanced", name: "American enhanced", language: "en-US", quality: "Enhanced" as const },
  { identifier: "us-default", name: "American default", language: "en-US", quality: "Default" as const },
];

describe("Rounds local voice quality", () => {
  it("ignores non-English device voices and ranks preferred English variants with enhanced quality", () => {
    expect(rankInstalledEnglishVoices(voices).map((voice) => voice.identifier)).toEqual(["us-enhanced", "us-default", "gb-default"]);
  });

  it("keeps an explicit learner choice and falls back only when that installed voice disappears", () => {
    expect(resolveRoundsVoice(voices, "gb-default")?.identifier).toBe("gb-default");
    expect(resolveRoundsVoice(voices, "missing")?.identifier).toBe("us-enhanced");
    expect(resolveRoundsVoice([{ ...voices[0] }], null)).toBeNull();
  });

  it("preserves legacy preferences and makes common Nursing notation clearer for speech", () => {
    expect(parseVoicePreferences(JSON.stringify({ rate: 1, spokenRationale: false }))).toEqual({ rate: 1, spokenRationale: false, voiceIdentifier: null });
    expect(prepareLocalSpeech("Check BP, SpO2, IV fluids and 5 mg medication.")).toBe("Check blood pressure, S P O two, intravenous fluids and 5 milligrams medication.");
  });
});
