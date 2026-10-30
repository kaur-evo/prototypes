# Factory Overview

## Purpose & Users

Factory Overview provides a real-time, multi-station bird's-eye view of the production floor. It is designed for supervisors, managers, and anyone who needs to monitor multiple stations simultaneously without switching between individual Shift Views. Available to all user types except Shift View users.

## Key Concepts

- **Live view:** Shows the *current* status of all selected stations — operating, stopped, or on standby — as color-coded cards.
- **Timeline view:** Shows a horizontal timeline of all selected stations over a configurable time window (1–24 hours), using the same color system as Shift View.
- **Station filter:** A shared filter (top-right) that applies to both views. Selecting more than 20 stations may affect performance.

## Information Architecture

### Live View

The first card in Live view is a **synopsis card** showing:
- Total stations selected
- Operating count (active production)
- Stopped count (running uncommented/unplanned stop or on standby)

Each station appears as a card, color-coded by status:

| Status | Card Color | Meaning |
|--------|-----------|---------|
| Operating (good) | Green | Producing at or above ideal cycle time |
| Operating (slow) | Yellow | Producing below ideal cycle time (speed loss) |
| Stopped (uncommented) | Light red | Stop with no reason entered |
| Stopped (commented) | Dark red | Stop with a reason entered |
| On standby (planned, included in OEE) | Light grey | Planned stop that affects OEE |
| On standby (planned, excluded from OEE) | Dark grey | Planned stop not affecting OEE |
| No shift | Black | No active shift scheduled |
| Connection lost | Special indicator | Device connectivity issue |

Each station card shows:
- **Station name** (clickable — opens Shift View in new tab)
- **OEE %** of current shift
- **Shift quantity** (total / ideal)
- **Current product** and good quantity vs target
- **Estimated production time** (alternates with quantity when target is set; shows "Target reached" when complete)
- **Speed chart** for the last hour (dark area = above ideal cycle time)
- **Stop reason** and duration (for stopped stations)

A unit dropdown in the top-right corner switches between primary and alternative units.

### Timeline View

Displays all selected stations as horizontal timelines using the universal color system:

| Color | Meaning |
|-------|---------|
| Green | Running at or above ideal speed |
| Yellow (light) | Uncommented speed loss |
| Yellow (dark) | Commented speed loss |
| Red (light) | Uncommented stop |
| Red (dark) | Commented unplanned stop |
| Grey (light) | Planned stop, included in OEE |
| Grey (dark) | Planned stop, excluded from OEE |
| Black | No shift |
| Blue pin | Product changeover |

Controls:
- **Indicator selector:** Switch between production overview, OEE, availability, performance, quality, and good quantity indicators.
- **Time window:** 1–24 hours visible at once. Navigate back/forward by the selected window size (max 7×24h back).
- **"Go to current time" button** resets to now.
- **Date indication** for time tracking.
- **Shift change icons** mark shift transitions.

Hover details on any timeline event show product info, stop reason, quantity, etc. Clicking any event opens the corresponding Shift View shift in a new tab.

In multi-factory setups, stations are grouped by factory with UTC offset displayed.

### Station Ordering

Stations and station groups can be reordered by dragging the dotted icon — order applies to both Live and Timeline views.

## States & Edge Cases

- **Auto-redirect:** Users are redirected to current time after 30 minutes of inactivity.
- **Page refresh:** Timeline resets to current time on refresh or re-entry.
- **Mobile/tablet:** Time-window navigation is not available.
- **Performance:** More than 20 stations may slow down the view.

## Connections to Other Modules

- **Shift View:** Station names link directly to the station's Shift View (new tab). All data displayed originates from Shift View.
- **Settings:** Station groups, shift schedules, and product configuration determine what appears in Factory Overview.
- **Grid View:** Can embed Factory Overview cards.
- **Dashboard / Reports:** Share the same underlying production data but with different aggregation levels.

## Image References

- ![Factory Overview Live](./factory-overview-live.png) — Live view showing operating, stopped, and standby station cards.
- ![Factory Overview Timeline](./factory-overview-timeline.png) — Timeline view with color-coded station histories.
- ![Station filter](./factory-overview-station-filter.png) — Station filtering interface.
- ![Timeline indicators](./factory-overview-timeline-indicators.png) — Indicator selector dropdown.
