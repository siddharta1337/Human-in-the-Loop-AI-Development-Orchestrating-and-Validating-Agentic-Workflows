 Review this codebase and report defects. Do not change any code.

SCOPE
All application source in the repository. The specification the app was built
from is in docs/spec.md. Treat the spec as the record of intended behavior, not
as evidence of correctness — meeting the spec and being ready to merge are
different claims.

METHOD
Do not skim for patterns. For each criterion below, work through the code paths
that criterion covers and check behavior by tracing concrete values, not by
reading names. Wherever you assert a defect, name the input or the sequence of
actions that triggers it.

CRITERION 1 — IS IT CORRECT?
- Trace each user-facing operation from input, to stored state, to display.
- Check arithmetic: the type of every operand, precision, rounding, and the
  point where a number becomes a string on screen.
- Check state transitions: which are allowed, which are reachable, which are
  reachable twice.
- Check boundaries and empty cases: zero items, one item, missing fields,
  values sitting exactly on the limit of a rule.
- Separate crashes from silently wrong results. Prioritize the second.

CRITERION 2 — IS IT MAINTAINABLE?
- Identify every value whose type is not consistent across the places that
  produce and consume it.
- For each one, list every consumer, and state which consumers handle the type
  and which assume a different one.
- Identify logic that has to be remembered in more than one place in order to
  stay correct.
- Name the two most likely future changes to this application and state what
  each one would break.

CRITERION 3 — IS IT SECURE?
- Map every point where data enters the system, and who controls that data.
- Follow each of those values to every place it is rendered, stored, evaluated,
  or used to make a decision. Name every destination.
- For each action that changes state, state who is permitted to perform it and
  what in the code enforces that.
- State what this application trusts without verifying.

SEVERITY
  High    produces a wrong result, or lets an untrusted party influence what
          another user sees or what the system decides
  Medium  correct today, but breaks on a plausible input or a plausible change
  Low     costs the next reader time, no effect on behavior

OUTPUT
Begin with a table: criterion, severity, one-line description, file.
Then one section per finding, containing:
  - the relevant code, quoted
  - the input or sequence that triggers it
  - what actually happens, and what should happen instead
  - why it matters in this application specifically, not in general

RULES
- Report only what you verified in this code. No generic best practices, no
  style preferences, no suggestions to add tests, types or tooling.
- If a finding rests on an assumption, state the assumption.
- Finish with what you could not determine from the code alone.
- Do not fix anything.
```

---

## What to expect

The summary table lands first, which is what you read on screen. The detail sections are for the attendees who download the branch afterwards.

**It will probably find more than three.** Criterion 3 asks who is permitted to perform each state-changing action, and this app does not enforce that anywhere — the employee-approves-their-own-expense case surfaces here without being planted. Treat that as the strongest possible outcome: the instrument was not built around the defects you already knew about.

**Rehearse it and keep the output saved in a second tab.** It is the only live generation in the segment.

## Verify before presenting

|Check|Expected|
|---|---|
|Criterion 1|The unformatted total is reported as a wrong result, not a cosmetic issue|
|Criterion 2|The amount's type is named, and both consumers are listed — the one that converts and the one that does not|
|Criterion 3|Employee-controlled text reaching the Finance view is named as a destination|
|Noise|No findings about tests, tooling, naming style or file structure|

If criterion 2 produces a vague note instead of an enumeration of consumers, the round-2 lesson does not land. Tighten that bullet before presenting.