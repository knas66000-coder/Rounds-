// Owner-facing Rounds product and engineering roadmap.
#import "report-theme.typ": report-accent, report-theme

#show: report-theme.with(
  title: "Rounds Robustness Roadmap",
  author: "Rounds Development Team",
  rhythm: "report",
  running-header: true,
)

#page(margin: (top: 29%, x: 2.2cm), numbering: none, header: none)[
  #set par(first-line-indent: 0em)
  #align(center)[
    #text(size: 26pt, weight: "bold", fill: report-accent)[Rounds Robustness Roadmap]
    #v(0.55em)
    #text(size: 13pt, fill: luma(85))[A staged plan for reliability, learning quality, safety, collaboration, and scale]
    #v(1.8em)
    #line(length: 43%, stroke: 0.6pt + luma(165))
    #v(1.7em)
    #text(size: 11pt)[Owner planning edition]
    #v(0.45em)
    #text(size: 10pt, fill: luma(95))[Built from the current Rounds application foundation]
    #v(1.4em)
    #text(size: 10pt)[#datetime.today().display("[day] [month repr:long] [year]")]
  ]
]

#page(numbering: none, header: none)[
  #outline(title: [Contents], indent: 1.4em)
]

#counter(page).update(1)

= Executive recommendation

Rounds has already crossed the difficult early threshold: it is no longer only a nursing question screen. It now has a local-first mobile learning foundation, 1,000 Nursing practice questions, voice interaction, optional secure Community identity, encrypted local backup, expanded University packs, nineteen Uganda High School subjects, and separate University and High School portals.

The best next move is *not* to add every possible feature. The highest-value path is to make the existing systems dependable, measurable, safe to evolve, and consistently valuable over many weeks of study. This roadmap therefore prioritises reliability and content quality before broader social, intelligent, or institutional features.

> *Strategic principle:* Rounds should become the dependable daily study companion first. Advanced intelligence, collaboration, and scale should build on that reliable base rather than replace it.

== Recommended investment order

#table(
  columns: (0.65fr, 1.35fr, 2.2fr, 1.35fr),
  inset: 7pt,
  table.header([*Order*], [*Initiative*], [*Why it matters now*], [*Target window*]),
  [1], [Release reliability and quality governance], [Prevents regressions, makes content trustworthy, and gives collaborators a safe way to improve the product.], [Immediate foundation],
  [2], [Assessment depth and meaningful learner progress], [Turns scattered practice into clear preparation with subject-specific timed work, history, and next steps.], [Next build cycle],
  [3], [Account recovery, privacy controls, and data continuity], [Protects learners as the product grows beyond a single device and strengthens trust.], [Next build cycle],
  [4], [Personal study planning and accessible learning controls], [Improves long-term use without relying on paid services or permanent connectivity.], [Near-term enhancement],
  [5], [Contributor workflow and operational visibility], [Allows multiple developers to work safely and gives the owner a clear view of releases and reports.], [In parallel],
  [6], [Optional consented sync and educator tools], [Useful only after local learning, privacy, content review, and release discipline are mature.], [Later growth],
)

= What is already strong

The roadmap begins by protecting the systems that are already working well.

#table(
  columns: (1.5fr, 3.5fr),
  inset: 7pt,
  table.header([*Existing strength*], [*Why it is a platform advantage*]),
  [Local-first learning], [Learners can practise, select an on-device program, use installed packs, keep progress, search topics, save work, and use high-school tools without an account.],
  [Separate portals], [University and High School have their own gateway, onboarding, course libraries, and action guards. Nursing is inside University.],
  [Original course architecture], [Every active pack uses a shared learning structure while retaining subject-specific content, safety language, and activity types.],
  [No-repeat sessions], [Practice queues and adaptive topic sessions avoid repeating the same item in one learning session.],
  [Voice-first support], [Device English-voice selection, narration, spoken rationales, recording, transcription, and guarded stop behaviour are already integrated.],
  [Privacy work], [Community is account-only, ordinary learning is local, and backup export is passphrase protected with no server upload.],
  [Quality baseline], [Typed helpers, 130 deterministic tests at the latest portal release, production builds, Expo web export, and checkpoints provide a solid foundation.],
)

= Priority one: make every release dependable

== Continuous release checks

The app already has manual validation commands. The next robust step is to run the same checks automatically for every pull request and proposed release. The pipeline should run TypeScript checks, linting, the full Vitest suite, server build, Expo web export, and a small set of route-level smoke checks. A failed gate should block merging until repaired.

