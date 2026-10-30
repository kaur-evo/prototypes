---
name: evocon-product-knowledge
description: >
  Deep product knowledge of Evocon, a cloud-based production monitoring platform for manufacturing.
  Use this skill whenever the user asks about Evocon's product, features, modules, OEE, production
  monitoring, shift management, factory overview, dashboards, reports, checklists, settings, grid view,
  or any manufacturing monitoring UX topic related to Evocon. Also use when reviewing designs, specs,
  or feature proposals for Evocon — the skill contains the design philosophy, color system, terminology,
  user types, and cross-module patterns needed to evaluate consistency and quality. Trigger this skill
  for any mention of: Evocon, Shift View, Factory Overview, OEE, stop reasons, speed loss, scrap,
  changeover, production signals, operators, stations, Mr. Evocon, checklists, machine locations, or
  manufacturing monitoring UX. Even if the user doesn't say "Evocon" explicitly, if they're discussing
  production monitoring software design, OEE dashboards, or shop floor operator interfaces, this skill
  is relevant.
---

# Evocon product knowledge

This skill provides comprehensive knowledge of Evocon's product — its modules, design philosophy,
color system, terminology, user types, and interaction patterns. Use it to answer questions about
how Evocon works, review designs for consistency, evaluate feature proposals, and provide
Evocon-specific UX guidance.

## When to use this skill

- Answering questions about Evocon's features, modules, or how things work
- Reviewing designs or specs for an Evocon feature
- Evaluating whether a proposed change is consistent with Evocon's patterns
- Writing UX copy that matches Evocon's voice and terminology
- Understanding how modules connect and affect each other
- Advising on OEE calculations, color system usage, or data flow

## Quick reference: what Evocon is

Evocon is a cloud-based production monitoring platform for manufacturing. It connects to machines
via hardware sensors, captures real-time production signals, and transforms raw data into actionable
business outcomes — higher productivity, lower waste, and better OEE (Overall Equipment Effectiveness).

Core value proposition: transform production data into business outcomes that increase productivity
and eliminate waste, with people, visualization, and ease of use at the center.

## The 7 modules

1. **Shift View** — Operator's primary real-time interface. The richest module. Hourly timeline
   with color-coded production signals, stops, speed loss, scrap. Operators register stop reasons,
   changeovers, scrap, and communicate with supervisors. 25+ languages, 6 responsive display modes.
2. **Factory Overview** — Multi-station bird's-eye view with Live (card-based status) and Timeline
   (Gantt-style history) sub-views. For supervisors and managers.
3. **Dashboard** — Customizable KPI widgets in tabs. OEE doughnut, production data bars, downtime
   summary, speed loss, scrap reasons, checklists. Tab rotation for big screens.
4. **Reports** — Historical analysis. 8 report types: Downtime, Speed Loss, Scrap, OEE, Quantities,
   Time Usage, Checklists, Production Speed. Saved reports, Split By, drill-down, export, AI insights.
5. **Checklists** — Quality/process compliance (separate license). Time/event/manual triggered checks
   with measurement, yes/no, text, select tasks. Pins on Shift View timeline.
6. **Settings** — Admin configuration hub. Stations, shifts, products, stop/scrap/speed loss reasons,
   operators, machine locations, alerts, devices, API keys, tags, activity logs, security.
7. **Grid View** — Multi-panel display (2-12 cards) for TVs and large screens. Embeds any module.

## Color system (used consistently across all modules)

| Color | Meaning |
|-------|---------|
| Green | Running within ideal cycle time |
| Yellow (light) | Speed loss, uncommented |
| Yellow (dark) | Speed loss, commented |
| Red (light) | Uncommented production stop |
| Red (dark) | Commented unplanned stop |
| Grey (light) | Planned stop, included in OEE |
| Grey (dark) | Planned stop, excluded from OEE |
| Black | No shift / production signals |
| Orange | Scrap or unsuccessful checklist |
| Blue pin | Product changeover |
| Blue flag | Batch target reached |

## User types

| Role | Access |
|------|--------|
| Company admin | Full access to everything |
| Factory admin | Full access within assigned factories |
| Office user | Shift View, Factory Overview, Dashboard, Reports. No Settings. |
| Shift View user (operator) | Shift View only |

## Core terminology

