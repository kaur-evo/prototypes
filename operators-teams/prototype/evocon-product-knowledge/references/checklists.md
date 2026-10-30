# Checklists

## Purpose & Users

Checklists enables structured quality control and task management within the production process. Operators fill checklists directly in Shift View; administrators create and manage them in Settings. Results are analyzed in the Checklists report. Checklists is a separately licensed feature.

## Key Concepts

- **Checklist:** A named set of tasks that appears as a pin on the Shift View timeline at defined intervals or on specific events.
- **Task:** An individual check within a checklist. Multiple task types available.
- **Pin:** Visual indicator on the Shift View timeline showing checklist status. Color-coded: black (new/pending), green (successful), orange (unsuccessful), red (missed).
- **Frequency:** When a checklist appears — can be time-based, event-based, or manual.
- **Authentication:** Optional passcode verification for operator identity when filling checklists.

## Checklist Pin States

| Pin Color | Status | Meaning |
|-----------|--------|---------|
| Black | New | Checklist appeared but not yet filled |
| Green | Successful | All tasks completed within acceptable parameters |
| Orange | Unsuccessful | One or more tasks failed or outside range |
| Red | Missed | Checklist deadline passed without completion |

When multiple pins are close together on the timeline, they stack into a numbered pin that expands on click (same stacking pattern as changeover pins).

## Frequency Types

| Frequency | Trigger | Example |
|-----------|---------|---------|
| Periodical | At scheduled intervals (e.g., every 2 hours) | Quality check every 2 hours during shift |
| Interval | After X units produced or X time in production | Check after every 1000 units |
| Changeover | On product changeover | Verify setup after product change |
| Quantity | When target quantity is reached | Inspect at 50% of target |
| Downtime | When a specific stop reason is added | Safety check after equipment failure |
| Manual | Operator activates manually from Shift View | Ad-hoc inspection |

## Task Types

| Type | Input | Use Case |
|------|-------|----------|
| Measurement | Numeric value | Temperature, weight, pressure readings |
| Yes/No | Toggle | Pass/fail checks |
| Text | Free text | Observations, notes |
| Mark as done | Checkbox | Completion confirmation |
| Single select | One option from list | Choose one category |
| Multi select | Multiple options from list | Select all that apply |

Measurement tasks can have **target value** and **acceptable range** (min/max). Values outside the range make the checklist unsuccessful.

## Shift View Integration

### Timeline Display
Checklist pins appear on the hour lines at the position matching their trigger time. Operators can:
- Click a pin to open the checklist modal
- Fill all tasks and submit
- See pin color change based on results

### Footer Badge
The Checklists button in the Shift View footer shows a red badge with the count of missed + new (pending) checklists. Opens the Checklist overview modal showing all checklists for the current shift.

### Checklist Modal
When filling a checklist:
- Shows checklist name, due time, and all tasks
- Each task displays its type-specific input
- Measurement tasks show target and range
- Submit saves results and updates the pin color
- Authentication prompt appears first if enabled

### Manual Activation
For manually-triggered checklists, operators click the "Start checklist" action from the timeline popover or from the checklist overview modal.

### Filtering
In the Shift View view settings (gear icon), operators can choose which checklists are visible on the timeline.

## Settings & Administration

### Creating Checklists
Administrators create checklists in Settings → Checklists:
1. **Name** — descriptive checklist name
2. **Group** — organize checklists into groups
3. **Stations** — which stations this checklist applies to
4. **Frequency** — when the checklist appears (see frequency types above)
5. **Tasks** — add tasks with their type, instructions, and parameters
6. **Status** — active/inactive toggle

### Checklist Groups
Groups organize checklists for easier management. Groups have names and can be reordered. Tasks within a checklist can also be reordered.

### Duplication
Checklists can be duplicated to create similar variants for different stations or configurations.

### Deletion
Deleting a checklist removes it from future shifts. Historical data in reports is preserved.

## Authentication

Optional per-checklist passcode system:
- When enabled, operators must enter their personal passcode before filling a checklist
- Passcodes are set per operator in Settings → Operators
- Ensures traceability of who filled which checklist
- The "Done by" field in reports reflects the authenticated operator

## Reporting

### Checklists Report (Standard)
Available in Reports module when Checklists feature is active:
- **Chart:** Visualizes successful/unsuccessful/missed proportions over time, by station, by checklist, etc.
- **Data table:** Count, successful, unsuccessful, missed, average time to fill, median time to fill
- **Drill-down:** Click to see individual checklist instances with task-level results
- **Time calculation:** Measures from pin appearance (due time) to submission. Late submissions show delayed fill times.

### Dashboard Widget
Two display modes:
1. **Individual checklists** — shows completion status for selected checklists
2. **Timeline** — trends over time

### Alerts
Alerts can be configured to trigger on checklist status changes (e.g., when a checklist is missed or unsuccessful). Sent via email or webhook.

### API Access
Checklists data can be exported via API to Excel/Power BI using API keys with custom reports rights.

## States & Edge Cases

- **New checklists (black pins)** are not included in reports — they have no status yet.
- **Manually deleted checklists** are removed from reports.
- **If a downtime-triggered checklist** appears retroactively (e.g., stop reason added later), the pin appears at the stop time, not the current time. This can cause submission time to appear delayed in reports.
- **Checklist pin position:** Based on the trigger event time, not when the operator fills it.

## Connections to Other Modules

- **Shift View** is where operators interact with checklists — fill, view, manually activate.
- **Settings** is where administrators create checklists, define frequencies, tasks, authentication.
- **Reports** provides the Checklists standard report for analysis.
- **Dashboard** can display Checklists widgets.
- **Alerts** can trigger notifications on checklist events.
- **Activity logs** track checklist modifications in both Settings and Shift View logs.

## Image References

- ![Checklist pins on timeline](./checklist-pins.png) — Timeline showing black, green, orange, and red checklist pins.
- ![Checklist modal](./checklist-modal.png) — Checklist filling interface with measurement and yes/no tasks.
- ![Checklist settings](./checklist-settings.png) — Checklist creation form in Settings with frequency and task configuration.
- ![Checklists report](./checklists-report.png) — Checklists report chart showing successful/unsuccessful/missed proportions.
- ![Dashboard checklists widget](./checklists-dashboard-widget.png) — Dashboard widget showing checklist completion status.
