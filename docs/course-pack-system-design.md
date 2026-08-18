# Rounds Course-Pack System Design

## Purpose

Rounds will remain one installed native learning application, not a collection of separate subject apps. A **course pack** is the reviewed, versioned, offline-capable collection of learning activities that a learner sees after selecting an institution and program. Nursing is the working reference pack; its privacy, no-repeat practice, adaptive review, mock assessment, voice and typed input, rationale, PDF study support, and safe community standards form the reusable Rounds learning engine.

This design deliberately separates **the learning engine** from **academic content**. The engine may be reused across programs, while every course unit retains its own learning outcomes, assessment logic, accessibility notes, reviewer approval, and update history. Rounds is a study platform; it does not grant credit, replace a university’s teaching, or claim curriculum alignment until an institution has reviewed the relevant mapping.

## Product Decision

> The next academic expansion should start with a downloadable **University Foundation Year** pack. It exercises writing, calculations, research, scenarios, and self-directed study without introducing unreviewed specialist or regulated content. Nursing remains active and unchanged while the shared pack infrastructure is designed.

The course hierarchy will use learner-friendly names, with optional **ISCED-F** metadata for portability across institutions and countries. UNESCO describes ISCED as a globally agreed framework for classifying education programmes and qualifications; Rounds will use it only as a reporting and mapping crosswalk, never as a substitute for a local syllabus. [1]

| Layer | Learner meaning | Example | Required in the first release |
|---|---|---|---|
| Academic level | The learning stage | University | Yes |
| Field tag | Portable catalog and reporting label | Health and Welfare | Yes, optional for local programs |
| Program | The learner’s route after onboarding | Computing | Yes |
| Pack | A downloadable collection for a program or shared year | University Foundation Year | Yes |
| Course unit | A coherent assessed unit | Quantitative Literacy | Yes |
| Module | A sequence of related topics | Percentages and ratios | Yes |
| Activity | The smallest completed learning action | Work a dosage-free percentage problem | Yes |

## Course-Pack Contract

Each pack must be serializable as a signed, versioned manifest plus local assets. It contains no learner answer history; progress belongs to the device and is keyed by a stable activity ID.

```ts
type CoursePackManifest = {
  packId: string;
  revision: string;
  academicLevel: "university";
  fieldTags: string[];
  programIds: string[];
  title: string;
  summary: string;
  language: string;
  estimatedDownloadBytes: number;
  reviewer: { name: string; role: string; reviewedAt: string };
  license: { sourceType: "owned" | "licensed" | "open"; attribution?: string };
  courses: CourseUnit[];
};

type CourseUnit = {
  courseId: string;
  title: string;
  learningOutcomes: string[];
  modules: Module[];
  assessmentRules: AssessmentRules;
  accessibility: AccessibilityNotes;
  revision: string;
};
```

The implementation may extend this with local file hashes, size estimates, localized labels, and institutional mappings. It must not allow an unreviewed community post, private learner PDF, or generated tutor response to become published course content.

## Reusable Learning Modes

The same activity shell should not force every discipline into a clinical question format. Rounds will ship a small set of explicit activity modes, each with a visible answer method and a defined review standard.

| Activity mode | Best for | Answer interaction | Offline behavior | Examples |
|---|---|---|---|---|
| Recall and explanation | Concepts and terminology | Multiple choice, short answer, matching | Fully available | Definitions, concepts, vocabulary |
| Worked calculation | Numeracy and quantitative subjects | Step entry and final value | Fully available | Percentages, ratios, formula choice |
| Scenario decision | Ethics, business, digital safety, health | Select and justify | Fully available | Privacy, integrity, project choices |
| Evidence reading | Research and academic writing | Identify claim, method, limitation, or citation issue | Fully available | Article excerpts, source evaluation |
| Writing planner | Academic and professional communication | Structured outline and checklist | Fully available | Paragraph plan, presentation structure |
| Logic trace | Programming and technical foundations | Predict, repair, order, or explain steps | Fully available | Conditions, loops, debugging |
| Oral practice | Speaking and recall where voice helps | Recorded or typed answer | Typed offline; transcription connected | Nursing oral exam, presentation rehearsal |
| Timed assessment | Course-end preparation | Mixed activity sequence | Fully available after pack download | Foundation Year mock assessment |

