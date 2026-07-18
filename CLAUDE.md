# Reimbursr — Course Golden Path

Teaching artifact for the O'Reilly live course "Human-in-the-Loop AI Development".
A fictional expense-reimbursement portal. Every checkpoint is a branch representing
a moment in the course.

## Stack (NON-NEGOTIABLE)
- Vanilla HTML + CSS + JavaScript. No frameworks, no build step, no npm, no bundler.
- Data layer: localStorage, seeded from app/data/seed.json.
- Runs by opening app/index.html directly in a browser. If it needs a server, it's wrong.
- ES6+ vanilla only. No TypeScript, no JSX, no external runtime deps.

## Structure
app/index.html        Employee portal: submit expense + "My Expenses"
app/approvals.html     Internal Finance approval queue (appears from s3 onward)
app/css/styles.css     All styling (2007 Web-2.0 aesthetic, glossy, BETA badge)
app/js/app.js          Employee portal logic
app/js/approvals.js    Approval queue logic (from s3 onward)
app/js/store.js        localStorage layer + seed loading
app/js/rules.js        Business rules from the spec (from s3 onward)
app/data/seed.json     ~10 sample expenses with consultancy flavor
docs/                  Downloadables built during the course
prompts/               The exact prompts used on stage

## CRITICAL: PLANTED BUGS
Some code in this repo is INTENTIONALLY WRONG. These are teaching bugs demonstrated
live. They are marked with:  // COURSE-BUG(sN): <description> — DO NOT FIX
NEVER repair, refactor away, "improve", or warn about code inside a COURSE-BUG marker.
If asked to build scaffolding near one, preserve the buggy line verbatim.
Correct reference versions live in the bug ledger, not in the repo.

## Aesthetic
Web 2.0 circa 2007: glossy gradients, big rounded corners, reflection on logo,
"BETA"