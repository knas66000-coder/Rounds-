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
  audience: "all_university" | "all_high_school" | AcademicProgramId[];
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
  {
    id: "uganda-high-school-biology", revision: "ug-hs-biology-starter-v1", title: "High School Biology", faculty: "Uganda High School", description: "Original starter learning in observation, living systems, evidence, and explanation. It is not an official NCDC syllabus or laboratory guide.", audience: ["uganda_high_school_biology"], readiness: "active", delivery: "downloadable", estimatedDownloadMb: 2,
    courses: [activeStarter("biology-ecosystem-evidence", "Living Systems and Evidence", "Read an ecosystem observation and identify the evidence needed for a careful explanation.", ["evidence_reading"]), activeStarter("biology-sampling-count", "Simple Sampling Count", "Calculate a simple percentage from recorded field-observation counts.", ["worked_calculation"]), activeStarter("biology-investigation-choice", "Fair Investigation Choice", "Choose a careful next step when a biological observation raises a question.", ["scenario"])],
  },
  {
    id: "uganda-high-school-chemistry", revision: "ug-hs-chemistry-starter-v1", title: "High School Chemistry", faculty: "Uganda High School", description: "Original starter learning in particle ideas, measurement patterns, variables, and careful chemical reasoning. It is not an official NCDC syllabus or laboratory guide.", audience: ["uganda_high_school_chemistry"], readiness: "active", delivery: "downloadable", estimatedDownloadMb: 2,
    courses: [activeStarter("chemistry-particle-evidence", "Particles and Observations", "Separate an observable change from an unsupported particle-level explanation.", ["evidence_reading"]), activeStarter("chemistry-concentration-count", "Simple Concentration Count", "Calculate a simple mass-per-volume value using recorded quantities.", ["worked_calculation"]), activeStarter("chemistry-variable-choice", "Controlled Variable Choice", "Choose a fair comparison step for a classroom chemistry question.", ["scenario"])],
  },
  {
    id: "uganda-high-school-economics", revision: "ug-hs-economics-starter-v1", title: "High School Economics", faculty: "Uganda High School", description: "Original starter learning in scarcity, choices, evidence, and clear economic reasoning. It is not an official NCDC syllabus or financial advice.", audience: ["uganda_high_school_economics"], readiness: "active", delivery: "downloadable", estimatedDownloadMb: 2,
    courses: [activeStarter("economics-scarcity-evidence", "Scarcity and Choice", "Read a household or community choice and distinguish a stated trade-off from an assumption.", ["evidence_reading"]), activeStarter("economics-percentage-change", "Percentage Change", "Calculate a percentage change from a simple recorded price example.", ["worked_calculation"]), activeStarter("economics-tradeoff-choice", "Compare a Trade-off", "Choose a responsible way to explain an economic choice using stated evidence.", ["scenario"])],
  },
  {
    id: "uganda-high-school-entrepreneurship", revision: "ug-hs-entrepreneurship-starter-v1", title: "High School Entrepreneurship", faculty: "Uganda High School", description: "Original starter learning in customer evidence, costs, ethical choices, and responsible venture planning. It is not an official NCDC syllabus or business advice.", audience: ["uganda_high_school_entrepreneurship"], readiness: "active", delivery: "downloadable", estimatedDownloadMb: 2,
    courses: [activeStarter("entrepreneurship-customer-evidence", "Customer Problem Evidence", "Separate a useful customer observation from an unsupported sales claim.", ["evidence_reading"]), activeStarter("entrepreneurship-cost-count", "Simple Cost per Item", "Calculate a simple unit cost from recorded project quantities.", ["worked_calculation"]), activeStarter("entrepreneurship-ethical-choice", "Respectful Venture Choice", "Choose a responsible next action when planning a small learner venture.", ["scenario"])],
  },
  {
    id: "uganda-high-school-english", revision: "ug-hs-english-starter-v1", title: "High School English", faculty: "Uganda High School", description: "Original starter learning in reading, argument, source use, drafting, and revision. It is not an official NCDC syllabus or official marking service.", audience: ["uganda_high_school_english"], readiness: "active", delivery: "downloadable", estimatedDownloadMb: 2,
    courses: [activeStarter("english-argument-evidence", "Reading Claims and Evidence", "Separate a claim, a reason, and a detail in a short persuasive passage.", ["evidence_reading"]), activeStarter("english-claim-planner", "Plan a Clear Paragraph", "Plan a claim, supporting detail, and revision check for a short paragraph.", ["writing_planner"]), activeStarter("english-source-choice", "Use a Source Responsibly", "Choose a clear source-use step before sharing a written response.", ["scenario"])],
  },
  {
    id: "uganda-high-school-physics", revision: "ug-hs-physics-starter-v1", title: "High School Physics", faculty: "Uganda High School", description: "Original starter learning in motion, measurement, patterns, forces, and evidence-based explanation. It is not an official NCDC syllabus or laboratory guide.", audience: ["uganda_high_school_physics"], readiness: "active", delivery: "downloadable", estimatedDownloadMb: 2,
    courses: [activeStarter("physics-motion-evidence", "Motion and Recorded Evidence", "Separate a recorded motion observation from an unsupported explanation.", ["evidence_reading"]), activeStarter("physics-speed-count", "Simple Speed Calculation", "Calculate a speed from a stated distance and time.", ["worked_calculation"]), activeStarter("physics-fair-test-choice", "Measurement Comparison Choice", "Choose a careful way to compare recorded measurements.", ["scenario"])],
  },
  {
    id: "uganda-high-school-mathematics", revision: "ug-hs-mathematics-starter-v1", title: "High School Mathematics", faculty: "Uganda High School", description: "Original starter learning in quantity, patterns, calculations, reasoning, and clear mathematical communication. It is not an official NCDC syllabus or examination service.", audience: ["uganda_high_school_mathematics"], readiness: "active", delivery: "downloadable", estimatedDownloadMb: 2,
    courses: [activeStarter("mathematics-pattern-trace", "Trace a Number Pattern", "Follow a stated number rule and identify its next result.", ["logic_trace"]), activeStarter("mathematics-percentage-count", "Percentage of a Quantity", "Calculate a percentage from stated whole and part quantities.", ["worked_calculation"]), activeStarter("mathematics-representation-choice", "Choose a Useful Representation", "Choose a clear mathematical representation before drawing a conclusion.", ["scenario"])],
  },
  {
    id: "uganda-high-school-geography", revision: "ug-hs-geography-starter-v1", title: "High School Geography", faculty: "Uganda High School", description: "Original starter learning in place, maps, environments, data, and geographic explanation. It is not an official NCDC syllabus or fieldwork guide.", audience: ["uganda_high_school_geography"], readiness: "active", delivery: "downloadable", estimatedDownloadMb: 2,
    courses: [activeStarter("geography-map-evidence", "Read a Map Key", "Use a map key and stated location details without claiming more than the evidence shows.", ["evidence_reading"]), activeStarter("geography-scale-count", "Calculate a Map Distance", "Calculate a stated distance using a simple map scale example.", ["worked_calculation"]), activeStarter("geography-environment-choice", "Compare an Environmental Claim", "Choose a careful response to a local environmental claim using stated evidence.", ["scenario"])],
  },
  {
    id: "uganda-high-school-history-civics", revision: "ug-hs-history-civics-starter-v1", title: "High School History and Civics", faculty: "Uganda High School", description: "Original starter learning in sources, timelines, civic reasoning, claims, and respectful evidence use. It is not an official NCDC syllabus or political advice.", audience: ["uganda_high_school_history_civics"], readiness: "active", delivery: "downloadable", estimatedDownloadMb: 2,
    courses: [activeStarter("history-source-evidence", "Read a Historical Source", "Separate a source’s statement from a conclusion that would need corroboration.", ["evidence_reading"]), activeStarter("history-timeline-trace", "Trace a Timeline", "Use stated event order to identify the next supported historical sequence step.", ["logic_trace"]), activeStarter("civics-respectful-choice", "Evaluate a Civic Choice", "Choose a respectful, evidence-aware step in a school-community discussion.", ["scenario"])],
  },
  {
    id: "uganda-high-school-ict", revision: "ug-hs-ict-starter-v1", title: "High School ICT and Digital Skills", faculty: "Uganda High School", description: "Original starter learning in digital information, data, logic, safe choices, and responsible technology use. It is not an official NCDC syllabus or cybersecurity service.", audience: ["uganda_high_school_ict"], readiness: "active", delivery: "downloadable", estimatedDownloadMb: 2,
    courses: [activeStarter("ict-information-evidence", "Check a Digital Claim", "Use source details to separate a digital claim from evidence that needs checking.", ["evidence_reading"]), activeStarter("ict-logic-trace", "Trace a Simple Rule", "Follow a stated conditional rule and identify its outcome.", ["logic_trace"]), activeStarter("ict-data-choice", "Share Data Responsibly", "Choose a privacy-aware action when a class activity uses digital information.", ["scenario"])],
  },
  {
    id: "uganda-high-school-agriculture", revision: "ug-hs-agriculture-starter-v1", title: "High School Agriculture and Food Systems", faculty: "Uganda High School", description: "Original starter learning in observations, production systems, records, sustainability, and agricultural reasoning. It is not an official NCDC syllabus or farming instruction.", audience: ["uganda_high_school_agriculture"], readiness: "active", delivery: "downloadable", estimatedDownloadMb: 2,
    courses: [activeStarter("agriculture-record-evidence", "Use a Farm Record Carefully", "Separate a recorded observation from an unsupported production explanation.", ["evidence_reading"]), activeStarter("agriculture-output-count", "Calculate a Recorded Average", "Calculate a simple average from stated classroom production records.", ["worked_calculation"]), activeStarter("agriculture-sustainability-choice", "Choose a Sustainable Next Step", "Choose a careful next question before making an agricultural claim.", ["scenario"])],
  },
  {
    id: "uganda-high-school-religion-ethics", revision: "ug-hs-religion-ethics-starter-v1", title: "High School Religious and Ethical Studies", faculty: "Uganda High School", description: "Original starter learning in values, respectful dialogue, claims, community choices, and ethical reflection. It is not an official NCDC syllabus or religious authority.", audience: ["uganda_high_school_religion_ethics"], readiness: "active", delivery: "downloadable", estimatedDownloadMb: 2,
    courses: [activeStarter("ethics-perspective-evidence", "Recognise a Perspective", "Separate a speaker’s value-based perspective from a verifiable claim.", ["evidence_reading"]), activeStarter("ethics-reason-trace", "Trace a Reasoned Choice", "Follow a stated reason and identify the conclusion it supports.", ["logic_trace"]), activeStarter("ethics-dialogue-choice", "Choose Respectful Dialogue", "Choose a respectful next step when classmates disagree about a community issue.", ["scenario"])],
  },
  {
    id: "uganda-high-school-kiswahili", revision: "ug-hs-kiswahili-starter-v1", title: "High School Kiswahili", faculty: "Uganda High School", description: "Original starter learning in reading, vocabulary in context, respectful communication, and clear Kiswahili expression. It is not an official NCDC syllabus or official marking service.", audience: ["uganda_high_school_kiswahili"], readiness: "active", delivery: "downloadable", estimatedDownloadMb: 2,
    courses: [activeStarter("kiswahili-maana-muktadha", "Maana Katika Muktadha", "Use nearby wording to identify a supported meaning in a short Kiswahili passage.", ["evidence_reading"]), activeStarter("kiswahili-ujumbe-planner", "Panga Ujumbe Wako", "Plan a clear, respectful Kiswahili message for a stated audience.", ["writing_planner"]), activeStarter("kiswahili-mawasiliano-choice", "Chagua Mawasiliano ya Heshima", "Choose a respectful next response in a Kiswahili communication scenario.", ["scenario"])],
  },
  {
    id: "uganda-high-school-literature", revision: "ug-hs-literature-starter-v1", title: "High School Literature", faculty: "Uganda High School", description: "Original starter learning in close reading, themes, character evidence, interpretation, and creative response. It is not an official NCDC syllabus or marking service.", audience: ["uganda_high_school_literature"], readiness: "active", delivery: "downloadable", estimatedDownloadMb: 2,
    courses: [activeStarter("literature-character-evidence", "Character Evidence", "Use a stated character action and line of dialogue before making an interpretation.", ["evidence_reading"]), activeStarter("literature-theme-planner", "Plan a Theme Response", "Plan a claim, supporting detail, and explanation for a short literary response.", ["writing_planner"]), activeStarter("literature-interpretation-choice", "Compare Interpretations", "Choose a responsible way to discuss different supported readings of a text.", ["scenario"])],
  },
  {
    id: "uganda-high-school-fine-art", revision: "ug-hs-fine-art-starter-v1", title: "High School Fine Art", faculty: "Uganda High School", description: "Original starter learning in visual observation, design choices, respectful critique, and reflective creative process. It is not an official NCDC syllabus or a professional art assessment.", audience: ["uganda_high_school_fine_art"], readiness: "active", delivery: "downloadable", estimatedDownloadMb: 2,
    courses: [activeStarter("fine-art-observation-evidence", "Observe a Visual Choice", "Describe a visible design choice before making an interpretation about the artwork.", ["evidence_reading"]), activeStarter("fine-art-process-planner", "Plan a Visual Process", "Plan materials, an intended message, and one revision check for a classroom visual task.", ["writing_planner"]), activeStarter("fine-art-critique-choice", "Give Respectful Critique", "Choose a constructive, evidence-aware response to a classmate’s artwork.", ["scenario"])],
  },
  {
    id: "uganda-high-school-technical-drawing", revision: "ug-hs-technical-drawing-starter-v1", title: "High School Technical Drawing", faculty: "Uganda High School", description: "Original starter learning in visual communication, scale, drawing conventions, constraints, and careful technical reasoning. It is not an official NCDC syllabus, engineering instruction, or safety guide.", audience: ["uganda_high_school_technical_drawing"], readiness: "active", delivery: "downloadable", estimatedDownloadMb: 2,
    courses: [activeStarter("technical-drawing-view-evidence", "Read a Drawing View", "Identify what a stated view communicates before adding an unsupported detail.", ["evidence_reading"]), activeStarter("technical-drawing-scale-count", "Use a Stated Scale", "Calculate a classroom drawing measurement from a stated scale example.", ["worked_calculation"]), activeStarter("technical-drawing-convention-choice", "Choose a Clear Convention", "Choose a careful next step before sharing a technical drawing for review.", ["scenario"])],
  },
  {
    id: "uganda-high-school-food-nutrition", revision: "ug-hs-food-nutrition-starter-v1", title: "High School Food and Nutrition", faculty: "Uganda High School", description: "Original starter learning in records, food information, planning, careful comparison, and responsible classroom reasoning. It is not an official NCDC syllabus, dietetic, medical, food-safety, or food-preparation guide.", audience: ["uganda_high_school_food_nutrition"], readiness: "active", delivery: "downloadable", estimatedDownloadMb: 2,
    courses: [activeStarter("food-nutrition-label-evidence", "Read a Stated Food Label", "Separate the information shown on a stated classroom label from a claim that needs more evidence.", ["evidence_reading"]), activeStarter("food-nutrition-portion-count", "Compare a Classroom Portion Record", "Calculate a simple amount from stated classroom serving records.", ["worked_calculation"]), activeStarter("food-nutrition-plan-choice", "Plan a Careful Food Information Check", "Choose a responsible next question before sharing a food-related claim.", ["scenario"])],
  },
  {
    id: "uganda-high-school-music", revision: "ug-hs-music-starter-v1", title: "High School Music", faculty: "Uganda High School", description: "Original starter learning in listening, pattern, performance planning, and respectful musical response. It is not an official NCDC syllabus, professional music assessment, or performance direction.", audience: ["uganda_high_school_music"], readiness: "active", delivery: "downloadable", estimatedDownloadMb: 2,
    courses: [activeStarter("music-listening-evidence", "Describe a Stated Listening Pattern", "Use stated musical details before making an interpretation about a classroom excerpt.", ["evidence_reading"]), activeStarter("music-performance-planner", "Plan a Group Performance", "Plan roles, a rehearsal check, and respectful collaboration for a classroom performance.", ["writing_planner"]), activeStarter("music-feedback-choice", "Choose Respectful Musical Feedback", "Choose a constructive response to a classmate’s stated performance goal.", ["scenario"])],
  },
  {
    id: "uganda-high-school-physical-education", revision: "ug-hs-physical-education-starter-v1", title: "High School Physical Education", faculty: "Uganda High School", description: "Original starter learning in movement planning, fair participation, observation, and reflection. It is not an official NCDC syllabus, exercise prescription, sports coaching, injury, or medical guidance.", audience: ["uganda_high_school_physical_education"], readiness: "active", delivery: "downloadable", estimatedDownloadMb: 2,
    courses: [activeStarter("physical-education-observation-evidence", "Read a Movement Observation", "Separate a stated movement observation from an unsupported judgement about a learner.", ["evidence_reading"]), activeStarter("physical-education-session-planner", "Plan Fair Participation", "Plan roles, an inclusive adjustment, and a reflection check for a classroom movement activity.", ["writing_planner"]), activeStarter("physical-education-fair-play-choice", "Choose a Fair Participation Step", "Choose a respectful next step when participation in a classroom activity is uneven.", ["scenario"])],
  },
];

