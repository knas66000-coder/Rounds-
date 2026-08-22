import { describe, expect, it } from "vitest";

import { answerFromLocalDocument, generateStudyQuestions } from "./document-assistant";
import { createLocalDocument } from "./document-search";

const document = createLocalDocument({
  title: "Private Setup Guide",
  kind: "markdown",
  pages: [
    "Installation begins with local setup. Before you begin, review the requirements carefully.\n\nPrivacy mode keeps imported files on the device. The reader does not upload the document.",
  ],
});

describe("source-grounded local answers", () => {
  it("answers from the closest local passage and keeps a source", () => {
    const answer = answerFromLocalDocument(document, "What should I do before installation?");
    expect(answer.status).toBe("grounded");
    expect(answer.source?.page).toBe(1);
    expect(answer.answer).toContain("Installation begins");
  });

  it("does not fabricate an answer when the document has no evidence", () => {
    const answer = answerFromLocalDocument(document, "What is the weather tomorrow?");
    expect(answer.status).toBe("not_found");
    expect(answer.source).toBeNull();
  });
});

describe("study question generator", () => {
  it("creates questions that retain their local passage source", () => {
    const questions = generateStudyQuestions(document.passages[0]);
    expect(questions.length).toBeGreaterThan(0);
    expect(questions[0].sourcePassageId).toBe(document.passages[0].id);
    expect(questions[0].answer.length).toBeGreaterThan(10);
  });
});