This is particularly important now that a change can affect Nursing practice, University topics, High School topic sessions, local backup, or a protected Community route. Build logs should be technical only; they should never contain learner answers, recordings, session tokens, or private PDFs.

== Safe error and crash recovery

Add a production-safe error boundary around the application and a small local diagnostic screen. The goal is not surveillance. It is to let a learner recover cleanly from an unexpected failure and let the owner understand anonymised technical failure categories when the learner explicitly chooses diagnostic sharing.

Every important failure state should offer a plain-language explanation, retry action, offline explanation when a server-only feature is unavailable, a copyable diagnostic code without learner content, and a local reset option for one corrupted feature store rather than a destructive reset of all study data.

== Content quality governance

The question bank and course packs need an owner-visible quality process as content expands. Add a *Report a content concern* action for questions, topic units, explanations, and voice text. A report should capture the content identifier, category, learner-selected reason, optional concise note, and app version—never a full learning history by default.

The owner workflow should then track: reported, reviewed, corrected, retired, and revalidated. Course content should receive revision identifiers so an explanation change can be traced to a specific pack version.

= Priority two: make learning progress meaningful

== Timed subject practice across all packs

Nursing already has a timed mock examination. The next parity step is a smaller, subject-appropriate timed practice mode for University and High School packs. It should be clearly labelled as study practice, not an official examination or readiness prediction.

#table(
  columns: (1.4fr, 2.05fr, 1.55fr),
  inset: 6pt,
  table.header([*Area*], [*Recommended design*], [*Boundary*]),
  [Nursing], [Keep the current mock-exam model; add configurable question counts, topic blueprints, and saved attempt history.], [Do not claim licensure prediction or clinical competence.],
  [University packs], [Offer 10–20 item timed rounds from the selected pack, with review, saved work, and topic-level next-step suggestions.], [Do not grade a university course or claim institutional alignment.],
  [High School packs], [Offer four-, eight-, or twelve-topic revision challenges respecting Senior level and selected scope.], [Do not claim UNEB/NCDC prediction or official marking.],
)

== A private longitudinal progress dashboard

The current app already stores completed topics, saved work, review needs, weekly study rhythm, bookmarks, and mock-exam outcomes. The next dashboard should turn those signals into understandable local trends rather than a single opaque “weakness score.”

The first view should show subject continuation, recently completed areas, saved-review count, current and longest weekly consistency, time in practice where available, and the next recommended local action. The learner should choose whether statistics stay solely on the device or are included in an encrypted backup.

== Explanation and content-review scorecard

Before generating more questions quickly, establish an editorial scorecard for each learning item: factual accuracy, clarity, answer-key alignment, language quality, accessibility of narration, duplication risk, source/review status, and safety boundary. Owner controls can surface aggregate revision counts without exposing private learner reflections.

= Priority three: protect accounts and learning continuity

== Account recovery and lifecycle controls

Rounds accounts are optional, but a learner who uses Community or private server-backed materials still needs reliable account controls. The next account features should be password reset, verified email or another secure recovery route, explicit session management, account deletion, and a transparent privacy notice.

These should be implemented before broader social or subscription features. Deletion must remove or anonymise owned Community data according to a documented policy, invalidate sessions, and explain what remains on the learner’s device versus what is removed from the server.

== Optional consented profile sync

Local-first should remain the default. A later opt-in sync feature could let a learner choose to copy selected local preferences and progress to their secure account for recovery on a new device. It must be granular: program profile, progress, bookmarks, saved topics, and voice preference should each have a clear status.

The learner should see last sync time, disconnect, export, and delete options. The encrypted local `.rounds` backup should remain available even after sync exists, because it keeps the learner in control and supports recovery without server dependence.

= Priority four: support a daily study habit

== Private weekly study plan

Build a local study plan beginning with simple learner choices: available days, short/medium/long session preference, active subject, and desired focus. The plan should suggest achievable blocks such as two four-topic sessions plus one saved review, rather than making promises about grades or examination results.

For learners without data, the plan should function entirely from installed content and local reminders. If notifications are used, they should be device-local by default and easy to pause.

== Accessibility and low-bandwidth refinement

Add larger-text controls, reduced-motion mode, more complete screen-reader labels, keyboard navigation for web, and a high-contrast option. Improve offline status language so a learner knows which actions are available now, which need a connection, and whether progress is stored locally.

== Practical feedback loop

