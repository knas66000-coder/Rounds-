# Security policy

Rounds is intentionally published as source code, but **credentials, learner data, and operational configuration must never be public**. Do not report a vulnerability in a public issue, pull request, commit message, or GitHub Discussion. Send it privately to the repository owner with a concise impact statement, affected screen or service, safe reproduction steps, and any proposed mitigation.

Never include real learner records, patient information, session tokens, passwords, backup passphrases, database URLs, API keys, signing keys, unredacted logs, or screenshots containing private data. If you believe a secret may already have been committed, revoke or rotate it first, then notify the owner privately with the file path and commit reference. Do not repost the secret.

## Collaboration safeguards

All changes should be developed in a branch and reviewed through a pull request. Contributors must keep environment files, generated builds, local logs, `.expo/`, device recordings, encrypted learner backups, and internal project metadata out of commits. The repository ignores common sensitive paths, but every contributor remains responsible for reviewing staged files before pushing.

The public repository is for inspectable source and community visibility. The private collaboration repository is for trusted coordination, pre-release material, and internal build troubleshooting. Neither repository is an appropriate location for production credentials or learner-identifying information.

## Response approach

The owner should acknowledge private reports, assess whether credentials or learner data are involved, contain the issue, rotate affected credentials where necessary, validate a fix, and coordinate disclosure only after remediation. Security fixes should include a regression test whenever the underlying behavior can be tested deterministically.
