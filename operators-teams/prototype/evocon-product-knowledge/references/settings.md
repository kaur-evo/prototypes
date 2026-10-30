# Settings

## Purpose & Users

Settings is the administrative backbone of Evocon — all configuration that drives Shift View, Factory Overview, Dashboard, and Reports is managed here. Only administrators (Company and Factory) can modify Settings. Office users can edit their own profile. Shift View users have no access to Settings.

## Key Concepts

- **Settings cards:** The Settings page presents subsections as clickable cards (Profile, Stations, Shifts, Products, Stop Reasons, Scrap Reasons, Speed Loss Reasons, Operators, Machine Locations, Alerts, Devices, API Keys, Tags, Activity Logs, Security, Users).
- **Group/Reason pattern:** Stop reasons, speed loss reasons, scrap reasons, and products all follow the same organizational pattern: Groups contain individual items. Groups have colors, translations, and factory assignments.
- **Global groups:** In multi-factory setups, Company administrators can create global groups shared across all factories. Factory admins can view but not edit global groups.
- **Translations:** Groups and reasons can have translations for multiple languages. Operators see items in their configured language in Shift View.
- **Ordering:** Groups and items within groups can be reordered by drag-and-drop. The same order appears in Shift View.

## Sections

### Profile
Each user can edit their own:
- Name, email, profile picture
- Language, default station, default start page
- Format preferences: number format, decimals, date format, first day of week, time format (12h/24h)
- Security: password change, two-factor authentication (2FA)

Format changes require page reload to take effect.

### User Accounts
Four user types with cascading access rights:

| Role | Shift View | Factory Overview | Dashboard | Reports | Settings |
|------|-----------|-----------------|-----------|---------|----------|
| Company Administrator | ✓ (all stations) | ✓ | ✓ | ✓ | ✓ (all) |
| Factory Administrator | ✓ (factory stations) | ✓ | ✓ | ✓ | ✓ (factory scope) |
| Office User | ✓ (assigned stations) | ✓ | ✓ | ✓ | Profile only |
| Shift View User | ✓ (assigned stations) | — | — | — | — |

**Configurable per user:**
- Station access with read/write or read-only per station
- Time restriction: limits how far back (in days or shifts) a user can edit Shift View data
- Languages (Shift View users can have multiple for language switching)
- Default station
- Number/date/time format preferences
- Security profile (Enterprise only)

**Password requirements:** ≥16 characters, uppercase, lowercase, number, symbol.

**Initial login:** Office/admin users receive a welcome email with 24h password creation link. After expiry, "Forgot password" flow available.

**Automatic logout:** Default 30 days. Configurable per security profile (1–365 days, Enterprise only).

### Stations
Stations represent measuring points (production lines/machines). New stations can only be added by Evocon support. Administrators manage:

**Station groups:** Organize stations into logical groups. One group = one factory. Drag to reorder.

**Per-station settings:**
- Name, description, group
- **Notification emails:** Email addresses for operator messages from Shift View. Replies from listed addresses are accepted.
- **OEE thresholds (happy/unhappy %):** Configure Mr. Evocon's mood and hourly quantity color coding. Happy = green, unhappy = red, between = neutral/yellow.
- **Default reasons:**
  - Empty shift reason — auto-applied to shifts with no production activity
  - Product changeover reason — auto-applied stop reason when changeover occurs during a stop
  - Default scrap reason — pre-selected scrap reason (useful for automatic scrap tracking)
- **Advanced settings:**
  - Require operator selection (mandatory before adding stop reasons)
  - Automatically carry stop reason to next shift (only if shifts are contiguous)
  - Require extra note on changeovers
  - Require LOT/Batch number on changeovers
  - Allow deleting production signals
  - Allow manual shift management (extra shifts, early start/end)

Changes require Shift View refresh to take effect.

### Shifts
Two views: **Timeline** (visual shift schedule per station) and **Templates** (list of shift templates).

