import { readdir, readFile, writeFile } from "node:fs/promises";

const [inputPath, answersPath, destinationPath] = process.argv.slice(2);
if (!inputPath || !answersPath || !destinationPath) throw new Error("Usage: node scripts/merge_nclex_answers.mjs <questions.json> <answer-dir> <out.json>");

const source = JSON.parse(await readFile(inputPath, "utf8")).questions;
const files = (await readdir(answersPath)).filter((file) => /^batch_\d+\.json$/.test(file)).sort();
const generated = (await Promise.all(files.map(async (file) => JSON.parse(await readFile(`${answersPath}/${file}`, "utf8")).answers))).flat();
const byId = new Map(generated.map((answer) => [answer.id, answer]));
const missing = source.filter((question) => !byId.has(question.id)).map((question) => question.id);
if (missing.length) throw new Error(`Missing answer records: ${missing.slice(0, 20).join(", ")}${missing.length > 20 ? "…" : ""}`);
const questions = source.map((question) => ({ ...question, ...byId.get(question.id) }));
if (questions.length !== source.length) throw new Error("Record count mismatch");
await writeFile(destinationPath, `${JSON.stringify({ source: "Rounds Nursing Question Bank 1000", questions }, null, 2)}\n`);
console.log(`Merged ${questions.length} answer-keyed nursing questions into ${destinationPath}`);