Station = machine/production line connected to Evocon. Shift = scheduled production time block.
OEE = Availability × Performance × Quality. Production signal = sensor event (circle on timeline).
Stop/Downtime = machine not producing. Speed loss = producing slower than ideal. Scrap = rejected
items. Changeover = product/batch change (blue pin). Operator = person on station (not a user account).
Mr. Evocon = emoticon reflecting OEE (happy/neutral/sad). Ideal cycle time = target speed per product.
Machine location = sub-area within a station. Tags = labels for filtering in reports.

## Design philosophy (priority order)

1. **Ease of use** — Intuition, optimal clicks, error prevention, consistency. The highest priority.
2. **Visualization** — Color as information, aesthetics without complexity, distance-readable.
   Key rule: beauty never at the expense of usability.
3. **Knowing users deeply** — Factory visits, user testing, interviews, support data, analytics.
4. **Fun** — Mr. Evocon, empty state illustrations, warm tone. Never at the cost of usability.
5. **Performance** — Fast, real-time. Primarily an engineering concern.

## UX writing guidelines

- As few words as possible, as many as necessary
- Reuse phrases — same label for same action everywhere
- Translation-aware — 25+ languages, no idioms, concise
- Neutral tone — professional but warm
- Action-oriented labels — buttons say what they do
- Error messages as guidance — what went wrong + how to fix

## Key cross-module patterns

- **Badge counters** — red/yellow/orange ovals in Shift View footer showing outstanding tasks
- **Progressive disclosure** — details on hover, click, or via modals
- **Station-centric navigation** — everything revolves around stations
- **Shift-scoped data** — Shift View shows one shift at a time
- **Summary modals** — footer buttons open tabbed lists of stops/speed loss/scrap
- **Consistent components** — same dropdowns, modals, tables, charts everywhere
- **Hotkeys** — cc (stop reason), pp (changeover), ss (scrap), Enter (save), ESC (close)
- **Group/Reason pattern** — stop, speed loss, scrap reasons all follow: Group → Reason structure
- **Configurable features** — many toggles per station in Settings

## OEE calculation

- Availability = Operating time / Planned time
- Performance = Total quantity / Ideal produced quantity
- Quality = Good quantity / Total quantity
- OEE = Availability × Performance × Quality
- Group/Total OEE uses summed values (weighted average by planned time), not arithmetic averages
- Date assignment: a shift belongs to the date it started

## Reference files

For detailed module information, read the relevant reference file:

- `references/shift-view.md` — Read when the question involves Shift View, operator workflows,
  timeline interactions, stop reasons, changeovers, scrap marking, display modes, or barcode functions.
- `references/factory-overview.md` — Read when the question involves multi-station monitoring,
  Live view cards, Timeline view, or station filtering.
- `references/dashboard.md` — Read when the question involves KPI widgets, tab management,
  widget configuration, time periods, comparison logic, or tab sharing.
- `references/reports.md` — Read when the question involves historical analysis, report types,
  filters, Split By, drill-down, export, AI insights, or OEE calculation details.
- `references/checklists.md` — Read when the question involves quality checks, checklist triggers,
  task types, authentication, checklist reporting, or dashboard widgets.
- `references/settings.md` — Read when the question involves admin configuration, user accounts,
  stations, shifts, products, reason management, operators, alerts, devices, API keys, security,
  or activity logs.
- `references/grid-view.md` — Read when the question involves multi-panel displays, TV layouts,
  or Grid View sharing.
- `references/design-philosophy.md` — Read when evaluating designs against Evocon's values,
  doing design reviews, discussing prioritization, or advising on UX process.

## Design review checklist

When reviewing a design or feature proposal, evaluate in this order:

1. **Ease of use** — Intuitive? Minimal clicks? Error-proof? Consistent with existing patterns?
2. **Visualization** — Color system correct? Information density appropriate? Distance-readable?
3. **User knowledge** — Serves the right user type? Fits their workflow and environment?
4. **Fun** — Engagement without compromising usability?
5. **Pattern consistency** — Matches existing patterns (badges, progressive disclosure, etc.)?
6. **Terminology** — Uses correct Evocon terms?
7. **Missing states** — Empty, loading, error, edge cases covered?
8. **Cross-module impact** — Affects Settings? Reports? Factory Overview? Grid View?
9. **i18n** — Labels concise enough for 25+ languages?
10. **Operator environment** — Touch targets, distance readability, shift-length fatigue?
