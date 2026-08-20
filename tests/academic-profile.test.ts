import { describe, expect, it } from "vitest";
import { academicProfileProblem, academicProgramsForPortal, isAcademicProgram, isUniversityProgram, isUgandaHighSchoolProgram, portalForProgram, programPackFor, requiresAcademicOnboarding } from "../shared/academic-profile";

describe("academic profile", () => {
  it("accepts a university and a supported academic program", () => {
    expect(academicProfileProblem({ institutionName: "Kampala University", program: "nursing" })).toBeNull();
    expect(isAcademicProgram("engineering")).toBe(true);
  });

  it("requires a meaningful institution and recognized program", () => {
    expect(academicProfileProblem({ institutionName: " ", program: "nursing" })).toContain("university");
    expect(academicProfileProblem({ institutionName: "Kampala University", program: "law" })).toContain("program");
  });

  it("maps each learner to a distinct program-pack definition", () => {
    expect(programPackFor("nursing").available).toBe(true);
    expect(programPackFor("engineering").packTitle).toContain("Engineering");
    expect(requiresAcademicOnboarding(null)).toBe(true);
    expect(requiresAcademicOnboarding({ program: "unsupported" })).toBe(true);
    expect(requiresAcademicOnboarding({ program: "nursing" })).toBe(false);
  });

  it("recognises every coordinated Uganda high-school core program without treating a university program as high-school", () => {
    expect(isUgandaHighSchoolProgram("uganda_high_school_geography")).toBe(true);
    expect(isUgandaHighSchoolProgram("uganda_high_school_religion_ethics")).toBe(true);
    expect(isUgandaHighSchoolProgram("engineering")).toBe(false);
    expect(programPackFor("uganda_high_school_ict").available).toBe(true);
  });

  it("splits programs into non-mixed University and High School portals while keeping Nursing in University", () => {
    expect(portalForProgram("nursing")).toBe("university");
    expect(portalForProgram("uganda_high_school_biology")).toBe("high_school");
    expect(portalForProgram("unsupported")).toBeNull();
    expect(isUniversityProgram("nursing")).toBe(true);
    expect(isUniversityProgram("uganda_high_school_biology")).toBe(false);
    const university = academicProgramsForPortal("university");
    const highSchool = academicProgramsForPortal("high_school");
    expect(university.some((program) => program.id === "nursing")).toBe(true);
    expect(university.some((program) => program.id.startsWith("uganda_high_school_"))).toBe(false);
    expect(highSchool.every((program) => program.id.startsWith("uganda_high_school_"))).toBe(true);
  });
});
