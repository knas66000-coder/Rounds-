import { describe, expect, it } from "vitest";
import { validateCommunityText } from "../shared/community-safety";

describe("community safety validation", () => {
  it("allows short respectful study support", () => {
    expect(validateCommunityText("Finished a focused pharm review today. Keep going!", 600)).toEqual({ valid: true, value: "Finished a focused pharm review today. Keep going!" });
  });

  it("blocks identifiers, recalled exam content, and contact details", () => {
    expect(validateCommunityText("My patient's MRN is 102030", 600).valid).toBe(false);
    expect(validateCommunityText("This was on the NCLEX yesterday", 600).valid).toBe(false);
    expect(validateCommunityText("Text me at 555-123-4567", 600).valid).toBe(false);
  });
});