Every activity must support typed interaction. Voice is an enhancement, never the only completion route. Rounds’ chosen local English voice may read compatible activity text when it is installed; learner recording and server transcription remain clearly labelled as connected features.

## Offline-First Rules

The local course pack is the learner’s dependable study copy. When a pack is marked **Installed**, it must include lesson text, question content, answer keys, rationales, activity templates, lightweight diagrams, accessibility text, and mock-assessment content. Learners must be able to resume an incomplete unit, review a bookmark, and see updated local progress without data.

| State | Learner experience | Network need |
|---|---|---|
| Not installed | Program home shows the pack size, revision, and install action | Required to install |
| Installing | Progress indicator, cancel action, integrity check | Required until complete |
| Installed | All core activities and local progress work | Not required |
| Update available | Learner can continue a current attempt, then update | Required to update |
| Update queued | New version is ready but deferred until the current round ends | Required only at download time |
| Recovery | App verifies local manifest and offers a safe retry | Required only if replacement is needed |

An activity attempt always records against the installed revision that served it. A new pack revision must never silently overwrite an active assessment. Sync, research updates, community, new downloads, audio transcription, cloud account changes, and future neural voice services remain connected-only and must be shown as such.

## Academic and Content Quality Gate

Rounds can use open, owned, or licensed educational materials. UNESCO defines OER as learning, teaching, and research materials in the public domain or under an open licence that permits appropriate access and reuse; this informs Rounds’ source records and attribution requirements. [2]

| Gate | Required evidence | Blocking condition |
|---|---|---|
| Curriculum scope | Declared institution/region map or clearly labelled general-foundation scope | Course claims institutional alignment without review |
| Rights and attribution | Owned, licensed, or compatible open-source record | Unknown source, copied proprietary material, or missing attribution |
| Academic review | Named reviewer, subject expertise, review date, revision | No review for any publishable course unit |
| Answer integrity | Correct key, rationale, distractor review, calculation check where relevant | Ambiguous, unsupported, or misleading answer feedback |
| Accessibility | Readable text, alt text, typed alternative, voice-ready formatting | Essential information available only in an image, color, or voice mode |
| Safety | Relevant risk boundary and referral language | Unreviewed health, legal, financial, or diagnostic instruction |
| Release control | Draft, review-ready, approved, active, or retired state | Draft material shown as installed content |

Health-related packs require qualified subject-matter review before publication. Learner-uploaded PDFs and AI-generated practice remain private learning aids, visibly separate from verified pack content. The Voice Tutor may explain supported pack concepts but may not silently change the pack or assert that its generated answer is an institutional teaching decision.

## First University Catalog

### Active reference pack

| Pack | Program | Status | Reason |
|---|---|---|---|
| Nursing Practice | Nursing | Active reference | Existing structured question bank, oral practice, adaptive review, mock assessment, study materials, and safety boundaries |

### First new downloadable pack: University Foundation Year

The Foundation Year pack is shared across the current program catalog. It should be designed once and surfaced only where an institution or learner profile enables it. The course list below is a design scope, not yet published instructional content.

| Course unit | Core module groups | Rounds activity emphasis | Review priority |
|---|---|---|---|
| Academic Writing and Referencing | Paragraphs, claims, evidence, citations, revision | Evidence reading and writing planners | Academic writing reviewer |
| Quantitative Literacy and Statistics | Ratios, percentages, graphs, descriptive statistics, probability | Worked calculations and chart interpretation | Quantitative reviewer |
| Research Methods and Information Quality | Research questions, variables, methods, ethics, source evaluation | Scenario decisions and evidence reading | Research-methods reviewer |
| Digital Literacy and Privacy | Files, documents, spreadsheets, accounts, safe online practice | Tool choices and digital-safety scenarios | Digital-literacy reviewer |
| Study and Learning Strategies | Retrieval practice, planning, note making, exam routines | Personal checklists and low-stakes reflection | Learning-design reviewer |
| Professional Communication | Audience, email, presentation structure, group work | Revision prompts and oral rehearsal | Communication reviewer |
| Ethics and Academic Integrity | Consent, attribution, fairness, responsible technology use | Case decisions and rationale review | Ethics reviewer |
| Entrepreneurship Foundations | Opportunity, customers, value, costs, simple planning | Cases and numerical practice | Business reviewer |

