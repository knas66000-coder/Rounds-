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
  {
    kind: "evidence_reading", packId: "uganda-high-school-biology", courseId: "biology-ecosystem-evidence", title: "Observe before explaining", eyebrow: "HIGH SCHOOL BIOLOGY STARTER", passageTitle: "Shade and leaf colour",
    passage: "During a school garden observation, a learner notices that leaves from plants in a shaded corner look darker green than leaves from the same kind of plant in a brighter corner. The learner has not recorded plant age, soil moisture, leaf age, or exact light conditions.", prompt: "Which statement is best supported by the observation?", options: ["Shade alone caused the darker leaves.", "The leaf-colour difference is an observation that suggests conditions worth recording and comparing.", "The plants must be different species.", "The observation should be ignored because it cannot be explained immediately."], correctOption: "The leaf-colour difference is an observation that suggests conditions worth recording and comparing.", explanation: "The colour difference is useful evidence, but several conditions may contribute. Careful notes and comparison come before choosing a cause.",
  },
  {
    kind: "worked_calculation", packId: "uganda-high-school-biology", courseId: "biology-sampling-count", title: "Describe a recorded sample", eyebrow: "HIGH SCHOOL BIOLOGY STARTER",
    scenario: "A learner records 12 flowering plants in a sample of 40 plants from a school garden area. This activity only practises describing the recorded sample.", prompt: "What percentage of the recorded plants were flowering?", expectedAnswer: 30, unit: "%", tolerance: 0.01, explanation: "Divide the flowering count by the total recorded count, then multiply by 100: 12 ÷ 40 × 100 = 30%. This describes the sample, not every plant in the wider area.", safetyNote: "Learning calculation only; this does not replace fieldwork or scientific reporting guidance.",
  },
  {
    kind: "scenario", packId: "uganda-high-school-biology", courseId: "biology-investigation-choice", title: "Compare one condition fairly", eyebrow: "HIGH SCHOOL BIOLOGY SCENARIO",
    scenario: "A learner wants to compare how two groups of the same seed type develop in a classroom observation. The learner has not yet decided what should stay the same between the groups.", prompt: "What is the strongest planning step before drawing a conclusion?", options: ["Change several conditions at once so the difference appears faster.", "Decide one condition to compare, record the other relevant conditions, and plan the same observation method for both groups.", "Choose the group that looks healthier before recording any observations.", "Assume one group will develop better because it is closer to a window."], bestOption: "Decide one condition to compare, record the other relevant conditions, and plan the same observation method for both groups.", explanation: "A fair comparison needs a clear focus and consistent observation conditions. This supports reasoning from recorded evidence rather than an assumption.", boundaryNote: "Learning scenario only; follow school laboratory, fieldwork, and safeguarding guidance.",
  },
  {
    kind: "evidence_reading", packId: "uganda-high-school-chemistry", courseId: "chemistry-particle-evidence", title: "Separate observation from explanation", eyebrow: "HIGH SCHOOL CHEMISTRY STARTER", passageTitle: "A dissolving solid",
    passage: "A learner records that a small amount of a solid seems to disappear after it is mixed into water. The learner can no longer see the solid, but has not measured mass before and after or examined the mixture in any other way.", prompt: "Which response uses the observation most carefully?", options: ["The solid stopped existing because it cannot be seen.", "The learner observed a visible change and should avoid claiming more than the recorded evidence supports.", "The water created a new element immediately.", "The learner should report the exact particle process as proven."], correctOption: "The learner observed a visible change and should avoid claiming more than the recorded evidence supports.", explanation: "A visible change can prompt a scientific explanation, but the learner should separate what was observed from what still needs evidence.",
  },
  {
    kind: "worked_calculation", packId: "uganda-high-school-chemistry", courseId: "chemistry-concentration-count", title: "Calculate a recorded mass per volume", eyebrow: "HIGH SCHOOL CHEMISTRY STARTER",
    scenario: "A classroom record states that 12 grams of a material are present in 300 cubic centimetres of a prepared example. This is a calculation exercise only.", prompt: "What is the recorded mass per cubic centimetre?", expectedAnswer: 0.04, unit: " g/cm³", tolerance: 0.001, explanation: "Divide the recorded mass by the recorded volume: 12 ÷ 300 = 0.04 g/cm³. The calculation describes the given values only.", safetyNote: "Learning calculation only; do not use this activity as laboratory preparation or handling guidance.",
  },
  {
    kind: "scenario", packId: "uganda-high-school-chemistry", courseId: "chemistry-variable-choice", title: "Plan a fair classroom comparison", eyebrow: "HIGH SCHOOL CHEMISTRY SCENARIO",
    scenario: "A learner wants to compare two recorded conditions in a teacher-supervised classroom chemistry activity. The learner proposes changing the amount of material, the container, and the observation time together.", prompt: "Which response best supports a useful comparison?", options: ["Change all conditions together so there is more to discuss.", "Choose one main condition to compare and keep the stated observation method and other relevant conditions as consistent as possible.", "Record only the result that matches an expected answer.", "Skip the record because the teacher already knows the outcome."], bestOption: "Choose one main condition to compare and keep the stated observation method and other relevant conditions as consistent as possible.", explanation: "A clear comparison is easier to interpret when the learner identifies the focus and records other relevant conditions consistently.", boundaryNote: "Learning scenario only; school laboratory rules and teacher instructions always take priority.",
  },
  {
    kind: "evidence_reading", packId: "uganda-high-school-economics", courseId: "economics-scarcity-evidence", title: "Name the trade-off", eyebrow: "HIGH SCHOOL ECONOMICS STARTER", passageTitle: "A household budget choice",
    passage: "A household has a limited amount set aside for the week. Family members discuss whether to spend part of it on transport for an additional market trip or keep it for school supplies. They cannot do both with the amount available.", prompt: "What does the passage show most clearly?", options: ["The household has no choices at all.", "Choosing one use means giving up another possible use of limited resources.", "Transport is always more important than school supplies.", "The household can spend the same money twice without a trade-off."], correctOption: "Choosing one use means giving up another possible use of limited resources.", explanation: "The passage describes scarcity and a trade-off: limited resources require a choice between competing uses.",
  },
  {
    kind: "worked_calculation", packId: "uganda-high-school-economics", courseId: "economics-percentage-change", title: "Describe a recorded price change", eyebrow: "HIGH SCHOOL ECONOMICS STARTER",
    scenario: "A learning example records a price changing from 2,000 shillings to 2,500 shillings. The activity only asks for the percentage change in the recorded example.", prompt: "What is the percentage increase?", expectedAnswer: 25, unit: "%", tolerance: 0.01, explanation: "Find the change, then divide by the original value: (2,500 − 2,000) ÷ 2,000 × 100 = 25%. This is a calculation example, not price or financial advice.", safetyNote: "For learning only; it does not predict prices or recommend a financial decision.",
  },
  {
    kind: "scenario", packId: "uganda-high-school-economics", courseId: "economics-tradeoff-choice", title: "Explain a choice with evidence", eyebrow: "HIGH SCHOOL ECONOMICS SCENARIO",
    scenario: "A student group is comparing two ways to use a small club budget. One option supports an activity now; the other keeps funds for a planned future need. The group has recorded the cost and purpose of each option.", prompt: "What is the most responsible next step?", options: ["Choose the option that sounds most popular without reviewing the recorded purpose or cost.", "Compare the stated benefits and trade-offs against the group’s recorded purpose and limited budget.", "Say there is no trade-off because both options are useful.", "Promise that one choice will benefit every learner in the same way."], bestOption: "Compare the stated benefits and trade-offs against the group’s recorded purpose and limited budget.", explanation: "Economic reasoning makes the trade-off visible and relates the choice to the available evidence and stated goal.", boundaryNote: "Learning scenario only; this is not personal, business, or financial advice.",
  },
  {
    kind: "evidence_reading", packId: "uganda-high-school-entrepreneurship", courseId: "entrepreneurship-customer-evidence", title: "Start with a customer observation", eyebrow: "HIGH SCHOOL ENTREPRENEURSHIP STARTER", passageTitle: "A lunchtime problem",
    passage: "During three school days, a learner sees several classmates searching for a quiet place to review notes during lunch. Four classmates say they would value a clearly marked reading corner. The learner concludes that every student will immediately pay for a new study service.", prompt: "Which statement is best supported?", options: ["Every student will immediately pay for a new service.", "The observations suggest a possible problem worth investigating with more careful customer evidence.", "The reading corner will certainly make a profit.", "Four comments prove the exact price learners will accept."], correctOption: "The observations suggest a possible problem worth investigating with more careful customer evidence.", explanation: "The observations are useful early signals, but they do not prove demand, pricing, or the views of every learner.",
  },
  {
    kind: "worked_calculation", packId: "uganda-high-school-entrepreneurship", courseId: "entrepreneurship-cost-count", title: "Find a simple unit cost", eyebrow: "HIGH SCHOOL ENTREPRENEURSHIP STARTER",
    scenario: "A class project records total materials costs of 24,000 shillings for 12 identical learning-display cards. This activity only practises a simple unit-cost calculation.", prompt: "What is the recorded cost per card?", expectedAnswer: 2000, unit: " shillings", tolerance: 0, explanation: "Divide total recorded cost by the number of cards: 24,000 ÷ 12 = 2,000 shillings per card. Real planning may include additional costs and conditions.", safetyNote: "For learning only; this is not business, pricing, or investment advice.",
  },
  {
    kind: "scenario", packId: "uganda-high-school-entrepreneurship", courseId: "entrepreneurship-ethical-choice", title: "Respect people while testing an idea", eyebrow: "HIGH SCHOOL ENTREPRENEURSHIP SCENARIO",
    scenario: "A learner wants feedback about a small school-based idea. A friend suggests collecting classmates’ phone numbers from a group chat and sending repeated messages without explaining why the numbers are being used.", prompt: "What is the most responsible next step?", options: ["Use the numbers immediately because the idea is small.", "Explain the purpose, ask people whether they want to take part, and collect only the feedback needed for the learning activity.", "Share classmates’ contact details with other learners to get more responses.", "Write down positive answers only so the idea looks stronger."], bestOption: "Explain the purpose, ask people whether they want to take part, and collect only the feedback needed for the learning activity.", explanation: "Responsible venture learning respects people, avoids unnecessary personal data, and treats mixed feedback as useful evidence.", boundaryNote: "Learning scenario only; this is not legal, business, or investment advice.",
  },
  {
    kind: "evidence_reading", packId: "uganda-high-school-english", courseId: "english-argument-evidence", title: "Separate a claim from support", eyebrow: "HIGH SCHOOL ENGLISH STARTER", passageTitle: "A school noticeboard proposal",
    passage: "A learner writes, “Our school should keep the reading room open for one extra hour after classes. In a short questionnaire, 18 learners said they sometimes struggle to find a quiet place to read. Opening longer will make every learner’s grades improve immediately.”", prompt: "Which part is a claim that needs more support?", options: ["Eighteen learners said they sometimes struggle to find a quiet place to read.", "The reading room should stay open for one extra hour.", "Opening longer will make every learner’s grades improve immediately.", "The learner wrote a short questionnaire."], correctOption: "Opening longer will make every learner’s grades improve immediately.", explanation: "The questionnaire result is reported evidence about some learners. The promise about every learner’s grades is much broader and needs stronger support.",
  },
  {
    kind: "writing_planner", packId: "uganda-high-school-english", courseId: "english-claim-planner", title: "Plan a clear paragraph", eyebrow: "HIGH SCHOOL ENGLISH STARTER",
    brief: "Plan a short paragraph about one improvement that would support learning at your school. State a specific claim, identify one detail that could support it, and write one revision check. This is a private planning activity, not an official marking exercise.",
    prompts: [
      { id: "claim", label: "Specific claim", helper: "State one focused position that a reader could understand." },
      { id: "support", label: "Supporting detail", helper: "Name an observation, source, or example you would need to support the claim." },
      { id: "revision", label: "Revision check", helper: "Write one check for clarity, evidence, or audience before sharing the paragraph." },
    ],
  },
  {
    kind: "scenario", packId: "uganda-high-school-english", courseId: "english-source-choice", title: "Use a source clearly", eyebrow: "HIGH SCHOOL ENGLISH SCENARIO",
    scenario: "A learner finds a useful online explanation while preparing a class paragraph. The learner copies a sentence into the draft but has not recorded the page title, author, or link.", prompt: "What should happen before the draft is shared?", options: ["Keep the sentence because online writing does not need a source.", "Record the source details, decide whether to quote or paraphrase, and make the source use clear in the draft.", "Delete every source name so the paragraph looks more original.", "Ask another learner to submit the copied sentence under a different name."], bestOption: "Record the source details, decide whether to quote or paraphrase, and make the source use clear in the draft.", explanation: "Clear source use helps a reader understand where ideas and wording came from and lets the learner check the original context.", boundaryNote: "Learning scenario only; use your school’s guidance for formal assignments and assessment.",
  },
  {
    kind: "evidence_reading", packId: "uganda-high-school-physics", courseId: "physics-motion-evidence", title: "Describe motion from a record", eyebrow: "HIGH SCHOOL PHYSICS STARTER", passageTitle: "Two recorded journeys",
    passage: "During a teacher-supervised classroom activity, a learner records that one toy cart travels 4 metres in 2 seconds and a second cart travels 4 metres in 4 seconds. The learner has not yet checked whether both distances and timing methods were recorded in the same way.", prompt: "Which statement uses the record most carefully?", options: ["The first cart has a greater recorded distance per second, but the comparison method should also be checked.", "The first cart must have more force because it arrived sooner.", "The second cart did not move because it took longer.", "The timing record can be ignored because the distances are the same."], correctOption: "The first cart has a greater recorded distance per second, but the comparison method should also be checked.", explanation: "The recorded values support a comparison of distance per second, while careful reasoning still checks that measurements were made consistently before a broader explanation is claimed.",
  },
  {
    kind: "worked_calculation", packId: "uganda-high-school-physics", courseId: "physics-speed-count", title: "Calculate a recorded speed", eyebrow: "HIGH SCHOOL PHYSICS STARTER",
    scenario: "A record shows an object travelling 120 metres in 15 seconds. This activity only practises calculating speed from the stated values.", prompt: "What is the recorded speed in metres per second?", expectedAnswer: 8, unit: " m/s", tolerance: 0.01, explanation: "Divide recorded distance by recorded time: 120 ÷ 15 = 8 m/s. The calculation describes the stated example only.", safetyNote: "Learning calculation only; do not use this activity as experimental, transport, or safety guidance.",
  },
  {
    kind: "scenario", packId: "uganda-high-school-physics", courseId: "physics-fair-test-choice", title: "Compare measurements carefully", eyebrow: "HIGH SCHOOL PHYSICS SCENARIO",
    scenario: "A learner wants to compare two recorded motion trials in a teacher-supervised activity. The learner proposes using different distances, different timing methods, and different starting positions, then choosing the result that looks quickest.", prompt: "What is the strongest next step?", options: ["Use a consistent stated distance and timing method, record relevant conditions, then compare the results.", "Change every condition so the trials are more varied.", "Keep only the quickest result and ignore the rest.", "State the conclusion before recording the trial values."], bestOption: "Use a consistent stated distance and timing method, record relevant conditions, then compare the results.", explanation: "Consistent measurements and transparent records make a comparison more meaningful than selecting a preferred result.", boundaryNote: "Learning scenario only; school safety rules and teacher instructions always take priority.",
  },
  {
    kind: "logic_trace", packId: "uganda-high-school-mathematics", courseId: "mathematics-pattern-trace", title: "Trace a number pattern", eyebrow: "HIGH SCHOOL MATHEMATICS STARTER",
    scenario: "A number pattern starts at 4. Each step first doubles the current number and then adds 3. The first result is therefore 11.", prompt: "What is the next result after 11?", options: ["25", "22", "14", "18"], correctOption: "25", explanation: "Apply the stated rule to 11: double 11 to get 22, then add 3 to get 25. Showing each step makes the pattern checkable.",
  },
  {
    kind: "worked_calculation", packId: "uganda-high-school-mathematics", courseId: "mathematics-percentage-count", title: "Find a percentage of a quantity", eyebrow: "HIGH SCHOOL MATHEMATICS STARTER",
    scenario: "A class reading record shows that 18 of 24 learners completed a short practice activity. This activity only asks for the percentage in the stated record.", prompt: "What percentage of the recorded learners completed the activity?", expectedAnswer: 75, unit: "%", tolerance: 0.01, explanation: "Divide the completed count by the total count, then multiply by 100: 18 ÷ 24 × 100 = 75%. The percentage describes this record only.",
  },
  {
    kind: "scenario", packId: "uganda-high-school-mathematics", courseId: "mathematics-representation-choice", title: "Choose a useful representation", eyebrow: "HIGH SCHOOL MATHEMATICS SCENARIO",
    scenario: "A learner has recorded attendance for four study sessions and wants to explain whether participation changed. The values are written in a notebook but are not yet organised for comparison.", prompt: "What is the most useful next step before making a conclusion?", options: ["Place the session labels and values in a clear table or simple graph, then check the pattern against the recorded numbers.", "Choose the largest value and state that every session improved.", "Ignore the session labels because the values are enough on their own.", "Change the smallest value so the pattern appears smoother."], bestOption: "Place the session labels and values in a clear table or simple graph, then check the pattern against the recorded numbers.", explanation: "A clear representation makes comparison possible and helps the learner explain only what the recorded values support.", boundaryNote: "Learning scenario only; this is not an official marking or examination prediction service.",
  },
  {
    kind: "evidence_reading", packId: "uganda-high-school-geography", courseId: "geography-map-evidence", title: "Read a map key carefully", eyebrow: "HIGH SCHOOL GEOGRAPHY STARTER", passageTitle: "A community map",
    passage: "A map key shows a solid blue line for a year-round river and a dashed blue line for a seasonal stream. A learner points to a dashed line near a settlement and says the map proves that the settlement has reliable water throughout the year.", prompt: "Which response uses the map evidence most carefully?", options: ["The dashed line represents a seasonal stream, so the map alone does not prove year-round water availability.", "Every blue line always shows a year-round river.", "The map proves that no one lives near the seasonal stream.", "The settlement must have no other water sources."], correctOption: "The dashed line represents a seasonal stream, so the map alone does not prove year-round water availability.", explanation: "The key supports a careful description of the mapped feature. A claim about reliable water would need more information than the line symbol alone.",
  },
  {
    kind: "worked_calculation", packId: "uganda-high-school-geography", courseId: "geography-scale-count", title: "Calculate a map distance", eyebrow: "HIGH SCHOOL GEOGRAPHY STARTER",
    scenario: "A classroom map uses the stated scale of 1 centimetre representing 5 kilometres. Two points are 4.2 centimetres apart on the map. This is a scale calculation exercise only.", prompt: "What real distance does the stated map measurement represent?", expectedAnswer: 21, unit: " km", tolerance: 0.01, explanation: "Multiply the map distance by the stated scale: 4.2 × 5 = 21 km. This describes the classroom example only.", safetyNote: "Learning calculation only; do not use this activity for travel, navigation, or safety decisions.",
  },
  {
    kind: "scenario", packId: "uganda-high-school-geography", courseId: "geography-environment-choice", title: "Compare an environmental claim", eyebrow: "HIGH SCHOOL GEOGRAPHY SCENARIO",
    scenario: "A student group hears that a wetland near a community has become smaller. One learner wants to post that one cause has been proven without checking maps, observations, dates, or local sources.", prompt: "What is the strongest next step?", options: ["Identify the claim, compare dated observations or reliable sources, and state what remains uncertain.", "Name one cause immediately because it sounds likely.", "Ignore the time period because places never change.", "Share only comments that agree with the first explanation."], bestOption: "Identify the claim, compare dated observations or reliable sources, and state what remains uncertain.", explanation: "Geographic reasoning compares place-based evidence over time and avoids treating an early explanation as proof.", boundaryNote: "Learning scenario only; this is not environmental, legal, land-use, or safety advice.",
  },
  {
    kind: "evidence_reading", packId: "uganda-high-school-history-civics", courseId: "history-source-evidence", title: "Read a historical source carefully", eyebrow: "HIGH SCHOOL HISTORY AND CIVICS STARTER", passageTitle: "A remembered event",
    passage: "A community elder describes a school event that happened many years earlier. The account gives a clear personal memory of the day but does not include the school record, newspaper report, or other accounts from that time.", prompt: "What is the most careful conclusion?", options: ["The account is a useful perspective, and another source could help check details about the event.", "One memory proves every detail of the event beyond question.", "Personal memories can never be discussed in history.", "The account proves that no record exists."], correctOption: "The account is a useful perspective, and another source could help check details about the event.", explanation: "A personal account can be valuable evidence while still benefiting from corroboration when a learner makes broader historical claims.",
  },
  {
    kind: "logic_trace", packId: "uganda-high-school-history-civics", courseId: "history-timeline-trace", title: "Trace a stated timeline", eyebrow: "HIGH SCHOOL HISTORY AND CIVICS STARTER",
    scenario: "A class timeline states that a meeting happened first, the group then recorded its decision, and a public notice followed after the decision was recorded.", prompt: "Which event is supported as coming after the recorded decision?", options: ["The public notice", "The meeting", "An event before the meeting", "No event can be ordered from the timeline"], correctOption: "The public notice", explanation: "The stated sequence places the public notice after the decision record. A timeline supports the order given without adding events that were not recorded.",
  },
  {
    kind: "scenario", packId: "uganda-high-school-history-civics", courseId: "civics-respectful-choice", title: "Evaluate a civic choice", eyebrow: "HIGH SCHOOL HISTORY AND CIVICS SCENARIO",
    scenario: "Learners disagree about a school-community project. One group wants to dismiss another group’s view before hearing its reasons or checking the stated project information.", prompt: "What is the most responsible next step?", options: ["Invite each group to state its reasons, compare them with the available information, and agree on a respectful discussion process.", "Choose the loudest view before hearing the others.", "Treat disagreement as proof that one group should be excluded.", "Share personal details about learners who disagree."], bestOption: "Invite each group to state its reasons, compare them with the available information, and agree on a respectful discussion process.", explanation: "Civic learning supports respectful participation, evidence-aware dialogue, and protection of people’s dignity during disagreement.", boundaryNote: "Learning scenario only; it is not political, legal, or civic authority guidance.",
  },
  {
    kind: "evidence_reading", packId: "uganda-high-school-ict", courseId: "ict-information-evidence", title: "Check a digital claim", eyebrow: "HIGH SCHOOL ICT STARTER", passageTitle: "A forwarded message",
    passage: "A learner receives a forwarded message saying that a new school rule will begin tomorrow. The message has no named school office, date, or link to an official notice, but several people have shared it.", prompt: "What is the strongest response?", options: ["Check a named official school source or ask the responsible office before treating the message as confirmed.", "Treat the message as confirmed because it has been shared many times.", "Forward it again without checking so more people know.", "Delete all school notices because online information is always false."], correctOption: "Check a named official school source or ask the responsible office before treating the message as confirmed.", explanation: "Sharing does not establish accuracy. A named and relevant source helps a learner check a claim before acting on or repeating it.",
  },
  {
    kind: "logic_trace", packId: "uganda-high-school-ict", courseId: "ict-logic-trace", title: "Trace a simple digital rule", eyebrow: "HIGH SCHOOL ICT STARTER",
    scenario: "A class rule says: if a file contains private learner information, do not send it to a public group; instead, ask the teacher or authorised school contact how it should be handled.", prompt: "What should happen when a learner notices private learner information in a file?", options: ["Do not send it to the public group; ask an authorised contact for the next step.", "Post it publicly so others can check it.", "Rename the file and share it anyway.", "Assume it is safe because it is digital."], correctOption: "Do not send it to the public group; ask an authorised contact for the next step.", explanation: "The stated rule leads directly to a privacy-aware action. Learners should not turn a class exercise into a real data-handling decision without school guidance.",
  },
  {
    kind: "scenario", packId: "uganda-high-school-ict", courseId: "ict-data-choice", title: "Share data responsibly", eyebrow: "HIGH SCHOOL ICT SCENARIO",
    scenario: "A learner creates a class survey. A friend suggests collecting every respondent’s full name, phone number, and home location even though the activity only needs anonymous answers about study habits.", prompt: "What is the most responsible next step?", options: ["Collect only the information needed, explain the learning purpose, and use a teacher-approved process.", "Collect all details in case they are useful later.", "Share respondents’ details with classmates to improve the survey.", "Promise anonymity but record names secretly."], bestOption: "Collect only the information needed, explain the learning purpose, and use a teacher-approved process.", explanation: "Responsible digital learning limits unnecessary personal information and makes the purpose and process clear.", boundaryNote: "Learning scenario only; this is not cybersecurity, legal, or data-protection advice.",
  },
  {
    kind: "evidence_reading", packId: "uganda-high-school-agriculture", courseId: "agriculture-record-evidence", title: "Use a production record carefully", eyebrow: "HIGH SCHOOL AGRICULTURE STARTER", passageTitle: "A garden record",
    passage: "A school garden record shows that one bed produced fewer vegetables in a particular week. The record includes harvest amounts but does not include rainfall, soil conditions, pests, planting date, or care routines.", prompt: "Which response is most careful?", options: ["The record shows a difference in harvest amounts, but more observations are needed before explaining why it happened.", "The lower amount proves one specific cause.", "The bed can never produce well again.", "Harvest records are not useful for learning."], correctOption: "The record shows a difference in harvest amounts, but more observations are needed before explaining why it happened.", explanation: "A record can identify a pattern worth investigating while keeping observed outcomes separate from explanations that require more evidence.",
  },
  {
    kind: "worked_calculation", packId: "uganda-high-school-agriculture", courseId: "agriculture-output-count", title: "Calculate a recorded average", eyebrow: "HIGH SCHOOL AGRICULTURE STARTER",
    scenario: "A classroom record lists three weekly harvest amounts of 42, 48, and 60 units. This activity only practises finding the average of the stated record.", prompt: "What is the average weekly amount?", expectedAnswer: 50, unit: " units", tolerance: 0.01, explanation: "Add the stated amounts and divide by three: (42 + 48 + 60) ÷ 3 = 50 units. The average describes this classroom record only.", safetyNote: "Learning calculation only; do not use this activity as farming, production, or financial advice.",
  },
  {
    kind: "scenario", packId: "uganda-high-school-agriculture", courseId: "agriculture-sustainability-choice", title: "Choose a sustainable next question", eyebrow: "HIGH SCHOOL AGRICULTURE SCENARIO",
    scenario: "A learner hears that a new practice will certainly improve every garden. The learner has one observation but no consistent records across sites, seasons, soil conditions, or care routines.", prompt: "What is the strongest next step?", options: ["Record the observation, identify relevant conditions, and ask what further evidence would be needed before a broad claim.", "Recommend the practice for every garden immediately.", "Ignore conditions because all gardens work the same way.", "Remove records that show a different result."], bestOption: "Record the observation, identify relevant conditions, and ask what further evidence would be needed before a broad claim.", explanation: "Sustainable agricultural reasoning starts with careful records and avoids turning one observation into an unsupported universal recommendation.", boundaryNote: "Learning scenario only; it is not farming, environmental, veterinary, or safety guidance.",
  },
  {
    kind: "evidence_reading", packId: "uganda-high-school-religion-ethics", courseId: "ethics-perspective-evidence", title: "Recognise a perspective", eyebrow: "HIGH SCHOOL RELIGIOUS AND ETHICAL STUDIES STARTER", passageTitle: "A community choice",
    passage: "In a class discussion, one learner says that a community project is important because it reflects a deeply held value. Another learner says the project should also explain how it will affect different people in the community.", prompt: "Which response best distinguishes the statements?", options: ["The first expresses a value-based perspective, while the second asks for relevant effects to be considered.", "Only one learner is allowed to have a value-based view.", "Values mean evidence and effects never matter.", "The discussion proves that everyone must agree immediately."], correctOption: "The first expresses a value-based perspective, while the second asks for relevant effects to be considered.", explanation: "Ethical learning can recognise values while also considering reasons, effects, and respectful dialogue without ranking learners’ beliefs.",
  },
  {
    kind: "logic_trace", packId: "uganda-high-school-religion-ethics", courseId: "ethics-reason-trace", title: "Trace a reasoned choice", eyebrow: "HIGH SCHOOL RELIGIOUS AND ETHICAL STUDIES STARTER",
    scenario: "A discussion rule says: if a learner disagrees with an idea, the learner should describe the idea fairly, give a reason respectfully, and avoid attacking the person who shared it.", prompt: "Which response follows the stated rule?", options: ["Describe the idea fairly and give a respectful reason for a different view.", "Insult the learner who shared the idea.", "Repeat a rumour about the learner instead of discussing the idea.", "Refuse to let anyone else speak."], correctOption: "Describe the idea fairly and give a respectful reason for a different view.", explanation: "The rule directs attention to ideas and reasons rather than personal attacks, making space for respectful disagreement.",
  },
  {
    kind: "scenario", packId: "uganda-high-school-religion-ethics", courseId: "ethics-dialogue-choice", title: "Choose respectful dialogue", eyebrow: "HIGH SCHOOL RELIGIOUS AND ETHICAL STUDIES SCENARIO",
    scenario: "Classmates disagree about how a school activity should recognise different community traditions. One learner suggests choosing a single view without listening to anyone else.", prompt: "What is the most respectful next step?", options: ["Invite respectful perspectives, identify shared needs, and use school guidance before proposing an inclusive option.", "Choose a single view immediately and stop discussion.", "Mock learners whose views differ.", "Share private details about classmates’ beliefs."], bestOption: "Invite respectful perspectives, identify shared needs, and use school guidance before proposing an inclusive option.", explanation: "Respectful ethical dialogue protects dignity, recognises difference, and looks for a process that is appropriate for the school community.", boundaryNote: "Learning scenario only; it is not religious authority, counselling, or legal advice.",
  },
  {
    kind: "evidence_reading", packId: "uganda-high-school-kiswahili", courseId: "kiswahili-maana-muktadha", title: "Maana katika muktadha", eyebrow: "HIGH SCHOOL KISWAHILI STARTER", passageTitle: "Ujumbe wa darasa",
    passage: "Mwalimu aliandika: ‘Wanafunzi walifika mapema kwa sababu walitaka kujiandaa kabla ya mjadala.’ Mwanafunzi mmoja anasema kuwa neno ‘mapema’ linathibitisha kwamba kila mwanafunzi aliwasili kwa wakati uleule.", prompt: "Jibu lipi linatumia ushahidi wa sentensi kwa makini?", options: ["Sentensi inaonyesha kwamba wanafunzi walifika kabla ya mjadala, lakini haisemi kuwa kila mmoja aliwasili wakati uleule.", "Neno ‘mapema’ linathibitisha muda kamili wa kila mwanafunzi.", "Sentensi haisemi chochote kuhusu maandalizi.", "Mwalimu lazima alichelewa kwa sababu wanafunzi walifika mapema."], correctOption: "Sentensi inaonyesha kwamba wanafunzi walifika kabla ya mjadala, lakini haisemi kuwa kila mmoja aliwasili wakati uleule.", explanation: "Ushahidi unaunga mkono maana ya kufika kabla ya mjadala, bila kuongeza muda kamili ambao sentensi haikusema.",
  },
  {
    kind: "writing_planner", packId: "uganda-high-school-kiswahili", courseId: "kiswahili-ujumbe-planner", title: "Panga ujumbe wako", eyebrow: "HIGH SCHOOL KISWAHILI STARTER",
    brief: "Unapanga ujumbe mfupi wa Kiswahili wa kuwakaribisha wanafunzi kwenye kikundi cha kusoma. Kusudi ni wazi, la heshima, na linaeleza hatua inayofuata. Mpango unabaki binafsi kwenye kifaa; Rounds huandika kukamilika, si alama ya uandishi wa Kiswahili.", prompts: [{ id: "kiswahili-message-plan", label: "Andika mpango wa ujumbe", helper: "Taja hadhira, kusudi, maelezo muhimu, na ukaguzi mmoja wa lugha au heshima." }],
  },
  {
    kind: "scenario", packId: "uganda-high-school-kiswahili", courseId: "kiswahili-mawasiliano-choice", title: "Chagua mawasiliano ya heshima", eyebrow: "HIGH SCHOOL KISWAHILI SCENARIO",
    scenario: "Katika kikundi cha kusoma, mwanafunzi anataka kujibu ujumbe wenye makosa kwa kumdhalilisha mwandishi hadharani.", prompt: "Hatua ipi inaonyesha mawasiliano ya heshima?", options: ["Jibu kwa heshima, eleza sehemu inayohitaji ufafanuzi, na umwalike mwandishi kurekebisha ujumbe.", "Tumia kejeli ili wengine wacheke.", "Sambaza ujumbe kwa watu wengi bila sababu.", "Kataa kusoma ujumbe wowote wa kikundi."], bestOption: "Jibu kwa heshima, eleza sehemu inayohitaji ufafanuzi, na umwalike mwandishi kurekebisha ujumbe.", explanation: "Mawasiliano yenye heshima hulenga ujumbe na ufafanuzi bila kumdhalilisha mtu.", boundaryNote: "Learning scenario only; this is not an official language assessment or counselling guidance.",
  },
  {
    kind: "evidence_reading", packId: "uganda-high-school-literature", courseId: "literature-character-evidence", title: "Use character evidence", eyebrow: "HIGH SCHOOL LITERATURE STARTER", passageTitle: "A short scene",
    passage: "In a short scene, Nia pauses before answering a friend’s question, looks at the unfinished poster on the table, and says, ‘I should check the details before we promise anything.’", prompt: "Which interpretation is best supported by the stated details?", options: ["Nia is cautious about making a promise before checking information.", "Nia never wants to complete the poster.", "Nia has proved that the friend is dishonest.", "Nia is certain the project will fail."], correctOption: "Nia is cautious about making a promise before checking information.", explanation: "Nia’s pause, attention to the poster, and stated wish to check details support a cautious interpretation without proving broader claims.",
  },
  {
    kind: "writing_planner", packId: "uganda-high-school-literature", courseId: "literature-theme-planner", title: "Plan a theme response", eyebrow: "HIGH SCHOOL LITERATURE STARTER",
    brief: "You are preparing a short response about a possible theme in a classroom text. Your response should connect a claim to a specific stated detail and explain the link. Your plan stays private on this device; Rounds records completion without grading personal literary interpretation.", prompts: [{ id: "literature-theme-plan", label: "Plan your literary response", helper: "Write a possible theme claim, one exact detail to use, your explanation, and one check against overstatement." }],
  },
  {
    kind: "scenario", packId: "uganda-high-school-literature", courseId: "literature-interpretation-choice", title: "Compare interpretations", eyebrow: "HIGH SCHOOL LITERATURE SCENARIO",
    scenario: "Two learners give different readings of a character’s silence in a short text. Each can point to a different line, but one learner says only one interpretation may be discussed.", prompt: "What is the strongest next step?", options: ["Compare the cited lines, explain how each supports an interpretation, and note what the text does not settle.", "Choose the loudest interpretation without looking at the text.", "Say personal attacks are evidence of interpretation.", "Remove the lines that support a different reading."], bestOption: "Compare the cited lines, explain how each supports an interpretation, and note what the text does not settle.", explanation: "Literary discussion can compare interpretations when learners stay connected to textual evidence and recognise uncertainty.", boundaryNote: "Learning scenario only; this is not an official marking or examination prediction service.",
  },
  {
    kind: "evidence_reading", packId: "uganda-high-school-fine-art", courseId: "fine-art-observation-evidence", title: "Observe a visual choice", eyebrow: "HIGH SCHOOL FINE ART STARTER", passageTitle: "A classroom artwork",
    passage: "A classroom artwork places a small bright shape near the centre and uses darker tones around it. A learner says the artist has proved that the bright shape is the most important object in every viewer’s experience.", prompt: "Which response is most careful?", options: ["The contrast and central placement make the shape visually noticeable, but viewers may still interpret its importance differently.", "The bright shape proves every viewer has the same response.", "Darker tones cannot be part of a visual choice.", "The artwork has no visible design features."], correctOption: "The contrast and central placement make the shape visually noticeable, but viewers may still interpret its importance differently.", explanation: "Observation can describe visible choices such as contrast and placement without claiming that every viewer must share one interpretation.",
  },
  {
    kind: "writing_planner", packId: "uganda-high-school-fine-art", courseId: "fine-art-process-planner", title: "Plan a visual process", eyebrow: "HIGH SCHOOL FINE ART STARTER",
    brief: "You are planning a classroom visual response about a familiar place. The plan should name an intended message, materials you can use safely in class, and a simple revision check. Your creative plan stays private on the device; Rounds records completion and does not issue professional art assessment.", prompts: [{ id: "fine-art-process-plan", label: "Plan your visual response", helper: "State the intended message, two design choices, available classroom materials, and one question for revision." }],
  },
  {
    kind: "scenario", packId: "uganda-high-school-fine-art", courseId: "fine-art-critique-choice", title: "Give respectful critique", eyebrow: "HIGH SCHOOL FINE ART SCENARIO",
    scenario: "A learner is asked to respond to a classmate’s artwork. A friend suggests saying only that it is ‘bad’ without referring to the visible work or the artist’s stated purpose.", prompt: "What is the most useful next response?", options: ["Describe one visible choice, connect it to the stated purpose, and offer a respectful question or suggestion.", "Use an insult because it is quicker.", "Assume the artist’s personal life explains the artwork.", "Share a photo of the work outside class without permission."], bestOption: "Describe one visible choice, connect it to the stated purpose, and offer a respectful question or suggestion.", explanation: "Constructive critique focuses on visible work, stated purpose, and respectful next questions rather than personal attacks.", boundaryNote: "Learning scenario only; it is not professional art assessment or a permission to share another learner’s work.",
  },
  {
    kind: "evidence_reading", packId: "uganda-high-school-technical-drawing", courseId: "technical-drawing-view-evidence", title: "Read a drawing view", eyebrow: "HIGH SCHOOL TECHNICAL DRAWING STARTER", passageTitle: "A stated view",
    passage: "A classroom drawing is labelled ‘front view’ and shows a rectangle with a centred circular feature. The drawing does not show a side view, dimensions, or material information.", prompt: "Which statement is best supported by the drawing?", options: ["The front view shows a rectangular outline with a centred circular feature, but it does not provide side detail or dimensions.", "The drawing proves the object’s exact depth and material.", "A front view always shows every surface of an object.", "The drawing has no information about shape."], correctOption: "The front view shows a rectangular outline with a centred circular feature, but it does not provide side detail or dimensions.", explanation: "A stated view supports description of what is shown while leaving missing dimensions and other views unresolved.",
  },
  {
    kind: "worked_calculation", packId: "uganda-high-school-technical-drawing", courseId: "technical-drawing-scale-count", title: "Use a stated scale", eyebrow: "HIGH SCHOOL TECHNICAL DRAWING STARTER",
    scenario: "A classroom drawing uses a stated scale of 1 centimetre representing 50 millimetres. A labelled feature measures 3.4 centimetres on the drawing. This is a scale exercise only.", prompt: "What real measurement does the stated drawing length represent?", expectedAnswer: 170, unit: " mm", tolerance: 0.01, explanation: "Multiply the stated drawing length by the stated scale: 3.4 × 50 = 170 mm. This describes the classroom example only.", safetyNote: "Learning calculation only; do not use this activity for construction, manufacturing, or safety decisions.",
  },
  {
    kind: "scenario", packId: "uganda-high-school-technical-drawing", courseId: "technical-drawing-convention-choice", title: "Choose a clear convention", eyebrow: "HIGH SCHOOL TECHNICAL DRAWING SCENARIO",
    scenario: "A learner is preparing a classroom technical drawing for peer review. The learner wants to add an important note but is unsure whether to place it across the visible lines where it will be difficult to read.", prompt: "What is the strongest next step?", options: ["Use a clear, legible note placement and ask the teacher or peer-review guide to check the stated drawing convention.", "Place the note over several lines because more text is always better.", "Hide the note so no one can question it.", "Treat the classroom drawing as a construction instruction without review."], bestOption: "Use a clear, legible note placement and ask the teacher or peer-review guide to check the stated drawing convention.", explanation: "Clear communication and a stated review process are more useful than guessing a convention or turning a classroom task into an instruction.", boundaryNote: "Learning scenario only; it is not engineering, construction, manufacturing, or safety guidance.",
  },
  {
    kind: "evidence_reading", packId: "uganda-high-school-food-nutrition", courseId: "food-nutrition-label-evidence", title: "Read a stated food label", eyebrow: "HIGH SCHOOL FOOD AND NUTRITION STARTER", passageTitle: "A classroom label exercise",
    passage: "A classroom exercise shows a packaged-food label with a stated serving amount and a listed ingredient. A learner says that the label proves the food is the best choice for every person in every situation.", prompt: "Which response uses the stated information most carefully?", options: ["The label provides information about the stated product, but it does not prove one choice is best for every person or situation.", "One listed ingredient proves the product is right for everyone.", "Food labels never provide useful information.", "The exercise label replaces professional health guidance."], correctOption: "The label provides information about the stated product, but it does not prove one choice is best for every person or situation.", explanation: "A stated label can be read carefully without turning a classroom exercise into a universal food or health recommendation.",
  },
  {
    kind: "worked_calculation", packId: "uganda-high-school-food-nutrition", courseId: "food-nutrition-portion-count", title: "Compare a classroom portion record", eyebrow: "HIGH SCHOOL FOOD AND NUTRITION STARTER",
    scenario: "A classroom record lists 24 servings prepared for a demonstration and 6 servings set aside for a separate labelled activity. This is only a simple fraction calculation from the stated record.", prompt: "What fraction of the stated servings was set aside?", expectedAnswer: 0.25, unit: " of the record", tolerance: 0.001, explanation: "Divide the stated set-aside count by the total: 6 ÷ 24 = 0.25. This describes the classroom record only.", safetyNote: "Learning calculation only; do not use this activity as dietetic, medical, food-safety, or food-preparation guidance.",
  },
  {
    kind: "scenario", packId: "uganda-high-school-food-nutrition", courseId: "food-nutrition-plan-choice", title: "Plan a careful food information check", eyebrow: "HIGH SCHOOL FOOD AND NUTRITION SCENARIO",
    scenario: "A learner sees a short online post saying that one ingredient will solve everyone’s study-energy problems. The post gives no source, no context, and no information about who the claim applies to.", prompt: "What is the strongest next step for the classroom discussion?", options: ["Identify the claim, check a relevant reliable source with a teacher, and state what the post does not establish.", "Repeat the claim as a guarantee for all learners.", "Tell classmates to make personal diet changes immediately.", "Assume a popular post needs no checking."], bestOption: "Identify the claim, check a relevant reliable source with a teacher, and state what the post does not establish.", explanation: "The response keeps a classroom information check separate from personal dietary decisions or health advice.", boundaryNote: "Learning scenario only; it is not dietetic, medical, food-safety, or food-preparation guidance.",
  },
  {
    kind: "evidence_reading", packId: "uganda-high-school-music", courseId: "music-listening-evidence", title: "Describe a stated listening pattern", eyebrow: "HIGH SCHOOL MUSIC STARTER", passageTitle: "A classroom excerpt",
    passage: "In a classroom listening exercise, a short excerpt repeats a steady hand-clap pattern while a second sound enters later with a higher pitch. A learner says the higher sound proves that every listener must feel excited.", prompt: "Which response is most careful?", options: ["The excerpt includes a repeated pattern and a later higher sound, but listeners may respond differently.", "A higher sound proves every listener has the same feeling.", "Repeated patterns cannot be described in music.", "The excerpt proves the performer’s private intention."], correctOption: "The excerpt includes a repeated pattern and a later higher sound, but listeners may respond differently.", explanation: "Listening evidence can describe audible features without claiming identical feelings or private intentions for every person.",
  },
  {
    kind: "writing_planner", packId: "uganda-high-school-music", courseId: "music-performance-planner", title: "Plan a group performance", eyebrow: "HIGH SCHOOL MUSIC STARTER",
    brief: "You are planning a short classroom performance. The plan should identify group roles, one rehearsal check, and a respectful way to coordinate changes. Your plan remains private on the device and is not professional performance assessment.", prompts: [{ id: "music-group-plan", label: "Plan your group performance", helper: "State the shared purpose, learner roles, rehearsal check, and one respectful coordination step." }],
  },
  {
    kind: "scenario", packId: "uganda-high-school-music", courseId: "music-feedback-choice", title: "Choose respectful musical feedback", eyebrow: "HIGH SCHOOL MUSIC SCENARIO",
    scenario: "A group is rehearsing a short classroom piece. One learner wants to tell another learner to stop participating because the first rehearsal was uneven.", prompt: "What is the strongest next step?", options: ["Name one observable rehearsal point, invite a shared practice adjustment, and keep participation respectful.", "Exclude the learner after one attempt.", "Mock the learner in front of the group.", "Share a recording of the rehearsal outside class without permission."], bestOption: "Name one observable rehearsal point, invite a shared practice adjustment, and keep participation respectful.", explanation: "Respectful feedback focuses on an observable rehearsal point and a constructive next step rather than excluding or humiliating a learner.", boundaryNote: "Learning scenario only; it is not professional performance assessment or permission to share another learner’s recording.",
  },
  {
    kind: "evidence_reading", packId: "uganda-high-school-physical-education", courseId: "physical-education-observation-evidence", title: "Read a movement observation", eyebrow: "HIGH SCHOOL PHYSICAL EDUCATION STARTER", passageTitle: "A classroom activity record",
    passage: "A teacher-supervised classroom activity record notes that one learner paused twice during a team task. The record does not state why the learner paused, how the learner felt, or whether an adjustment was requested.", prompt: "Which response is most careful?", options: ["The record notes two pauses, but further respectful conversation and teacher guidance are needed before explaining why.", "The pauses prove the learner is unwilling to participate.", "The learner should be given an exercise instruction by classmates.", "The record proves the same pattern will happen in every activity."], correctOption: "The record notes two pauses, but further respectful conversation and teacher guidance are needed before explaining why.", explanation: "A movement observation should not be turned into a personal judgement or activity instruction without appropriate teacher guidance.",
  },
  {
    kind: "writing_planner", packId: "uganda-high-school-physical-education", courseId: "physical-education-session-planner", title: "Plan fair participation", eyebrow: "HIGH SCHOOL PHYSICAL EDUCATION STARTER",
    brief: "You are planning a teacher-supervised classroom movement activity. The plan should include fair participation roles, one inclusive adjustment to discuss with the teacher, and a reflection question. It is not an exercise prescription or sports-coaching plan.", prompts: [{ id: "physical-education-participation-plan", label: "Plan fair participation", helper: "State the shared activity purpose, participation roles, a teacher-discussion adjustment, and one reflection question." }],
  },
  {
    kind: "scenario", packId: "uganda-high-school-physical-education", courseId: "physical-education-fair-play-choice", title: "Choose a fair participation step", eyebrow: "HIGH SCHOOL PHYSICAL EDUCATION SCENARIO",
    scenario: "During a teacher-supervised classroom activity, a team keeps giving the same learners every turn while other learners wait without being asked what role would help them participate.", prompt: "What is the most responsible next step?", options: ["Pause the team process, invite respectful role preferences, and use the teacher’s activity guidance to share participation fairly.", "Keep the same learners in every role because they are faster.", "Pressure a learner to continue after they ask for teacher support.", "Make a medical judgement about classmates from the activity."], bestOption: "Pause the team process, invite respectful role preferences, and use the teacher’s activity guidance to share participation fairly.", explanation: "Fair participation works with teacher guidance, respectful choice, and inclusive roles rather than pressure or assumptions about learners.", boundaryNote: "Learning scenario only; it is not exercise prescription, sports coaching, injury, or medical guidance.",
  },
];

export function starterActivityFor(packId: string, courseId: string): StarterCourseActivity | null {
  return STARTER_COURSE_ACTIVITIES.find((activity) => activity.packId === packId && activity.courseId === courseId) ?? null;
}
