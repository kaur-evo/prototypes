# Operators & Teams — Prototype

Design prototype for adding **shift-leader / helper distinction**, **persistent teams (brigades)**, and **headcount tracking** to Evocon. Driven by 23+ customer requests over 4 years. Two surfaces; throwaway code optimized for design iteration, not production.

If you're an LLM picking this up in a new chat — read this file, [operators-teams-ux-research.md](operators-teams-ux-research.md), and the [evocon-product-knowledge](evocon-product-knowledge/SKILL.md) skill. Together they cover the *why*, the *what*, and the *how-it-should-feel*.

## What's here

```
prototype/
├── CLAUDE.md                         ← this file
├── operators-teams-ux-research.md    ← 400-line UX research synthesis (the "why")
├── mock-data.js                      ← shared teams/operators + localStorage layer
├── setup-proto.html                  ← Settings surface (standalone, vanilla JS)
├── index.html                        ← Shift View shell (Vue 3 + Vuetify)
├── shift-view.js                     ← Static Shift View visual chrome
├── operators.js                      ← OperatorsPanel component (the real interaction)
├── img/                              ← logo + Mr Evocon mascot
└── evocon-product-knowledge/
    └── SKILL.md                      ← Evocon product reference (modules, colors, terminology)
```

## How to open it

1. `open setup-proto.html` — Settings page. Lists operators + teams, lets you CRUD them, plus an "+ Shift" assign modal.
2. Click "Open Shift View →" in the top bar (or open `index.html` directly) — Vue-based Shift View shell with the Operators panel triggered from the bottom-bar operator chip.

Both surfaces share `mock-data.js` via `localStorage`. Bump `DATA_VERSION` in [mock-data.js](mock-data.js) to wipe stale state. The Settings surface is the source of truth for which operators exist and which team they belong to; the Shift View surface reads from there.

## The mock dataset

- 3 teams: **Team Alpha** (Athens, blue), **Team Beta** (Warsaw, green), **Team Gamma** (Casablanca, red).
- 30 operators (10 per team). First operator of each team is tagged `Supervisor`; the rest have no tags.
- Tags: `Supervisor` / `Operator` / `Helper` / `Quality`.
- Stations: Filling Line 1/2, Packaging A/B, Warehouse, Quality Lab.

## What the prototype is actually testing

Three customer worlds, one feature, one 3-level model:

| World | Customer signal | Need |
|---|---|---|
| **A — "Who's in charge?"** | ~14 customers (Papoutsanis, Eurochartiki, Yiotis, Tikkurila, briqueterie chaouia, Vianex, Thermory…) | One **shift leader** + helpers, attribute OEE to the responsible person |
| **B — "Which crew is best?"** | ~5 customers (Matrixpack, hplush, Mars GEM, Supercerame; Campari/Hellenica adjacent) | Persistent **teams/brigades** for team-level OEE & bonuses |
| **C — "What kind of person?"** | Cross-cutting (Supercerame, Sarantis, briqueterie chaouia, RAFARM) | **Role/department tags** for filtering & compliance |

**The 3-level framework** (25.11 meeting — Meeri, Martin, Johanna): **Team → Supervisor → Helpers** (count or names). Maps cleanly to all three worlds. This is what the prototype implements.

## Key revenue signals to remember

- **Matrixpack** (Nov 2025): "Teams sit between Shifts and Operators and directly affect OEE." Multi-year ask, detailed diagrams.
- **Campari + Hellenica**: won't expand Evocon to more lines because mid-shift team editing is too painful (re-enter everyone). Solved by **duplicate-entry button**.
- **Potter & Moore** (Apr 2026, partner-escalated): independently asked for the same duplicate button.
- **JW**: "We argue every meeting whether 40% OEE was good or bad based on headcount" — drives the helpers/count requirement.
- **THG Labs**: "I fear our finance director won't approve this system unless we can get labour variance data."

## Open design decisions (from research, not yet resolved)

1. **Static vs dynamic role.** John Lelis: dynamic per-shift, with a Settings default — "If not, we have to get crazy and think all the different combinations." Prototype follows this.
2. **Operator group: Settings (static) or Shift View (dynamic)?** Mars/hplush/Matrixpack all say static, admin-managed, rarely changes. Override allowed in Shift View for the edge case where someone covers another team's shift.
3. **What's the optional toggle granularity?** Per-station (`Settings → Stations → Advanced → "Enable shift leader selection"`) — same pattern as existing "Require operator selection". Off by default.
4. **Custom roles beyond Supervisor / Operator / Helper / Quality?** P2 — research says Leader/Helper covers 90%, custom roles add edge-case complexity. Currently a fixed tag set in `MOCK_TAGS`.

See [operators-teams-ux-research.md](operators-teams-ux-research.md) — "Key Design Decisions to Resolve" — for the full 8-row table with evidence.

## MVP scoping

