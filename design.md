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
