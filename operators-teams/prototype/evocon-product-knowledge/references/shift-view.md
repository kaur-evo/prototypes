# Shift View

## Purpose & Users

Shift View is the operator's primary interface — a real-time, station-scoped view of the current or past production shift. It is the most feature-rich module in Evocon. Operators use it throughout their shift to monitor production, register stop reasons, mark product changeovers, enter scrap, and communicate with supervisors. Administrators and office users also use it to review past shifts and correct data. Available in 25+ languages with 6 responsive display modes from mobile to 4K.

## Key Concepts

- **Hour lines:** Each horizontal row represents one hour of the shift, showing production signals, stops, speed loss, and quantities.
- **Production signal (circle):** Each black circle represents a sensor event. The quantity per circle depends on the production process (usually configured so roughly one circle ≈ one minute of production).
- **Interaction header:** When clicking on the timeline, a popover appears with contextual actions (Add reason, Add changeover, Add scrap, etc.) and navigation arrows.
- **Most-used reasons:** When adding stop/speed loss/scrap reasons, the most frequently used reasons (calculated from the last 30 days, by occurrence) appear at the top. Stored locally per browser.
- **Hotkeys:** `cc` = add stop reason to last uncommented stop, `pp` = changeover on last signal, `ss` = scrap on last signal. Enter = save, ESC = close modals.

## Information Architecture

Shift View is divided into three main areas:

### Header
![Shift View header](./shift-view-header.png)

- **Station name** with left/right arrows to navigate between stations. Station list opens in a modal with search, grouped by station groups.
- **Date & shift selector** — click to open calendar and pick any date/shift. Arrows to move between shifts. "Go to latest" button in top-right.
- **Live/Offline indicator** — pulsing green dot for live shifts. Red "Offline" text with device details popup when connectivity is lost (admin users get a HELP button).
- **Current time** display.
- **View settings** (gear icon) — user preferences for Mr. Evocon style, quantity display (good vs total), unit (primary vs alternative), footer customization, checklist visibility.
- **Shift quantity** — actual produced / ideal quantity for the shift.
- **Current batch info** — product code/name, progress bar (green=good, orange=scrap, white=target), estimated production time (based on harmonic mean of last 5 signal speeds). Completed/upcoming batches accessible via tabs or expanded modal.
- **Speed widget** — real-time production speed chart. Zoomable, draggable. Shows dotted target line, dark red stops, yellow/white speed line, blue changeover pins. Multiple unit format options (units/h, units/min, units/sec, sec/unit, sec/signal).
- **OEE widget** — hourly OEE bar chart showing availability (green), performance (yellow), quality (orange) lines, target OEE (white), and OEE bars (white=above target, grey=below).
- **Shift OEE display** — numeric OEE and component breakdowns (availability, performance, quality).
- **Mr. Evocon** — emoticon reflecting OEE against configurable thresholds (happy/neutral/sad). Hover shows the threshold levels. Optional seasonal/"fun" variants.

### Timeline (Hour Lines)
![Shift View timeline](./shift-view-timeline.png)

Each hour shows:
- **Color-coded areas** following the universal color system (green=running, yellow=speed loss, red=uncommented stop, dark red=commented stop, grey=planned stop).
- **Production signals** as black circles. Orange circles = scrap. Grey circles = signals with comments.
- **Blue changeover pins** marking product transitions. When multiple pins are close, they stack into a numbered pin that expands on click.
- **Produced quantity vs target** at the end of each hour line. Color follows OEE thresholds (green = OEE ≥ happy target, yellow = between, red = OEE ≤ unhappy target).
- **Hover details** on stops: reason, group, location, extra note, duration, loss quantity. On speed loss: same detail set. On signals: timestamp, quantity.
- **Extra note indicator** — small icon on stops/speed losses that have extra notes attached.

### Footer
![Shift View footer](./shift-view-footer.png)

Left-to-right:
- **Three-dot menu** — Edit shift time, Start/Finish shift (for extra shifts), Delete shift (admin only on finished shifts).
- **Language flag** — switch between configured languages for the Shift View user.
- **Operator** — shows current operator name(s). Opens operator selection modal with start/end times, team support.
- **Product changeover** — opens changeover interaction (optional, hideable from view settings).
- **Downtime** (red badge with count of uncommented stops) — opens Downtime overview modal with Uncommented/Unplanned/Planned tabs, total durations, and ability to add/edit/remove reasons.
- **Speed loss** (yellow badge with count of uncommented groups) — opens Speed loss overview modal with Uncommented/Commented tabs.
- **Scrap** (orange badge with total scrap count) — opens Scrap overview modal showing scrap per product with expandable reason details.
- **Checklists** (red badge with missed/new count) — opens Checklist overview modal. Separate license.
- **Messages** (dot indicator for new messages) — send/receive messages to predefined email addresses. Subject, body (500 chars), inbox/archive.

