export const ACADEMIC_PROGRAMS = [
  { id: "nursing", title: "Nursing", faculty: "Health Sciences", packTitle: "Nursing practice pack", description: "NCLEX-style clinical scenarios, oral practice, adaptive remediation, and mock exams.", available: true },
  { id: "engineering", title: "Engineering", faculty: "Engineering and Technology", packTitle: "Engineering foundations pack", description: "Mathematics, design reasoning, systems thinking, and technical problem-solving.", available: false },
  { id: "computing", title: "Computing", faculty: "Computing and Digital Skills", packTitle: "Computing foundations pack", description: "Programming, data, networks, cybersecurity, and digital ethics.", available: false },
  { id: "business", title: "Business", faculty: "Business and Entrepreneurship", packTitle: "Business foundations pack", description: "Accounting, economics, management, entrepreneurship, and decision cases.", available: false },
  { id: "natural_sciences", title: "Natural Sciences", faculty: "Natural Sciences and Mathematics", packTitle: "Science foundations pack", description: "Biology, chemistry, physics, mathematics, and statistics.", available: false },
  { id: "education", title: "Education", faculty: "Education", packTitle: "Education foundations pack", description: "Learning theory, assessment, inclusive practice, and classroom scenarios.", available: false },
  { id: "social_sciences", title: "Social Sciences", faculty: "Social Sciences and Humanities", packTitle: "Social sciences foundations pack", description: "Psychology, sociology, research methods, communication, and ethics.", available: false },
  { id: "foundation_year", title: "University Foundation Year", faculty: "Cross-program", packTitle: "Foundation Year pack", description: "Academic writing, study skills, digital literacy, statistics, and research methods.", available: false },
] as const;

export type AcademicProgramId = (typeof ACADEMIC_PROGRAMS)[number]["id"];
export type AcademicProfileInput = { institutionName: string; program: AcademicProgramId };

export function isAcademicProgram(value: string): value is AcademicProgramId {
  return ACADEMIC_PROGRAMS.some((program) => program.id === value);
}

export function requiresAcademicOnboarding(profile: { program: string } | null | undefined): boolean {
  return !profile || !isAcademicProgram(profile.program);
}

export function academicProfileProblem(input: { institutionName: string; program: string }): string | null {
  const institution = input.institutionName.trim().replace(/\s+/g, " ");
  if (institution.length < 2 || institution.length > 120) return "Enter your university or college name using 2 to 120 characters.";
  if (!isAcademicProgram(input.program)) return "Choose the academic program you study.";
  return null;
}

export function programPackFor(programId: AcademicProgramId) {
  return ACADEMIC_PROGRAMS.find((program) => program.id === programId)!;
}
