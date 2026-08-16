import { readFile, writeFile } from "node:fs/promises";

const [sourcePath, normalizedPath, appBankPath, auditPath] = process.argv.slice(2);
if (!sourcePath || !normalizedPath || !appBankPath || !auditPath) {
  throw new Error("Usage: node scripts/process_answered_question_bank.mjs <raw.txt> <normalized.json> <app-bank.json> <audit.json>");
}

const categoryRules = [
  ["Maternity", /pregnan|labor|fetal|newborn|apgar|placenta|preeclamps|eclamps|umbilical|postpartum|gestation/i],
  ["Pediatrics", /child|infant|pediatric|adolescent|croup|bronchiolitis|immuniz|vaccine|school-age|toddler/i],
  ["Mental Health", /suicid|depress|anxiety|schizophren|psych|hallucinat|delusion|mania|bipolar|serotonin|therapy/i],
  ["Pharmacology", /medication|drug|antidote|dose|warfarin|heparin|opioid|acetaminophen|lithium|digoxin|phenytoin|isoniazid|insulin|antibiotic|ssri|maoi|benzodiazepine/i],
  ["Infection Control", /infection|isolation|precaution|hand hygiene|mrsa|tuberculosis|influenza|c\. ?diff|sterile|sepsis|catheter-associated|central line/i],
  ["Neurological", /stroke|seizure|intracranial|brain|neurolog|glasgow|gcs|aphasia|mening|parkinson|spinal cord|dementia/i],
  ["Cardiac", /heart|cardiac|ecg|arrhythm|ventricular|atrial|myocard|angina|chest pain|blood pressure|hypertension|hypotension|perfusion/i],
  ["Respiratory", /respirat|oxygen|hypoxi|asthma|copd|pneumothorax|breath sound|wheez|ventilat|tracheostomy|dyspnea|airway/i],
  ["Endocrine", /diabetes|glucose|thyroid|ketoacidosis|hypoglyc|hyperglyc|adrenal|cushing|insulin/i],
  ["Renal", /renal|kidney|dialysis|urine|urinary|potassium|sodium|calcium|magnesium|electrolyte|fluid volume/i],
  ["Gastrointestinal", /abdominal|liver|bowel|gastric|gerd|ulcer|appendic|pancrea|stool|nutrition|tube feeding|peg/i],
  ["Critical Care", /icu|critical|shock|ventilator|peep|arterial blood gas|hemodynamic|vasopressor|central venous/i],
  ["Emergency", /emergency|trauma|anaphylaxis|hemorrhage|cpr|defibrill|rapid response|primary survey|tension pneumothorax/i],
  ["Prioritization", /priority|triage|delegat|maslow|which patient|see first|sbar|abc framework|nursing process/i],
];

const categoryConcepts = {
  "Fundamentals": ["Assessment", "Patient safety"],
  "Pharmacology": ["Medication safety", "Therapeutic monitoring"],
  "Cardiac": ["Circulation", "Cardiovascular assessment"],
  "Respiratory": ["Oxygenation", "Airway assessment"],
  "Endocrine": ["Metabolic regulation", "Glucose monitoring"],
  "Renal": ["Fluid balance", "Electrolyte monitoring"],
  "Maternity": ["Maternal assessment", "Fetal well-being"],
  "Pediatrics": ["Growth and development", "Family-centered care"],
  "Mental Health": ["Therapeutic communication", "Safety assessment"],
  "Infection Control": ["Transmission prevention", "Standard precautions"],
  "Emergency": ["Rapid assessment", "Life-threatening conditions"],
  "Critical Care": ["Hemodynamic monitoring", "Escalation of care"],
  "Prioritization": ["Clinical judgment", "Nursing delegation"],
  "Gastrointestinal": ["Abdominal assessment", "Nutrition and elimination"],
  "Neurological": ["Neurologic assessment", "Time-sensitive care"],
};

const keywordStopWords = new Set(["the", "and", "for", "with", "that", "this", "from", "such", "are", "was", "also", "called", "about", "into", "then", "per", "most", "common", "patient", "nurse", "when", "after", "before", "using", "should", "must", "will", "may", "can", "not", "than", "one", "two", "three", "four", "five"]);

