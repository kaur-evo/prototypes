# Spiros — Operators & Teams interview outline

**Goal:** lock down setup + shift assignment so we can move to the reporting side.
**Format:** 45–60 min. Spiros drives the prototype first, then we discuss.
**Prototype:** `setup-proto.html` + `index.html` (Shift View). Bumped `DATA_VERSION` recently — fresh state on load.

---

## Part 1 — Prototype walk-through (~15 min)

Have him share screen and do this himself. Don't lead.

**Scenario:** You're setting up a new factory shift. Three teams (Alpha, Beta, Gamma) already exist as mock data. Two helpers from a different line show up mid-shift to cover a gap.

1. Open **Operators** (Settings). Browse the List view and the Teams view.
2. Add a new operator — assign them to a team, give them stations and at least one tag.
3. Edit an existing team (Team Alpha) — change its color from the palette.
4. Open **Shift View**. From the bottom-bar operator chip, assign the shift:
   - Pick a supervisor + 2 operators from Team Alpha.
   - Add 2 helpers (use the helper-count entry, not named).
5. Mid-shift: a Team Beta operator covers for someone — add them to the same shift.
6. Use the **Duplicate** button on an entry to extend a person's time block.

While he's doing this: just watch. Note where he hesitates, what he tries to click that isn't there, what terms he uses out loud.

---

## Part 2 — Three core questions (~30 min)

### Q1. Tags: setup-time attribute or shift-time assignment? ⭐ primary

> Today the prototype lets you tag an operator with **Supervisor / Helper / Operator / Quality** in Settings. But this collides with shift-time role selection: a supervisor on Tuesday might be a helper on Wednesday.

Ask:

- When you set up an operator, are you saying *"this person is a supervisor"* (identity), or *"this person is available to act as supervisor"* (capability)?
- For **Quality** specifically — is that an identity (this person is a QC inspector, always) or a per-shift assignment?
- If we drop Supervisor/Helper from the Settings tags and only keep them as **shift-time roles**, do you lose anything? Or is the Settings tag just a default for speed of entry?
- For reporting (e.g. *"show me OEE for shifts led by a supervisor"*), should the system count someone as a supervisor based on:
  - (a) their setup tag at the time the shift happened, or
  - (b) the role they were given in that specific shift?
- Pharma/RAFARM-style traceability — does the **role at time of shift** suffice, or do you need the role to be locked to the person?

Anchor decisions: research item #4 ("Role lives on the shift assignment, not the person") and #1 (dynamic per-shift, with a Settings default for speed). Confirm or break.

### Q2. Shift View bottom-bar chip — what numbers belong on the footer?

> Currently the chip can show: leader name (bold), team name, member count, helper count, total man-hours.

Ask:

- If you only had room for **two** things on the chip, which two? (leader name? headcount? team? man-hours?)
- Is **man-hours** something you want to see in real time during a shift, or only in reports?
- For factories without a designated leader (Matrixpack-style brigades): what does the chip show — team name + headcount?
- When supervisor toggle is **off** at station level, what does the chip default to?

Anchor: research JTBD #2 (headcount context next to OEE), Eurochartiki productivity quote.

### Q3. Teams + man-hours in reports

> The 3-level model (Team → Supervisor → Helpers) needs to feed reporting. We haven't designed the report side yet.

Ask:

- In Reports, what's the **first** new thing you'd want? Split-by-Team, Split-by-Leader, or a Manpower view?
- Man-hours: do you want it as a **column** in the existing OEE report, or a **separate Manpower report**?
- *Pieces per man-hour* — is this an Eurochartiki-only ask or universal?
- When you compare Team A vs Team B (Matrixpack case): do you compare on raw OEE, or do you also expect headcount-adjusted OEE?
- For factories that mix worlds (Greek pharma uses leader-helper, Greek snacks uses teams): does one report fit both, or are they different reports?

Anchor: research JTBD #6 + #7 (leader-helper combos, team comparison), pattern frequency table.

---

## Part 3 — Validate proposed answers (~10 min)

Read out the 4 unresolved Key Design Decisions (#1, #4, #6, #7) and ask him to confirm or push back. Specifically:

- #1 — Dynamic role per shift, default in Settings: ✓ / change
- #4 — Same person can be leader on shift A, helper on shift B: ✓ / change
- #6 — Operator group is static, admin-managed: ✓ / change
- #7 — Operator covering another team's shift defaults to their assigned group, with shift-level override: ✓ / change

---

## Notes to capture

- Per-customer mappings (who is World A vs B vs C from his portfolio)
- Any naming he uses in Greek/English that we should reflect (the "main operator" vs "shift leader" question)
- Whether per-station "Enable shift leader selection" matches his expectation as the gating mechanism
- Anything he tried in the prototype that didn't work the way he expected