- **MVP-B (recommended start)**: "Star the leader." Per-station toggle in Settings, default role per operator, star toggle in Shift View, leader-first display in bottom bar, "Shift Leaders only" filter in Reports. JTBDs #1, #2.
- **MVP-B+**: extends MVP-B with operator groups (teams) for World B. Adds "Group" field on operators, group badge in Shift View, Operator Group as Split By / Filter in Reports. JTBDs #6, #7.
- **Quick win**: Duplicate operator entry button (already in `operators.js` overview cards). JTBD #4.
- **P2**: Dashboard Manpower widget, headcount-aware OEE targets (JTBD #3 — only 2 customers), custom role taxonomy (JTBD #5).

## Setup surface — [setup-proto.html](setup-proto.html)

Plain HTML + vanilla JS (no framework). Two views toggled in top bar:
- **List view** — operators table with first/last name, tag chips, team dot+name, stations, passcode mock.
- **Teams view** — collapsible groups per team.

Three modals:
- **Add/Edit Operator** — name, stations (multi-select dropdown), team, tags (multi-select dropdown), passcode mock.
- **Add/Edit Team** — name, color, factory.
- **Assign Shift** — team-grouped checkbox list, tag chips, helper count, start/end time. Matches the Shift View operators panel UX so the two surfaces feel consistent.

Persists everything via `SharedData` in `mock-data.js`.

## Shift View surface — `index.html` + `shift-view.js` + `operators.js`

Vue 3 + Vuetify 3 (loaded from CDN). Pure visual chrome around the **OperatorsPanel** — the only thing with real interaction logic.

- [`index.html`](index.html) — entry point + all CSS. Renders `<shift-view>` + `<operators-panel>`. The `setup()` is intentionally minimal: just `operatorsPanelOpen` and `operatorSummary` refs.
- [`shift-view.js`](shift-view.js) — dark-theme Shift View mock: 3-column header (logo/station/quantity/batch/upcoming, shift label + chart, clock + OEE), timeline (hardcoded 8-row pattern matching Evocon's color system), bottom bar. The operator chip in the bottom bar emits `open-operators`.
- [`operators.js`](operators.js) — the **OperatorsPanel** Vue component. Three views via `currentView`:
  - **overview** — list of operator entries (cards with team dots, name list, time range, delete/duplicate/edit icons) + helper entries.
  - **add-operators** — search box, collapsible team groups with multi-select checkboxes, inline tag editing (multi-select dropdown per operator), helper count, start/end time.
  - **add-helpers** — number input + time range (currently reachable only via "edit helper entry").
- The panel emits `update:summary` whenever entries change; the bottom bar chip uses this to display primary team + count + extras + total man-hours.

### Shift leader elevation (Spiros / Eurochartiki signal)

If any selected operator has the `Supervisor` tag, the bottom-bar chip shows `**Leader** + N` (bold leader name, +N = everyone else, ops + helpers) instead of `Team Alpha (3) + 2`. Gated by a per-station feature toggle.

- Toggle lives in `setup-proto.html → Stations view → "Enable shift leader selection"`. Off by default — Spiros's hard constraint: *"whatever you do, must be optional"*.
- The Shift View prototype represents station `Filling Line 1` (see [`mock-data.js`](mock-data.js) → `SHIFT_VIEW_STATION`). `operators.js` reads that station's toggle in `emitSummary()` and suppresses `leaderName` when it's off.
- Reload the Shift View tab after toggling — the panel reads station settings on entry-change, not via storage events.

## Visual reference — Evocon's design system

Anything new must conform to Evocon's existing patterns. The [evocon-product-knowledge](evocon-product-knowledge/SKILL.md) skill is the canonical reference — read it before reviewing or extending designs. Key things:

- **Color system**: green = running, yellow = speed loss, red = stop, orange = scrap, blue pin = changeover, etc. Used identically across all modules — never repurpose.
- **Design priority order**: 1) Ease of use 2) Visualization 3) Knowing users 4) Fun 5) Performance. *Beauty never at the expense of usability.*
- **UX writing**: as few words as possible, reuse phrases, translation-aware (25+ languages), action-oriented labels.
- **Cross-module patterns** to respect: badge counters, progressive disclosure, station-centric navigation, shift-scoped data, summary modals, hotkeys (cc / pp / ss), Group → Reason structure, configurable per-station toggles in Settings.
- **Operator** = person on a station, **not a user account**. Stations, not operators, are the central entity.

## How to do design reviews on this prototype

Follow the design review checklist from `evocon-product-knowledge/SKILL.md`. Specifically watch for:

1. Does this match the **per-station "Enable X" toggle pattern** in Settings → Stations → Advanced?
2. Is the **operator vs. user** distinction respected? (Operators don't log in; they're entries on a shift.)
3. Does the **bottom-bar chip** stay distance-readable across the 6 responsive modes?
4. Will labels translate? Avoid English-only idioms.
5. **Cross-module impact** — anything we add here ripples into Reports (Split By Operator Group?), Factory Overview (show leader name in card?), Grid View, API (`shift_report` payload).
6. **Operator environment** — touch targets, shift-length fatigue, glove-friendly tap zones if relevant.

## What's intentionally not here

- No real Reports / Dashboard / Factory Overview / Settings → Stations screens. Out of scope for this prototype.
- No diary / drawer / write-access / user-role permission testing — that was scaffolding for a separate prototype, removed.
- No backend, no real API — just `localStorage`.
- No build step — open the HTML files directly.

## Older sketches (parent directory)

`../teams/`, `../teams2/` are earlier iterations from before the `prototype/` folder consolidated things. `../research-images/` holds screenshots referenced by the research doc (`img-01` through `img-25`).
