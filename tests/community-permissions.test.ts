import { describe, expect, it } from "vitest";
import { canManageCommunityContent } from "../shared/community-permissions";

describe("community ownership", () => {
  it("permits deletion only for the content owner", () => {
    expect(canManageCommunityContent(42, 42)).toBe(true);
    expect(canManageCommunityContent(42, 7)).toBe(false);
  });
});
