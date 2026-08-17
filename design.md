# Rounds NCLEX Mobile Interface Design

## Product direction

Rounds NCLEX is a focused, voice-first nursing exam practice tool for short, repeatable study sessions. The app is designed for portrait orientation and one-handed use. The primary action remains within easy thumb reach, while the question, listening state, verdict, and clinical explanation are presented as a calm vertical sequence.

## Screen list

| Screen | Primary content and functionality |
|---|---|
| Practice | Session header, category filter, question progress, spoken-question card, large microphone/answer control, manual and auto mode controls, current score, and the latest verdict. |
| Review | The submitted transcript, correct answer, keyword match summary, verdict, clinical context, explanation, clinical significance, and related concepts. A prominent Next Question action returns to practice. |
| Categories | All 15 NCLEX categories with topic summaries and question counts. Selecting a category filters the practice session. |
| Progress | Session accuracy, answered count, correct/partial/incorrect breakdown, recent performance, and category-level progress from locally stored sessions. |
| Settings | Voice preference, speech rate, auto-advance preference, reset session data, microphone permission guidance, and app information. |

## Primary layout

The Practice screen uses a warm paper background with a compact top bar. The question card occupies the visual center and uses a high-contrast serif heading for the prompt. The bottom action area contains a large rounded microphone button with a clear listening/idle state, a secondary Ask button when manual mode is active, and a segmented Manual / Auto mode switch. Status and feedback never rely on color alone; each verdict includes a text label and icon.

The Review screen uses stacked cards so the user can scan from their own response to the clinical teaching point. The Next Question button is fixed in the lower safe-area region when practical, with sufficient bottom padding for the home indicator and tab bar.

## Key user flows

### Start a manual practice session

1. The user opens Practice and optionally selects a category.
2. The user taps Ask.
3. The app speaks the question using native text-to-speech.
4. The app enters Listening mode and requests microphone access if needed.
5. The user speaks an answer or stops listening.
6. The app evaluates keywords, presents the transcript and verdict, and reads concise feedback aloud.
7. The user reviews the clinical context and taps Next Question.

### Use auto mode

1. The user switches the Manual / Auto control to Auto.
2. The app asks the current question and begins listening.
3. After grading and feedback, the app waits briefly and advances to the next question.
4. The user can stop auto mode at any point; speech and timers are cancelled safely.

### Review categories

1. The user opens Categories from the tab bar.
2. The user taps a category card.
3. The app returns to Practice with the selected category applied and progress reset for that filtered session.

### Review progress

1. The user opens Progress.
2. The app reads locally stored session results.
3. The user sees accuracy and verdict breakdowns, then can return to Practice without losing the current session.

## Color choices

The brand uses Clinical Minimalism: sage green `#2F5D4E` for primary actions and navigation emphasis, brighter green `#3E8268` for active highlights, paper `#F5F1E8` for the main background, ink `#2B2A28` for primary text, amber `#C68A3A` for partial answers and caution, rose `#B2554B` for incorrect answers and errors, and a soft surface `#FFFDF8` for cards. Borders use a muted warm neutral rather than cool gray. Typography pairs Fraunces or a similar serif display face for question headlines with the platform system font for controls and explanations.

## Interaction and accessibility

Primary controls use press feedback and light haptics, with no critical action represented only by an icon. Buttons have large touch targets, clear labels, and accessible state announcements such as “Listening” and “Answer recorded.” Voice interaction has a visible non-voice fallback: the user can use a text response field when speech recognition is unavailable or permission is denied. Content scrolls vertically and avoids dense horizontal controls.

## Local data model

The first release stores the question bank, current session state, preferences, and practice results locally with AsyncStorage. No account, cloud sync, or backend dependency is introduced unless requested later.

## Improvement pass: learning clarity and control

The Practice screen should make the educational next step immediately clear after each answer. The verdict card will include a **keyword checklist** that distinguishes matched clinical terms from terms still to review. A short next-step message will guide the learner to either continue, repeat the answer, or review the explanation without relying only on the verdict color.

The selected category should be maintained across the Topics and Practice tabs, with a visible focused-practice indicator and a category-specific queue. Selecting a category will land the learner directly in that domain, rather than merely returning them to the general practice screen.

Primary actions will be accessible by label and state. The app will provide restrained haptic confirmation for asking a question, toggling auto mode, stopping a recording, and receiving a graded result. Each status state will retain a visible text equivalent, ensuring that a learner can understand speaking, listening, transcribing, and review states without sound or haptics.

## Study tools: bookmarks and timed mock exam

