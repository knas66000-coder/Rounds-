import { describe, expect, it } from "vitest";
import { canUseStudyMaterial } from "../shared/study-material-permissions";

describe("private study-material ownership", () => {
  it("allows only the owning learner to use a material as a grounded source", () => {
    expect(canUseStudyMaterial(42, 42)).toBe(true);
    expect(canUseStudyMaterial(42, 7)).toBe(false);
  });
});
