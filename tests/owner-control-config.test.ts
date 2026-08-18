import { describe, expect, it } from "vitest";
import { normalizeRoundsEmail } from "../shared/rounds-auth";

describe("Rounds Owner Control Center configuration", () => {
  it("has a valid normalized private owner email configured", () => {
    const ownerEmail = process.env.ROUNDS_OWNER_EMAIL;
    expect(ownerEmail).toBeTruthy();
    expect(normalizeRoundsEmail(ownerEmail ?? "")).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });
});
