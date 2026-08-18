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

export const COURSE_PACKS: CoursePack[] = [
  {
    id: "nursing-practice",
    revision: "embedded-nursing-v1",
    title: "Nursing Practice",
    faculty: "Health Sciences",
    description: "The active Nursing reference pack with clinical scenarios, spoken practice, adaptive remediation, and mock exams.",
    audience: ["nursing"],
    readiness: "active",
    delivery: "embedded",
    courses: [{ id: "nclex-practice", title: "NCLEX Practice", summary: "Existing reviewed Rounds Nursing practice and assessment activities.", activityKinds: ["recall", "scenario", "oral_practice", "timed_assessment"], contentState: "active" }],
  },
  {
    id: "university-foundation-year",
    revision: "catalog-v1",
    title: "University Foundation Year",
    faculty: "Cross-program",
    description: "A shared course sequence for academic, digital, quantitative, research, and professional learning foundations.",
    audience: "all_university",
    readiness: "catalog",
    delivery: "not_downloadable",
    courses: [
      { id: "academic-writing", title: "Academic Writing and Referencing", summary: "Arguments, evidence, citation practice, and revision planning.", activityKinds: ["evidence_reading", "writing_planner"], contentState: "review_pending" },
      { id: "quantitative-literacy", title: "Quantitative Literacy and Statistics", summary: "Ratios, percentages, graphs, and introductory statistics.", activityKinds: ["worked_calculation", "evidence_reading"], contentState: "review_pending" },
      { id: "research-methods", title: "Research Methods and Information Quality", summary: "Research questions, variables, methods, ethics, and source evaluation.", activityKinds: ["scenario", "evidence_reading"], contentState: "review_pending" },
      { id: "digital-literacy", title: "Digital Literacy and Privacy", summary: "Files, documents, spreadsheets, account safety, and information quality.", activityKinds: ["scenario", "recall"], contentState: "review_pending" },
      { id: "study-strategies", title: "Study and Learning Strategies", summary: "Retrieval practice, planning, notes, and examination routines.", activityKinds: ["writing_planner", "recall"], contentState: "review_pending" },
      { id: "professional-communication", title: "Professional Communication", summary: "Audience, email, presentation planning, and group communication.", activityKinds: ["writing_planner", "oral_practice"], contentState: "review_pending" },
      { id: "academic-ethics", title: "Ethics and Academic Integrity", summary: "Consent, attribution, fairness, and responsible technology use.", activityKinds: ["scenario", "evidence_reading"], contentState: "review_pending" },
      { id: "entrepreneurship", title: "Entrepreneurship Foundations", summary: "Opportunity, customers, value, costs, and simple planning.", activityKinds: ["scenario", "worked_calculation"], contentState: "review_pending" },
    ],
  },
  {
    id: "computing-foundations",
    revision: "roadmap-v1",
    title: "Computing Foundations",
    faculty: "Computing and Digital Skills",
    description: "The first specialist pilot for programming, data, web, networks, and responsible AI.",
    audience: ["computing"],
    readiness: "planned",
    delivery: "not_downloadable",
    courses: [{ id: "computing-preview", title: "Computing Course Sequence", summary: "Programming, data and spreadsheet skills, web foundations, networks, and AI ethics.", activityKinds: ["logic_trace", "scenario", "evidence_reading"], contentState: "planned" }],
  },
  {
    id: "business-foundations",
    revision: "roadmap-v1",
    title: "Business Foundations",
    faculty: "Business and Entrepreneurship",
    description: "A specialist pilot for decision cases, quantitative business basics, and entrepreneurship.",
    audience: ["business"],
    readiness: "planned",
    delivery: "not_downloadable",
    courses: [{ id: "business-preview", title: "Business Course Sequence", summary: "Accounting, economics, management, marketing, and entrepreneurship.", activityKinds: ["scenario", "worked_calculation", "writing_planner"], contentState: "planned" }],
  },
  {
    id: "engineering-foundations",
    revision: "roadmap-v1",
    title: "Engineering Foundations",
    faculty: "Engineering and Technology",
    description: "A specialist pilot for systems thinking, design reasoning, technical communication, and review-ready calculation activities.",
    audience: ["engineering"],
    readiness: "planned",
    delivery: "not_downloadable",
    courses: [{ id: "engineering-preview", title: "Engineering Course Sequence", summary: "Engineering mathematics, design process, systems, technical communication, and safety.", activityKinds: ["worked_calculation", "logic_trace", "writing_planner"], contentState: "planned" }],
  },
  {
    id: "health-sciences",
    revision: "roadmap-v1",
    title: "Health Sciences",
    faculty: "Health Sciences",
    description: "A reviewed expansion track for foundational health-science units; this will not reuse Nursing clinical questions.",
    audience: ["natural_sciences"],
    readiness: "planned",
    delivery: "not_downloadable",
    courses: [{ id: "health-preview", title: "Health Sciences Course Sequence", summary: "Anatomy and physiology, nutrition and public health, and other reviewer-approved units.", activityKinds: ["recall", "scenario", "evidence_reading"], contentState: "planned" }],
  },
];

export function coursePacksForProgram(program: AcademicProgramId): CoursePack[] {
  return COURSE_PACKS.filter((pack) => pack.audience === "all_university" || pack.audience.includes(program));
}

export function coursePackReadinessLabel(readiness: CoursePackReadiness): string {
  if (readiness === "active") return "ACTIVE";
  if (readiness === "catalog") return "CATALOG PREVIEW";
  return "PLANNED";
}

export function courseActivityLabel(kind: CourseActivityKind): string {
  return ({ recall: "Recall", worked_calculation: "Worked steps", scenario: "Decision case", evidence_reading: "Evidence reading", writing_planner: "Writing planner", logic_trace: "Logic trace", oral_practice: "Oral practice", timed_assessment: "Timed assessment" })[kind];
}
