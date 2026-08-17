export type GroundedReferenceInput = {
  supported?: unknown;
  excerpt?: unknown;
  explanation?: unknown;
};

export type GroundedReference = {
  supported: boolean;
  excerpt: string;
  explanation: string;
};

export function normalizeGroundedReference(input: GroundedReferenceInput): GroundedReference {
  if (input.supported !== true || typeof input.excerpt !== "string") return { supported: false, excerpt: "", explanation: "" };
  const excerpt = input.excerpt.trim().replace(/\s+/g, " ").slice(0, 240);
  if (!excerpt) return { supported: false, excerpt: "", explanation: "" };
  const explanation = typeof input.explanation === "string" ? input.explanation.trim().replace(/\s+/g, " ").slice(0, 240) : "";
  return { supported: true, excerpt, explanation };
}
