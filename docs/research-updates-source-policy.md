# Rounds Research Updates: trusted-source policy

Research Updates is an **on-demand connected feature** inside the existing Rounds application. It does not replace downloaded course packs, verified Rounds rationales, or professional clinical judgment. Offline Nursing practice remains available without it.

## Initial trusted domains

| Domain | Permitted update focus | Rounds display requirement |
|---|---|---|
| `ncsbn.org` | Nursing regulation, licensure, NCLEX-related notices, workforce and regulatory publications | Identify the NCSBN source title and direct link. |
| `cdc.gov` | Public-health guidance, disease prevention, surveillance, outbreak updates, and MMWR publications | Identify the CDC source title and direct link. |
| `fda.gov` | Drug, device, safety, recall, and regulatory notices | Identify the FDA source title and direct link. |
| `who.int` | International health guidance and global health updates | Identify the WHO source title and direct link. |
| `nih.gov` | Research and health-information updates from NIH institutions | Identify the NIH source title and direct link. |

## Evidence and safety rules

The feature accepts a learner topic rather than a request for individual clinical advice. A connected search must return only sources from an approved domain, with a title, direct URL, concise dated summary, and clear source label. If no qualifying source is found, Rounds must say so rather than providing an unsupported update. Search summaries are marked **Research update — verify with course guidance and local policy** and never overwrite an installed answer key or clinical rationale.

The first release is manually initiated by the learner and does not poll, schedule, or send automatic update notifications. This keeps the online step deliberate, protects offline study behavior, and avoids background-fetch assumptions until update preferences and institutional source mappings are designed.

## Source references

- https://www.ncsbn.org/ — National Council of State Boards of Nursing, nursing regulation and latest news.
- https://www.cdc.gov/ — Centers for Disease Control and Prevention, official public-health guidance and journals.
- https://www.fda.gov/ — U.S. Food and Drug Administration, official safety, regulatory, drug, and device information.
