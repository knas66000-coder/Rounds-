import { describe, expect, it } from "vitest";
import { canAccessOwnerControl, isRoundsOwnerEmail, ownerPackStatusLabel } from "../shared/owner-control";

describe("Rounds Owner Control Center access rules", () => {
  it("requires both the configured owner email and the admin role", () => {
    const owner = "owner@rounds.example";
    expect(isRoundsOwnerEmail(" OWNER@ROUNDS.EXAMPLE ", owner)).toBe(true);
    expect(canAccessOwnerControl({ email: owner, role: "admin" }, owner)).toBe(true);
    expect(canAccessOwnerControl({ email: owner, role: "user" }, owner)).toBe(false);
    expect(canAccessOwnerControl({ email: "learner@rounds.example", role: "admin" }, owner)).toBe(false);
  });

  it("labels only configured active packs as active", () => {
    expect(ownerPackStatusLabel("active")).toBe("Active");
    expect(ownerPackStatusLabel("planned")).toBe("Planned");
  });
});
