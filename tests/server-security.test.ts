import { describe, expect, it } from "vitest";
import { apiSecurityHeaders, isTrustedBrowserOrigin } from "../server/_core/security";

describe("Rounds API security boundary", () => {
  const production = { NODE_ENV: "production" };

  it("allows the deployed Rounds origin and rejects arbitrary browser origins in production", () => {
    expect(isTrustedBrowserOrigin("https://roundsnclex-mjcssreo.manus.space", production)).toBe(true);
    expect(isTrustedBrowserOrigin("https://attacker.example", production)).toBe(false);
    expect(isTrustedBrowserOrigin("not a URL", production)).toBe(false);
  });

  it("allows explicit preview origins without opening production to unrelated origins", () => {
    const environment = {
      NODE_ENV: "production",
      EXPO_WEB_PREVIEW_URL: "https://preview.rounds.example/path",
    };

    expect(isTrustedBrowserOrigin("https://preview.rounds.example", environment)).toBe(true);
    expect(isTrustedBrowserOrigin("https://other.rounds.example", environment)).toBe(false);
  });

  it("keeps local and sandbox origins available only during development", () => {
    expect(isTrustedBrowserOrigin("http://localhost:8081", { NODE_ENV: "development" })).toBe(true);
    expect(isTrustedBrowserOrigin("https://8081-abc.us5.manus.computer", { NODE_ENV: "development" })).toBe(true);
    expect(isTrustedBrowserOrigin("http://localhost:8081", production)).toBe(false);
  });

  it("returns a restrictive API header set and enables HSTS only in production", () => {
    const developmentHeaders = apiSecurityHeaders(false);
    const productionHeaders = apiSecurityHeaders(true);

    expect(developmentHeaders["Content-Security-Policy"]).toContain("default-src 'none'");
    expect(developmentHeaders["X-Content-Type-Options"]).toBe("nosniff");
    expect(developmentHeaders["Strict-Transport-Security"]).toBeUndefined();
    expect(productionHeaders["Strict-Transport-Security"]).toContain("max-age=31536000");
  });
});
