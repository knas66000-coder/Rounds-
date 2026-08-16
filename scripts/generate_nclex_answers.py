import argparse
import concurrent.futures
import json
import os
import time
from pathlib import Path

from openai import OpenAI


CATEGORIES = [
    "Fundamentals", "Pharmacology", "Cardiac", "Respiratory", "Endocrine",
    "Renal", "Maternity", "Pediatrics", "Mental Health", "Infection Control",
    "Emergency", "Critical Care", "Prioritization", "Gastrointestinal", "Neurological",
]

SYSTEM_PROMPT = """You create educational NCLEX nursing practice content from source questions that do not include answers.
Return cautious, current, broadly accepted NCLEX-level answers. Do not invent a patient-specific plan. Preserve the original question text exactly in no field; use the supplied id to map records.
Select exactly one allowed nursing category. Provide a concise answer (normally one sentence), 2-5 simple literal grading keywords, a short learning context, a precise rationale, and a brief clinical-significance statement. If a source question is ambiguous or varies by institution, state the safest commonly taught NCLEX framing and set needsReview to true. Use respectful, non-stigmatizing language. This is exam-study content, not individualized medical advice."""


def schema_for(batch_size: int):
    record = {
        "type": "object",
        "properties": {
            "id": {"type": "string"},
            "cat": {"type": "string", "enum": CATEGORIES},
            "a": {"type": "string"},
            "keys": {"type": "array", "items": {"type": "string"}, "minItems": 2, "maxItems": 5},
            "context": {"type": "string"},
            "explanation": {"type": "string"},
            "clinicalSignificance": {"type": "string"},
            "relatedConcepts": {"type": "array", "items": {"type": "string"}, "minItems": 2, "maxItems": 4},
            "needsReview": {"type": "boolean"},
        },
        "required": ["id", "cat", "a", "keys", "context", "explanation", "clinicalSignificance", "relatedConcepts", "needsReview"],
        "additionalProperties": False,
    }
    return {
        "type": "json_schema",
        "json_schema": {
            "name": "nclex_answer_batch",
            "strict": True,
            "schema": {
                "type": "object",
                "properties": {"answers": {"type": "array", "items": record, "minItems": batch_size, "maxItems": batch_size}},
                "required": ["answers"],
                "additionalProperties": False,
            },
        },
    }


def generate_batch(client: OpenAI, model: str, batch, output_path: Path):
    if output_path.exists():
        return "cached"
    prompt = "Allowed categories: " + ", ".join(CATEGORIES) + "\n\nSource questions:\n" + json.dumps(batch, ensure_ascii=False)
    for attempt in range(4):
        try:
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                response_format=schema_for(len(batch)),
                max_completion_tokens=6000,
            )
            if not response.choices:
                raise ValueError(f"Model returned no choices: {response.model_dump_json()}")
            content = response.choices[0].message.content
            if not content:
                raise ValueError(f"Model returned empty content: {response.model_dump_json()}")
            parsed = json.loads(content)
            answers = parsed["answers"]
            expected_ids = {item["id"] for item in batch}
            actual_ids = {item["id"] for item in answers}
            if expected_ids != actual_ids or len(answers) != len(batch):
                raise ValueError("Response ids did not match source batch")
            output_path.write_text(json.dumps({"answers": answers}, ensure_ascii=False, indent=2) + "\n", encoding="utf8")
            return "generated"
        except Exception as error:
            if attempt == 3:
                raise RuntimeError(f"{output_path.name} failed after retries: {error}") from error
            time.sleep(2 ** attempt)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--model", default="gpt-5-mini")
    parser.add_argument("--batch-size", type=int, default=10)
    parser.add_argument("--workers", type=int, default=5)
    parser.add_argument("--limit", type=int, default=0)
    args = parser.parse_args()

    source = json.loads(Path(args.input).read_text(encoding="utf8"))["questions"]
    if args.limit:
        source = source[: args.limit]
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    batches = [source[i:i + args.batch_size] for i in range(0, len(source), args.batch_size)]
    client = OpenAI()

    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as executor:
        jobs = [executor.submit(generate_batch, client, args.model, batch, output_dir / f"batch_{index:03d}.json") for index, batch in enumerate(batches)]
        completed = 0
        for future in concurrent.futures.as_completed(jobs):
            future.result()
            completed += 1
            if completed % 10 == 0 or completed == len(jobs):
                print(f"Completed {completed}/{len(jobs)} answer batches", flush=True)


if __name__ == "__main__":
    main()
