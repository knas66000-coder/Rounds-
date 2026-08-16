import { readFile, writeFile } from "node:fs/promises";

const source = process.argv[2];
const destination = process.argv[3];

if (!source || !destination) {
  throw new Error("Usage: node scripts/parse_question_bank.mjs <source.txt> <destination.json>");
}

const raw = await readFile(source, "utf8");
const normalized = raw.replace(/\f/g, "\n").replace(/\r/g, "");
const matches = [...normalized.matchAll(/\bnur-(\d{3,4})\s*\n([\s\S]*?)(?=\n\s*nur-\d{3,4}\s*\n|$)/g)];

const questions = matches.map((match) => ({
  id: `nur-${match[1].padStart(3, "0")}`,
  sourceQuestion: match[2].replace(/\s+/g, " ").trim(),
})).filter((item) => item.sourceQuestion.length > 0);

const ids = new Set(questions.map((item) => item.id));
if (questions.length !== 1000 || ids.size !== 1000) {
  throw new Error(`Expected 1,000 unique questions; received ${questions.length} records and ${ids.size} unique IDs.`);
}

await writeFile(destination, `${JSON.stringify({ source: "Rounds Nursing Question Bank 1000", questions }, null, 2)}\n`);
console.log(`Parsed ${questions.length} unanswered questions into ${destination}`);
