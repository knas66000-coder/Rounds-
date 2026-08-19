import { describe, expect, it } from "vitest";
import { canAccessOwnerControl, isRoundsOwnerEmail, OWNER_CONTROL_PACKS, ownerPackStatusLabel } from "../shared/owner-control";

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

  it("shows only high-level active pack metadata for the Uganda high-school specialist elective wave", () => {
    const highSchool = OWNER_CONTROL_PACKS.find((pack) => pack.id === "uganda-high-school");
    expect(highSchool?.status).toBe("active");
    expect(highSchool?.detail).toContain("Kiswahili");
    expect(highSchool?.detail).toContain("Technical Drawing");
  });
});
