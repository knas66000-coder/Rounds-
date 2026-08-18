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

export type CalculationActivity = {
  kind: "worked_calculation";
  packId: string;
  courseId: string;
  title: string;
  eyebrow: string;
  scenario: string;
  prompt: string;
  expectedAnswer: number;
  unit?: string;
  tolerance?: number;
  explanation: string;
  safetyNote?: string;
};

export type LogicTraceActivity = {
  kind: "logic_trace";
  packId: string;
  courseId: string;
  title: string;
  eyebrow: string;
  scenario: string;
  prompt: string;
  options: string[];
  correctOption: string;
  explanation: string;
};

export type ScenarioActivity = {
  kind: "scenario";
  packId: string;
  courseId: string;
  title: string;
  eyebrow: string;
  scenario: string;
  prompt: string;
  options: string[];
  bestOption: string;
  explanation: string;
  boundaryNote?: string;
};

export type StarterCourseActivity = EvidenceReadingActivity | WritingPlannerActivity | CalculationActivity | LogicTraceActivity | ScenarioActivity;

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
  {
    kind: "worked_calculation", packId: "university-foundation-year", courseId: "quantitative-literacy", title: "Find a survey response rate", eyebrow: "QUANTITATIVE LITERACY STARTER",
    scenario: "A student society invites 30 members to complete a short planning survey. Twelve members respond.", prompt: "What percentage of invited members responded?", expectedAnswer: 40, unit: "%", tolerance: 0.01, explanation: "Divide responses by invitations, then multiply by 100: 12 ÷ 30 × 100 = 40%. This describes this survey only; it does not prove the views of every student.",
  },
  {
    kind: "logic_trace", packId: "computing-foundations", courseId: "computing-logic-trace", title: "Trace a sign-in check", eyebrow: "COMPUTING STARTER",
    scenario: "A sign-in form first checks whether both the email and password fields have text. If either field is blank, it shows “Complete both fields.” Only after both fields have text does it send a sign-in request.", prompt: "What happens when the email field is blank and the password field has text?", options: ["The form sends a sign-in request.", "The form shows “Complete both fields.”", "The form resets the password automatically.", "The form assumes the email is correct."], correctOption: "The form shows “Complete both fields.”", explanation: "The first rule requires both fields to contain text. With one blank field, the form stops at the validation message rather than sending a request.",
  },
  {
    kind: "worked_calculation", packId: "business-foundations", courseId: "business-break-even-basics", title: "Count a simple break-even point", eyebrow: "BUSINESS STARTER",
    scenario: "A student project has fixed event costs of 120 units. Each ticket contributes 10 units after its direct event cost.", prompt: "How many tickets are needed to cover the fixed cost in this simplified example?", expectedAnswer: 12, unit: " tickets", tolerance: 0, explanation: "Divide fixed cost by contribution per ticket: 120 ÷ 10 = 12 tickets. This is a learning example, not financial or investment advice.", safetyNote: "For learning only; real prices and costs need fuller review.",
  },
  {
    kind: "logic_trace", packId: "engineering-foundations", courseId: "engineering-constraint-order", title: "Check a design constraint first", eyebrow: "ENGINEERING STARTER",
    scenario: "A design brief says a proposed study-area fixture must fit within a 2-metre wall section before the group compares colors or finishes. Proposal A needs 2.4 metres. Proposal B needs 1.8 metres.", prompt: "Which proposal can move to the next design comparison?", options: ["Proposal A, because color can be chosen later.", "Proposal B, because it satisfies the stated space constraint.", "Both proposals, because every design idea should be built first.", "Neither proposal, because no other information matters."], correctOption: "Proposal B, because it satisfies the stated space constraint.", explanation: "The stated fit constraint is checked before secondary preferences. Proposal B fits the 2-metre section, while Proposal A does not.",
  },
  {
    kind: "worked_calculation", packId: "natural-sciences-foundations", courseId: "science-mean-observation", title: "Calculate a simple mean", eyebrow: "NATURAL SCIENCES STARTER",
    scenario: "A learner records three classroom thermometer readings: 14, 16, and 18 degrees. The activity is only about calculating the mean of the recorded values.", prompt: "What is the mean reading?", expectedAnswer: 16, unit: " degrees", tolerance: 0, explanation: "Add the readings, then divide by the number of readings: (14 + 16 + 18) ÷ 3 = 16. A mean summarizes recorded values; it does not explain their cause.",
  },
  {
    kind: "logic_trace", packId: "education-foundations", courseId: "education-check-for-understanding", title: "Use evidence of learning", eyebrow: "EDUCATION STARTER",
    scenario: "A tutor wants to check whether learners can identify a reliable source. The planned activity asks each learner to choose one source and state one reason it appears reliable. The tutor will then review the stated reason.", prompt: "What evidence is the tutor using to check learning?", options: ["Whether each learner can choose a source and explain one reliability reason.", "Whether the tutor spoke for the entire lesson.", "Whether all learners use the same pen color.", "Whether the room is silent for the whole activity."], correctOption: "Whether each learner can choose a source and explain one reliability reason.", explanation: "The learner action and explanation are observable evidence connected to the stated learning goal.",
  },
  {
    kind: "worked_calculation", packId: "social-sciences-foundations", courseId: "social-response-count", title: "Describe a response count", eyebrow: "SOCIAL SCIENCES STARTER",
    scenario: "In a small voluntary discussion poll, 8 of 20 invited students reply. The activity asks only for a percentage description of this response count.", prompt: "What percentage of invited students replied?", expectedAnswer: 40, unit: "%", tolerance: 0.01, explanation: "Divide replies by invitations, then multiply by 100: 8 ÷ 20 × 100 = 40%. The percentage describes the poll response count, not the beliefs of all students.",
  },
  {
    kind: "scenario", packId: "university-foundation-year", courseId: "foundation-attribution-choice", title: "Credit a source before submission", eyebrow: "ACADEMIC FOUNDATIONS SCENARIO",
    scenario: "A learner has copied two sentences from an online article into a draft because the wording is useful. The learner has the page open but has not recorded the author, date, or link.", prompt: "What is the most responsible next step before submitting the draft?", options: ["Leave the sentences unchanged because the page is public.", "Record the source details, use quotation or paraphrase appropriately, and show the source clearly in the draft.", "Remove every source from the draft so attribution is unnecessary.", "Share the article text under another learner’s name."], bestOption: "Record the source details, use quotation or paraphrase appropriately, and show the source clearly in the draft.", explanation: "Academic work should make the origin of words and ideas traceable. Recording source details supports accurate attribution and later checking.",
  },
  {
    kind: "scenario", packId: "computing-foundations", courseId: "computing-accessibility-choice", title: "Include the user requirement", eyebrow: "COMPUTING SCENARIO",
    scenario: "A team is planning a campus-events page. One learner explains that some users rely on keyboard navigation and readable text contrast. The team has limited time for the first version.", prompt: "Which planning choice is most responsible?", options: ["Treat keyboard and contrast needs as optional decoration after launch.", "Include keyboard navigation and readable contrast as requirements, then test them with the first version.", "Ask users who need those features to use a different site.", "Replace all text with images to reduce planning work."], bestOption: "Include keyboard navigation and readable contrast as requirements, then test them with the first version.", explanation: "Accessibility needs belong in the problem definition and testing plan, not as an optional extra after a product is built.",
  },
  {
    kind: "scenario", packId: "business-foundations", courseId: "business-customer-consent", title: "Ask before using contact details", eyebrow: "BUSINESS SCENARIO",
    scenario: "A student team collects email addresses from classmates during a public event sign-up. The form says it is for event attendance, but the team now wants to send a separate promotional message about a new idea.", prompt: "What should the team do before using the addresses for promotion?", options: ["Send the promotion because the addresses were collected at an event.", "Check the stated purpose and seek clear permission for the new promotional use.", "Publish the address list so others can promote the idea too.", "Assume no one will mind because the project is small."], bestOption: "Check the stated purpose and seek clear permission for the new promotional use.", explanation: "Contact details should be used consistently with the purpose explained when they were collected. A new use needs clear, appropriate permission.", boundaryNote: "This is a learning scenario, not legal advice.",
  },
  {
    kind: "scenario", packId: "engineering-foundations", courseId: "engineering-evidence-choice", title: "Test before selecting", eyebrow: "ENGINEERING SCENARIO",
    scenario: "Two proposed study-area layouts both fit the available wall space. One layout is cheaper on paper, while the other may be easier for users to reach. The group has not measured user movement or asked facilities staff about maintenance.", prompt: "What should the group do before choosing a final layout?", options: ["Choose the cheaper layout immediately because cost is the only relevant factor.", "Gather relevant user-access and maintenance evidence, then compare both layouts against the stated constraints.", "Build both permanent layouts before asking any questions.", "Select the layout with the most colors."], bestOption: "Gather relevant user-access and maintenance evidence, then compare both layouts against the stated constraints.", explanation: "A responsible design decision checks the stated constraints with relevant evidence instead of relying on one preference or assumption.", boundaryNote: "This is a learning scenario, not engineering or safety approval.",
  },
  {
    kind: "scenario", packId: "natural-sciences-foundations", courseId: "science-replication-choice", title: "Repeat a careful observation", eyebrow: "NATURAL SCIENCES SCENARIO",
    scenario: "A learner notices one unexpected result in a classroom measurement activity. The recording sheet shows that the instrument reading was copied once, and the learner cannot tell whether the original reading was stable.", prompt: "What is the strongest next step for the learning activity?", options: ["Treat the unexpected value as final proof of a new explanation.", "Record the conditions clearly and repeat the observation using the same stated method before drawing a conclusion.", "Delete the value without recording that it occurred.", "Choose the result that best matches the expected answer."], bestOption: "Record the conditions clearly and repeat the observation using the same stated method before drawing a conclusion.", explanation: "Careful repetition and transparent recording help distinguish an observation from a supported conclusion.",
  },
  {
    kind: "scenario", packId: "education-foundations", courseId: "education-inclusive-choice", title: "Offer a fair way to show learning", eyebrow: "EDUCATION SCENARIO",
    scenario: "A tutor plans a short check for understanding after a lesson. One learner is more comfortable giving a brief spoken explanation, while another prefers a written response. Both can address the same learning objective.", prompt: "Which design choice best keeps the check connected to the objective?", options: ["Require one format only because different formats cannot show the same learning.", "Allow an appropriate spoken or written response using the same clear success criteria.", "Skip the check because learners prefer different formats.", "Grade learners only on how quickly they respond."], bestOption: "Allow an appropriate spoken or written response using the same clear success criteria.", explanation: "Multiple accessible response formats can be fair when they are evaluated against the same relevant learning objective.",
  },
  {
    kind: "scenario", packId: "social-sciences-foundations", courseId: "social-context-choice", title: "Respect context in an interpretation", eyebrow: "SOCIAL SCIENCES SCENARIO",
    scenario: "A learner reads three anonymous comments about long travel times to campus. The comments describe individual experiences, but the learner has no information about routes, work schedules, cost, or the wider student population.", prompt: "Which interpretation is most responsible?", options: ["The comments prove every learner experiences the same travel problem.", "The comments are useful perspectives that suggest a broader, context-sensitive question for further study.", "The comments should be ignored because personal accounts never matter.", "The learner should identify the authors publicly to verify the comments."], bestOption: "The comments are useful perspectives that suggest a broader, context-sensitive question for further study.", explanation: "Individual perspectives can inform research questions, but responsible interpretation avoids overgeneralizing and respects privacy.",
  },
];

export function starterActivityFor(packId: string, courseId: string): StarterCourseActivity | null {
  return STARTER_COURSE_ACTIVITIES.find((activity) => activity.packId === packId && activity.courseId === courseId) ?? null;
}
