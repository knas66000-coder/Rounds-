export type EvidenceReadingActivity = {
  kind: "evidence_reading";
  packId: string;
  courseId: string;
  title: string;
  eyebrow: string;
  passageTitle: string;
  passage: string;
  prompt: string;
  options: string[];
  correctOption: string;
  explanation: string;
};

export type WritingPlannerActivity = {
  kind: "writing_planner";
  packId: string;
  courseId: string;
  title: string;
  eyebrow: string;
  brief: string;
  prompts: { id: string; label: string; helper: string }[];
};

export type StarterCourseActivity = EvidenceReadingActivity | WritingPlannerActivity;

export const STARTER_COURSE_ACTIVITIES: StarterCourseActivity[] = [
  {
    kind: "writing_planner", packId: "university-foundation-year", courseId: "academic-writing", title: "Plan a traceable claim", eyebrow: "ACADEMIC WRITING STARTER",
    brief: "You are preparing a short paragraph about whether a campus study room should extend its evening hours. Make a modest claim, note the strongest evidence you would need, and plan how you will show the source clearly. This is a private planning exercise, not an automatically graded essay.",
    prompts: [
      { id: "claim", label: "Working claim", helper: "State a specific, cautious position in one or two sentences." },
      { id: "evidence", label: "Evidence to gather", helper: "Name the source, observation, or data that would make the claim more reliable." },
      { id: "trace", label: "How you will trace the source", helper: "Write how you will record the source so another reader can check it." },
    ],
  },
  {
    kind: "evidence_reading", packId: "university-foundation-year", courseId: "digital-literacy", title: "Check the link before you sign in", eyebrow: "DIGITAL LITERACY STARTER", passageTitle: "A familiar-looking message",
    passage: "A student receives a message that appears to come from a campus office. It says an account will close today unless the student signs in using a link in the message. The message does not mention the student by name and the web address contains extra words before the university name.",
    prompt: "What is the most responsible first action?", options: ["Use the message link immediately because the deadline is urgent.", "Forward the message publicly so others can decide.", "Open the official university site or known app independently and verify whether there is an account notice.", "Reply with the account password to prove ownership."], correctOption: "Open the official university site or known app independently and verify whether there is an account notice.", explanation: "Urgency and a familiar-looking name are not proof of authenticity. Using a known official route avoids relying on an unverified link.",
  },
  {
    kind: "evidence_reading", packId: "computing-foundations", courseId: "computing-requirements", title: "Start with the missing requirement", eyebrow: "COMPUTING STARTER", passageTitle: "Campus office finder brief",
    passage: "A project brief says, “Build an app to help first-year students find campus offices.” It does not identify which offices must appear, whether the information changes frequently, whether students need accessibility details, or how the team will know the result is useful.",
    prompt: "What should the team do before choosing a programming tool?", options: ["Clarify the users, required office information, update source, accessibility needs, and success criteria.", "Select a programming language based only on what the team used last year.", "Publish a blank app quickly and ask users to create the office list themselves.", "Assume every campus office has the same hours and access needs."], correctOption: "Clarify the users, required office information, update source, accessibility needs, and success criteria.", explanation: "A tool choice follows a clear problem definition. The brief needs usable requirements before the team can design or test an appropriate solution.",
  },
  {
    kind: "evidence_reading", packId: "business-foundations", courseId: "business-customer-evidence", title: "Separate a need from an assumption", eyebrow: "BUSINESS STARTER", passageTitle: "A queue at lunch",
    passage: "A student sees a long line at one campus food stall on two afternoons. After six short conversations, several students mention that they would value faster ordering. The student concludes that every student will pay for a new delivery service immediately.",
    prompt: "Which statement is best supported by the information?", options: ["Every student will pay for delivery immediately.", "The observations suggest a possible need worth investigating with a broader, careful sample.", "A delivery service cannot work because one line was long.", "The six conversations prove the exact price students will accept."], correctOption: "The observations suggest a possible need worth investigating with a broader, careful sample.", explanation: "The observations and conversations are useful early signals, but they do not establish demand, price, or the views of every student.",
  },
  {
    kind: "writing_planner", packId: "engineering-foundations", courseId: "engineering-design-constraints", title: "Plan around constraints", eyebrow: "ENGINEERING STARTER",
    brief: "A student group has been asked to propose a simple way to reduce water use in a shared study area. Before selecting a design, record what the proposal must achieve, the limits that shape it, and the evidence the group still needs. This is a planning activity, not engineering or safety approval.",
    prompts: [
      { id: "goal", label: "What must the proposal achieve?", helper: "State a clear outcome that could later be evaluated." },
      { id: "constraints", label: "What constraints matter?", helper: "Consider budget, user needs, maintenance, access, and local approval." },
      { id: "evidence", label: "What evidence is missing?", helper: "List what the group should measure or confirm before choosing a design." },
    ],
  },
  {
    kind: "evidence_reading", packId: "natural-sciences-foundations", courseId: "science-observation-evidence", title: "Observation is not yet an explanation", eyebrow: "NATURAL SCIENCES STARTER", passageTitle: "Plants near a window",
    passage: "During one month, a learner notices that plants near a window become taller than plants on another shelf. The learner did not record the amount of water, starting size, temperature, soil condition, or exact light exposure.",
    prompt: "What is the strongest next step?", options: ["Conclude that light alone caused the difference.", "Record and compare relevant conditions before deciding which explanation is supported.", "Move all plants immediately and treat the first observation as final proof.", "Ignore the observation because it is not a full experiment."], correctOption: "Record and compare relevant conditions before deciding which explanation is supported.", explanation: "The height difference is an observation. Several conditions could influence it, so relevant evidence is needed before choosing a cause.",
  },
  {
    kind: "writing_planner", packId: "education-foundations", courseId: "education-learning-objectives", title: "Make the learning visible", eyebrow: "EDUCATION STARTER",
    brief: "A lesson aim says, “Learners will understand responsible online communication.” Turn this broad aim into a practical, observable objective and consider what evidence would show learning. This is a planning activity, not a teaching certification assessment.",
    prompts: [
      { id: "objective", label: "Observable learner objective", helper: "Use a verb that a learner can demonstrate or explain." },
      { id: "evidence", label: "Evidence of learning", helper: "Describe what the learner could produce, select, or say." },
      { id: "inclusion", label: "Inclusive support", helper: "Name one way learners could access the activity or show understanding." },
    ],
  },
  {
    kind: "evidence_reading", packId: "social-sciences-foundations", courseId: "social-claims-evidence", title: "Match a claim to evidence", eyebrow: "SOCIAL SCIENCES STARTER", passageTitle: "A study group conversation",
    passage: "After speaking with two classmates, a learner says, “Students in this program do not have time to study.” One classmate works evenings and one commutes a long distance. The learner has not asked other students or examined course schedules, work patterns, or available support.",
    prompt: "Which response uses the evidence most responsibly?", options: ["The two conversations establish what every student experiences.", "The conversations describe two experiences and suggest a question for broader, respectful investigation.", "The learner should infer the reason for every student’s limited time.", "The learner should ignore the conversations because personal experience never matters."], correctOption: "The conversations describe two experiences and suggest a question for broader, respectful investigation.", explanation: "Individual accounts can be meaningful starting points, but they do not automatically establish a conclusion about an entire program.",
  },
];

export function starterActivityFor(packId: string, courseId: string): StarterCourseActivity | null {
  return STARTER_COURSE_ACTIVITIES.find((activity) => activity.packId === packId && activity.courseId === courseId) ?? null;
}
