# Project recipes

These are proposed reuse patterns. They do **not** claim the target projects already contain these
integrations.

## Maqasa Jo

Safe first slice:
1. WhatsApp command: “Give me today's auction/admin summary.”
2. Read-only adapter fetches platform metrics and upcoming auctions.
3. Agent renders Arabic summary.
4. No bid, payment, listing publication, or user-account change from chat.

Later, approved capabilities may include draft listing summaries, bank-asset intake checklists,
auction alerts and investor follow-up drafts.

## Risha360

Safe first slice:
1. creator receives an offer/reminder notification;
2. “show offer” retrieves structured details;
3. “draft acceptance” creates a draft only;
4. actual acceptance or commercial commitment requires explicit confirmation and platform policy.

Useful extensions: monthly profile/photo reminders, follower-input reminders, wallet/points summaries.

## Factory AI OS / Manufacturing OS

Safe first slice:
1. read-only daily production/maintenance/quality summary;
2. alert explanation and linked evidence;
3. draft work order or escalation;
4. human approval before changing production systems.

Keep OT control separate from conversational AI. The assistant should not directly control machinery.

## Master Brain / project portfolio

High-value first slice:
- “What projects are blocked?”
- “What changed today?”
- “Prepare a status report for Project X.”
- “Continue the next safe local task” only when the underlying execution environment is explicitly
  authorized and Safe Forward Execution's boundaries are satisfied.

This turns WhatsApp into a mobile view/control surface, not the source of truth. Master Brain remains
the source of project state and audit history.

## Engineering / GitHub

Start read-only:
- PR status;
- failed CI jobs;
- open blockers/issues;
- recent commits.

Then add draft actions:
- draft issue;
- draft PR comment;
- prepare release notes.

Writing, merging, deployment and production changes remain separately authorized actions.
