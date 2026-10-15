# Reimbursr

Teaching artifact for the live course **"Human-in-the-Loop AI Development."**
Reimbursr is a fictional expense-reimbursement portal used as the course's golden path:
a single running example that evolves checkpoint by checkpoint as the course progresses.

## Branch-per-checkpoint layout

Each checkpoint in the course corresponds to a branch. Branches are named `sN-<slug>`
(e.g. `s1-blind-trust`) and represent the state of the app at that moment in the
course narrative. Later checkpoints build on earlier ones — check out a branch to see
exactly what existed at that point.

Some code in this repo is **intentionally wrong** — planted bugs used for live
demonstrations. These are marked with `// COURSE-BUG(sN): <description> — DO NOT FIX`
comments and should never be repaired outside of the course narrative.

See [CLAUDE.md](CLAUDE.md) for the full stack constraints and repo structure.
