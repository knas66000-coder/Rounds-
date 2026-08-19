export const ACADEMIC_PROGRAMS = [
  { id: "nursing", title: "Nursing", faculty: "Health Sciences", packTitle: "Nursing practice pack", description: "NCLEX-style clinical scenarios, oral practice, adaptive remediation, and mock exams.", available: true },
  { id: "engineering", title: "Engineering", faculty: "Engineering and Technology", packTitle: "Engineering foundations pack", description: "Design constraints, systems thinking, technical communication, and structured problem-solving.", available: true },
  { id: "computing", title: "Computing", faculty: "Computing and Digital Skills", packTitle: "Computing foundations pack", description: "Clear requirements, logic, data thinking, and responsible digital decisions.", available: true },
  { id: "business", title: "Business", faculty: "Business and Entrepreneurship", packTitle: "Business foundations pack", description: "Customer evidence, decision cases, entrepreneurship, and responsible planning.", available: true },
  { id: "natural_sciences", title: "Natural Sciences", faculty: "Natural Sciences and Mathematics", packTitle: "Science foundations pack", description: "Observation, evidence, explanation, and structured scientific thinking.", available: true },
  { id: "education", title: "Education", faculty: "Education", packTitle: "Education foundations pack", description: "Observable learning goals, inclusive planning, and reflective practice.", available: true },
  { id: "social_sciences", title: "Social Sciences", faculty: "Social Sciences and Humanities", packTitle: "Social sciences foundations pack", description: "Claims, evidence, respectful interpretation, and research thinking.", available: true },
  { id: "foundation_year", title: "University Foundation Year", faculty: "Cross-program", packTitle: "Foundation Year pack", description: "Academic writing, digital literacy, study skills, statistics, and research methods.", available: true },
  { id: "uganda_high_school_biology", title: "High School Biology", faculty: "Uganda High School", packTitle: "Biology learning pack", description: "Original starter practice in observation, living systems, evidence, and explanation for Ugandan high-school learners.", available: true },
  { id: "uganda_high_school_chemistry", title: "High School Chemistry", faculty: "Uganda High School", packTitle: "Chemistry learning pack", description: "Original starter practice in particle ideas, patterns, variables, and careful chemical reasoning for Ugandan high-school learners.", available: true },
  { id: "uganda_high_school_economics", title: "High School Economics", faculty: "Uganda High School", packTitle: "Economics learning pack", description: "Original starter practice in scarcity, trade-offs, evidence, and clear economic reasoning for Ugandan high-school learners.", available: true },
  { id: "uganda_high_school_entrepreneurship", title: "High School Entrepreneurship", faculty: "Uganda High School", packTitle: "Entrepreneurship learning pack", description: "Original starter practice in customer evidence, costs, ethical choices, and responsible venture planning for Ugandan high-school learners.", available: true },
  { id: "uganda_high_school_english", title: "High School English", faculty: "Uganda High School", packTitle: "English language learning pack", description: "Original starter practice in reading, argument, source use, drafting, and revision for Ugandan high-school learners.", available: true },
  { id: "uganda_high_school_physics", title: "High School Physics", faculty: "Uganda High School", packTitle: "Physics learning pack", description: "Original starter practice in motion, measurements, patterns, forces, and evidence-based explanation for Ugandan high-school learners.", available: true },
  { id: "uganda_high_school_mathematics", title: "High School Mathematics", faculty: "Uganda High School", packTitle: "Mathematics learning pack", description: "Original starter practice in quantity, patterns, calculations, reasoning, and clear mathematical communication for Ugandan high-school learners.", available: true },
  { id: "uganda_high_school_geography", title: "High School Geography", faculty: "Uganda High School", packTitle: "Geography learning pack", description: "Original starter practice in place, maps, environments, data, and evidence-based geographic explanation for Ugandan high-school learners.", available: true },
  { id: "uganda_high_school_history_civics", title: "High School History and Civics", faculty: "Uganda High School", packTitle: "History and civics learning pack", description: "Original starter practice in historical sources, civic reasoning, timelines, claims, and respectful evidence use for Ugandan high-school learners.", available: true },
  { id: "uganda_high_school_ict", title: "High School ICT and Digital Skills", faculty: "Uganda High School", packTitle: "ICT and digital skills pack", description: "Original starter practice in digital information, data, safe choices, logic, and responsible technology use for Ugandan high-school learners.", available: true },
  { id: "uganda_high_school_agriculture", title: "High School Agriculture and Food Systems", faculty: "Uganda High School", packTitle: "Agriculture and food systems pack", description: "Original starter practice in observation, production systems, records, sustainability, and careful agricultural reasoning for Ugandan high-school learners.", available: true },
  { id: "uganda_high_school_religion_ethics", title: "High School Religious and Ethical Studies", faculty: "Uganda High School", packTitle: "Religious and ethical studies pack", description: "Original starter practice in values, respectful dialogue, evidence, community choices, and ethical reflection for Ugandan high-school learners.", available: true },
] as const;

export type AcademicProgramId = (typeof ACADEMIC_PROGRAMS)[number]["id"];
export type AcademicProfileInput = { institutionName: string; program: AcademicProgramId };

export function isAcademicProgram(value: string): value is AcademicProgramId {
  return ACADEMIC_PROGRAMS.some((program) => program.id === value);
}

export function isUgandaHighSchoolProgram(value: string): value is Extract<AcademicProgramId, `uganda_high_school_${string}`> {
  return value.startsWith("uganda_high_school_") && isAcademicProgram(value);
}

export function requiresAcademicOnboarding(profile: { program: string } | null | undefined): boolean {
  return !profile || !isAcademicProgram(profile.program);
}

export function academicProfileProblem(input: { institutionName: string; program: string }): string | null {
  const institution = input.institutionName.trim().replace(/\s+/g, " ");
  if (institution.length < 2 || institution.length > 120) return "Enter your school, university, or college name using 2 to 120 characters.";
  if (!isAcademicProgram(input.program)) return "Choose the program or subject you study.";
  return null;
}

export function programPackFor(programId: AcademicProgramId) {
  return ACADEMIC_PROGRAMS.find((program) => program.id === programId)!;
}