export function coursePacksForProgram(program: AcademicProgramId): CoursePack[] {
  const highSchool = program.startsWith("uganda_high_school_");
  return COURSE_PACKS.filter((pack) => (!highSchool && pack.audience === "all_university") || (highSchool && pack.audience === "all_high_school") || (Array.isArray(pack.audience) && pack.audience.includes(program)));
}

export function highSchoolCoursePacks(): CoursePack[] {
  return COURSE_PACKS.filter((pack) => pack.audience === "all_high_school" || (Array.isArray(pack.audience) && pack.audience.some((program) => program.startsWith("uganda_high_school_"))));
}

export function coursePackForId(packId: string): CoursePack | null {
  return COURSE_PACKS.find((pack) => pack.id === packId) ?? null;
}

export function primaryCoursePackForProgram(program: AcademicProgramId): CoursePack | null {
  const packs = coursePacksForProgram(program);
  return packs.find((pack) => Array.isArray(pack.audience) && pack.audience.includes(program)) ?? packs.find((pack) => pack.audience === "all_high_school") ?? packs.find((pack) => pack.id === "university-foundation-year") ?? null;
}

export function coursePackReadinessLabel(readiness: CoursePackReadiness): string {
  if (readiness === "active") return "ACTIVE";
  if (readiness === "catalog") return "CATALOG PREVIEW";
  return "PLANNED";
}

export function courseActivityLabel(kind: CourseActivityKind): string {
  return ({ recall: "Recall", worked_calculation: "Worked steps", scenario: "Decision case", evidence_reading: "Evidence reading", writing_planner: "Writing planner", logic_trace: "Logic trace", oral_practice: "Oral practice", timed_assessment: "Timed assessment" })[kind];
}