The five-tab navigation will include a **Study** destination, keeping its compact label and simple compass-style icon in the thumb-reachable tab bar. It is a hub with two large actions: **Timed Mock Exam** and **Bookmarks**. Bookmarks are saved locally from any practice or mock-exam question. The Bookmarks view shows the saved question, its respectful topic label, and a remove action; learners can start a unique review round from those saved questions without losing their main history.

The mock exam is a timed **study simulation**, not an official NCLEX administration. Its setup screen starts a randomized set of 25 unique questions with a 60-minute countdown. During the exam, immediate teaching feedback is withheld to preserve test-like pacing. Learners can enter a typed response, flag a question, move back and forward, or finish early; answers remain editable until final submission. A clear completion sheet reports score, unanswered questions, flagged items, and time used, then offers focused review. Time expiry automatically submits the existing response set. The interaction always presents a visible timer and progress indicator, with explicit, confirmable exit and submit controls to prevent accidental loss of work.

## Secure account access

The app opens to a private, Rounds-branded sign-in gate rather than exposing learning content before an account session is present. The portrait sign-in view uses the same clinical paper, ink, and sage system as the application. It contains the Rounds NCLEX name, a short privacy-oriented explanation, a single **Sign in securely** action, and a concise note that the session is protected on the learner’s device. The sign-in provider is never named in the app interface.

Authenticated learners move directly to the existing practice experience. Settings includes an **Account** card with the learner’s name or email, a session-protection description, and a confirmable **Sign out** action. Sign-out removes the local secure session and returns to the branded sign-in view. All Practice, Topics, Study, Progress, Settings, Mock Exam, and Bookmark Review routes are rendered only after the session gate has resolved; the OAuth callback remains outside this gate so it can establish the session safely.

## Community learning loop

The Community tab is a private, authenticated study space—not a clinical consultation forum. Learners may share short study updates, study methods, and encouraging messages using three lightweight post types: **Study win**, **Study tip**, and **Encouragement**. They may encourage posts with a single positive reaction, add short replies, and report content. Direct messages, public follower graphs, profile search, personal contact details, and clinical-answer debates are deliberately excluded from the first release.

Every compose surface repeats the safety boundary: do not share patient information, personal health information, clinical advice, recalled exam content, harassment, or solicitation. Post and reply text is intentionally length-limited, server-validated, and associated only with the authenticated creator. The feed shows a display name or the neutral label **Learner**, never an email address. Learners can delete their own posts or replies; reports create an internal moderation record and hide no content automatically. The app invites respectful study support and makes clear that community discussion does not replace professional supervision or medical guidance.

The portrait Community home screen follows iOS list conventions: a visible safety note at the top, a compact **Share a study update** entry point, followed by chronological update cards with a positive reaction, reply count, report action, and own-content deletion menu. A post-detail sheet keeps replies close to the original update. The interaction loop is: learner practices → shares a non-sensitive study reflection → receives encouragement or a study-method response → returns to focused review or mock-exam study.

## Community notifications

Community notifications are private, in-app alerts for two social events only: another learner **encourages** the learner’s study update or **replies** to it. The system never alerts learners about their own actions, never includes the full source post or reply text in an alert, and shows only a neutral actor label when a display name is unavailable. Notifications are stored per authenticated learner with unread and read states. The Community tab displays an unread count; an inbox lets learners open the related community area, mark individual alerts as read, or mark all alerts as read.

Notification preferences appear in Settings with separate on/off controls for encouragement and reply alerts. Both are enabled by default, apply only to new in-app events, and can be changed at any time. This first release deliberately excludes operating-system push notifications, email, direct messages, and marketing alerts so the social loop remains focused, private, and low-interruption.

## Voice-first practice refinement

Voice practice uses a deliberate four-state flow: **Ready**, **Speaking question**, **Listening**, and **Reviewing**. The learner can begin spoken delivery, replay the question at any time, or stop current speech. Question speech is structured with short pauses between the question prompt and answer cue, helping learners hear clinical values and medication terms without a rushed transition. A locally saved pace control applies consistently to both question and feedback speech.

While the microphone is active, the Practice screen displays a high-contrast recording state, elapsed seconds out of the eight-second capture window, a simple progress line, and a clear early-stop action. When transcription completes, the recognized text stays visible in the answer field before grading, allowing the learner to correct a clinical term or vital value rather than losing the attempt. If recording or transcription fails, the learner sees three equal recovery paths: retry speaking, edit the recognized text, or type an answer. The voice interface remains usable with screen readers through explicit state and action labels, while typed input remains first-class rather than a hidden fallback.