function clean(value) {
  return value.replace(/\f/g, " ").replace(/\s+/g, " ").replace(/\s+([,.;:!?])/g, "$1").trim();
}

function fingerprint(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

function categoryFor(question, answer) {
  const combined = `${question} ${answer}`;
  return categoryRules.find(([, rule]) => rule.test(combined))?.[0] ?? "Fundamentals";
}

function keywordsFor(answer) {
  const tokens = answer.toLowerCase().match(/[a-z0-9]+(?:-[a-z0-9]+)?/g) ?? [];
  const unique = [];
  for (const token of tokens) {
    if ((token.length < 3 && !/^(?:\d+|[a-z]\d+)$/i.test(token)) || keywordStopWords.has(token) || unique.includes(token)) continue;
    unique.push(token);
    if (unique.length === 5) break;
  }
  return unique.length >= 2 ? unique : [...unique, "assessment"].slice(0, 2);
}

const raw = (await readFile(sourcePath, "utf8")).replace(/\r/g, "").replace(/\f/g, "\n");
const markers = [...raw.matchAll(/(?:^|\n)\s*nur-(\d{3,4})\s*\n/g)];
const parsed = markers.map((marker, index) => {
  const start = (marker.index ?? 0) + marker[0].length;
  const end = index + 1 < markers.length ? (markers[index + 1].index ?? raw.length) : raw.length;
  const block = raw.slice(start, end);
  const questionStart = block.indexOf("Q:");
  const answerStart = block.indexOf("A:", questionStart + 2);
  return {
    id: `nur-${marker[1].padStart(3, "0")}`,
    q: questionStart >= 0 && answerStart >= 0 ? clean(block.slice(questionStart + 2, answerStart)) : "",
    a: answerStart >= 0 ? clean(block.slice(answerStart + 2)) : "",
  };
});

const invalid = parsed.filter((record) => !record.q || !record.a);
const ids = new Set(parsed.map((record) => record.id));
if (parsed.length !== 1000 || ids.size !== 1000 || invalid.length) {
  throw new Error(`Expected 1,000 complete unique Q&A records; parsed=${parsed.length}, uniqueIds=${ids.size}, invalid=${invalid.length}`);
}

const seenQuestions = new Map();
const unique = [];
const duplicateAudit = [];
for (const record of parsed) {
  const key = fingerprint(record.q);
  if (seenQuestions.has(key)) {
    duplicateAudit.push({ duplicateId: record.id, retainedId: seenQuestions.get(key), question: record.q });
    continue;
  }
  seenQuestions.set(key, record.id);
  const cat = categoryFor(record.q, record.a);
  unique.push({
    ...record,
    cat,
    keys: keywordsFor(record.a),
    context: `This question reinforces ${cat.toLowerCase()} nursing knowledge for safe NCLEX-style clinical reasoning.`,
    explanation: record.a,
    clinicalSignificance: `Recognizing this ${cat.toLowerCase()} concept supports timely assessment, safe escalation, and appropriate nursing action.`,
    relatedConcepts: categoryConcepts[cat],
  });
}

const categoryCounts = unique.reduce((counts, record) => ({ ...counts, [record.cat]: (counts[record.cat] ?? 0) + 1 }), {});
const audit = {
  sourceRecordCount: parsed.length,
  uniqueQuestionCount: unique.length,
  duplicateQuestionCount: duplicateAudit.length,
  duplicateQuestions: duplicateAudit,
  categoryCounts,
  answerlessRecords: invalid.map((record) => record.id),
};

await writeFile(normalizedPath, `${JSON.stringify({ source: "Rounds Nursing QA 1000", questions: parsed }, null, 2)}\n`);
await writeFile(appBankPath, `${JSON.stringify({ source: "Rounds Nursing QA 1000", questions: unique }, null, 2)}\n`);
await writeFile(auditPath, `${JSON.stringify(audit, null, 2)}\n`);
console.log(JSON.stringify(audit, null, 2));
