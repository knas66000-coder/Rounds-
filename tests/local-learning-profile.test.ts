import { describe, expect, it } from "vitest";

import { createLocalLearningProfile, parseLocalLearningProfile } from "../lib/local-learning-profile";

describe("local learning profile", () => {
  it("creates a valid on-device profile without an account identifier", () => {
    const profile = createLocalLearningProfile({ institutionName: "  Lakeside College  ", program: "computing" }, "2026-08-20T00:00:00.000Z");
    expect(profile).toEqual({ schemaVersion: 1, institutionName: "Lakeside College", program: "computing", updatedAt: "2026-08-20T00:00:00.000Z" });
    expect("email" in profile).toBe(false);
  });

  it("rejects malformed or invalid local profiles without selecting another learner's program", () => {
    expect(parseLocalLearningProfile('{"schemaVersion":1,"institutionName":"Lakeside","program":"not-real","updatedAt":"2026-08-20"}')).toBeNull();
    expect(parseLocalLearningProfile('{"schemaVersion":1,"institutionName":"","program":"nursing","updatedAt":"2026-08-20"}')).toBeNull();
    expect(parseLocalLearningProfile("not-json")).toBeNull();
  });
});
