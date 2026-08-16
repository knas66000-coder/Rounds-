import { describe, expect, it } from "vitest";
import { bookmarkIds, parseBookmarks, toggleBookmark } from "../lib/bookmarks";

describe("bookmarks", () => {
  it("adds then removes an individual question without duplicating it", () => {
    const saved = toggleBookmark([], "nur-001", "2026-08-16T00:00:00.000Z");
    expect(bookmarkIds(saved)).toEqual(["nur-001"]);
    expect(toggleBookmark(saved, "nur-001")).toEqual([]);
  });

  it("recovers safely from invalid locally persisted bookmark data", () => {
    expect(parseBookmarks("not-json")).toEqual([]);
    expect(parseBookmarks(JSON.stringify([{ questionId: "nur-004", savedAt: "x" }]))).toHaveLength(1);
  });
});
