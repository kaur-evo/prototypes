# Dashboard

## Purpose & Users

Dashboard provides personalized, at-a-glance production KPI monitoring for office users and administrators. Each user has their own dashboard with customizable widgets organized into tabs. It is also widely used on large screens on office or shop floor walls for live data displays. Shift View users do not have access to Dashboard.

## Key Concepts

- **Widget:** A self-contained chart or indicator showing a specific KPI for selected stations and time period.
- **Tab:** A named container for widgets. Users can create, rename, reorder, duplicate, and delete tabs. No limit on tabs or widgets per tab.
- **Tab rotation:** Auto-cycles through tabs every 30 seconds — ideal for wall-mounted displays.
- **Preceding period comparison:** Most widgets can show delta values vs. the matching previous period.

## Default Setup

New users get two pre-configured tabs:
1. **"OEE & Downtime"** — 5 widgets: OEE overview (7d), OEE overview (30d), Production data w/ OEE (30d), Downtime (7d), Downtime (30d)
2. **"My Dashboard"** — empty, ready for customization

When widget filters use "All" for factories/stations/reasons, newly added items are automatically included — no manual updates needed.

## Widget Types

### OEE Overview
- Doughnut chart showing OEE and its three components (availability, performance, quality)
- Change vs. preceding period shown in green (improvement) or red (decline), with both absolute and relative change percentages
- Optional target line (displayed in white)

### Production Data
- Bar chart for any single indicator: OEE, availability, technical availability, quality, performance, total quantity, good quantity, or scrap
- Optional trendline (dotted line; excludes no-data days and running periods)
- Optional comparison with preceding period (yellow lines)
- Optional target line (solid; bars colored lighter/darker relative to target)
- Weekends marked on x-axis
- Hover shows exact values
- Unit selector (primary/alternative) for quantity indicators

### Downtime Summary
- Horizontal bar chart of top stop reasons
- View by: individual reasons, groups, or locations
- Show top 1–10 reasons
- Optional preceding-period change arrows (green = decrease, red = increase)
- Hover shows occurrence count, time, and percentage change
- Shows "% of planned time" for each reason on hover

### Speed Loss
- Same structure as Downtime Summary but for speed loss reasons
- View by: individual reasons, groups, or locations

### Scrap Reasons
- Same structure as Downtime Summary but for scrap reasons
- View by: individual reasons or groups
- Hover shows scrap amount and percentage of total produced quantity
- Unit selector (primary/alternative)

### Checklists
- Two display modes: individual checklists or timeline
- Shows checklist completion status and trends (separate license required)

## Widget Configuration

All widget types share core settings:
- **Name** — custom or auto-generated (saved in current language, not auto-translated)
- **Time period** — extensive options (see below)
- **Station filter** — by factory, station group, or individual stations; "Select all" option available
- **Indicator-specific filters** — reasons to include, view mode, top N count

### Time Period Options

| Period | Description |
|--------|-------------|
| Ongoing shift | Current shift data only; comparison = previous shift |
| Previous shift | Last shift with data; finds most recent even if days ago |
| Today | |
| Yesterday | |
| Previous production day | Last day with shift data (skips non-production days) |
| Last 7 shifts | Aggregated by shift name + date |
| This week / Last week | |
| Last 7 days / Last 30 days | |
| This month / Last month | |
| This year / Last year | |
| Last 12 months | From 1st of month 12 months ago through yesterday |
| Custom | User-defined date range |

**Date assignment rule:** A shift belongs to the date when it *started*. A shift starting Monday 8 PM and ending Tuesday 8 AM counts as Monday's data.

**Shift-based period logic:** When multiple stations are selected, bars are aggregated by matching shift name + date. Comparison bars are calculated per-bar based on the chronologically preceding shift of the same type.

### Comparison Logic
- "Compare with preceding period" shows the previous equivalent time range
- For running periods (e.g., "this week"): comparison = same weekdays of last week
- For fixed dates: comparison = immediately preceding days of the same count
- Some periods offer "matching" vs. "whole period" comparison options

## Tab Management

- **Add:** Click "+" next to last tab, name it (max 25 chars)
- **Rename:** Edit mode (pencil icon) → three-dot menu → Rename
- **Reorder:** Edit mode → drag tabs by dotted handle
- **Duplicate:** Edit mode → three-dot menu → Duplicate
- **Delete:** Edit mode → three-dot menu → Delete (cannot delete the only remaining tab)

## Widget Management

- **Add:** "Add widget" button → select type → configure → Save
- **Edit:** Three-dot menu on widget → Edit → modify → Save
- **Delete:** Three-dot menu → Delete → Confirm
- **Duplicate:** Three-dot menu → Duplicate
- **Reposition:** Drag widget to new position; others auto-adjust

## Sharing

Administrators can share their tabs with other users:
- Select tabs to share → Select recipients (searchable, filterable by factory/station/role)
- Shift View users are excluded (no Dashboard access)
- Permission warning icon appears for users who lack rights to data in the shared widgets
- Admins can share to admins and office users; office users cannot share

## Tab Rotation

Toggle in top-right enables auto-cycling through all tabs every 30 seconds. Ideal for always-on displays.

## Connections to Other Modules

- **Shift View** is the data source — Dashboard aggregates what operators capture per shift.
- **Reports** provide deeper, more flexible analysis of the same data.
- **Settings** defines the stations, stop/scrap/speed loss reasons, and products that populate widget filters.
- **Grid View** can embed Dashboard cards for multi-view layouts.

## Image References

- ![Dashboard overview](./dashboard-overview.png) — Dashboard with multiple widget types.
- ![OEE widget](./dashboard-oee-doughnut.png) — OEE overview doughnut with comparison.
- ![Production data widget](./dashboard-production-data-bar.png) — Bar chart with trendline and target.
- ![Downtime widget](./dashboard-downtime-summary.png) — Downtime summary with change indicators.
- ![Tab management](./dashboard-tab-management.png) — Tab editing with reorder/rename/delete.
