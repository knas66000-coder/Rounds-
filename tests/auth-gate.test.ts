import { describe, expect, it } from "vitest";
import { accessStateFor } from "../lib/auth-gate";

describe("secure access gate", () => {
  it("does not reveal protected app content until session resolution is complete", () => {
    expect(accessStateFor({ loading: true, isAuthenticated: false, isCallback: false })).toBe("loading");
    expect(accessStateFor({ loading: false, isAuthenticated: false, isCallback: false })).toBe("sign-in");
    expect(accessStateFor({ loading: false, isAuthenticated: true, isCallback: false })).toBe("app");
  });

  it("always permits the callback route to finish the secure session exchange", () => {
    expect(accessStateFor({ loading: true, isAuthenticated: false, isCallback: true })).toBe("callback");
  });
});
