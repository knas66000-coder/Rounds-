import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(scriptDirectory, "..");
const trainableDirectory = path.join(projectDirectory, "data", "voice-samples", "trainable");
const manifestPath = path.join(trainableDirectory, "manifest.json");

function fail(message) {
  console.error(`Dataset validation failed: ${message}`);
  process.exitCode = 1;
}

if (!fs.existsSync(manifestPath)) {
  fail("trainable manifest was not found.");
} else {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  let eligibleItemCount = 0;

  for (const item of manifest.items ?? []) {
    const audioPath = path.resolve(trainableDirectory, item.audioPath);
    const transcriptPath = path.resolve(trainableDirectory, item.transcriptPath);
    if (!fs.existsSync(audioPath)) fail(`${item.id}: audio file was not found at ${item.audioPath}.`);
    if (!fs.existsSync(transcriptPath)) {
      fail(`${item.id}: transcript file was not found at ${item.transcriptPath}.`);
      continue;
    }

    const lines = fs
      .readFileSync(transcriptPath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      fail(`${item.id}: transcript has no usable lines.`);
      continue;
    }

    if (item.trainingEligibility === "eligible-after-alignment") {
      eligibleItemCount += 1;
      console.log(`${item.id}: ${lines.length} transcript lines ready for local forced alignment.`);
    }
  }

  if (eligibleItemCount === 0) {
    fail("no authorised items are ready for forced alignment.");
  } else if (!process.exitCode) {
    console.log(`Dataset validation passed: ${eligibleItemCount} authorised recording set(s) are ready for the alignment stage.`);
  }
}
