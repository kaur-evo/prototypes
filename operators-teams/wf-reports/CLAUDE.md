# Wireframe – Reports Comparison Feature

## File map

| File | Role | Read when |
|------|------|-----------|
| `index.html` | View — HTML structure + CSS | changing layout or styles |
| `data.js` | Model — static config + mock data + pure functions | changing data shape, presets, column defs, date math |
| `logic.js` | Controller — app state + all event handlers + rendering | changing any behaviour or UI output |

Load order matters: `data.js` must execute before `logic.js` (both are `<script src>` tags at the bottom of `index.html`). All symbols are globals.

---

## data.js — where things are

Search by symbol; line numbers drift.

| Section | Key symbols |
|---------|-------------|
| Calendar, presets, axes | `MONTHS`, `PRESET_LABELS`, `XAXIS_OPTIONS`, `TIME_AXES` |
| People | `OPERATOR_DIRECTORY`, `OPERATOR_GROUPS`, `PSEUDO_OPERATORS` (`OP_UNKNOWN`), `OP_NO_LEADER` |
| Downtime columns | `DT_COLS` |
| Icons | `ICN` / `ICN_MULTI` + `icn(name, size, color)` — Evocon's own assets |
| Shift blocks | `SHIFT_BLOCKS` (one mock week), `blk()`, `blockPseudoOps`, `blockOperatorValues` |
| OEE | `OEE_TABLE_COLS`, `rollupOEE`, `descrValues`, `oeeTableRows`, `OEE_DIMS`, `oeeMatrixFromBlocks`, `manhoursScoped`, `blockManhours` |
| Quantities | `QTY_TABLE_COLS`, `rollupQty`, `qtyTableRows`, `qtyMatrixFromBlocks`, `qtyByDay` |
| Dates, compare range | `sameDay`, `addDays`, `computeRangeForMode` |
| One period, three reports | `blocksForRange`, `SHIFT_BLOCKS_CMP`, `DT_REASONS`, `downtimeEvents`, `DT_AXES`, `timeBucket` / `timeSlots` / `dayLabel`, `getAxisData`, `downtimeTotalRow`, `downtimeSplitMatrix`, `oeeDailySeries` |

## logic.js — where things are

| Area | Key symbols |
|------|-------------|
| App / compare / table state | `rangeStart/End`, `currentPreset`, `_appliedCompareOn`, `compareStart/End`, `_dtData`, `_dtPage` |
| Date picker + compare | `toggleDatePicker`, `applyDatePicker`, `removeCompare`, `applyCdd` |
| Downtime chart + table | `initChart`, `redrawChart`, `drawChartWith`, `drawDowntimeSplit`, `initTable`, `renderTable` |
| The period's input | `periodBlocks`, `comparePeriodBlocks`, `passesFilters`, `selectedBlocks`, `downtimeBase` |
| Chart controls | `decorateChartChips`, `setChipLabel`, `setChipActive`, `splitOptionsFor` |
| Filter bar | `FILTER_DIMS`, `FILTER_MENU`, `MENU_DECOR`, `renderActiveChips`, `renderSelectionList`, `applyFilters` |
| OEE / Quantities | `drawOeeChart`, `drawOeeBars`, `renderOeeMainTable`, `drawQtyChart`, `renderQtyTable` |

---

## Key wiring

- **One period, three reports.** All three reports read the same production: `SHIFT_BLOCKS` is one mock week, and `blocksForRange` repeats it day by day over whatever range is picked (no production on future days). OEE and Quantities roll the blocks up; Downtime reads stop events that `downtimeEvents` allocates from each block's real downtime (planned − run), so Downtime minutes equal what OEE's availability implies. The comparison period is `SHIFT_BLOCKS_CMP` (fixed per-block factors). **Nothing is random** — the only variety is a stable hash — so every view, axis, split and report reconciles, and switching never changes a number.
- **Date / compare / filter change** → `redrawChart(currentXAxis)` (or `drawOeeChart` / `drawQtyChart`) → `downtimeBase()` rebuilds the events from the filtered period → `getAxisData(xAxis, base)` → `drawChartWith(items)` + `initTable(items)`. Nothing is cached between draws.
- **Downtime rows** come from `dtFinishRow`: average = duration ÷ count, % of planned = duration ÷ the row's planned time, people columns via `descrValues` (the same as OEE / Quantities). The **Total row** is `downtimeTotalRow` — the whole period, never a sum of rows (rows overlap on the people axes). **Split by** is `downtimeSplitMatrix`, a true two-way sum.
- **People attribution is the same in all three reports**: a stop / a block counts for everyone on the shift, so rows overlap on Operators and Operator groups, and sum exactly on Shift leaders (which has an `Unknown` bucket, per spec).
- **Picker snapshot** — `toggleDatePicker()` saves all state to `_pickerSnapshot`; `closeDatePicker()` restores it. `applyDatePicker()` clears it (commit).
- **`_appliedCompareOn`** tracks the last *applied* compare state (not the in-picker state). Compare events only exist while it is on.

