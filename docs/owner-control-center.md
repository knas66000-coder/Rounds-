# Rounds Owner Control Center

## Purpose

The **Rounds Owner Control Center** is a distinct, web-first administrative surface for the person operating Rounds. It shares the Rounds backend but remains structurally separate from the learner routes, learner navigation, and learner experience. Its purpose is platform oversight, not learner study.

## Initial Owner Scope

| Area | Owner can view or control | Explicit boundary |
|---|---|---|
| Platform overview | Learner totals, completed academic profiles, program distribution, material count, open safety reports | No passwords, opaque sessions, device tokens, or raw private PDFs |
| Learner directory | Minimal account identity, institution/program, account-created and last-sign-in dates | No learner answers, local practice history, microphone recordings, or private-document contents |
| Course-pack status | Which packs are active, which pack is the current flagship, and planned expansion state | Content can only be changed through reviewed Rounds releases in the first version |
| Community safety | Open report metadata, reason, target type, and resolution controls | Avoids publishing private report details or exposing unrelated learner records |
| Account access | Owner-only sign-in using the configured Rounds owner email and a Rounds-native account | Learners cannot discover or navigate to the control center |

## Access Model

The owner creates or signs in to a normal Rounds-native account using the configured private owner email. The server promotes only that account to the **admin** role and applies a second server-side email match for every owner-control API. The browser and mobile client hide owner routes from learners, but authorization never relies on the interface alone.

## Operational Workflow

1. The owner signs in at the dedicated Owner Control Center entry point.
2. The overview presents aggregate platform health and the current program map.
3. The owner can review open community safety reports and mark a report resolved after review.
4. The owner can inspect a minimal learner directory to support institutions and program rollout, without accessing sensitive learning artifacts.
5. The owner returns to the learner application through a clearly separate action; learner features do not expose administration controls.

## Initial Program and Pack Model

The first active pack is **Nursing / Health Sciences**. The control center also lists the approved expansion roadmap—University Foundation Year, Engineering Foundations, and later high-school combinations—without presenting unbuilt content as live. Offline pack distribution, automated updates, and delegated institution administrators are follow-up releases.
