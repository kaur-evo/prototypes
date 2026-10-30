---
name: evocon-activity-logs
description: >
  Produce Evocon activity-log spec tables (Settings logs and/or Shift View logs) for a
  mission/feature, in the exact Evocon log format. Use whenever a spec needs an "Activity
  Logs" section describing how new or changed entities/events appear in the audit logs —
  e.g. when a mission adds a field, a setting, a new entity, or a new Shift View event.
  Trigger on: "activity logs", "audit logs", "settings logs", "shift view logs", "what gets
  logged", "log table for <entity>", or any request to document logging for an Evocon feature.
---

# Evocon activity-logs spec writer

Evocon has two separate activity logs, each its own table with its own columns:

- **Settings logs** — admin changes to configured entities (operators, groups, stations, products, users, reasons…). Source spec: Notion "Activity logs: Settings".
- **Shift View logs** — operator/admin changes to timeline events (operators-on-shift, downtime, scrap, changeover, shift, checklists…). Source spec: Notion "Activity logs: Shift View".

This skill turns "feature X adds/changes Y" into the correct log table(s), in Evocon's real format, showing **only what is new or unique** for the feature — devs already know the format and the columns that stay the same.

---

## Step 0 — Ask the user first (required)

Before writing anything, ask:

1. **New entity or not?** Does this feature introduce a brand-new logged entity/event, or only add/change fields on an existing one?
2. **If new — what is its exact name?** (the string that goes in the `Entities` / `Events` column, e.g. "Operator groups"). Get the exact plural/casing — do not guess.

Do not proceed until these are answered. The entity name drives the `Entities`/`Events` column and the `Entity ID` content.

---

## Step 1 — Decide which log(s) are needed

Work out whether the change touches **Settings**, **Shift View**, or **both**, and produce a separate table for each that applies:

- Touches a **Settings** screen (operator setup, group CRUD, a new field/toggle on a configured entity, a new configured entity) → **Settings logs** table.
- Touches a **Shift View** timeline event (operator assignment on a shift, downtime, scrap, changeover, etc.) → **Shift View logs** table.
- Touches both (e.g. a field that exists in Settings AND shows up in a shift assignment) → **both tables**.

State explicitly which one(s) you concluded and why (one line).

---

## Step 2 — Column rules

### Keep the real columns, drop from "Users" rightward

Both real logs have many trailing columns (Users, Roles, Factory, Station, Shifts, Operators, Products, Expand/Go to…). **In a spec, omit every column from `Users` onward** — they never change per-feature and just add noise. Keep the columns up to and including `New values`.

So the spec tables use these headers:

**Settings logs**

| Entities | Entity ID | User actions | Old values | New values |

(Real full header for reference, not used in spec: User action time · Entities · Entity ID · User actions · Old values · New values · Users · Roles · Expand/Go to Setting.)

**Shift View logs**

| Event time | Events | User actions | Old values | New values |

(Real full header for reference: User action time · Event time · Events · User actions · Old values · New values · Users · Roles · Factory · Station · Shifts · Operators · Products · Actions.)

> **Flag any column you think genuinely changes.** If a feature would alter a kept column's *meaning or content* (e.g. the `Entities` column gains a new value, or `Event time` semantics shift), call it out in a 💡 callout above the table. If a normally-omitted column (Users→right) would actually change for this feature, surface that too instead of silently dropping it.

### Column content

- **Entities / Events** — the entity/event type string. Stays constant within a table if all rows are the same entity; state it once in a callout ("Entities = Operators") and you may still keep the column for clarity, or repeat the value per row. For a NEW entity, this is the name the user gave in Step 0.
- **Entity ID** (Settings) — two lines: display name, then `ID: <id>`. Products also add `Product code: <code>`. Users show `name<br>name@company` (no numeric ID).
- **User actions** — exactly one of: **Added**, **Edited**, **Deleted** (Settings). Shift View also has event-specific verbs (Started, First fill, Uncommented…), but for most features Added/Edited/Deleted is enough.
- **Old values / New values** — see Step 3.

---

## Step 3 — Old / New value formatting

Format is **`Field: value`**, one field per line (`<br>` between lines in Notion). Bold the field label.

Action rules (from the real spec):

- **Added** → Old values = `-`. New values = the fields being set.
- **Edited** → list only the **changed** fields, as old→new pairs (same field label in both Old and New cells). Time fields on time-bearing events stay visible with `(Unchanged)` in gray when shown for context.
- **Deleted** → Old values = the fields that existed; New values = `-`.

