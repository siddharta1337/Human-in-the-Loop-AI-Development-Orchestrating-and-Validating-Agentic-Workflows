# Reimbursr Code Audits

**What this is:** a guideline for reviewing Reimbursr's code before it is merged. It checks the code through three validations: is it correct, is it maintainable, and is it secure. Each validation has its own rules.

**Who owns it:** the team. Team members are responsible for keeping the rules up to date as the project learns what to look for.

**Who reads it:** whoever reviews the code, human or agent. It is meant to be loaded into a prompt for a single review, not kept as permanent context.


The decisions the app was built from are in docs/decisions.md.

Treat that document as the record of intended behavior, not as evidence of correctness. Meeting the decisions and being ready to merge are different claims.

## Method

- Do not skim for patterns.
- For each validation below, work through the code paths that validation covers and check behavior by tracing concrete values, not by reading names.
- Wherever you assert a defect, name the input or the sequence of actions that triggers it.

## Validation 1: Is It Correct?

- Trace each user-facing operation from input, to stored state, to display.
- Check arithmetic: the type of every operand, precision, rounding, and the point where a number becomes a string on screen.
- Check state transitions: which are allowed, which are reachable, which are reachable twice.
- Check boundaries and empty cases: zero items, one item, missing fields, values sitting exactly on the limit of a rule.
- Separate crashes from silently wrong results. Prioritize the second.

## Validation 2: Is It Maintainable?

- Identify every value whose type is not consistent across the places that produce and consume it.
- For each one, list every consumer, and state which consumers handle the type and which assume a different one.
- Identify logic that has to be remembered in more than one place in order to stay correct.
- Name the two most likely future changes to this application and state what each one would break.

## Validation 3: Is It Secure?

- Map every point where data enters the system, and who controls that data.
- Follow each of those values to every place it is rendered, stored, evaluated, or used to make a decision. Name every destination.
- For each action that changes state, state who is permitted to perform it and what in the code enforces that.
- State what this application trusts without verifying.

## Severity

- **High:** produces a wrong result, or lets an untrusted party influence what another user sees or what the system decides.
- **Medium:** correct today, but breaks on a plausible input or a plausible change.
- **Low:** costs the next reader time, no effect on behavior.

## Output

Report every finding in a single table, including low-severity ones. Sort the rows by severity, High first.

| Validation | Severity | File | Finding | Trigger |
|---|---|---|---|---|

- **File:** the file and line where the defect is.
- **Finding:** one line describing the defect. If it rests on an assumption, state the assumption here.
- **Trigger:** the input or sequence of actions that produces it.



## Rules

- Report only what you verified in this code. No generic best practices, no style preferences, no suggestions to add tests, types or tooling.
- If a finding rests on an assumption, state the assumption.
- Finish with what you could not determine from the code alone.
- Do not fix anything.
- Review only the requested files not the project.
