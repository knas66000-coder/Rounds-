# Rounds Academic Expansion Blueprint

## Purpose and product boundary

Rounds remains **one installed native learning application**. Nursing is the established reference implementation: its private access, offline practice, voice and typed responses, explanations, non-repeating question rounds, bookmarks, mock assessments, adaptive review, and community safeguards form the reusable Rounds learning engine.

University and high-school content will be added as downloadable course packs inside Rounds. They will not be separate projects, duplicate applications, or web-only experiences. Each course pack uses a common course hierarchy while retaining the assessment formats appropriate to its discipline.

> Rounds supports structured learning and examination preparation. It does not itself grant academic credit, replace institutional teaching, or claim alignment with a particular country’s syllabus until the relevant institution has approved a curriculum mapping.

## Catalog architecture

The app uses a single hierarchy for all academic levels.

| Layer | Purpose | Example |
|---|---|---|
| Academic level | Separates university and high-school learning pathways | University |
| Field | Groups related programmes for discovery and reporting | Health and Welfare |
| Program family | Provides a learner-facing collection | Health Sciences |
| Course unit | The downloadable, assessable course | Anatomy and Physiology |
| Topic | A coherent sequence inside a course | Cardiovascular physiology |
| Learning activity | A lesson, practice set, case, calculation, or assessment | Cardiac-output practice round |

The catalog uses optional global field tags for portability, rather than forcing one national curriculum. ISCED-F is a three-level education-field hierarchy with 11 broad fields, 29 narrow fields, and about 80 detailed fields; it is suitable as a **metadata crosswalk**, not as the learner-facing course structure. [1] [2]

## Shared Rounds learning engine

Every course unit inherits the following capabilities from Nursing.

| Shared capability | Rounds behavior across subjects |
|---|---|
| Downloadable packs | Learners install a course pack once while connected and retain its core activities without data. |
| Local-first study | Progress, bookmarks, active rounds, assessments, and learning signals are saved immediately on the device. |
| Voice and typed learning | Voice is available where it improves the activity; typed input remains available in every course. |
| Feedback and rationales | Each activity provides an answer check and a concise explanation appropriate to the subject. |
| No-repeat practice | A question is not repeated within a round unless the learner explicitly starts a focused review. |
| Adaptive review | Missed, partial, flagged, or saved activities can reappear in a transparent targeted review queue. |
| Mock assessments | Each course may offer an offline timed assessment whose format matches its academic objectives. |
| Private account and community protections | Learning records remain private; community content stays academic, respectful, and age-appropriate. |

## Offline-first scope

### Available without data after installation

Downloaded lesson text, question banks, answer keys, rationales, lightweight diagrams, bookmarks, mock exams, local progress, typed-answer grading, speech pace, and the on-device text-to-speech experience remain available. The learner must be able to open a downloaded course, begin a practice round, stop midway, resume later, and see updated local progress without a network connection.

### Available only when connected

New course-pack downloads, account sign-in or sign-out changes, cloud backup, community activity, server-backed voice transcription, content updates, and notification refresh require connectivity. The app must not mask this boundary: it should show the content’s download state and preserve pending local work rather than failing a learning activity.

### Synchronization principles

Local answers and study events are written first to device storage, then queued for secure later synchronization. A course pack carries a revision identifier so a learner can complete an in-progress round using the version they downloaded. When a newer pack is available, Rounds prompts for update after the round instead of replacing active content. If an account record and device record conflict, Rounds preserves the locally completed study event and flags it for deterministic reconciliation rather than silently deleting learner progress.

## Recommended release sequence

### Release A: University Foundation Year

This release creates a high-value cross-program entry point and proves the reusable course-pack model before specialist content grows.

| Course unit | Initial topic groups | Primary activities |
|---|---|---|
| Academic Writing | Paragraph construction, argument, evidence, referencing, revision | Identify claims, improve paragraphs, plan short essays |
| Study and Learning Strategies | Retrieval practice, planning, note making, examination routines | Study-plan prompts, short reflection, revision checklists |
| Digital Literacy | Files, documents, spreadsheets, privacy, information quality | Tool decisions, spreadsheet practice, safe-online scenarios |
| Quantitative Literacy and Statistics | Percentages, ratios, graphs, descriptive statistics, probability | Calculations, chart reading, worked step checks |
| Research Methods | Questions, variables, ethics, data collection, evidence | Method selection, ethics scenarios, evidence interpretation |
| Communication Skills | Audience, academic presentation, professional communication | Message revision, presentation planning, scenario response |
| Ethics and Responsible Practice | Consent, integrity, responsible technology use, fairness | Decision scenarios and rationale review |
| Entrepreneurship Foundations | Opportunity, customers, value, costs, simple planning | Small case decisions and numerical practice |

### Release B: Health Sciences and Computing pilots