### Specialist pilot sequence

The first specialist packs should prove different learning modes without publishing large amounts of unreviewed content. The order below is a product decision, not a claim about every university’s programme structure.

| Release | Program pack | Why it follows Foundation Year | Initial course-unit design scope |
|---|---|---|---|
| Pilot 1 | Computing Foundations | Tests logic, code tracing, and data tasks with low regulatory risk | Introduction to Programming; Data and Spreadsheet Skills; Web Foundations; Networking and Cybersecurity Foundations; AI and Digital Ethics |
| Pilot 2 | Business Foundations | Reuses cases, calculations, ethics, and entrepreneurship modes | Accounting Basics; Economics Principles; Management; Marketing; Entrepreneurship and Business Planning |
| Pilot 3 | Engineering Foundations | Requires a stronger multi-step calculation and diagram interaction review | Engineering Mathematics; Design Process; Materials and Systems; Technical Communication; Safety and Professional Practice |
| Reviewed expansion | Health Sciences | Reuses Nursing patterns but needs regulated-content governance | Anatomy and Physiology; Nutrition and Public Health; Pharmacology Foundations only after qualified review |

High-school subjects, including BCM, PCM, Economics, and Entrepreneurship, remain deliberately out of scope for this university design release. They will require a separate level, shorter sequences, curriculum mapping, minor safeguards, and institution or guardian policy decisions.

## Learner and Owner Flows

### Learner flow

1. The learner creates or signs into a private Rounds account.
2. The learner selects an institution and program, then reaches the program-specific Rounds home.
3. The home shows only the packs licensed or enabled for that profile, with clear states: active, available to download, planned, or unavailable.
4. The learner installs a pack once, sees its revision and estimated device size, and opens a course unit.
5. The course unit leads with the next unfinished module, while still allowing topic browsing, bookmarks, adaptive review, and a timed assessment where the unit supports it.
6. Progress writes locally first. Connected synchronization never blocks the learner from finishing a downloaded activity.

### Owner flow

The existing Owner Control Center keeps its separation from learner data. Course-pack controls must initially show only pack status, reviewer status, revision, size, programme availability, download/activation state, and aggregate usage—not raw answers, recordings, private PDFs, or personal tutor conversations.

| Owner status | Meaning | Learner visibility |
|---|---|---|
| Draft | Content being assembled | Hidden |
| Review ready | All required checks complete and awaiting approval | Hidden |
| Approved | Ready for staged distribution | Hidden until enabled |
| Active | Available to eligible program homes | Install or open state |
| Update available | A newer reviewed revision exists | Update prompt after active work |
| Retired | No longer offered to new learners | Existing learner access governed by transition policy |

## First Implementation Backlog

1. Create local `CoursePackManifest`, `CourseUnit`, `Module`, `Activity`, `PackRevision`, and `DownloadState` models without moving existing Nursing questions.
2. Build a local pack manager that validates a manifest and asset hash, stores an installed revision, reports size, and preserves activity progress by revision.
3. Convert the Academic Home into a pack-aware home that can show the existing Nursing pack and a non-content Foundation Year prototype state.
4. Extract shared learning activity shells from Nursing without renaming or weakening the active NCLEX routes.
5. Add the Foundation Year catalog metadata and only approved sample activities after reviewer sign-off.
6. Add Owner Control status, review metadata, and staged activation controls before any new pack is announced as active.

## Non-Negotiable Boundaries

The course-pack system must not ship placeholder teaching questions as if they were reviewed. It must not treat a learner’s PDF as a course pack, use community text as a course source, or mix a Nursing question into an unrelated program. It must preserve the no-repeat rule within a practice round, retain typed alternatives to every voice flow, and visibly label private AI-generated content as private learner-material practice.

## References

[1]: https://www.uis.unesco.org/en/methods-and-tools/isced "UNESCO Institute for Statistics — International Standard Classification of Education"

[2]: https://www.unesco.org/en/open-educational-resources "UNESCO — Open Educational Resources"
