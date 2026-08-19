import { describe, expect, it } from "vitest";

import { hasCommunityProfile, shouldQueryCommunityData } from "../shared/local-first-access";

describe("local-first access boundary", () => {
  it("keeps private learning independent while community data requires an opted-in account", () => {
    expect(hasCommunityProfile(false)).toBe(false);
    expect(shouldQueryCommunityData(false)).toBe(false);
    expect(hasCommunityProfile(true)).toBe(true);
    expect(shouldQueryCommunityData(true)).toBe(true);
  });
});
