import { describe, expect, it } from "vitest";

import { createLocalDocument, resolveReaderCommand, searchLocalDocument } from "./document-search";

describe("local document search", () => {
  const document = createLocalDocument({
    title: "Installation Guide",
    kind: "markdown",
    pages: [
      "Installation begins with a local setup.\n\nOpen the settings page and select your document.\n\nPrivacy mode keeps imported files on the device.",
      "Troubleshooting starts with checking the document title.\n\nRestart the local reader if import is interrupted.",
    ],
  });

  it("returns the closest local passage for a phrase", () => {
    const results = searchLocalDocument(document, "local setup");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].passage.page).toBe(1);
    expect(results[0].excerpt).toContain("local setup");
  });

  it("does not return results for an unrelated query", () => {
    expect(searchLocalDocument(document, "weather forecast")).toEqual([]);
  });
});

describe("reader command resolver", () => {
  it("recognizes supported deterministic commands", () => {
    expect(resolveReaderCommand("search for installation steps")).toEqual({
      type: "search",
      query: "installation steps",
    });
    expect(resolveReaderCommand("read page 4")).toEqual({ type: "readPage", page: 4 });
    expect(resolveReaderCommand("read the next result")).toEqual({ type: "nextResult" });
  });
});