### Empty-field rule (important — user's pattern)

**A field with no value is omitted entirely — never write `Tags: -` or `Additional workforce: 0` just to show it's empty.** The field line simply isn't present.

- Exception: when an **Edit clears** a previously-set field, show the label with the emptied value (e.g. `Tags: -`) so the change is visible — otherwise it looks like nothing changed.
- A whole **side** being empty (Added's Old, Deleted's New) is the single `-` placeholder, as above.

### Multi-value fields

Comma-separated list, capped at 10 names then `+ N more` (e.g. `Stations: Line 1, Line 2, … + 37 more`). Operators on a shift are a plain comma-separated list.

---

## Step 4 — Output shape

Produce, under an `## Activity Logs` heading (collapsible/toggle is fine):

1. A one-line 💡 callout per table stating the format is unchanged and what is new (which fields / which entity), plus any flagged column change.
2. The Settings logs table and/or the Shift View logs table, each with the trimmed headers from Step 2.
3. Realistic mocked example rows covering the relevant actions (Added / Edited / Deleted as applicable). Mock all values — use believable Evocon-style names/IDs.
4. If a field is **P2/P3** (later phase), tag those rows in the Entities cell, e.g. `Operators<br>(🍺 P2: tags)`.

---

## Worked example (Operators & Teams mission)

Step 0 answers: new entity = **yes**, named **"Operator groups"**. Plus new fields on the existing **Operators** entity (operator group, Allow as shift leader) and on the **Operators** Shift View event (shift leader marked inline, Additional workforce).

Conclusion: **both** logs are affected.

### Settings logs

> 💡 Format unchanged. New things to log: the **operator group** + **Allow as shift leader** fields on an operator (Entities = Operators), and **Operator groups** as its own entity (Added/Edited/Deleted).

| Entities | Entity ID | User actions | Old values | New values |
|---|---|---|---|---|
| Operators | Vasilis Mavroeidis<br>ID: vasilis@evocon | Edited | Operator group: Operators<br>Allow as shift leader: No | Operator group: Red Team<br>Allow as shift leader: Yes |
| Operator groups | Red Team<br>ID: 512 | Added | - | Name: Red Team<br>Tags: Night-shift |
| Operator groups | Red Team<br>ID: 512 | Edited | Name: Red Team | Name: Red Crew |
| Operator groups | Red Crew<br>ID: 512 | Deleted | Name: Red Crew | - |
| Operators<br>(🍺 P2: tags) | Vasilis Mavroeidis<br>ID: vasilis@evocon | Edited | Tags: - | Tags: Night-shift, Forklift |
| Operator groups<br>(🍺 P2: tags) | Red Team<br>ID: 512 | Edited | Tags: - | Tags: Night-shift |

Note the empty-field rule in action: the "rename" Edit row shows only `Name:` (no `Tags:` line, because tags didn't change), not `Tags: -`.

### Shift view logs

> 💡 Format unchanged. Events stays **Operators**. In the values, the operators are a plain list with the leader marked **(shift leader)** in parentheses, plus **Additional workforce**. No separate row for the leader, no group.

| Event time | Events | User actions | Old values | New values |
|---|---|---|---|---|
| 08.06.2026<br>10:00:00 | Operators | Added | - | Operators: Vasilis Mavroeidis (shift leader), Jenna Rossity<br>Additional workforce: 2<br>Start time: 10:00<br>End time: 11:00 |
| 08.06.2026<br>10:00:00 | Operators | Edited | Operators: Jenna Rossity<br>Start time: 10:00<br>End time: 11:00 | Operators: Vasilis Mavroeidis (shift leader), Jenna Rossity<br>Additional workforce: 2<br>Start time: 10:00<br>End time: 11:00 |

Empty-field rule again: the Edited Old value has no `Additional workforce: 0` line — it's simply absent because it was empty.

---

## Quick checklist before delivering

- [ ] Asked the user: new entity yes/no, and its exact name.
- [ ] Decided Settings / Shift View / both — and said which.
- [ ] Trimmed columns to `New values` (dropped Users→right). Flagged any kept column whose content changes, and any dropped column that actually changes.
- [ ] Old/New use `Field: value`; empty fields omitted (not `Field: -`); Added Old = `-`, Deleted New = `-`; Edited shows changed fields only.
- [ ] Multi-value lists capped at 10 + "N more".
- [ ] P2/P3 fields tagged on their rows.
- [ ] All example values mocked, Evocon-style.
