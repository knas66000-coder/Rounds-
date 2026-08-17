export const MAX_STUDY_MATERIAL_BYTES = 4 * 1024 * 1024;
export const STUDY_MATERIAL_MIME_TYPE = "application/pdf" as const;

export function studyMaterialProblem(input: { mimeType?: string | null; size?: number | null }): string | null {
  if (input.mimeType && input.mimeType !== STUDY_MATERIAL_MIME_TYPE) return "Choose a PDF study material.";
  if (input.size && input.size > MAX_STUDY_MATERIAL_BYTES) return "Choose a PDF smaller than 4 MB.";
  return null;
}
