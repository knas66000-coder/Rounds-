import { describe, expect, it } from "vitest";
import { normalizeGroundedReference } from "../shared/study-material-safety";
import { MAX_STUDY_MATERIAL_BYTES, studyMaterialProblem } from "../shared/study-material-validation";

describe("private study-material safeguards", () => {
  it("allows only small PDF study materials", () => {
    expect(studyMaterialProblem({ mimeType: "application/pdf", size: MAX_STUDY_MATERIAL_BYTES })).toBeNull();
    expect(studyMaterialProblem({ mimeType: "text/plain", size: 100 })).toContain("PDF");
    expect(studyMaterialProblem({ mimeType: "application/pdf", size: MAX_STUDY_MATERIAL_BYTES + 1 })).toContain("4 MB");
  });

  it("does not render a grounded citation without an explicit source excerpt", () => {
    expect(normalizeGroundedReference({ supported: true, excerpt: "", explanation: "Claim" })).toEqual({ supported: false, excerpt: "", explanation: "" });
    expect(normalizeGroundedReference({ supported: false, excerpt: "Quoted source" })).toEqual({ supported: false, excerpt: "", explanation: "" });
  });

  it("caps and normalizes displayed grounded material", () => {
    const result = normalizeGroundedReference({ supported: true, excerpt: "  Source\n excerpt  ", explanation: "  Direct\n support  " });
    expect(result).toEqual({ supported: true, excerpt: "Source excerpt", explanation: "Direct support" });
  });
});
