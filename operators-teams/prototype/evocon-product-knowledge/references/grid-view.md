# Grid View

## Purpose & Users

Grid View enables multi-panel displays by combining 2–12 cards from different Evocon modules in a single screen. It is designed for wall-mounted TVs, multi-monitor setups, and side-by-side station comparisons. Only Office and administrative users can create Grid Views; Shift View users can access them via shared URLs.

## Key Concepts

- **Card:** A single panel within the grid, showing one module view.
- **Short URL:** Auto-generated shortened URL for easy sharing and bookmarking. Persistent — save as bookmark for repeated access.
- **Grid layout:** Cards are added/removed using "+" and "X" buttons on the grid edges. Minimum 2, maximum 12 cards.

## Card Types

| Type | Content | Notes |
|------|---------|-------|
| Shift View | Single station's Shift View | Select which station to display |
| Factory Overview | Live or Timeline view | If multiple cards use the same view with different filters, refresh resets all to same filter |
| Dashboard | Single tab from Dashboard | Shows all widgets on the selected tab |
| Report | Standard or saved report | Chart + data table (may need scroll). Custom reports not available. |

## Creating a Grid View

1. Open "Grid View" from the main menu
2. Add cards using "+" buttons on grid edges; remove with "X"
3. For each card, select the module type and configure (station, tab, report, etc.)
4. Click "Open" — grid opens in a new tab
5. Copy the generated short URL from the creation modal for sharing/bookmarking
6. Close the creation modal with "Cancel"

Each card has scrollbars for content that exceeds the card's display area (long shifts, data tables).

## Sharing

- **URL-based access:** Share the short URL with any user who has access to the included data.
- **Shift View users:** Can view grids via shared URL but cannot create them. Do not include Dashboard cards in grids shared with Shift View users (they lack Dashboard access).
- **TV/kiosk displays:** Create the grid on a laptop, copy the URL, paste it in the TV's browser.
- **Access requirements:** Recipients must have read access to all stations/modules included in the grid.

## States & Edge Cases

- **Filter sync issue:** If multiple Factory Overview cards show the same view type (e.g., both Live) with different filters, a page refresh resets all to the same filter state.
- **Report scrolling:** Reports include both chart and data table, so grid cards for reports may require scrolling.
- **Bookmark persistence:** Grid URLs are stable — bookmarking provides permanent access without recreation.

## Connections to Other Modules

- **Shift View**, **Factory Overview**, **Dashboard**, and **Reports** can all be embedded as cards.
- **Settings** determines station access permissions that affect what users can see in shared grids.

## Image References

- ![Grid View layout](./grid-view-layout.png) — Grid with multiple cards showing Shift View and Factory Overview.
- ![Grid creation](./grid-view-grid-creation.png) — Grid creation modal with card type selection and short URL.