**Shift templates:**
- Name, color, factory, stations, weekdays
- Start time, end time
- "No shift" days — exceptions to the schedule (holidays, etc.)
- Downtime auto-commenting — recurring stops auto-commented during specified times
- Active/inactive toggle

**Rules:**
- Active templates cannot overlap on the same station
- Changes don't affect currently running shifts
- Changes apply up to 24h into the past (if no previous shifts exist)
- Deleting templates doesn't affect historical data
- One template can cover multiple stations within the same factory

**Timeline view features:**
- 4-week view (1 back, current, 2 forward)
- Day view by clicking date
- Edit/delete upcoming shifts directly
- Vertical orange line = current time

**Downtime auto-commenting:**
- Set per shift template: specify time range, stop reason, and location
- Auto-comments any uncommented stop within the timeframe
- Signals during auto-comment time are preserved
- Starts from the next shift after saving

**Empty shift comment:** If no production events occur during a shift, the empty shift reason (configured per station) overwrites auto-comments after the shift ends.

### Products
Products are organized into groups. Each product has:
- Name, group, product code (unique, mandatory), primary unit (max 5 chars), optional alternative unit

**Station assignments (routes):**
- Ideal cycle time / production speed (multiple unit formats)
- Speed loss threshold (between ideal cycle time and downtime start)
- Downtime start time (when delay becomes a stop; recommended starting value: 180 seconds)
- Quantity per sensor signal
- Alternative unit conversion direction and value

Changes take effect from the next changeover. To apply to a running batch, re-save the changeover in Shift View.

**Bulk management:** Product data export/import via Excel file (Company admins only). Covers product groups, products, and routes. Strict format requirements.

**Ordering:** Product groups and products within groups can be reordered; same order appears in Shift View changeover modal.

### Stop Reasons
**Groups:** Name, color, factory/global, translations, ordering.

**Reasons:** Name, group, type (planned/unplanned), stations, machine locations link, configurable options:
- Include in OEE calculation (planned stops only)
- Include in technical availability (unplanned stops only)
- Require extra note (optional: only when stop exceeds set duration)
- Require location
- Allow joining of multiple stops
- Maximum allowed duration (1–1440 minutes)
- Translations

Deleting a reason removes it from future use; historical data preserved. Type changes apply prospectively (historical data retains original type).

**Bulk management:** Stop reasons export/import via Excel (Company admins only).

### Speed Loss Reasons
Same group/reason pattern as Stop Reasons: name, group, color, stations, translations. Options: require location, require extra note.

### Scrap Reasons
Same group/reason pattern. Additional option: "Add scrap and increase total quantity" — for 2-sensor setups where scrap count adds to (rather than subtracts from) total. Require extra note option available.

### Operators
Operators are not users — they're a name list for shift registration. Each operator:
- First name, last name
- Assigned stations (required)
- Optional: Checklists authentication passcode

Required operator selection can be enabled per station to enforce registration before operators can add stop reasons.

### Machine Locations
Locations represent physical positions within a production line where stops/speed losses occur. Each location:
- Name, stations, linked stop reasons (optional), linked speed loss reasons (optional), translations

Locations are analyzed in Reports using X-axis grouping. They should not be used as a "third level" for stop/speed loss reasons.

Ordering: by station grouping, drag-and-drop.

### Alerts
Administrators define event-based notifications:

**Trigger types:**
- **Downtime:** "Lasts longer than," "Is added," or "Repeats X times within shift"
- **Scrap:** Count threshold per batch (resets at changeover)
- **Changeover:** "Is added" or "Target reached"
- **Checklist:** Status-based (missed, unsuccessful, etc.)

**Filters:** Factory, station, product, operator.

**Channels:** Email (with customizable subject/body using variables) or Webhook (URL with base64-encoded body).

Alerts look forward only — not retroactive. Downtime alerts send 1–2 minutes after the triggering event.

