# Operators & Teams — API additions (spec)

**Purpose.** Make the new shift-people data — shift leader(s), operator groups, headcount / man-hours, the indirect-personnel flag, and operator tags — available over the API, so customers pull it into Excel / Power BI / their ERP instead of hand-matching attendance to Evocon exports.

## Grounding (read before reviewing)

- **Known facts.** Evocon exposes a reports API under `api.evocon.com/api/reports/`, authenticated with a Base64-encoded `APIKey:SecretKey` pair. There is an existing per-shift report payload (referred to internally as `shift_report`) that already carries the operator names on a shift.
- **Proposed.** Every **field name** below is a suggestion, not a verified API field — the *intent* is fixed, the exact naming / casing / nesting must be set with whoever owns the API schema.
- **No example JSON on purpose.** The real `shift_report` response shape isn't documented here, so inventing request/response bodies would be guesswork. This spec describes *what to add and why*, not a fabricated payload.

## What to add

| # | Addition | What it carries | Why (customer driver) | Grounding / notes |
|---|----------|-----------------|------------------------|-------------------|
| 1 | **Shift-leader flag per operator** | Boolean marking which operator(s) on a shift led it; the rest are operators/helpers. | The responsible person's name is lost in a flat list — can't attribute a shift's OEE to one person (~14 customers: Papoutsanis, Eurochartiki, Yiotis, Tikkurila…). | Extends the per-shift operator list in `shift_report`. Research suggested `is_leader`. **Multiple leaders possible** (see #6) — model as a flag per operator, not a single id. |
| 2 | **Operator group** | The group/department each operator belongs to (e.g. Blue Team, Quality, Operators). | Team/department-level OEE & bonuses without manual Excel pivots (Matrixpack, hplush, Mars GEM, Sarantis, Supercerame). | New attribute on the operator; mirrors Settings "Operator group". Current-state attribute. |
| 3 | **Headcount / man-hours** | People on the shift + total man-hours (Σ each distinct operator's shift hours). | Customers compute Good Qty ÷ (people × hours) by hand today; JW/THG need headcount-aware productivity & labour variance; Sarantis feeds man-hours into ERP costing. | Research integration note (`team_size` + duration). Expose the man-hours number directly to avoid client-side math. |
| 4 | **Exclude-from-man-hours flag** | Per operator: whether their time counts toward the shift's man-hours total. | Indirect personnel (supervisors, technicians, warehouse) are spread across lines and shouldn't inflate costing man-hours (Sarantis, raised unprompted in interview). | Per-operator attribute; pairs with the Settings switch. Man-hours total (#3) should be reported **net of excluded operators** (and/or split — see #5). |
| 5 | **Direct vs indirect man-hours** *(stretch)* | Two man-hours figures: direct (line operators) and indirect (excluded personnel). | Sarantis explicitly asked for both measures, matching how they account for direct vs indirect personnel. | Derives from #3 + #4. Optional second figure; only if #4 ships. |
| 6 | **Multiple leaders per shift** | Support more than one leader on a shift (e.g. production supervisor + quality lead). | Some plants assign several responsible people per shift (Sarantis: supervisor, quality, technical leads set once per shift). | Makes #1 a per-operator flag rather than one leader id. Prototype already models this (`leaderIds[]` with a primary). |
| 7 | **Operator tags** | The free-form tags already on an operator (role/department metadata). | Filter/segment people by type in external reporting; replaces the role-in-the-name-field hack (briqueterie chaouia, RAFARM, Supercerame). | Tags exist in Evocon today (enterprise); expose them on the operator in the report payload. Current-state metadata, **not** historical. |

## Open questions for the API owner

- **Placement** — do leader flag / group / exclude-flag / tags live on each operator inside the shift's operator array, or as separate top-level fields? (Decides #1, #2, #4, #7 shape.)
- **Man-hours: raw or derived?** Return the computed number, or the inputs (headcount + duration) and let clients compute? Research implies clients want the number.
- **Historical vs current** — leader flag is per-shift historical (the leader *on that shift*); group + tags are current-state attributes. Confirm the report returns as-of-shift leader, not the operator's current settings.
- **Excluded operators in man-hours** — confirm the headline man-hours (#3) is net of #4, and whether #5 (direct/indirect split) is in scope.
- **Versioning** — additive fields only, so existing integrations don't break. Confirm this rides the current reports API version or needs a new one.

## Priority

Strongest-validated first: **#1 shift-leader flag, #2 operator group, #3 man-hours**. Then **#4 exclude-from-man-hours** (Sarantis). **#5 direct/indirect split, #6 multiple leaders, #7 tags** are extensions to confirm with more customers.