## Core Workflows

### Registering Stop Reasons
Operators comment on red (uncommented) areas by clicking on them. Single-click opens a popover; double-click goes directly to the reason selector. Multiple stops can be selected by dragging brackets or clicking individually. The selection flow follows a configurable sequence: Group → Reason → Location (default), or Location → Group → Reason, or Group → Location → Reason. Extra notes (free text, max 500 chars) can be added; some reasons require them. The last 10 extra notes appear for quick re-selection. Stops can also be commented from the Downtime overview modal.

### Marking Speed Loss
Clicking any yellow area selects a speed loss group (bounded by changeovers, or manually adjusted with brackets). The same Group/Reason/Location flow applies. Speed loss groups are counted as one event in reporting when commented together.

### Product Changeovers
Clicking a signal or stop and selecting "Add changeover" opens the changeover flow: select product group, product (with search across name, code, order number), optional target quantity, LOT/Batch info, and extra notes. The blue pin appears at the marked position. If a target is set, a progress bar appears in the header with estimated completion time. Multi-station changeovers can synchronize changeovers across stations (configured by support — full sync or source-to-target sync).

### Marking Scrap
Two methods: (1) Click specific signals on the timeline and select "Add scrap" — quantity pre-filled from selected signals, adjustable. (2) Open the Scrap modal from the footer and click "+ Scrap" — select product, enter quantity, choose reason. Scrap can be entered in primary or alternative units. Scrap groups/reasons follow the same pattern as stop reasons.

### Operator Registration
Opens from the footer. Select one or multiple operators; set start/end times. Can be made mandatory per station (required operator selection). When mandatory, operators must register before they can add stop reasons. Supports team shifts with multiple operators and mid-shift operator changes.

### Shift Management
- **Edit shift time** — extend or shorten the current or past shift. Cannot crop out signals or changeovers. Cannot overlap with adjacent shifts. Minute precision.
- **Start shift early** — start a planned shift before its scheduled time (uses the template once).
- **Extra shifts** — start ad-hoc shifts when no planned shift is running. Set custom start/end times.
- **Finish shift early** — end an ongoing planned shift before its scheduled end.
- **Delete shift** — admin-only, for finished shifts. Irreversible.

### Sending Messages
Operators can message predefined contacts (configured per station in Settings) from the Messages modal. Contacts can reply via email. Subject + body (500 chars). Inbox and archive views. No attachments supported.

## UI Elements & Patterns

### Popover Interaction Model
Clicking on the timeline opens a popover with contextual actions. The popover shows:
- Selected time range or signal details
- Count and total duration of selected elements
- Navigation arrows (left/right/up/down) to move between signals and stops
- Action buttons: Add reason, Add changeover, Add scrap, Edit signal, Delete signal, Start checklist
- On mobile, the popover is draggable and repositionable.

### Badge Counters
The footer uses colored ovals as status indicators:
- Red oval on Downtime = count of uncommented stops
- Yellow oval on Speed loss = count of uncommented speed loss groups
- Orange oval on Scrap = total scrap product count
- Red circle on Checklists = missed + new checklists

### Stacked Pins
When multiple pins (changeover, team change, checklist) are close together, they merge into a numbered pin. Clicking expands to show individual pins for interaction.

### Joining Stops
Multiple stops within a shift can be merged into one for reporting purposes. The stop reason must have joining enabled in Settings. Joined stops show a "joined" icon. They count as a single occurrence in Dashboard and Reports. Can be unjoined from the Downtime overview modal.

### Barcode Functions
For environments using barcode scanners:
- `2#QUANTITY#` — add a production signal with specified quantity
- `4#productId#` — make a product changeover
- `5#Quantity#ProductID#` — add signal with quantity (and changeover if product differs)
- `6#scrapQty#scrapReasonId#extraNote#` — add scrap with reason
- `1#reasonId#` — register a stop reason to the last uncommented stop
- The Shift View must be the active browser tab. Barcodes are station-specific.

