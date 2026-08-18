export type CaseChainStep = {
  id: string;
  title: string;
  situation: string;
  prompt: string;
  options: string[];
  bestOption: string;
  explanation: string;
};

export type CourseCaseChain = {
  id: string;
  packId: string;
  title: string;
  eyebrow: string;
  summary: string;
  boundaryNote?: string;
  reflectionPrompt: string;
  steps: CaseChainStep[];
};

export const COURSE_CASE_CHAINS: CourseCaseChain[] = [
  {
    id: "foundation-source-plan", packId: "university-foundation-year", title: "Prepare a traceable source plan", eyebrow: "ACADEMIC FOUNDATIONS CASE", summary: "Move from useful notes to an attributable, submission-ready draft.", reflectionPrompt: "What source-checking habit will you use before your next draft?",
    steps: [
      { id: "capture", title: "Capture the source details", situation: "You have copied useful wording from an online article into a private draft. The article remains open, but no author, date, title, or link has been recorded.", prompt: "What should you do first?", options: ["Record the source details and mark the borrowed wording for quotation or careful paraphrase.", "Leave the text unchanged because the page is public.", "Delete the browser history so no one can find the page."], bestOption: "Record the source details and mark the borrowed wording for quotation or careful paraphrase.", explanation: "Traceable source details support accurate attribution and allow you to check the original context later." },
      { id: "review", title: "Check the draft before sharing", situation: "The source details are now recorded and the wording has been revised. You are preparing to share the draft with a study partner for feedback.", prompt: "Which final check best supports responsible academic work?", options: ["Make it clear which ideas are yours and which are sourced, then ask for feedback on the argument.", "Remove every citation so the draft looks more original.", "Ask the study partner to submit the draft under their name."], bestOption: "Make it clear which ideas are yours and which are sourced, then ask for feedback on the argument.", explanation: "Clear attribution and a focused feedback request help improve the work without hiding the origin of ideas." },
    ],
  },
  {
    id: "computing-accessible-events", packId: "computing-foundations", title: "Plan an accessible events page", eyebrow: "COMPUTING CASE", summary: "Turn user needs into requirements and an early test plan.", reflectionPrompt: "What user need would you put into the first version’s acceptance criteria?",
    steps: [
      { id: "requirements", title: "Set the requirements", situation: "A student team is planning a campus-events page. Users mention keyboard navigation and readable contrast, and the team has limited time for a first version.", prompt: "How should the team treat these needs?", options: ["Include them as requirements for the first version.", "Treat them as decoration to add after launch.", "Ask affected users to use another website."], bestOption: "Include them as requirements for the first version.", explanation: "Accessibility needs belong in the problem definition, not as optional decoration." },
      { id: "test", title: "Choose an early test", situation: "The first page prototype now includes labeled controls and visible focus order. The team needs a short test before building more features.", prompt: "Which test is most useful now?", options: ["Navigate the page using a keyboard and check whether each control has a clear label and visible focus.", "Add more animations before any interaction test.", "Assume that a page is accessible if it works with a mouse."], bestOption: "Navigate the page using a keyboard and check whether each control has a clear label and visible focus.", explanation: "A small task-based test checks the specific requirements the team identified." },
    ],
  },
  {
    id: "business-consent-campaign", packId: "business-foundations", title: "Plan a consent-aware campaign", eyebrow: "BUSINESS CASE", summary: "Use customer contact details consistently with their stated purpose.", boundaryNote: "This is a learning case, not legal advice.", reflectionPrompt: "What would you state clearly on a future sign-up form?",
    steps: [
      { id: "purpose", title: "Check the collection purpose", situation: "A team collected email addresses for event attendance. It now wants to send a separate promotional message about a new idea.", prompt: "What should the team do first?", options: ["Check the stated purpose and seek clear permission for the promotional use.", "Send the promotion because addresses were collected at an event.", "Publish the address list for others to use."], bestOption: "Check the stated purpose and seek clear permission for the promotional use.", explanation: "New uses should be consistent with what people were told when their details were collected." },
      { id: "message", title: "Write the invitation", situation: "The team has a list of people who have clearly opted in to receive updates. It is drafting the first message.", prompt: "Which message feature best supports a respectful campaign?", options: ["State why the recipient is receiving it and provide a clear way to stop future updates.", "Hide the sender’s identity so the message looks more urgent.", "Reuse the list for unrelated groups without explanation."], bestOption: "State why the recipient is receiving it and provide a clear way to stop future updates.", explanation: "Clear purpose and respectful control help recipients understand and manage the communication." },
    ],
  },
  {
    id: "engineering-layout-evidence", packId: "engineering-foundations", title: "Compare a study-area layout", eyebrow: "ENGINEERING CASE", summary: "Use constraints and relevant evidence before choosing a design direction.", boundaryNote: "This is a learning case, not engineering or safety approval.", reflectionPrompt: "Which constraint would you verify first in a similar design decision?",
    steps: [
      { id: "constraints", title: "Name what matters", situation: "Two study-area layouts fit the wall space. One is cheaper, while the other may be easier for users to reach. The group has not checked maintenance needs.", prompt: "What is the strongest next step?", options: ["List access, cost, maintenance, and space constraints before comparing the layouts.", "Choose the cheaper layout immediately.", "Choose the layout with the most colors."], bestOption: "List access, cost, maintenance, and space constraints before comparing the layouts.", explanation: "A responsible decision begins with explicit constraints instead of a single preference." },
      { id: "evidence", title: "Gather a relevant check", situation: "The group has listed its constraints and needs one fast evidence step before selecting a layout.", prompt: "Which check best fits the stated constraints?", options: ["Ask relevant users about reach and ask facilities staff about maintenance implications.", "Build both permanent layouts before gathering feedback.", "Use a random choice to avoid bias."], bestOption: "Ask relevant users about reach and ask facilities staff about maintenance implications.", explanation: "Relevant input helps compare the options against the constraints the group has already stated." },
    ],
  },
  {
    id: "science-observation-cycle", packId: "natural-sciences-foundations", title: "Handle an unexpected observation", eyebrow: "NATURAL SCIENCES CASE", summary: "Move from one unexpected value to a careful, documented next observation.", reflectionPrompt: "What condition would you record before repeating a classroom observation?",
    steps: [
      { id: "record", title: "Record the conditions", situation: "A classroom measurement includes one unexpected value. The learner cannot tell whether the reading was stable and the method notes are incomplete.", prompt: "What should happen before a conclusion is drawn?", options: ["Record the conditions and uncertainty surrounding the value.", "Treat the value as final proof of a new explanation.", "Delete the value without noting that it occurred."], bestOption: "Record the conditions and uncertainty surrounding the value.", explanation: "Transparent notes preserve the observation while avoiding an unsupported conclusion." },
      { id: "repeat", title: "Repeat carefully", situation: "The method notes are now complete and the learner can repeat the same classroom procedure.", prompt: "What is the most useful next action?", options: ["Repeat the observation using the stated method and compare the recorded results.", "Choose the value that best matches an expected answer.", "Change several conditions at once without recording them."], bestOption: "Repeat the observation using the stated method and compare the recorded results.", explanation: "Careful repetition helps distinguish a one-time observation from a supported pattern." },
    ],
  },
  {
    id: "education-inclusive-check", packId: "education-foundations", title: "Design an inclusive learning check", eyebrow: "EDUCATION CASE", summary: "Keep one learning objective while offering fair ways to show understanding.", reflectionPrompt: "How would you explain the same success criterion to learners using different response formats?",
    steps: [
      { id: "objective", title: "Keep the objective central", situation: "A tutor wants to check whether learners can explain the main idea from a lesson. Some learners prefer a short spoken response and others prefer writing.", prompt: "Which plan keeps the check connected to the objective?", options: ["Allow an appropriate spoken or written response using the same clear success criteria.", "Require one format only because different formats cannot show the same learning.", "Skip the learning check entirely."], bestOption: "Allow an appropriate spoken or written response using the same clear success criteria.", explanation: "Multiple response formats can be fair when they are evaluated against the same relevant objective." },
      { id: "feedback", title: "Use the response well", situation: "Learners have responded in their chosen format. The tutor is deciding how to use the answers.", prompt: "What feedback action is most useful?", options: ["Compare each response to the success criteria and name one next improvement.", "Rank learners by response speed only.", "Give identical feedback without looking at the objective."], bestOption: "Compare each response to the success criteria and name one next improvement.", explanation: "Objective-linked feedback helps learners understand what they achieved and what to improve." },
    ],
  },
  {
    id: "social-context-inquiry", packId: "social-sciences-foundations", title: "Develop a context-sensitive inquiry", eyebrow: "SOCIAL SCIENCES CASE", summary: "Use individual perspectives to form a careful question without overgeneralizing.", reflectionPrompt: "What extra context would you want before interpreting a similar set of comments?",
    steps: [
      { id: "interpret", title: "Interpret carefully", situation: "A learner reads three anonymous comments about long travel times to campus. There is no information about routes, work schedules, costs, or the wider student population.", prompt: "Which interpretation is most responsible?", options: ["Treat the comments as useful perspectives that suggest a broader question for study.", "Use the comments to prove every learner experiences the same problem.", "Identify the authors publicly to verify the comments."], bestOption: "Treat the comments as useful perspectives that suggest a broader question for study.", explanation: "Individual perspectives can inform inquiry, but responsible interpretation avoids overgeneralizing and respects privacy." },
      { id: "question", title: "Frame the next question", situation: "The learner now wants to investigate travel experiences in a respectful way.", prompt: "Which question best follows from the limited comments?", options: ["How do route availability, schedules, cost, and study commitments shape travel experiences for different learners?", "Which single learner is responsible for the travel problem?", "How can comments be used to label all learners the same way?"], bestOption: "How do route availability, schedules, cost, and study commitments shape travel experiences for different learners?", explanation: "The question seeks relevant context rather than treating a few comments as a complete explanation." },
    ],
  },
];

export function caseChainForPack(packId: string): CourseCaseChain | null {
  return COURSE_CASE_CHAINS.find((chain) => chain.packId === packId) ?? null;
}

export function caseChainForId(chainId: string): CourseCaseChain | null {
  return COURSE_CASE_CHAINS.find((chain) => chain.id === chainId) ?? null;
}
