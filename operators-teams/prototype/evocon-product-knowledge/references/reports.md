# Reports

## Purpose & Users

Reports provides historical, analytical reporting on production data for office users and administrators (not available to Shift View users). While Shift View captures data in real time and Dashboard gives at-a-glance KPIs, Reports enables deep analysis across time periods, stations, products, operators, and shifts.

## Key Concepts

- **Standard reports:** Pre-built report types available to all users with Reports access.
- **Saved reports:** User-customized snapshots of a standard report with specific filters, axes, and display options. Appear at the top of the report menu. Rolling time ranges (e.g., "last 7 days") update automatically.
- **Downloadable data files:** Raw data exports providing the underlying data behind standard reports, for custom analysis.
- **Custom reports:** Additional reports enabled per-customer; also downloadable. API access available for further flexibility.
- **Date assignment rule:** A shift belongs to the date it *started*. A shift starting Monday 8 PM and ending Tuesday 8 AM is Monday's data.
- **Processing delay:** Standard reports have a 2–3 minute delay vs. real-time Shift View/Dashboard. Custom reports may have up to 10 minutes.

## Report Types

### Downtime
Analyzes production stop reasons — the primary tool for understanding availability loss. Bar chart colored by stop group, showing duration and occurrence count. Drill-down reveals individual stop occurrences with operator, duration, date, and extra notes, plus a trendline.

**Data table columns:** Count, Notes, Loss (units), Duration (all), Average duration, Duration (incl. in OEE), Planned time (total), % of planned time.

### Speed Loss
Same structure as Downtime but for speed loss reasons (performance loss). Bar chart colored by group. Speed loss events are counted as one group when commented together in Shift View.

**Data table columns:** Count, Notes, Loss (units), Duration, Average duration.

### Scrap
Analyzes quality loss through scrap quantities and reasons. Bars colored by scrap group.

**Data table columns:** Scrap quantity (primary + alternative unit), % of produced, Time lost, Planned time, % of planned time.

### OEE
Shows equipment effectiveness and its three components over time. Supports both bar and line chart views. Includes technical availability as a separate metric.

**Key metrics:**
- **Availability** = Operating time / Planned time
- **Performance** = Total quantity / Ideal produced quantity
- **Quality** = Good quantity / Total quantity
- **OEE** = Availability × Performance × Quality
- **Technical availability** = (Planned time − Unplanned technical stops) / Planned time
- **OOE** = (Operating time / Shift time) × Performance × Quality
- **TEEP** = (Operating time / All time) × Performance × Quality

**OEE totals** are calculated as weighted averages based on planned production time (not arithmetic averages of individual station OEE values). Total OEE can be lower than all individual values if performance exceeds 100% on some stations due to incorrect ideal cycle time settings.

### Quantities
Tracks production output: good quantity, scrap, total, ideal quantity, and potential (ideal − total). Shows availability loss and performance loss in units.

### Time Usage
Visualizes how planned production time divides between: good production (green), speed loss (yellow), planned stops included in OEE (light grey), planned stops excluded from OEE (dark grey), unplanned stops (dark red), and uncommented stops (light red). Percentages are based on total production time, not planned time.

### Checklists
Reports on checklist completion: successful (green), unsuccessful (orange), and missed (red) counts and proportions. Shows average and median submission time. Available only with Checklists license.

### Production Speed
Histogram-based analysis for identifying optimal production speeds per product. Uses sensor signal data with outlier removal (IQR method). Shows mode (most frequent speed) vs. target speed to help calibrate ideal cycle times. Available in Professional and Enterprise packages.

## Shared Features

### Filters
All reports share:
- **Timeframe** — today, yesterday, this/last week, this/last month, last 7/30 days, this/last quarter, last 4 quarters, this/last year, custom date range
- **Factories** (multi-factory only)
- **Stations** — by group or individual
- **+FILTER button** — add optional filters (operators, shifts, products, product groups, etc.)
- **RESET button** — clears all filters

Filters carry over when switching between reports. Reason filters (stop/speed loss/scrap reasons) are available for their respective reports and also in OEE and Time Usage.

### X-Axis & Y-Axis Options
X-axis display options: days, weeks, months, years, stations, station groups, stop reasons, stop groups, locations, shifts, operators, products, product groups. Auto-switches to higher granularity when more than 30 data points.

