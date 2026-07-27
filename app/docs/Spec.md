# Reimbursr — Specification

**What this is:** a record of decisions made before implementation started.
**Who owns it:** the person making the decisions, not the person writing the code.
**Who reads it:** whoever implements Reimbursr , human or agent.

---

## Purpose

Reimbursr is an internal expense reimbursement portal. Employees submit expenses
they paid out of pocket. The finance team reviews each submission and decides
whether the company pays it back.

Where this document is silent, no decision has been made.

---

## Users

**Employee** : submits expenses and follows what happened to them.

**Finance reviewer** : reviews submitted expenses and approves or rejects them.

---

## Outcome

This section defines the desired results. Ensure the following outcomes are met:

- Every expense an employee submits reaches a decided state. Nothing sits in an
  undefined one.
- Finance can see everything waiting on a decision in one place.
- An employee can tell what happened to a submission without asking anyone.

---

## Constraints

This section defines strict rules. Enforce the following limitations:

- An expense must have an amount, a date, a category, and a description. A
  submission missing any of them is not accepted.
- Category must be one of: Travel, Meals, Lodging, Supplies, Other.
- Once submitted, an expense cannot be edited by the employee who submitted it.
- Amounts must be positive.
- An expense cannot be dated in the future.

---

## Edge Cases

This section defines boundary behaviors. Handle the following scenarios accordingly:

- A submission that fails validation creates no record at all , not a partial
  one, not a draft.
- An expense that has already been decided cannot be decided a second time.
- The same expense submitted twice is one expense, not two.

---

## Expectations

This section outlines completion criteria. Verify that all conditions below are satisfied:

- An employee can submit an expense and immediately see it in their own list,
  with its current state.
- A finance reviewer can act on every submission that is waiting for one.
- Every rule in Constraints and Edge Cases is enforced when the expense is
  submitted, not left for the reviewer to catch.
- A rejected submission tells the employee why it was rejected. A silent
  discard does not count as done.

---

## Out of Scope

Deliberately excluded from this version:

- Receipt uploads and attachments
- Multiple currencies
- Payroll and accounting integrations
- Notifications of any kind

---

Implementation tasks are tracked separately. This document does not sequence
work , it records what was decided.