---

## Three reports: Downtime · OEE · Quantities

`currentReport` ('downtime' | 'oee' | 'quantities') drives `switchReport(type)`, which toggles the three `*-chart-section` blocks and calls the right `draw*` function. The left rail buttons (`rnav-downtime` / `rnav-oee` / `rnav-quantities`) call it. The four filter/date apply paths (`applyDatePicker`, `removeCompare`, `applyCdd`, `applyOperatorFilters`) each redraw whichever report is active.

### Shared people-data model (the important part)

OEE and Quantities both derive **everything about operators / groups / leaders from `SHIFT_BLOCKS`** in `data.js` — one block = a station-shift with a `leaderId`, `operatorIds`, and raw counters (`plannedMin/runMin/idealQty/totalQty/goodQty`). So chart, table, and filter chips always reconcile, and Split-by works on either dimension for free.

- **Name sync:** `OPERATOR_DIRECTORY` mirrors the setup prototype's 8 operators (`mock-data.js` MOCK_OPERATORS) in short form — `V. Mavroeidis`, `N. Papadopoulos` (the two `canLead`), `M. Kostopoulou`, etc., in three operator groups: **Blue Team**, **Red Team** and **Maintenance** (`OPERATOR_GROUPS`). Moving setup → reports shows familiar names. 1:1 by last name.
- **Unknown ×N** — reports have one non-person entry, `Unknown` (`OP_UNKNOWN`), which behaves like an operator everywhere: filter list, X-axis/split-by categories, table rows, the Operators / Operator groups columns. It is the unnamed part of a shift, with a headcount: **×0** = no operator was selected, **×N** = N additional-workforce people from Shift View, alone or alongside named operators. "Additional workforce" is a Shift View term only and never appears in reports. See `blockPseudoOps`.
  - **Man-hours:** Unknown = `awCount × plannedMin/60` per block (`awManhours`); an empty shift (×0) adds nothing. Same in all three reports.
  - **Reconciliation:** every people axis sums to its Total — the Unknown row is where the unnamed people's hours land. Unknown has no group, so the group axis gets its own `Unknown` bucket; the leader axis gets `Unknown` (`OP_NO_LEADER`, an alias of `OP_UNKNOWN`, also pinned in the Shift-leaders filter) for unled blocks.
- **`OEE_DIMS`** {operator, group, leader} maps a block → its value(s) per dimension. `oeeDimKey(label)` turns an axis/split label into a key. `oeeMatrixFromBlocks` / `qtyMatrixFromBlocks` build the outer×inner cell grid.
- **`selectedBlocks()`** applies the operator + leader filter chips to `SHIFT_BLOCKS`.
- **Axes map** — `splitOptionsFor(xAxis)` builds all three Split-by dropdowns and leaves out the dimension already on the X-axis: the spec's matrix has no diagonal (Operators × Operators and so on are "-"). `selectXAxis` / `selectOeeXAxis` / `selectQtyXAxis` drop the split when the axis moves onto it.

### OEE report

- `drawOeeChart()` dispatches: **line** only when `oeeChartType==='line'` AND `oeeXAxis==='Day'` AND no split (`oeeDailySeries` — rolled up from the same blocks as the Day table shown under it); otherwise **`drawOeeBars()`** (grouped bars). The 4 component bars are Quality/Performance/Availability/OEE (multiplicative — never stacked). **Manhours is table-only** — no 2nd-Y line.
- Controls: `oee-charttype-btn` (Line/Bar), `oee-xaxis-btn`, `oee-splitby-btn`.
- Tables: `renderOeeMainTable` (full 21-col `OEE_TABLE_COLS`, no-split) / `renderOeeTable` (compact category×inner, split). `oeeTableRows(blocks, dimKey)` builds rows + a Total.

### Quantities report

- `drawQtyChart()` — **stacked** bars (Scrap+Good+Potential = ideal output; opposite of OEE's multiplicative components). Per block: Good=`goodQty`, Scrap=`totalQty−goodQty`, Potential=`idealQty−totalQty`. `QTY_SEGMENTS` defines the colors (grey/green/orange). Day axis = `qtyByDay`; categorical = `qtyMatrixFromBlocks`.
- Controls: `qty-xaxis-btn`, `qty-splitby-btn` (Y-axis fixed to Quantity). State: `qtyXAxis`, `qtySplitBy`, `_qtyHidden`, `_qtyPage`.
- Tables: `renderQtyTable` (full, `QTY_TABLE_COLS`) / `renderQtySplitTable` (compact). `qtyTableRows(blocks, dimKey)`.
