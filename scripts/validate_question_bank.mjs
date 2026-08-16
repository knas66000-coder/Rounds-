import { readFile } from "node:fs/promises";

const [unansweredPath, answeredPath, organizedPath] = process.argv.slice(2);
if (!unansweredPath || !answeredPath || !organizedPath) throw new Error("Usage: node scripts/validate_question_bank.mjs <unanswered.json> <answered.json> <organized.json>");

const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
const unanswered = JSON.parse(await readFile(unansweredPath, "utf8")).questions;
const answered = JSON.parse(await readFile(answeredPath, "utf8")).questions;
const organized = JSON.parse(await readFile(organizedPath, "utf8")).questions;
const sourceById = new Map(unanswered.map((record) => [record.id, record]));
const answerById = new Map(answered.map((record) => [record.id, record]));
const mismatchIds = unanswered.filter((record) => !answerById.has(record.id) || normalize(record.sourceQuestion) !== normalize(answerById.get(record.id).q)).map((record) => record.id);
const questionTextCounts = new Map();
for (const record of organized) questionTextCounts.set(normalize(record.q), (questionTextCounts.get(normalize(record.q)) ?? 0) + 1);
const duplicateText = [...questionTextCounts.entries()].filter(([, count]) => count > 1).map(([question]) => question);
const malformed = organized.filter((record) => !record.id || !record.q || !record.a || !record.cat || !Array.isArray(record.keys) || record.keys.length < 2 || !record.explanation || !record.clinicalSignificance);
const extraIds = organized.filter((record) => !sourceById.has(record.id)).map((record) => record.id);
const report = {
  sourceCount: unanswered.length,
  answeredCount: answered.length,
  organizedCount: organized.length,
  questionTextMismatchIds: mismatchIds,
  duplicateQuestionTextCount: duplicateText.length,
  malformedRecordCount: malformed.length,
  malformedRecordIds: malformed.map((record) => record.id),
  unexpectedOrganizedIds: extraIds,
};
console.log(JSON.stringify(report, null, 2));
if (unanswered.length !== 1000 || answered.length !== 1000 || organized.length !== 1000 || mismatchIds.length || duplicateText.length || malformed.length || extraIds.length) process.exit(1);