Add a simple feedback channel for usability issues and feature requests. It should record app version, platform, affected screen, and learner-provided text only after confirmation. Feedback should not silently include recordings, answers, PDFs, or account secrets.

= Priority five: build a healthy contributor system

== Public code and contributor workflow

The prepared source package, developer manual, contribution guide, and security guidance are the first step. Once the approved public repository is connected, use branch protection, pull requests, review checklists, and issue templates. Separate documentation issues, content-quality issues, accessibility issues, bugs, and feature proposals.

Every contributor change should answer four questions before merge: Which portal and pack does it affect? Does it preserve local-first access? Does it respect privacy and safety boundaries? Which deterministic test proves the change?

== Content authoring workflow

As course content becomes larger, move it toward a reviewable pipeline. Keep content identifiers stable, author content outside screen files, validate item structure automatically, detect duplicates, record revision notes, and require human review for high-stakes Nursing statements or content that could be mistaken for official examination guidance.

== Owner operational view

Expand the owner control centre with release notes, current build version, pack revision status, unresolved content reports, and non-identifying service health. Avoid learner ranking or surveillance dashboards. The purpose is operational confidence and content quality, not pressure or social comparison.

= Priority six: grow carefully after the foundation is stable

== Educator and institution tools

Only after privacy controls and content governance are mature, consider an educator mode with consent-based groups, shared resource collections, and assignment templates. The initial version should avoid viewing private learner reflections or microphone recordings. Any institutional dashboard should report only data the learner explicitly agrees to share.

== More subject depth, not more unrelated menus

The next content expansion should deepen current packs before adding many new programs. Recommended work is more reviewed scenarios, richer worked examples where appropriate, additional original topic pathways, clear source/revision status, and high-quality alternative explanations. This directly improves learner value and makes each pack feel complete.

== Optional intelligent support

The Voice Tutor and private PDF features already show how bounded online intelligence can help. Future intelligent support should remain transparent: identify its source when grounded in learner material, say when it is unavailable, avoid answering beyond academic scope, and never represent itself as a clinician, examiner, teacher of record, or official syllabus authority.

= Recommended 90-day sequence

#table(
  columns: (0.8fr, 1.45fr, 2.45fr, 1.3fr),
  inset: 6pt,
  table.header([*Stage*], [*Primary outcome*], [*Work included*], [*Success signal*]),
  [Weeks 1–3], [Safe release engine], [Continuous checks, error boundary, recovery language, configuration checklist, dependency review, content-report data model.], [Every proposed change is validated automatically; common failures do not erase local study data.],
  [Weeks 4–6], [Trustworthy academic loop], [Content-report screens, owner review queue, revision identifiers, configurable Nursing mock exams, shared timed-practice contract.], [Content concerns can be resolved traceably; timed learning has consistent safety language.],
  [Weeks 7–9], [Useful long-term progress], [Private progress dashboard, saved mock history, subject continuation, local study-plan prototype, accessibility controls.], [Learners understand what to study next without a grade prediction or account requirement.],
  [Weeks 10–12], [Account and collaboration maturity], [Recovery/deletion controls, public contributor workflow, issue templates, release notes, operational-view improvements.], [A new collaborator can work safely; account holders understand recovery, export, and deletion choices.],
)

= Decision rules for future requests

#table(
  columns: (1.65fr, 3.35fr),
  inset: 6pt,
  table.header([*Question*], [*Decision rule*]),
  [Does it improve daily study?], [Prioritise if it makes a learner practise, understand, review, or return more effectively with existing content.],
  [Does it work without data?], [Prefer local implementation first. If online support is necessary, state the limitation clearly and retain a useful offline fallback.],
  [Does it collect personal data?], [Require a specific purpose, minimal data, explicit learner choice, ownership controls, and deletion/export reasoning before implementation.],
  [Does it change learning content?], [Require subject scope, safety boundary, review status, stable identifier, and deterministic validation.],
  [Does it mix portals?], [Reject or redesign it. University and High School should remain separate from first entry through course action.],
  [Does it add an external service?], [Prefer device capabilities or existing platform services. Add an external dependency only with operational ownership, privacy review, fallback behaviour, and a documented cost model.],
)

= Final recommendation

The next feature to build should be *release reliability and content-quality governance*, followed by *timed subject practice and a private longitudinal dashboard*. These areas make everything already inside Rounds more valuable. They create the safe foundation needed for account recovery, a public contributor community, optional synchronization, educator tools, and future intelligent features.

Rounds should continue to grow step by step: first dependable, then deeply useful, then scalable.
