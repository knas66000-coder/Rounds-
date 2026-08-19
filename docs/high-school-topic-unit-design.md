# Rounds High-School Topic-Unit and Session Design

## Purpose

Rounds’ Uganda high-school catalogue now has broad subject access, offline packs, private cases, and Senior 1–6 selection. This release deepens those packs so a learner does not simply restart the same three starter activities. The topic-unit layer is **original Rounds learning content**. It supports study and reflection; it does not claim to reproduce an official syllabus, predict examinations, or provide professional, clinical, legal, or safety instruction.

## Level Positioning

The learner selects Senior 1 through Senior 6 locally. Rounds maps that selection into an internal learning band, but this is only a study-positioning aid rather than a claim of institutional placement or curriculum equivalence.

| Senior selection | Rounds band | Intended use |
|---|---|---|
| Senior 1–2 | `foundation` | Introduce vocabulary, observation, and simple relationships. |
| Senior 3–4 | `development` | Compare evidence, apply a stated rule, and connect ideas. |
| Senior 5–6 | `extension` | Evaluate assumptions, communicate a justified response, and recognise limits. |

## Topic Unit Contract

Every topic unit belongs to exactly one high-school pack and level band. It has a stable topic identifier, a concise topic title, a subject-boundary note where necessary, a source-free original study prompt, and deterministic answer feedback. A topic unit is separate from the existing starter activities and branching case, thereby giving each pack more than one learning route.

The initial deepening catalogue gives every active high-school subject a set of level-aware units across foundation, development, and extension bands. Units remain distinct by both **topic** and **activity mode**. A student can therefore move between observation, short reasoning, scenario choice, and private planning rather than receive the same interaction repeatedly.

## Adaptive Local Session Rules

The selector operates only with local pack progress, bookmarks, outcomes, and timestamps. It never sends learner answers, reflections, or weak-topic labels to owner controls or any other learner.

| Selection priority | Rule |
|---|---|
| New learning | Prefer an unseen unit from the learner’s selected band. |
| Weak-topic review | Prefer a previously reviewed or incorrect unit only after at least one different topic has appeared. |
| Saved review | Include a bookmarked unit only when it does not duplicate the current topic. |
| Variety | Do not repeat a unit in a session; do not place the same activity mode consecutively when another eligible mode exists. |
| Freshness | Use deterministic local rotation so a fresh session changes order without introducing unrelated subjects. |

## Learner Experience

The high-school home should explain why an activity appears—for example, **new topic**, **review this topic**, or **saved for revisit**—and show progress by topic, not only by subject total. Learners keep control: they may choose a topic directly, use the mixed session, save an activity, or revisit a private case.

## Safety and Content Boundaries

The existing boundaries still apply. High-risk subjects retain their explicit limits: Food and Nutrition is not dietetic or medical guidance; Physical Education is not exercise, injury, or medical advice; Agriculture is not farming instruction; Technical Drawing is not engineering or construction direction; and Religious and Ethical Studies is not religious authority. These boundaries travel with the unit wherever it appears.

## Acceptance Criteria

A release is ready only if every active high-school pack has level-aware units, a session cannot repeat a unit, selected-band units are preferred without leaking learner data, topic progress remains local, and deterministic tests cover the selector, subject separation, level mapping, and malformed local state rejection.
