import { describe, expect, it } from "vitest";
import { accountProblem, normalizeRoundsEmail, sessionIsExpired, signInProblem } from "../shared/rounds-auth";
import { hashRoundsPassword, newRoundsSession, verifyRoundsPassword } from "../server/rounds-auth";

describe("Rounds-native account validation", () => {
  it("normalizes account email and accepts a complete account", () => {
    expect(normalizeRoundsEmail(" Learner@Example.edu ")).toBe("learner@example.edu");
    expect(accountProblem({ name: "Amina Noor", email: "learner@example.edu", password: "safe-password-10" })).toBeNull();
  });

  it("rejects weak account fields and incomplete sign-in", () => {
    expect(accountProblem({ name: "A", email: "wrong", password: "short" })).toContain("name");
    expect(signInProblem("", "")).toContain("email and password");
  });

  it("treats elapsed opaque sessions as expired", () => {
    expect(sessionIsExpired(new Date("2026-01-01"), new Date("2026-01-02"))).toBe(true);
    expect(sessionIsExpired(new Date("2026-01-03"), new Date("2026-01-02"))).toBe(false);
  });

  it("stores passwords as one-way hashes and creates opaque session tokens", async () => {
    const password = "safe-password-10";
    const hash = await hashRoundsPassword(password);
    expect(hash).not.toContain(password);
    await expect(verifyRoundsPassword(password, hash)).resolves.toBe(true);
    await expect(verifyRoundsPassword("different-password", hash)).resolves.toBe(false);
    const session = newRoundsSession(new Date("2026-01-01T00:00:00.000Z"));
    expect(session.token).not.toBe(session.tokenHash);
    expect(session.tokenHash).toHaveLength(64);
    expect(session.expiresAt.toISOString()).toBe("2026-01-31T00:00:00.000Z");
  });
});