### Downtime & Speed Loss Registration Sequence
Configurable per station. Three options for the order operators see when adding stop/speed loss reasons:
1. Group → Reason → Location (default)
2. Location → Group → Reason
3. Group → Location → Reason

### Production Signal Comments
Any signal can have a free-text comment added via Edit signal. Signals with comments appear as grey circles. Comments are visible on hover. Custom export available via support.

### Produced Quantity Colors
Hourly quantity numbers are color-coded based on the station's OEE thresholds:
- Green = hourly OEE ≥ happy (high) target
- Yellow = between low and high targets
- Red = hourly OEE ≤ unhappy (low) target

The target quantity per hour is calculated from the product's ideal cycle time and planned production time, dynamically adjusted for changeovers and excluded stops.

## States & Edge Cases

- **Decimals in quantities:** When a signal spans two hours or two shifts (starts at the boundary), the quantity is proportionally split, causing decimal values in hourly/shift totals. This is by design.
- **Offline state:** When the Evocon device loses connectivity, a red "Offline" indicator replaces the green "Live" dot. An admin-visible notification shows device serial number and last-online time.
- **No shift running:** Black/empty state. Extra shift can be started. Planned shift can be started early.
- **Current shift timer:** Auto-redirects users to the latest shift after inactivity (20 min for Shift View users, 30 min for office/admin). A notification appears with a countdown before redirect. Any click resets the timer.
- **Speed loss after stops:** The first signal after a production stop never shows speed loss — it's shown at the target cycle time because Evocon only knows signal end times, not start times.
- **Required operator selection:** When enabled, a red dot appears on the operator button. Operators must register before they can add stop reasons.
- **Read-only mode:** Users with read-only access can view all data but cannot edit anything.
- **Time restriction:** Configurable per user — limits how far back into past shifts they can edit data.

## Display Modes

Six responsive breakpoints:
1. **Extra small (<600px)** — mobile. Widgets accessible from chart icon. Bottom menu buttons without text. Popover is draggable.
2. **Small (600–960px)** — tablets portrait. Widgets behind chart icon. Scrollable hour lines.
3. **Medium (960–1264px)** — small laptops, tablets landscape. Scrollable hour lines.
4. **Large (1264–1440px)** — standard desktop. All features visible.
5. **Extra large (1440–1904px)** — larger desktops.
6. **Extra extra large (>1904px)** — 4K and ultra-wide. Two widgets shown simultaneously (Speed + OEE side by side).

## Connections to Other Modules

- **Settings** configures everything Shift View uses: stations, shifts, products, stop/scrap/speed loss reasons, operators, machine locations, devices, and feature toggles.
- **Factory Overview** links to individual station Shift Views (station names are clickable links opening in new tabs).
- **Dashboard** widgets aggregate the same data that Shift View captures per shift.
- **Reports** provide historical analysis of the data entered in Shift View. Running period data may have a 2–3 minute processing delay vs. Shift View's real-time display.
- **Checklists** pins appear on the Shift View timeline and are filled by operators within Shift View.
- **Grid View** can embed Shift View cards for multi-station display.

## Image References

- ![Shift View overview](./shift-view-overview.png) — Complete Shift View layout showing header, hour lines, and footer.
- ![Shift View header](./shift-view-header.png) — Header area with station selector, date/shift, live indicator, batch info, speed graph, OEE, Mr. Evocon.
- ![Shift View colors](./shift-view-colors.png) — Color coding reference for all timeline elements.
- ![Downtime modal](./shift-view-downtime-overview-modal.png) — Downtime overview modal showing tabbed stop lists.
- ![Changeover flow](./shift-view-changeover-flow.png) — Product changeover selection with search, target, and batch info.
- ![Stop reason selection](./shift-view-stop-reason-selection.png) — Stop reason picker showing groups, reasons, locations, and most-used.
- ![Speed widget](./shift-view-speed-widget.png) — Speed graph with target line, speed line, and stop areas.
- ![OEE widget](./shift-view-oee-widget.png) — OEE hourly bar chart with component lines.
- ![Display modes](./shift-view-display-modes.png) — Comparison of mobile, tablet, and desktop layouts.
- ![Stacked pins](./shift-view-stacked-pins.png) — Multiple pins stacked into a numbered indicator.
- ![Joining stops](./shift-view-joining-stops.png) — Joined stops with the merge icon.