When **Spoken rationale** is enabled in Settings, Rounds delivers feedback in a calm sequence: verdict feedback first, then the clinical context and why-it-matters rationale. The rationale is not inserted into the active recording flow and never begins until answer grading has finished. A visible **Replay rationale** control sits in the answer-review card so learners can hear the explanation again without repeating the question. Any new practice action, explicit stop control, category change, or question advance cancels queued rationale speech immediately. The setting is enabled by default for a voice-first study experience but remains optional and locally saved alongside pace preferences.

## Offline-first installed learning

Rounds remains a single installed native application. Nursing and every future course unit use the same learning engine and are delivered as **downloadable course packs**, rather than as separate applications or web-only subjects. A course pack includes its unit outline, lesson text, question bank, answer keys, rationales, saved practice settings, and any essential lightweight media required for its core learning flow. Learners choose a pack while connected, see its storage size and latest revision, then keep studying after data is unavailable.

The offline baseline includes downloaded questions and lessons, bookmarks, current practice and mock-exam state, local progress, voice pace and rationale preferences, typed-answer grading, and text-to-speech where the device supports it. Speech-to-text transcription, social activity, account changes, content downloads, and synchronization require a connection; when offline, Rounds must present a clear status label and preserve the learner’s work locally instead of failing or discarding it.

Offline work follows a local-first queue. Every answer, bookmark, exam result, or learning signal is written to device storage immediately. When connectivity returns, Rounds syncs only the pending private-learning changes for the authenticated learner and preserves the device result if a conflict cannot be resolved automatically. Course content is versioned by pack so a learner can finish an in-progress offline practice round before accepting an updated question bank. The app exposes an **Offline learning** area in Settings for managing installed course packs, download status, storage use, last successful sync, retrying sync, and removing a downloaded pack without deleting cloud-backed account data.

## University program ideas and priorities

Rounds should launch a shared **University Foundation Year** before expanding deep specialist catalogs. Foundation units make the application immediately useful across programs, establish the reusable course-pack format, and give learners study, writing, quantitative, and digital skills that reinforce every discipline. The initial foundation collection is **Academic Writing**, **Study and Learning Strategies**, **Digital Literacy**, **Quantitative Literacy and Statistics**, **Research Methods**, **Communication Skills**, **Ethics and Responsible Practice**, and **Entrepreneurship Foundations**.

The first specialist program families should be **Health Sciences** and **Computing and Digital Skills**. Health Sciences grows directly from the mature Nursing experience and adds **Anatomy and Physiology**, **Pharmacology Foundations**, **Nutrition**, **Public Health**, and **Medical Laboratory Foundations**. Computing proves that the same Rounds engine works for structured problem solving as well as clinical scenarios, beginning with **Introduction to Programming**, **Web Foundations**, **Data and Spreadsheet Skills**, **Networking Fundamentals**, **Cybersecurity Foundations**, and **AI and Digital Ethics**.

| Release priority | Program family | Initial course units | Learning patterns to inherit from Nursing |
|---|---|---|---|
| First | University Foundation Year | Academic Writing, Study Strategies, Digital Literacy, Statistics, Research Methods, Communication, Ethics, Entrepreneurship | Offline packs, short practice rounds, rationales, bookmarks, progress, mock assessments, adaptive revision |
| First | Health Sciences | Nursing, Anatomy and Physiology, Pharmacology Foundations, Nutrition, Public Health, Medical Laboratory Foundations | Voice prompts, clinical scenarios, safety boundaries, paced feedback, remediation |
| First | Computing and Digital Skills | Programming, Web Foundations, Data Skills, Networking, Cybersecurity, AI and Digital Ethics | Worked examples, code or logic prompts, step checks, calculation workspace, error-based revision |
| Second | Business and Entrepreneurship | Accounting, Economics, Marketing, Management, Finance Basics, Business Communication | Case decisions, numerical practice, interpretation of short business scenarios |
| Second | Natural Sciences and Mathematics | Biology, Chemistry, Physics, Calculus, Environmental Science | Formula practice, diagram-linked prompts, worked solutions, unit-based review |
| Later | Social Sciences, Humanities, and Education | Psychology, Sociology, Academic Communication, Child Development, Foundations of Education | Evidence interpretation, reflection prompts, short written answers, teaching scenarios |

Every unit uses a subject-specific assessment profile while preserving one familiar Rounds workflow. A learner may hear a nursing scenario, complete a statistics calculation, review a programming trace, or plan an academic paragraph, but each flow still offers clear objectives, concise instruction, offline practice, answer checking, rationale, review queues, saved items, and progress. The Rounds brand and existing Nursing experience remain intact; new programs appear as additional course packs inside the same application.
