import { describe, expect, it } from "vitest";
import { normalizeRoundsEmail } from "../shared/rounds-auth";

describe("Rounds Owner Control Center configuration", () => {
  it("normalizes an owner email without requiring the private runtime address in source control", () => {
    const ownerEmail = process.env.ROUNDS_OWNER_EMAIL ?? "owner@rounds.invalid";
    expect(normalizeRoundsEmail(` ${ownerEmail.toUpperCase()} `)).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });
});
