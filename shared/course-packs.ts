import type { AcademicProgramId } from "./academic-profile";

export type CourseActivityKind = "recall" | "worked_calculation" | "scenario" | "evidence_reading" | "writing_planner" | "logic_trace" | "oral_practice" | "timed_assessment";
export type CoursePackReadiness = "active" | "catalog" | "planned";
export type CoursePackDelivery = "embedded" | "downloadable" | "not_downloadable";

export type CourseUnitPreview = {
  id: string;
  title: string;
  summary: string;
  activityKinds: CourseActivityKind[];
  contentState: "active" | "review_pending" | "planned";
};

export type CoursePack = {
  id: string;
  revision: string;
  title: string;
  faculty: string;
  description: string;
  audience: "all_university" | AcademicProgramId[];
  readiness: CoursePackReadiness;
  delivery: CoursePackDelivery;
  estimatedDownloadMb?: number;
  courses: CourseUnitPreview[];
};

const activeStarter = (id: string, title: string, summary: string, activityKinds: CourseActivityKind[]): CourseUnitPreview => ({ id, title, summary, activityKinds, contentState: "active" });

export const COURSE_PACKS: CoursePack[] = [
  {
    id: "nursing-practice", revision: "embedded-nursing-v1", title: "Nursing Practice", faculty: "Health Sciences", description: "The established Nursing reference pack with clinical scenarios, spoken practice, adaptive remediation, and mock exams.", audience: ["nursing"], readiness: "active", delivery: "embedded",
    courses: [activeStarter("nclex-practice", "NCLEX Practice", "Existing reviewed Rounds Nursing practice and assessment activities.", ["recall", "scenario", "oral_practice", "timed_assessment"])],
  },
  {
    id: "university-foundation-year", revision: "foundation-starter-v3", title: "University Foundation Year", faculty: "Cross-program", description: "A shared local foundation for academic, digital, research, communication, and quantitative learning.", audience: "all_university", readiness: "active", delivery: "downloadable", estimatedDownloadMb: 3,
    courses: [
      activeStarter("academic-writing", "Academic Writing and Referencing", "Read evidence carefully, then plan a clear academic response.", ["evidence_reading", "writing_planner"]),
      activeStarter("quantitative-literacy", "Quantitative Literacy and Statistics", "Ratios, percentages, graphs, and introductory statistics.", ["worked_calculation", "evidence_reading"]),
      { id: "research-methods", title: "Research Methods and Information Quality", summary: "Research questions, variables, methods, ethics, and source evaluation.", activityKinds: ["scenario", "evidence_reading"], contentState: "review_pending" },
      activeStarter("digital-literacy", "Digital Literacy and Privacy", "Practice clear, responsible decisions about information and digital work.", ["evidence_reading", "scenario"]),
      { id: "study-strategies", title: "Study and Learning Strategies", summary: "Retrieval practice, planning, notes, and examination routines.", activityKinds: ["writing_planner", "recall"], contentState: "review_pending" },
      { id: "professional-communication", title: "Professional Communication", summary: "Audience, email, presentation planning, and group communication.", activityKinds: ["writing_planner", "oral_practice"], contentState: "review_pending" },
      activeStarter("foundation-attribution-choice", "Ethics and Academic Integrity", "Use clear attribution and traceable source choices in academic work.", ["scenario", "evidence_reading"]),
      { id: "entrepreneurship", title: "Entrepreneurship Foundations", summary: "Opportunity, customers, value, costs, and simple planning.", activityKinds: ["scenario", "worked_calculation"], contentState: "review_pending" },
    ],
  },
  {
    id: "computing-foundations", revision: "computing-starter-v3", title: "Computing Foundations", faculty: "Computing and Digital Skills", description: "A local starter pack for clear technical reasoning, requirements, and responsible digital choices.", audience: ["computing"], readiness: "active", delivery: "embedded",
    courses: [activeStarter("computing-requirements", "Clear Problem Requirements", "Read a simple product brief and identify the information needed before building.", ["evidence_reading"]), activeStarter("computing-logic-trace", "Logic Trace", "Follow a simple rule sequence and identify the resulting action.", ["logic_trace"]), activeStarter("computing-accessibility-choice", "Accessibility Requirement", "Choose an inclusive requirement before a first version is built.", ["scenario"])],
  },
  {
    id: "business-foundations", revision: "business-starter-v3", title: "Business Foundations", faculty: "Business and Entrepreneurship", description: "A local starter pack for customer evidence, clear decision-making, and entrepreneurship thinking.", audience: ["business"], readiness: "active", delivery: "embedded",
    courses: [activeStarter("business-customer-evidence", "Customer Need Evidence", "Separate a customer observation from an unsupported business assumption.", ["evidence_reading", "scenario"]), activeStarter("business-break-even-basics", "Simple Break-even Count", "Work through a fixed-cost and contribution example.", ["worked_calculation"]), activeStarter("business-customer-consent", "Customer Contact Consent", "Choose a responsible use for contact details gathered for another purpose.", ["scenario"])],
  },
  {
    id: "engineering-foundations", revision: "engineering-starter-v3", title: "Engineering Foundations", faculty: "Engineering and Technology", description: "A local starter pack for constraints, structured design thinking, and clear technical communication.", audience: ["engineering"], readiness: "active", delivery: "embedded",
    courses: [activeStarter("engineering-design-constraints", "Design Constraints", "Plan a design response around requirements, limits, and evidence to gather.", ["writing_planner"]), activeStarter("engineering-constraint-order", "Constraint Order", "Trace the first stated design constraint before comparing preferences.", ["logic_trace"]), activeStarter("engineering-evidence-choice", "Evidence Before Selection", "Choose a responsible evidence step before selecting a design layout.", ["scenario"])],
  },
  {
    id: "natural-sciences-foundations", revision: "science-starter-v3", title: "Natural Sciences Foundations", faculty: "Natural Sciences and Mathematics", description: "A local starter pack for careful observation, explanation, and evidence-based science learning.", audience: ["natural_sciences"], readiness: "active", delivery: "embedded",
    courses: [activeStarter("science-observation-evidence", "Observation and Explanation", "Distinguish an observation from an explanation and identify the next useful evidence.", ["evidence_reading", "recall"]), activeStarter("science-mean-observation", "Simple Mean", "Calculate a mean from recorded observation values.", ["worked_calculation"]), activeStarter("science-replication-choice", "Repeat a Careful Observation", "Choose a transparent next step after an unexpected recorded result.", ["scenario"])],
  },
  {
    id: "education-foundations", revision: "education-starter-v3", title: "Education Foundations", faculty: "Education", description: "A local starter pack for observable learning goals, inclusive planning, and reflective teaching practice.", audience: ["education"], readiness: "active", delivery: "embedded",
    courses: [activeStarter("education-learning-objectives", "Observable Learning Objectives", "Turn a broad learning aim into a clear, observable learner objective.", ["writing_planner", "evidence_reading"]), activeStarter("education-check-for-understanding", "Check for Understanding", "Trace the learner evidence that matches an observable learning goal.", ["logic_trace"]), activeStarter("education-inclusive-choice", "Inclusive Learning Check", "Choose an accessible way for learners to show the same objective.", ["scenario"])],
  },
  {
    id: "social-sciences-foundations", revision: "social-sciences-starter-v3", title: "Social Sciences Foundations", faculty: "Social Sciences and Humanities", description: "A local starter pack for claims, evidence, respectful interpretation, and research thinking.", audience: ["social_sciences"], readiness: "active", delivery: "embedded",
    courses: [activeStarter("social-claims-evidence", "Claims and Supporting Evidence", "Identify the difference between a claim, an observation, and supporting evidence.", ["evidence_reading", "writing_planner"]), activeStarter("social-response-count", "Response Count", "Calculate and describe a small survey response percentage.", ["worked_calculation"]), activeStarter("social-context-choice", "Context-sensitive Interpretation", "Choose a responsible next interpretation of individual perspectives.", ["scenario"])],
  },
];

export function coursePacksForProgram(program: AcademicProgramId): CoursePack[] {
  return COURSE_PACKS.filter((pack) => pack.audience === "all_university" || pack.audience.includes(program));
}

export function coursePackForId(packId: string): CoursePack | null {
  return COURSE_PACKS.find((pack) => pack.id === packId) ?? null;
}

export function primaryCoursePackForProgram(program: AcademicProgramId): CoursePack | null {
  const packs = coursePacksForProgram(program);
  return packs.find((pack) => pack.audience !== "all_university") ?? packs.find((pack) => pack.id === "university-foundation-year") ?? null;
}

export function coursePackReadinessLabel(readiness: CoursePackReadiness): string {
  if (readiness === "active") return "ACTIVE";
  if (readiness === "catalog") return "CATALOG PREVIEW";
  return "PLANNED";
}

export function courseActivityLabel(kind: CourseActivityKind): string {
  return ({ recall: "Recall", worked_calculation: "Worked steps", scenario: "Decision case", evidence_reading: "Evidence reading", writing_planner: "Writing planner", logic_trace: "Logic trace", oral_practice: "Oral practice", timed_assessment: "Timed assessment" })[kind];
}