Health Sciences should reuse the mature Nursing patterns. Computing should prove that Rounds can support discrete problem solving, step checking, and productive-error feedback without compromising the calm, voice-first interface.

| Program family | Course unit | Suggested topic map | Subject-specific learning format |
|---|---|---|---|
| Health Sciences | Nursing | Existing NCLEX-aligned categories | Clinical scenarios, spoken answers, adaptive remediation |
| Health Sciences | Anatomy and Physiology | Anatomical language; cells and tissues; musculoskeletal; nervous; cardiovascular; respiratory; renal and endocrine | Label recognition, cause-and-effect cases, diagram-linked practice |
| Health Sciences | Pharmacology Foundations | Dosage concepts; pharmacokinetics; safety checks; major medication classes | Safe decision prompts, calculation checks, mechanism-to-effect reasoning |
| Health Sciences | Nutrition and Public Health | Nutrition principles; life-stage needs; prevention; population health; health promotion | Short cases, data interpretation, planning prompts |
| Computing | Introduction to Programming | Problem decomposition; variables; conditions; loops; functions; debugging | Predict output, repair logic, step-by-step traces |
| Computing | Web Foundations | Web structure; styling; interaction; accessibility; deployment concepts | Identify markup roles, explain layouts, short build-planning prompts |
| Computing | Data and Spreadsheet Skills | Tables; formulas; cleaning; charts; interpretation | Formula selection, data-quality checks, chart interpretation |
| Computing | Networking and Cybersecurity Foundations | Networks; protocols; accounts; threats; secure behavior | Incident scenarios, concept checks, safe-practice decisions |
| Computing | AI and Digital Ethics | Data, model limitations, privacy, bias, responsible use | Evidence-based ethical scenarios and reflective rationales |

## High-school pathway

High-school is not a reduced university catalog. It shares the same Rounds engine but uses its own academic level, shorter learning sequences, age-appropriate language, explicit safeguarding, and country or institution-specific curriculum maps.

| High-school subject path | Initial units | Design adaptation |
|---|---|---|
| Mathematics | Number, algebra, geometry, statistics, probability | Worked steps, practice ladders, visible calculation support |
| Integrated Science | Biology, chemistry, physics, environmental science | Everyday contexts, diagrams, experiment reasoning, short-answer practice |
| English and Literacy | Reading, writing, grammar, comprehension, research | Age-appropriate passages, writing planners, feedback rubrics |
| Computing and Digital Skills | Digital literacy, coding foundations, online safety | Guided projects, clear safety prompts, teacher-compatible tasks |
| Business and Social Studies | Economics basics, enterprise, civics, geography, history | Case prompts, source interpretation, timeline and data activities |
| Wellbeing and Career Readiness | Study habits, communication, health awareness, career exploration | Private reflection, goal planning, non-diagnostic wellbeing guidance |

High-school community features require stronger moderation defaults, clear reporting, restricted discoverability, and no direct messaging. Institution-specific permissions and guardian or school policy requirements must be resolved before enabling shared learner spaces for minors.

## Content and quality requirements

Every course pack needs a declared level, program family, target learning outcomes, topic order, answer-evaluation approach, rationale standard, accessibility notes, offline size estimate, content revision, and named academic reviewer. Regulated or high-stakes subjects, especially health-related content, require qualified subject-matter review before publication. The app must distinguish between verified instructional content and learner-generated community material.

## Implementation order inside the existing Rounds application

| Order | Change inside Rounds | Outcome |
|---|---|---|
| 1 | Introduce the offline course-pack data model and local pack manager | Makes Nursing and future courses downloadable and usable without data. |
| 2 | Generalize Nursing categories into program, course, topic, and activity metadata | Retains existing Nursing routes while allowing other units to use the same engine. |
| 3 | Add the University Foundation Year as the first downloadable cross-program collection | Validates text, calculation, writing, and research activity templates. |
| 4 | Add Health Sciences and Computing pilots | Validates specialist scenario and technical problem-solving learning modes. |
| 5 | Add institution or region curriculum mappings and high-school subject paths | Enables localized expansion without duplicating the app. |
| 6 | Add offline synchronization, pack updates, academic-review controls, and expanded accessibility settings | Supports reliable growth and maintains learner trust. |

## Decision needed before implementation

The next implementation should begin with the offline course-pack foundation and the **University Foundation Year**. This avoids hard-coding the first new specialist subject and ensures Nursing, future university units, and high-school paths share the same durable offline architecture.

## References

[1]: https://www.uis.unesco.org/en/methods-and-tools/isced "UNESCO Institute for Statistics — International Standard Classification of Education"
[2]: https://ec.europa.eu/eurostat/statistics-explained/index.php?title=International_Standard_Classification_of_Education_(ISCED) "Eurostat — International Standard Classification of Education"
[3]: https://esco.ec.europa.eu/en/about-esco/escopedia/escopedia/international-standard-classification-education-fields-education-and "European Commission ESCO — ISCED-F 2013"