### Devices
Overview of Evocon hardware devices:
- Serial number, status, last online time
- 4 inputs per device with connected stations
- Hostname, Ethernet MAC (copyable)
- Troubleshooting link

### API Keys
For connecting external systems (ERP, Excel, Power BI) to Evocon:

**Two key types:**
- **Custom reports:** Read-only access to api.evocon.com/api/reports/ for all stations
- **User rights:** Copies access rights of a selected user

Secret key shown only once at creation. Authentication uses Base64-encoded `APIKey:SecretKey` in Authorization header.

Keys can be enabled/disabled/deleted. Deletion is irreversible. Regular rotation recommended.

### Tags (Enterprise)
Labels for categorizing stop/speed loss/scrap reasons and groups for custom API-based reporting:
- **Name:** Descriptive label (e.g., "Cleaning")
- **Alias:** Unique system key (e.g., "CLN")
- **Scope:** Assignable to stop reasons, stop groups, speed loss reasons, speed loss groups, scrap reasons, scrap groups
- Multiple tags per item; same tag across multiple items
- Tag data accessible only via API (not in standard reports)

### Activity Logs
Two views:

**Shift View logs:**
- Track operator actions: downtime (added/edited/deleted), checklists, changeovers, shifts, scrap, signals
- Filter by timeframe, station, events, user actions
- Shows: action time, event time, old/new values, user, role, factory, station, shift, operator, product
- Link to open corresponding Shift View

**Settings logs:**
- Track admin actions across all Settings sections
- Filter by timeframe, object type, user actions
- Shows: action time, object, object ID, old/new values, user, role
- Link to open corresponding Settings modal

### Security (Enterprise)
**Security profiles:**
- Require SSO, require 2FA, auto-logout after N days
- Assignable to user accounts

**SSO and SCIM:** Setup requires Evocon support involvement.

**Allowed IPs:**
- Restrict access by IP address
- Optionally restrict by role level (users below allowed role are blocked)
- When list is empty, all connections allowed
- Changes take immediate effect

## Data Management Patterns

### Export/Import
Stop reasons and products support bulk management via Excel export/import (Company admins only):
- Download current data → Edit in MS Excel → Upload
- Strict format: don't modify IDs, use unique names, use dropdowns
- Validation errors reported after upload
- Route duplication available for products

### Historical Data Behavior
- Renaming a stop reason/group changes it historically
- Changing stop type (planned/unplanned) applies prospectively
- Moving an item from local to global group replaces the relationship historically
- Deleting items soft-deletes them (data preserved, item hidden from UI)

### Automatic Inclusion
When dashboard widgets or report filters use "All" selections, newly added stations/reasons are automatically included.

## Connections to Other Modules

- **Shift View** consumes almost everything configured here: stations, shifts, products, all reason types, operators, machine locations, message contacts, feature toggles.
- **Factory Overview** uses station groups and shift schedules.
- **Dashboard** uses stations, reasons, and products for widget filtering.
- **Reports** uses all configured items for filtering, X-axis options, and calculations.
- **Checklists** configuration lives in Settings.

## Image References

- ![Settings overview](./settings-overview.png) — Settings page showing all cards.
- ![Station settings](./settings-station-settings.png) — Station edit view with OEE thresholds, default reasons, advanced settings.
- ![Shift templates](./settings-shift-templates.png) — Shift scheduling timeline and template list.
- ![Product configuration](./settings-product-config.png) — Product with route settings (cycle time, downtime start, units).
- ![Stop reason settings](./settings-stop-reason-settings.png) — Stop reason edit form with type, OEE inclusion, extra note, max duration.
- ![User management](./settings-user-management.png) — User account creation showing role assignment, station access, and preferences.
- ![Alerts configuration](./settings-alerts-config.png) — Alert setup with trigger types and channel configuration.
- ![Activity logs](./settings-activity-logs.png) — Activity logs table with filters and expandable rows.