For Downtime, Speed Loss, and Scrap: Y-axis can show duration, average duration, or count. Secondary Y-axis available.

For Scrap: Secondary Y-axis options include % of produced and % of planned time. Unit selector for alternative units.

### Split By
Adds a third dimension to chart visualizations. Select a "Split by" dimension (e.g., operators, shifts, products, tags) to subdivide each X-axis category into grouped bars. Table view shows main X-axis data only.

### Data Drill-Down
Click any first-column element in the data table (or the chart area around a bar) to drill into details. A "BACK" button returns to the previous view.

### Chart Legend Toggle
Click any legend element to show/hide it from the chart. Works for stop groups, quantity types, OEE components, etc.

### Sorting
Click column headers to sort ascending/descending. Sorting applies across all pages, not just the currently visible page. Chart updates to match table sort.

### Pagination
Long time ranges with daily granularity are split into pages. Chart and data table pagination are synchronized.

### Column Management
Add or remove columns from the data table via the "Columns" dropdown. Useful for customizing the view and for fitting the table to printable area.

### Time Format
Selectable display format for time values in the data table (hours/minutes, decimal hours, etc.).

### Export
- **Excel export:** "Export" → "All (Excel)" downloads the data table.
- **Notes export:** For Downtime and Speed Loss reports, "Export" → "Notes (Excel)" exports extra notes.
- **Downloadable reports:** Larger data files sent to email if processing exceeds 10 seconds. Download link valid for 72 hours.

### Print
"Print" from the three-dot menu generates a PDF file.

### Share
Share button copies a URL link to the current report with all filters applied. Recipients must have access rights to the included data.

### Saved Reports
Save a configured report with name and description. Appears in the sidebar with a star icon. Can be reordered (drag), renamed, updated (apply new filters then "Update"), duplicated, or deleted.

### Duplicating Reports
Duplicate any report (standard or saved) from the three-dot menu. Creates a saved copy with current (even unsaved) changes applied.

## AI Insights (Beta)

Downtime report offers AI-powered analysis of extra notes. When a stop reason has ≥50 extra notes on a station, an "AI" icon appears. Clicking it triggers analysis sent to the user's email as an Excel file with:
- **Summary sheet:** Themes grouped by AI, total downtime per theme, significant patterns (operators, shifts, products, locations)
- **All notes sheet:** Raw data with theme assignments

Limits: per-customer rate limit, max 20,000 notes per analysis, max 5 queued requests.

## OEE Calculation Details

**Availability** = (Green + Yellow) / (Shift time − Planned stops excluded from OEE)

**Performance** = Green / (Green + Yellow), or equivalently: Total quantity / Ideal produced quantity

**Quality** = Good quantity / (Good quantity + Scrap)

**Group/Total OEE** uses summed values (not averages): sum all stations' operating times, planned times, quantities, then apply formulas. This is a weighted average by planned production time.

**Why total OEE can be lower than individual values:** When any station has performance > 100% (due to ideal cycle time set too low), the weighted calculation can produce a total OEE below the minimum individual value.

## Connections to Other Modules

- **Shift View** is the data source — every stop, changeover, scrap, and signal enters through Shift View.
- **Dashboard** aggregates the same data into KPI widgets; Reports offers deeper analysis with more filters and chart options.
- **Settings** defines stop/scrap/speed loss reasons, products, stations, operators, and shifts that appear in report filters.
- **Checklists** report is available when the Checklists feature is licensed.
- **Factory Overview** shows real-time status; Reports provides historical trends.

## Image References

- ![Downtime report](./reports-downtime-report.png) — Downtime bar chart with group colors and occurrence counts.
- ![OEE report](./reports-oee-report.png) — OEE line/bar chart with availability, performance, quality components.
- ![Quantities report](./reports-quantities-report.png) — Quantities chart with good, scrap, and potential areas.
- ![Time Usage report](./reports-time-usage-report.png) — Stacked time usage chart with color coding.
- ![Production speed histogram](./reports-production-speed-histogram.png) — Histogram showing mode vs. target speed.
- ![Report filters](./report-filters.png) — Filter bar with timeframe, stations, and reason selectors.
- ![Split by](./reports-split-by.png) — Split by dimension adding grouped bars.
- ![AI insights](./reports-ai-insights.png) — AI icon on stop reason for extra note analysis.
