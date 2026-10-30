// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  logic.js — Controller                                                       ║
// ║  App state, event handlers, business logic, and DOM rendering.               ║
// ║  Depends on data.js being loaded first.                                      ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

// ── App state ─────────────────────────────────────────────────────────────────

// Downtime reads the period's stop records (data.js periodData), filtered on
// every draw (downtimeBase).
let currentXAxis   = 'Stop reasons';
let downtimeSplitBy = null;        // null = off, or a Split by option (DT_AXES key)
let _dtColLabel    = 'Stop reasons';
let currentY2      = null;         // null = off, or one of Y2_OPTIONS (Downtime)
let _dtFixedWidth  = 200;          // first column width, px — resizable via drag
let currentReport  = 'downtime';   // 'downtime' | 'oee'
let oeeSplitBy     = null;         // null = off, or a split label ('Shift leaders' | 'Operators' | 'Operator groups')
let oeeXAxis       = 'Day';        // OEE chart X-axis: 'Day' | 'Operators' | 'Operator groups'
let oeeChartType   = 'line';       // 'line' | 'bar' — user toggle. Line is only
                                   // drawn for the Day (time) axis with no split;
                                   // categorical axes / split always render bars.
let _oeeHiddenLeaders = new Set(); // leaders toggled off via the legend
let _oeePage       = 0;            // current page of category clusters (split mode)
const OEE_CATS_PER_PAGE = 100;     // categories per page — live default "Items per page: 100"

// Quantities report state (mirrors the OEE controls).
let qtyXAxis       = 'Day';        // 'Day' | 'Operators' | 'Operator groups' | 'Shift leaders'
let qtySplitBy     = null;         // null = off, or a split label
let _qtyHidden     = new Set();    // segments toggled off via the legend
let _qtyPage       = 0;            // current page of category clusters
const QTY_CATS_PER_PAGE = 100;     // categories per page — live default "Items per page: 100"

const _today = new Date(); _today.setHours(0,0,0,0);
let rangeEnd   = new Date(_today);
let rangeStart = new Date(_today); rangeStart.setDate(_today.getDate() - 6);
let leftMonth  = { year: 0, month: 0 };
let rightMonth = { year: 0, month: 0 };

let picking          = false;      // true while user is picking the first calendar day
let currentPreset    = 'last7';

let _pickerSnapshot  = null;       // snapshot saved on picker-open so Close can revert

// ── Data table state ──────────────────────────────────────────────────────────

let _dtData = [];
let _dtPage = 0;

// ── Calendar: display-month helpers ──────────────────────────────────────────

// True if d is strictly between rangeStart and rangeEnd
function inRange(d) {
  if (!rangeStart || !rangeEnd) return false;
  return d > rangeStart && d < rangeEnd;
}

// Set leftMonth / rightMonth so that both endpoints are visible, clamped to current month
function setDisplayMonths(start, end) {
  const now = new Date();
  let lm = { year: start.getFullYear(), month: start.getMonth() };
  let rm = { year: (end || start).getFullYear(), month: (end || start).getMonth() };

  // If same month, push left one back
  if (lm.year === rm.year && lm.month === rm.month) {
    lm = { year: rm.year, month: rm.month - 1 };
    if (lm.month < 0) { lm.month = 11; lm.year--; }
  }

  // Clamp right to current month
  if (rm.year > now.getFullYear() || (rm.year === now.getFullYear() && rm.month > now.getMonth())) {
    rm = { year: now.getFullYear(), month: now.getMonth() };
    lm = { year: rm.year, month: rm.month - 1 };
    if (lm.month < 0) { lm.month = 11; lm.year--; }
  }

  leftMonth  = lm;
  rightMonth = rm;
}

// ── Calendar rendering ────────────────────────────────────────────────────────

function renderCalendar(titleId, gridId, year, month) {
  document.getElementById(titleId).textContent = `${MONTHS[month]} ${year}`;

  const firstDay    = new Date(year, month, 1);
  const lastDay     = new Date(year, month + 1, 0);
  const startDow    = mondayDow(firstDay);
  const daysInMonth = lastDay.getDate();

  // Leading empty slots + this month's days (no trailing overflow)
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d });

  // Split into rows of 7
  const rows = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  let html = '';

  // Day-of-week headers
  html += '<div class="cal-grid">';
  DOW.forEach(d => { html += `<div class="cal-header-cell">${d}</div>`; });
  html += '</div>';

  rows.forEach(row => {
    // Classify each cell: main range state
    const states = row.map(cell => {
      if (!cell) return 'empty';
      const d = new Date(year, month, cell.day);
      if (sameDay(d, rangeStart)) return 'start';
      if (sameDay(d, rangeEnd))   return 'end';
      if (inRange(d))             return 'range';
      return 'normal';
    });

    // Main band span indices
    const bandIndices = states.map((s, i) => (s === 'start' || s === 'range' || s === 'end') ? i : -1).filter(i => i !== -1);
    const firstBand = bandIndices.length ? bandIndices[0] : -1;
    const lastBand  = bandIndices.length ? bandIndices[bandIndices.length - 1] : -1;

    html += '<div class="cal-grid" style="margin-top:0;">';
    row.forEach((cell, col) => {
      const state    = states[col];
      const isInBand = col >= firstBand && col <= lastBand && firstBand !== -1;

      let wrapClass = 'cal-cell-wrap';
      if (isInBand) {
        if (firstBand === lastBand)    wrapClass += ' band-single';
        else if (col === firstBand)    wrapClass += ' band-left';
        else if (col === lastBand)     wrapClass += ' band-right';
        else                           wrapClass += ' band-full';
      }

      if (!cell) { html += `<div class="${wrapClass}"></div>`; return; }

      const cellDate = new Date(year, month, cell.day);
      const isFuture = cellDate > _today;
      let dayClass = 'cal-day';
      if (isFuture)                                 dayClass += ' disabled';
      else if (state === 'start' || state === 'end') dayClass += ' range-dot';

      html += `<div class="${wrapClass}">`;
      html += `<div class="${dayClass}"${isFuture ? '' : ` onclick="handleDayClick(${year},${month},${cell.day})"`}>${cell.day}</div>`;
      html += `</div>`;
    });
    html += '</div>';
  });

  document.getElementById(gridId).innerHTML = html;
}

function renderCalendars() {
  renderCalendar('cal-left-title',  'cal-left-grid',  leftMonth.year,  leftMonth.month);
  renderCalendar('cal-right-title', 'cal-right-grid', rightMonth.year, rightMonth.month);
  updateNavButtons();
}

function updateNavButtons() {
  const now = new Date();
  const atMax = rightMonth.year > now.getFullYear() ||
                (rightMonth.year === now.getFullYear() && rightMonth.month >= now.getMonth());
  const btn1 = document.getElementById('nav-next-single');
  const btn2 = document.getElementById('nav-next-double');
  btn1.disabled = atMax; btn1.style.opacity = atMax ? '0.2' : '1';   btn1.style.cursor = atMax ? 'default' : 'pointer';
  btn2.disabled = atMax; btn2.style.opacity = atMax ? '0.1' : '0.5'; btn2.style.cursor = atMax ? 'default' : 'pointer';
}

// ── Calendar navigation ───────────────────────────────────────────────────────

function navigate(dir) {
  const steps = dir === 2 ? 2 : (dir === -1 ? -1 : 1);
  if (steps > 0) {
    const now = new Date();
    const nextRight = { year: rightMonth.year, month: rightMonth.month + steps };
    while (nextRight.month > 11) { nextRight.month -= 12; nextRight.year++; }
    if (nextRight.year > now.getFullYear() ||
        (nextRight.year === now.getFullYear() && nextRight.month > now.getMonth())) return;
  }
  [leftMonth, rightMonth].forEach(m => {
    m.month += steps;
    while (m.month > 11) { m.month -= 12; m.year++; }
    while (m.month < 0)  { m.month += 12; m.year--; }
  });
  renderCalendars();
}

// ── Calendar day click ────────────────────────────────────────────────────────

function handleDayClick(year, month, day) {
  const d = new Date(year, month, day);

  // Main range picking
  if (!picking) {
    rangeStart = d; rangeEnd = null; picking = true;
    clearChips();
  } else {
    if (d < rangeStart) { rangeEnd = rangeStart; rangeStart = d; }
    else                { rangeEnd = d; }
    picking = false;
    currentPreset = 'custom';
    selectChipByPreset('custom');
  }
  renderCalendars();
}

// ── Preset chips ──────────────────────────────────────────────────────────────

function clearChips() {
  document.querySelectorAll('#chips-primary .chip').forEach(c => c.classList.remove('selected'));
}

function selectChipByPreset(preset) {
  clearChips();
  const chip = document.querySelector(`[data-preset="${preset}"]`);
  if (chip) chip.classList.add('selected');
}

function selectPreset(el) {
  const preset = el.dataset.preset;
  currentPreset = preset;
  clearChips();
  el.classList.add('selected');

  const today = new Date(); today.setHours(0,0,0,0);
  const dow   = mondayDow(today);

  switch (preset) {
    case 'today':
      rangeStart = new Date(today); rangeEnd = new Date(today); break;
    case 'yesterday': {
      const y = new Date(today); y.setDate(y.getDate() - 1);
      rangeStart = y; rangeEnd = new Date(y); break;
    }
    case 'this_week':
      rangeStart = new Date(today); rangeStart.setDate(today.getDate() - dow);
      rangeEnd   = new Date(today); break;
    case 'last_week':
      rangeStart = new Date(today); rangeStart.setDate(today.getDate() - dow - 7);
      rangeEnd   = new Date(today); rangeEnd.setDate(today.getDate() - dow - 1); break;
    case 'last7':
      rangeEnd   = new Date(today);
      rangeStart = new Date(today); rangeStart.setDate(today.getDate() - 6); break;
    case 'this_month':
      rangeStart = new Date(today.getFullYear(), today.getMonth(), 1);
      rangeEnd   = new Date(today); break;
    case 'last_month':
      rangeStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      rangeEnd   = new Date(today.getFullYear(), today.getMonth(), 0); break;
    case 'last30':
      rangeEnd   = new Date(today);
      rangeStart = new Date(today); rangeStart.setDate(today.getDate() - 29); break;
    case 'this_quarter': {
      const q = Math.floor(today.getMonth() / 3);
      rangeStart = new Date(today.getFullYear(), q * 3, 1);
      rangeEnd   = new Date(today); break;
    }
    case 'last_quarter': {
      const q  = Math.floor(today.getMonth() / 3);
      const lq = q === 0 ? 3 : q - 1;
      const ly = q === 0 ? today.getFullYear() - 1 : today.getFullYear();
      rangeStart = new Date(ly, lq * 3, 1);
      rangeEnd   = new Date(ly, lq * 3 + 3, 0); break;
    }
    case 'last4q':
      rangeEnd   = new Date(today);
      rangeStart = new Date(today); rangeStart.setMonth(today.getMonth() - 12); break;
    case 'this_year':
      rangeStart = new Date(today.getFullYear(), 0, 1);
      rangeEnd   = new Date(today); break;
    case 'last_year':
      rangeStart = new Date(today.getFullYear() - 1, 0, 1);
      rangeEnd   = new Date(today.getFullYear() - 1, 11, 31); break;
    case 'custom':
      rangeStart = null; rangeEnd = null; picking = false;
      renderCalendars();
      return; // handled via calendar clicks
    default: return;
  }

  picking = false;
  if (rangeStart) setDisplayMonths(rangeStart, rangeEnd);
  renderCalendars();
}

// ── Filter-bar button label ───────────────────────────────────────────────────

function updateFilterBtn() {
  if (!rangeStart) return;
  const btn   = document.getElementById('date-btn');
  const fmt = d => fmtDMslashM(d);
  const label = PRESET_LABELS[currentPreset]
    || (rangeEnd && !sameDay(rangeStart, rangeEnd) ? `${fmt(rangeStart)} – ${fmt(rangeEnd)}` : fmt(rangeStart));
  // Live: "‹ Last 7 days ›" — chevrons step the period back and forward.
  btn.innerHTML = icn('chevLeft', 18, '#616161') + `<span class="chip-label">${label}</span>` + icn('chevRight', 18, '#616161');
}

// ── Date picker: open / close / apply ────────────────────────────────────────

function toggleDatePicker() {
  const dp     = document.getElementById('date-picker');
  const isOpen = dp.style.display !== 'none' && dp.style.display !== '';
  if (isOpen) {
    closeDatePicker();
  } else {
    // Snapshot current state so Close can revert
    _pickerSnapshot = {
      rangeStart:   rangeStart ? new Date(rangeStart) : null,
      rangeEnd:     rangeEnd   ? new Date(rangeEnd)   : null,
      currentPreset,
      leftMonth:    { ...leftMonth },
      rightMonth:   { ...rightMonth },
    };
    dp.style.display = 'flex';
  }
}

function closeDatePicker() {
  if (_pickerSnapshot) {
    const s = _pickerSnapshot;
    rangeStart    = s.rangeStart;
    rangeEnd      = s.rangeEnd;
    currentPreset = s.currentPreset;
    leftMonth     = s.leftMonth;
    rightMonth    = s.rightMonth;
    picking       = false;
    selectChipByPreset(currentPreset);
    renderCalendars();
  }
  document.getElementById('date-picker').style.display = 'none';
}

function applyDatePicker() {
  _pickerSnapshot = null; // commit — nothing to revert
  updateFilterBtn();

  if (currentReport === 'oee') drawOeeChart();
  else if (currentReport === 'quantities') drawQtyChart();
  else redrawChart(currentXAxis);
  document.getElementById('date-picker').style.display = 'none';
}

// ══════════════════════════════════════════════════════════════════════════════
//  DOWNTIME (spec docs/downtime-spec.md)
//  One record per stop (data.js periodData). Every view reads the filtered
//  stops of `_dtBase`: rows (dtRows) → table, bars → chart, the test hook.
// ══════════════════════════════════════════════════════════════════════════════

const htmlEsc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ── Downtime state ──
let dtYAxis       = 'Duration';      // Y-axis metric (DT_METRICS key)
let dtTimeFormat  = 'Readable';      // "Time format" chip
let dtSort        = null;            // { key, dir } from a header click; null = default
const dtHiddenCols = new Set();      // column keys unticked in the Columns picker
let _dtBase  = null;                 // the filtered stops and segments of the last draw
let _dtBars  = [];                   // the drawn bars (chartData)

// Y-axis metrics. seg(g, bar): a stop-group segment's height; row(r): one value
// per X value (the 2nd Y-axis line). Average duration is not additive, so its
// segments split the bar's average by their share of the duration.
const DT_METRICS = {
  'Duration':          { kind: 'dur', col: 'durSec',  seg: g => g.durSec,  row: r => r.durSec },
  'Count':             { kind: 'int', col: 'count',   seg: g => g.count,   row: r => r.count },
  'Notes count':       { kind: 'int', col: 'notes',   seg: g => g.notes,   row: r => r.notes },
  'Average duration':  { kind: 'dur', col: 'avgSec',
                         seg: (g, b) => (b.count && b.durSec ? (b.durSec / b.count) * (g.durSec / b.durSec) : 0), row: r => r.avgSec },
  '% of planned time': { kind: 'pct', col: 'pct',
                         seg: (g, b) => (b.plannedSec ? g.durOeeSec / b.plannedSec * 100 : 0), row: r => r.pct || 0 },
};
const Y_OPTIONS  = Object.keys(DT_METRICS);
const Y2_OPTIONS = ['Duration', 'Count', 'Notes count', 'Average duration'];   // then "-"

// Stop groups in the product's order; the legend and the stacking follow it.
function groupOrder() { return ['Uncommented', ...TagsStore.getStopGroups().map(g => g.name)]; }

// Axes on which one stop can sit in several bars: no Total row.
const OVERLAP_AXES = new Set(['Operators', 'Operator groups', 'Tags']);
function dtTotalHidden() { return OVERLAP_AXES.has(currentXAxis) || OVERLAP_AXES.has(downtimeSplitBy); }
// Split by equal to the X-axis draws as if there were no split.
function dtEffSplit() {
  const s = downtimeSplitBy;
  return s && s !== currentXAxis && DT_AXES[s] ? s : null;
}
function axisSingular(label) {
  if (TIME_AXES.has(label)) return label;
  return DT_AXES[label]?.singular || label;
}

// ── Table columns (spec §7) ──
const DT_TAGS_COL = { key: 'tags', label: 'Tags', width: 220,
  vals: s => stopTagIds(s).map(id => TagsStore.tagById(id)?.name).filter(Boolean) };
function showTagsInRows() { return tagsFeatureOn() && currentXAxis !== 'Tags'; }

// Prototype option "tag pills" (window.__protoTagPills): the Tags column shows
// each tag as a pill instead of comma-joined text.
function tagPillsOn() { return window.__protoTagPills !== 'off'; }
function tagPillsHtml(txt) {
  const on = activeFilters.includes('tags') && !tagsFilter.inverted ? new Set(tagsFilter.tagIds) : new Set();
  return txt.split(', ').map(name => {
    const tag = TagsStore.getTags().find(t => t.name === name);
    if (!tag) return htmlEsc(name);
    return `<span class="dt-tag-pill${on.has(tag.id) ? ' is-on' : ''}" data-tag-id="${tag.id}">${htmlEsc(name)}</span>`;
  }).join('');
}
// A pill click: no Tags filter yet, or an inverted one, starts "Tags: <tag>";
// otherwise the tag joins the selection, or leaves it when it is already in.
// Adding a tag also switches the X-axis to Tags, so the picked tags become the bars.
function toggleTagFromTable(id) {
  const adding = !activeFilters.includes('tags') || tagsFilter.inverted || !tagsFilter.tagIds.includes(id);
  if (!activeFilters.includes('tags') || tagsFilter.inverted) {
    tagsFilter = { tagIds: [id], noTag: false, inverted: false };
  } else if (!adding) {
    tagsFilter = { ...tagsFilter, tagIds: tagsFilter.tagIds.filter(t => t !== id) };
  } else {
    tagsFilter = { ...tagsFilter, tagIds: [...tagsFilter.tagIds, id] };
  }
  if (!activeFilters.includes('tags')) activeFilters.push('tags');
  closeFilterMenus(); renderActiveChips(); applyFilters();
  if (adding && currentXAxis !== 'Tags') selectXAxis('Tags');
}

function plannedLabel() {
  if (!TIME_AXES.has(currentXAxis) && (DT_AXES[currentXAxis]?.planned === 'total' || !DT_AXES[currentXAxis])) return 'Planned time (Total)';
  return `Planned time (${axisSingular(currentXAxis)})`;
}
// Every column the current X-axis offers, in order (before the Columns picker).
function dtColumnsAll() {
  const text = DT_TEXT_COLS.slice();
  if (tagsFeatureOn() && window.__protoTagColumns !== 'off') text.splice(text.findIndex(c => c.key === 'leader') + 1, 0, DT_TAGS_COL);
  const cols = [
    ...text.map(c => ({ ...c, kind: 'text', align: 'left' })),
    ...DT_NUM_COLS.map(c => ({ ...c, kind: c.type, align: 'right', label: c.planned ? plannedLabel() : c.label })),
  ].filter(c => c.label !== currentXAxis);
  return [{ key: 'x', label: currentXAxis, kind: 'first', align: 'left' }, ...cols];
}
function dtColumns() { return dtColumnsAll().filter(c => c.kind === 'first' || !dtHiddenCols.has(c.key)); }
function dtColVisible(key) { return dtColumns().some(c => c.key === key); }

// Text cell: distinct values, A–Z, up to 50, then "+ N more".
function dtTextCell(stops, col) {
  const vals = new Set();
  stops.forEach(s => col.vals(s).forEach(v => { if (v) vals.add(v); }));
  if (!vals.size) return col.empty || '-';
  const sorted = [...vals].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
  return sorted.length > 50 ? `${sorted.slice(0, 50).join(', ')} + ${sorted.length - 50} more` : sorted.join(', ');
}
function dtNumText(v, kind) {
  if (kind === 'int') return fmtInt(v);
  if (kind === 'dur') return fmtDur(v, dtTimeFormat);
  if (kind === 'pct') return fmtPct(v);
  return String(v);
}
// A row's cell text (memoised per row and column).
function dtCellText(r, col) {
  if (col.kind === 'first') return r.name;
  if (col.kind === 'text') {
    r._txt = r._txt || {};
    if (!(col.key in r._txt)) r._txt[col.key] = dtTextCell(r.stops, col);
    return r._txt[col.key];
  }
  return dtNumText(r[col.key], col.kind);
}
function dtTotalCellText(t, col) {
  if (col.kind === 'first') return 'Total';
  return col.total ? dtNumText(t[col.key], col.kind) : '';
}

// ── Sorting: a header click sorts descending, a second ascending; the chart follows ──
function dtSortState() {
  return dtSort || (TIME_AXES.has(currentXAxis) ? { key: 'x', dir: 'asc' } : { key: 'durSec', dir: 'desc' });
}
function dtSortRows(rows) {
  const st = dtSortState();
  const col = dtColumnsAll().find(c => c.key === st.key) || { key: 'x', kind: 'first' };
  const sign = st.dir === 'asc' ? 1 : -1;
  const val = (r) => col.kind === 'first' ? r.order : col.kind === 'text' ? dtCellText(r, col) : (r[col.key] ?? -1);
  rows.sort((a, b) => {
    const va = val(a), vb = val(b);
    const c = typeof va === 'string' ? va.localeCompare(vb, 'en', { sensitivity: 'base', numeric: true }) : va - vb;
    return c ? sign * c : a.order - b.order;
  });
  return rows;
}
function dtHeaderClick(key) {
  const st = dtSortState();
  dtSort = st.key === key ? { key, dir: st.dir === 'desc' ? 'asc' : 'desc' } : { key, dir: 'desc' };
  _dtPage = 0;
  drawDowntime();
}

// ── Table rendering ──
function renderTable() {
  if (!_dtBase) return;
  const cols = dtColumns();
  const all = dtColumnsAll();
  const cc = document.getElementById('dt-col-count');
  if (cc) cc.textContent = 'Columns: ' + (cols.length === all.length ? 'All' : cols.length);
  const tf = document.getElementById('dt-time-label');
  if (tf) tf.textContent = 'Time format: ' + dtTimeFormat;

  const rows = _dtData;
  const pages = Math.max(1, Math.ceil(rows.length / DT_PER_PAGE));
  if (_dtPage >= pages) _dtPage = pages - 1;
  const start = _dtPage * DT_PER_PAGE;
  const end = Math.min(start + DT_PER_PAGE, rows.length);
  const page = rows.slice(start, end);
  const st = dtSortState();
  const yCol = DT_METRICS[dtYAxis].col, y2Col = currentY2 ? DT_METRICS[currentY2].col : null;
  const arrow = (key) => st.key !== key ? ''
    : `<svg class="dt-sort" width="14" height="14" viewBox="0 0 24 24" fill="#424242"><path d="${st.dir === 'desc' ? 'M11 4H13V16L18.5 10.5L19.92 11.92L12 19.84L4.08 11.92L5.5 10.5L11 16V4Z' : 'M13 20H11V8L5.5 13.5L4.08 12.08L12 4.16L19.92 12.08L18.5 13.5L13 8V20Z'}"/></svg>`;

  // Header: the X-axis column pinned and bold, then the rest. The Y-axis icon
  // marks the column the bars show, the 2nd Y-axis icon the line's.
  let head = '<tr style="height:32px;">';
  cols.forEach(col => {
    const icon = col.kind === 'first' ? icn('xAxis', 16, '#424242')
      : col.key === yCol ? icn('yAxis', 16, '#424242') : col.key === y2Col ? icn('y2Axis', 16, '#424242') : '';
    const inner = `<div class="dt-th-inner${col.align === 'right' ? ' right' : ''}">${icon}<span>${htmlEsc(col.label)}</span>${arrow(col.key)}</div>`;
    if (col.kind === 'first') {
      head += `<th class="dt-fixed dt-th" data-col="x" style="width:${_dtFixedWidth}px;min-width:${_dtFixedWidth}px;text-align:left;padding:0 12px;font-family:'Open Sans',sans-serif;font-size:13px;font-weight:600;color:#424242;position:sticky;left:0;overflow:visible;">${inner}<div class="dt-col-resize"></div></th>`;
    } else {
      const w = col.kind === 'text' ? `width:${col.width}px;min-width:${col.width}px;` : 'white-space:nowrap;';
      head += `<th class="dt-th" data-col="${col.key}" style="${w}text-align:${col.align};font-family:'Open Sans',sans-serif;font-size:12px;font-weight:600;color:#424242;">${inner}</th>`;
    }
  });
  document.getElementById('dt-head').innerHTML = head + '</tr>';
  document.querySelectorAll('#dt-head .dt-th').forEach(th => th.addEventListener('click', (e) => {
    if (e.target.classList.contains('dt-col-resize')) return;
    dtHeaderClick(th.dataset.col);
  }));

  const td = (txt, col, isTotal, raw) => {
    const ff = col.align === 'right' ? "'Roboto Mono',monospace" : "'Open Sans',sans-serif";
    const w = col.kind === 'text' ? `width:${col.width}px;min-width:${col.width}px;max-width:${col.width + 120}px;` : 'white-space:nowrap;';
    const pills = col.key === 'tags' && !isTotal && txt !== '-' && tagPillsOn();
    let html = txt === '-' ? '<span style="color:#9e9e9e;">-</span>' : pills ? tagPillsHtml(txt) : htmlEsc(txt);
    if (col.hasNote && !isTotal && raw > 0) html += `&nbsp;${ICON_OPEN}`;
    return `<td style="font-family:${ff};font-size:14px;${isTotal ? 'font-weight:600;' : ''}color:#212121;text-align:${col.align};vertical-align:middle;${w}padding:4px 16px 4px 8px;">`
      + (pills
        // Pills wrap onto more lines so every tag stays clickable.
        ? `<div class="dt-tag-pills">${html}</div></td>`
        : `<div data-txt-row="1" style="line-height:20px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${html}</div></td>`);
  };
  // On the Tags axis with pills on, each row's tag is a pill too (green: in the filter).
  const firstHtml = (txt) => currentXAxis === 'Tags' && tagPillsOn() && txt !== 'Total' && txt !== TAG_NONE_LABEL
    ? tagPillsHtml(txt) : htmlEsc(txt);
  const firstTd = (txt, cls) =>
    `<td class="dt-fixed ${cls || ''}" style="font-family:'Open Sans',sans-serif;font-size:14px;font-weight:600;color:#212121;vertical-align:middle;padding:4px 16px;"><div data-txt-row="main" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${firstHtml(txt)}</div></td>`;

  let body = '';
  page.forEach((r, i) => {
    body += `<tr class="${(start + i) % 2 === 0 ? 'dt-row-even' : 'dt-row-odd'}" style="height:48px;">`;
    cols.forEach(col => { body += col.kind === 'first' ? firstTd(r.name) : td(dtCellText(r, col), col, false, r[col.key]); });
    body += '</tr>';
  });
  if (!dtTotalHidden() && rows.length) {
    const t = dtTotalRow(_dtBase);
    body += '<tr class="dt-row-total" style="height:40px;">';
    cols.forEach(col => { body += col.kind === 'first' ? firstTd('Total') : td(dtTotalCellText(t, col), col, true); });
    body += '</tr>';
  }
  document.getElementById('dt-body').innerHTML = body;

  // Pager, as live: "1-18 / 18".
  document.getElementById('dt-page-info').textContent = `${rows.length ? start + 1 : 0}-${end} / ${rows.length}`;
  document.getElementById('dt-prev').disabled = _dtPage === 0;
  document.getElementById('dt-next').disabled = end >= rows.length;
}
function dtPrev() { if (_dtPage > 0) { _dtPage--; drawDowntime(); } }
function dtNext() { if ((_dtPage + 1) * DT_PER_PAGE < _dtData.length) { _dtPage++; drawDowntime(); } }

function initTableEvents() {
  const scrollEl = document.getElementById('dt-scroll');
  const tipEl    = document.getElementById('chart-tooltip');
  // Truncated cells show their full text on hover.
  scrollEl.addEventListener('mousemove', function(e) {
    const txtDiv = e.target.closest('[data-txt-row]');
    if (txtDiv && txtDiv.scrollWidth > txtDiv.offsetWidth) {
      tipEl.innerHTML = `<span style="font-family:'Open Sans',sans-serif;font-size:14px;font-weight:600;color:white;white-space:normal;display:block;max-width:420px;">${htmlEsc(txtDiv.textContent.trim())}</span>`;
      tipEl.style.display = 'block';
      let x = e.clientX + 14, y = e.clientY - 10;
      if (x + tipEl.offsetWidth  > window.innerWidth  - 8) x = e.clientX - tipEl.offsetWidth  - 14;
      if (y + tipEl.offsetHeight > window.innerHeight - 8) y = e.clientY - tipEl.offsetHeight + 10;
      tipEl.style.left = x + 'px'; tipEl.style.top = y + 'px';
      return;
    }
    tipEl.style.display = 'none';
  });
  scrollEl.addEventListener('mouseleave', () => tipEl.style.display = 'none');
  // A tag pill adds its tag to the Tags filter (or takes it out again).
  scrollEl.addEventListener('click', function(e) {
    const pill = e.target.closest('.dt-tag-pill');
    if (pill) { tipEl.style.display = 'none'; toggleTagFromTable(+pill.dataset.tagId); }
  });

  // First column resize.
  let _resizing = false, _resizeStartX = 0, _resizeStartW = 0;
  document.addEventListener('mousedown', function(e) {
    if (!e.target.classList.contains('dt-col-resize')) return;
    _resizing = true; _resizeStartX = e.clientX; _resizeStartW = _dtFixedWidth;
    e.target.classList.add('active');
    document.body.style.cursor = 'col-resize'; document.body.style.userSelect = 'none';
    e.preventDefault(); e.stopPropagation();
  });
  document.addEventListener('mousemove', function(e) {
    if (!_resizing) return;
    _dtFixedWidth = Math.max(120, _resizeStartW + (e.clientX - _resizeStartX));
    document.querySelectorAll('#dt-table .dt-fixed').forEach(el => { el.style.width = _dtFixedWidth + 'px'; el.style.minWidth = _dtFixedWidth + 'px'; });
  });
  document.addEventListener('mouseup', function() {
    if (!_resizing) return;
    _resizing = false;
    document.querySelectorAll('.dt-col-resize').forEach(el => el.classList.remove('active'));
    document.body.style.cursor = ''; document.body.style.userSelect = '';
  });
}

// ── Table chips: Columns picker and Time format ──
// A small menu under a chip. items: [{ label, on, disabled, onClick }].
function openChipMenu(menuId, anchorId, items, multi) {
  const menu = document.getElementById(menuId);
  const wasOpen = menu.classList.contains('open');
  closeAllDropdowns();
  if (wasOpen) return;
  const check = '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4Z"/></svg>';
  menu.innerHTML = items.map((it, i) => multi
    ? `<div class="sl-row${it.on ? ' is-checked' : ''}${it.disabled ? ' is-disabled' : ''}" data-i="${i}"><span class="sl-check">${it.on ? check : ''}</span><span>${htmlEsc(it.label)}</span></div>`
    : `<div class="xaxis-opt${it.on ? ' selected' : ''}" data-i="${i}">${htmlEsc(it.label)}</div>`).join('');
  menu.querySelectorAll('[data-i]').forEach(el => el.addEventListener('click', (e) => {
    e.stopPropagation();
    const it = items[+el.dataset.i];
    if (it.disabled) return;
    it.onClick();
  }));
  menu.onclick = e => e.stopPropagation();
  menu.classList.add('open');
}
function toggleColumnsMenu(event) {
  event.stopPropagation();
  const build = () => dtColumnsAll().map(c => ({
    label: c.label, on: c.kind === 'first' || !dtHiddenCols.has(c.key), disabled: c.kind === 'first',
    onClick: () => {
      if (dtHiddenCols.has(c.key)) dtHiddenCols.delete(c.key); else dtHiddenCols.add(c.key);
      drawDowntime();
      const menu = document.getElementById('dt-cols-menu'), keep = menu.scrollTop;
      menu.classList.remove('open');
      openChipMenu('dt-cols-menu', 'dt-cols-btn', build(), true);   // stays open while ticking
      menu.scrollTop = keep;
    },
  }));
  openChipMenu('dt-cols-menu', 'dt-cols-btn', build(), true);
}
function toggleTimeMenu(event) {
  event.stopPropagation();
  openChipMenu('dt-time-menu', 'dt-time-btn', TIME_FORMATS.map(f => ({
    label: f, on: f === dtTimeFormat,
    onClick: () => { dtTimeFormat = f; closeAllDropdowns(); drawDowntime(); },
  })));
}

// ── Chart ──
function initChart() { redrawChart(currentXAxis); }

// Bars of the drawn rows: one per row, or one per row × split value. Each bar
// carries its stops and is stacked by stop group.
function dtGroupSegs(stops) {
  const by = new Map();
  stops.forEach(s => (by.get(s.group) || by.set(s.group, []).get(s.group)).push(s));
  const order = groupOrder();
  return [...by.keys()].sort((a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99))
    .map(g => ({ group: g, stops: by.get(g), ...dtSums(by.get(g)) }));
}
function dtBars(rows, split) {
  if (!split) return rows.map(r => ({ x: r.name, split: null, row: r, stops: r.stops, ...dtSums(r.stops), plannedSec: r.plannedSec, groups: dtGroupSegs(r.stops) }));
  const dim = DT_AXES[split];
  const bars = [];
  rows.forEach(r => {
    const by = new Map();
    r.stops.forEach(s => dim.keys(s).forEach(v => (by.get(v) || by.set(v, []).get(v)).push(s)));
    sortValues([...by.keys()]).forEach(v => {
      const st = by.get(v);
      bars.push({ x: r.name, split: v, row: r, stops: st, ...dtSums(st), plannedSec: r.plannedSec, groups: dtGroupSegs(st) });
    });
  });
  return bars;
}

// Nice ticks for a metric; durations step in hours, minutes or seconds.
function fmtDurShort(sec) {
  const s = Math.round(sec), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  const p = (x) => String(x).padStart(2, '0');
  if (h) return `${fmtInt(h)}h` + (m ? ` ${p(m)}m` : '');
  if (m) return `${m}m` + (ss ? ` ${p(ss)}s` : '');
  return ss ? `${ss}s` : '0';
}
function dtTicks(kind, max) {
  if (kind === 'dur') {
    const unit = max > 3 * 3600 ? 3600 : max > 180 ? 60 : 1;
    return { ticks: d3.ticks(0, max / unit, 6).map(t => t * unit), fmt: fmtDurShort };
  }
  return { ticks: d3.ticks(0, max, 6), fmt: kind === 'pct' ? (v => fmtDec(v, v % 1 ? 1 : 0) + '%') : fmtInt };
}

function drawDowntimeEmpty() {
  document.getElementById('chart-legend').innerHTML = '';
  d3.select('#chart-container').selectAll('svg').remove();
  const box = document.createElement('div');
  box.className = 'chart-empty';
  box.innerHTML = `<div class="chart-empty-title">No data</div>`
    + (tagsFilterActive() ? `<div class="chart-empty-hint">Check the Tags filter.</div>` : '');
  document.getElementById('chart-container').appendChild(box);
}

function drawDtChart(rows) {
  const container = document.getElementById('chart-container');
  container.querySelector('.chart-empty')?.remove();
  d3.select('#chart-container').selectAll('svg').remove();
  _dtBars = [];
  if (!rows.some(r => r.count > 0)) { drawDowntimeEmpty(); return; }

  const split = dtEffSplit();
  const metric = DT_METRICS[dtYAxis];
  const bars = dtBars(rows, split);
  bars.forEach(b => { b.groups.forEach(g => { g.val = metric.seg(g, b); }); b.val = b.groups.reduce((t, g) => t + g.val, 0); });
  _dtBars = bars;

  // Legend: the stop groups (also when split).
  const order = groupOrder();
  const present = new Set(bars.flatMap(b => b.groups.map(g => g.group)));
  const groups = order.filter(g => present.has(g)).concat([...present].filter(g => !order.includes(g)));
  const color = (g) => STOP_GROUP_COLORS[g] || CHART_PALETTE[groups.indexOf(g) % CHART_PALETTE.length];
  document.getElementById('chart-legend').innerHTML = groups.map(g =>
    `<div style="display:flex;align-items:center;gap:6px;"><span style="display:inline-block;width:14px;height:14px;border-radius:2px;background:${color(g)};flex-shrink:0;"></span><span style="font-family:'Open Sans',sans-serif;font-size:12px;color:#212121;">${htmlEsc(g)}</span></div>`).join('');

  const W = container.clientWidth, H = container.clientHeight;
  const margin = { top: split ? 16 : 44, right: currentY2 ? 76 : 24, bottom: split ? 200 : 124, left: 84 };
  const width = Math.max(10, W - margin.left - margin.right);
  const height = Math.max(10, H - margin.top - margin.bottom);
  const svg = d3.select('#chart-container').append('svg').attr('width', W).attr('height', H);
  const chart = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  // Bar slots: every bar the same width; split clusters apart by a gap.
  const GAP = split ? 0.8 : 0;
  const slots = []; let pos = 0, prevX = null;
  bars.forEach(b => {
    if (split && prevX !== null && b.x !== prevX) pos += GAP;
    slots.push({ b, pos }); pos += 1; prevX = b.x;
  });
  const unit = width / Math.max(1, pos);
  const bw = Math.min(unit * (split ? 0.8 : 0.7), 120);
  const slotX = (sl) => sl.pos * unit + (unit - bw) / 2;

  // Y scale.
  const max = d3.max(bars, b => b.val) || 1;
  const yt = dtTicks(metric.kind, max * 1.05);
  const top = Math.max(max * 1.05, yt.ticks[yt.ticks.length - 1] || 1);
  const y = d3.scaleLinear().domain([0, top]).range([height, 0]);
  chart.append('g').call(d3.axisLeft(y).tickValues(yt.ticks).tickSize(-width).tickFormat(''))
    .call(ax => ax.select('.domain').remove())
    .call(ax => ax.selectAll('line').style('stroke', '#eeeeee'));

  // Hover background per X value (a cluster when split).
  const clusters = [];
  slots.forEach(sl => {
    const last = clusters[clusters.length - 1];
    if (last && last.x === sl.b.x) last.slots.push(sl); else clusters.push({ x: sl.b.x, row: sl.b.row, slots: [sl] });
  });
  const tooltipEl = document.getElementById('chart-tooltip');
  clusters.forEach(c => {
    const x0 = c.slots[0].pos * unit, x1 = (c.slots[c.slots.length - 1].pos + 1) * unit;
    c.cx = (x0 + x1) / 2;
    c.bg = chart.append('rect').attr('class', 'col-bg').attr('x', x0 - (split ? unit * GAP / 2 : 0)).attr('y', 0)
      .attr('width', x1 - x0 + (split ? unit * GAP : 0)).attr('height', height).attr('fill', 'transparent')
      .on('mousemove', (event) => { c.bg.attr('fill', 'rgba(46,204,113,0.08)'); dtTooltip(event, c.row, null, null); })
      .on('mouseleave', () => { c.bg.attr('fill', 'transparent'); tooltipEl.style.display = 'none'; });
  });

  // Bars, stacked by stop group bottom-up.
  slots.forEach(sl => {
    const b = sl.b, bx = slotX(sl);
    let acc = 0;
    b.groups.forEach((g, gi) => {
      const y0 = y(acc), y1 = y(acc + g.val);
      chart.append('rect').attr('class', 'seg-main')
        .attr('x', bx).attr('width', bw).attr('y', y1).attr('height', Math.max(0, y0 - y1))
        .attr('fill', color(g.group)).attr('rx', gi === b.groups.length - 1 ? 2 : 0)
        .on('mousemove', (event) => {
          const c = clusters.find(k => k.x === b.x); c?.bg.attr('fill', 'rgba(46,204,113,0.08)');
          dtTooltip(event, b.row, b, g);
        })
        .on('mouseleave', () => { clusters.forEach(k => k.bg.attr('fill', 'transparent')); tooltipEl.style.display = 'none'; });
      acc += g.val;
    });
  });

  // Baseline.
  chart.append('line').attr('x1', 0).attr('x2', width).attr('y1', height).attr('y2', height).style('stroke', '#e0e0e0');
  const label = (sel) => sel.style('font-family', "'Open Sans',sans-serif").style('font-size', '11px').style('fill', '#616161');

  if (!split) {
    // Count labels: diagonal, on top of each bar.
    slots.forEach(sl => {
      const cx = slotX(sl) + bw / 2;
      label(chart.append('text').attr('transform', `translate(${cx - 2},${y(sl.b.val) - 6}) rotate(-45)`)
        .attr('class', 'count-label').style('pointer-events', 'none')).text(fmtInt(sl.b.count));
    });
    // X labels under the bars.
    slots.forEach(sl => {
      const cx = slotX(sl) + bw / 2;
      label(chart.append('text').attr('transform', `translate(${cx + 4},${height + 12}) rotate(-38)`).attr('text-anchor', 'end'))
        .text(sl.b.x);
    });
  } else {
    // Split: the split value under each bar, then the X value under its cluster.
    // Narrow bars get a smaller label; too narrow to read, none.
    const fs = Math.min(11, Math.floor(unit * 0.9));
    if (fs >= 7) slots.forEach(sl => {
      const cx = slotX(sl) + bw / 2;
      label(chart.append('text').attr('transform', `translate(${cx - 4},${height + 12}) rotate(45)`)).style('font-size', fs + 'px').text(sl.b.split);
    });
    clusters.forEach(c => {
      chart.append('line').attr('x1', c.cx).attr('x2', c.cx).attr('y1', height + 96).attr('y2', height + 102).style('stroke', '#9e9e9e');
      label(chart.append('text').attr('transform', `translate(${c.cx - 4},${height + 112}) rotate(45)`))
        .style('font-weight', '600').style('fill', '#424242').text(c.x);
    });
  }

  // Y axis + title.
  const yAxisG = chart.append('g').call(d3.axisLeft(y).tickValues(yt.ticks).tickFormat(yt.fmt).tickSize(0));
  yAxisG.select('.domain').remove();
  label(yAxisG.selectAll('text'));
  svg.append('text').attr('transform', 'rotate(-90)').attr('x', -(margin.top + height / 2)).attr('y', 14)
    .attr('text-anchor', 'middle').style('font-family', "'Open Sans',sans-serif").style('font-size', '11px').style('fill', '#9e9e9e')
    .text(dtYAxis);

  // 2nd Y-axis: a black line on a right-hand scale, one point per X value.
  if (currentY2 && DT_METRICS[currentY2]) {
    const m2 = DT_METRICS[currentY2];
    const pts = clusters.map(c => ({ x: c.cx, v: m2.row(c.row) }));
    const max2 = d3.max(pts, p => p.v) || 1;
    const t2 = dtTicks(m2.kind, max2 * 1.1);
    const y2 = d3.scaleLinear().domain([0, Math.max(max2 * 1.1, t2.ticks[t2.ticks.length - 1] || 1)]).range([height, 0]);
    const ax2 = chart.append('g').attr('transform', `translate(${width},0)`).call(d3.axisRight(y2).tickValues(t2.ticks).tickFormat(t2.fmt).tickSize(0));
    ax2.select('.domain').remove();
    label(ax2.selectAll('text'));
    svg.append('text').attr('transform', 'rotate(-90)').attr('x', -(margin.top + height / 2)).attr('y', W - 8)
      .attr('text-anchor', 'middle').style('font-family', "'Open Sans',sans-serif").style('font-size', '11px').style('fill', '#9e9e9e')
      .text(currentY2);
    chart.append('path').datum(pts).attr('class', 'line-main').attr('fill', 'none').attr('stroke', '#111').attr('stroke-width', 2)
      .style('pointer-events', 'none')
      .attr('d', d3.line().x(p => p.x).y(p => y2(p.v)));
    chart.selectAll('.y2-dot').data(pts).join('circle').attr('class', 'y2-dot').attr('r', 3)
      .attr('cx', p => p.x).attr('cy', p => y2(p.v)).attr('fill', '#111').style('pointer-events', 'none');
  }
}

// ── Chart tooltip (spec §8) ──
// Headings [stop group, split value, X value]; then the hovered part's values,
// only those whose column is visible; then one Tags row.
function dtTooltip(event, row, bar, seg) {
  const tip = document.getElementById('chart-tooltip');
  const ol = (t) => `<span style="font-family:'Open Sans',sans-serif;font-size:10px;font-weight:600;color:white;letter-spacing:0.8px;text-transform:uppercase;line-height:16px;white-space:nowrap;">${htmlEsc(t)}</span>`;
  const heading = (label, value, dot) =>
    `<div style="display:flex;align-items:center;gap:6px;">${dot ? `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${dot};flex-shrink:0;"></span>` : ''}${ol(label)}</div>`
    + `<div style="font-family:'Open Sans',sans-serif;font-size:16px;font-weight:600;color:white;line-height:24px;margin-bottom:4px;white-space:nowrap;">${htmlEsc(value)}</div>`;
  const line = (label, value) =>
    `<div style="display:flex;align-items:baseline;line-height:16px;"><span style="font-family:'Open Sans',sans-serif;font-size:10px;font-weight:600;color:#cccccc;letter-spacing:0.8px;text-transform:uppercase;white-space:nowrap;">${htmlEsc(label)}:&nbsp;</span><span style="font-family:'Open Sans',sans-serif;font-size:12px;color:white;max-width:320px;">${htmlEsc(value)}</span></div>`;

  const src = seg || bar || row;           // the hovered part
  const planned = (bar || row).plannedSec;
  let html = '';
  if (seg) html += heading('Stop group', seg.group, STOP_GROUP_COLORS[seg.group] || '#bbb');
  if (bar && bar.split != null) html += heading(axisSingular(dtEffSplit()), bar.split);
  html += heading(axisSingular(currentXAxis), row.name);
  const rows = [];
  if (dtColVisible('durSec'))  rows.push(line('Duration', fmtDur(src.durSec, dtTimeFormat)));
  if (dtColVisible('avgSec'))  rows.push(line('Average duration', fmtDur(src.count ? src.durSec / src.count : 0, dtTimeFormat)));
  if (dtColVisible('count'))   rows.push(line('Count', fmtInt(src.count)));
  if (dtColVisible('notes'))   rows.push(line('Notes count', fmtInt(src.notes)));
  if (dtColVisible('pct'))     rows.push(line('% of planned time', fmtPct(planned ? src.durOeeSec / planned * 100 : null)));
  if (showTagsInRows())        rows.push(line('Tags', dtTextCell(src.stops, DT_TAGS_COL)));
  html += `<div style="display:flex;flex-direction:column;gap:2px;">${rows.join('')}</div>`;
  tip.innerHTML = html;
  tip.style.display = 'block';
  const tw = tip.offsetWidth, th = tip.offsetHeight;
  let tx = event.clientX + 14, ty = event.clientY - 10;
  if (tx + tw > window.innerWidth - 8) tx = event.clientX - tw - 14;
  if (ty + th > window.innerHeight - 8) ty = event.clientY - th + 10;
  tip.style.left = tx + 'px'; tip.style.top = Math.max(4, ty) + 'px';
}

// ── One draw: filtered stops → rows (sorted) → table page → chart ──
function drawDowntime() {
  _dtBase = downtimeBase();
  _dtData = dtSortRows(dtRows(currentXAxis, _dtBase));
  renderTable();
  const page = _dtData.slice(_dtPage * DT_PER_PAGE, (_dtPage + 1) * DT_PER_PAGE);
  drawDtChart(page);
}
function redrawChart(xAxis) {
  if (xAxis !== currentXAxis) { dtSort = null; _dtPage = 0; }
  currentXAxis = xAxis;
  _dtColLabel = xAxis;
  setChipLabel('xaxis-btn', 'X-axis: ' + xAxis);
  drawDowntime();
}

// ── Chart controls: X-axis, Split by, Y-axis, 2nd Y-axis ──
function closeAllDropdowns() {
  ['xaxis-dropdown', 'splitby-dropdown', 'yaxis-dropdown', 'y2axis-dropdown', 'dt-cols-menu', 'dt-time-menu',
   'oee-splitby-dropdown', 'oee-xaxis-dropdown', 'oee-charttype-dropdown', 'qty-xaxis-dropdown', 'qty-splitby-dropdown']
    .forEach(id => document.getElementById(id)?.classList.remove('open'));
}
// A dropdown of plain options under a chart chip.
function openOptionMenu(ddId, options, selected, onPick) {
  const dd = document.getElementById(ddId);
  const wasOpen = dd.classList.contains('open');
  closeAllDropdowns();
  if (typeof closeFilterMenus === 'function') closeFilterMenus();
  if (wasOpen) return;
  dd.innerHTML = '';
  options.forEach(opt => {
    const el = document.createElement('div');
    el.className = 'xaxis-opt' + (opt === selected ? ' selected' : '');
    el.dataset.val = opt;
    el.textContent = opt;
    el.addEventListener('click', e => { e.stopPropagation(); dd.classList.remove('open'); onPick(opt); });
    dd.appendChild(el);
  });
  dd.classList.add('open');
}

function xAxisOptions() { return XAXIS_OPTIONS.filter(o => o !== 'Tags' || tagsFeatureOn()); }
function toggleXAxisDropdown(event) {
  event.stopPropagation();
  openOptionMenu('xaxis-dropdown', xAxisOptions(), currentXAxis, selectXAxis);
}
function selectXAxis(option) {
  if (option === currentXAxis) return;
  redrawChart(option);
}
function buildXAxisDropdown() { /* built when opened (toggleXAxisDropdown) */ }

// Split by: the entity options in X-axis order (no time units), then "-".
function dtSplitOptions() { return [...xAxisOptions().filter(o => !TIME_AXES.has(o)), '-']; }
function toggleSplitDropdown(event) {
  event.stopPropagation();
  openOptionMenu('splitby-dropdown', dtSplitOptions(), downtimeSplitBy || '-', v => selectSplit(v === '-' ? null : v));
}
function selectSplit(val) {
  downtimeSplitBy = val || null;
  document.getElementById('splitby-dropdown').classList.remove('open');
  setChipLabel('splitby-btn', 'Split by: ' + (downtimeSplitBy || '-'));
  setChipActive('splitby-btn', downtimeSplitBy);
  drawDowntime();
}

function toggleYDropdown(event) {
  event.stopPropagation();
  openOptionMenu('yaxis-dropdown', Y_OPTIONS, dtYAxis, selectY);
}
function selectY(metric) {
  if (!DT_METRICS[metric]) return;
  dtYAxis = metric;
  setChipLabel('dt-yaxis-btn', 'Y-axis: ' + metric);
  drawDowntime();
}
function toggleY2Dropdown(event) {
  event.stopPropagation();
  openOptionMenu('y2axis-dropdown', [...Y2_OPTIONS, '-'], currentY2 || '-', v => selectY2(v));
}
function selectY2(option) {
  const v = option === '-' || option === '–' || !option ? null : option;
  if (v && !Y2_OPTIONS.includes(v)) return;
  currentY2 = v;
  setChipLabel('y2axis-btn', '2nd Y-axis: ' + (currentY2 || '-'));
  setChipActive('y2axis-btn', currentY2);
  drawDowntime();
}
function buildY2Dropdown() { /* built when opened (toggleY2Dropdown) */ }

// Chart-control chips are built from the text they ship with: that becomes the
// label node, with the control's icon before it and a caret after — so redrawing
// a value never wipes the glyphs. Icons are the real ones (../prototype/icn).
const CHART_CHIPS = {
  'dt-yaxis-btn':    'yAxis',  'y2axis-btn':       'y2Axis',
  'xaxis-btn':       'xAxis',  'splitby-btn':      'xAxis',
  'oee-xaxis-btn':   'xAxis',  'oee-splitby-btn':  'xAxis',
  'qty-yaxis-btn':   'yAxis',  'qty-xaxis-btn':    'xAxis',
  'oee-charttype-btn': 'lineChart',
  'qty-splitby-btn': 'xAxis',
};
function decorateChartChips() {
  Object.entries(CHART_CHIPS).forEach(([id, name]) => {
    const el = document.getElementById(id);
    if (!el || el.querySelector('.chip-label')) return;
    const text = el.textContent.replace(/[▾\s ]+$/, '').trim();
    el.innerHTML = icn(name) + `<span class="chip-label">${text}</span>` + icn('caret');
  });
  ['dt-cog', 'oee-cog', 'qty-cog'].forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.innerHTML.trim()) el.innerHTML = icn('cog', 24, '#757575');
  });
  // Page header, BACK, and the table-card headers.
  const fill = (sel, html) => document.querySelectorAll(sel).forEach(el => { if (!el.innerHTML.trim()) el.innerHTML = html; });
  fill('#pg-more',  icn('dotsVertical', 24, '#757575'));
  fill('#pg-share', icn('share', 24, '#757575'));
  fill('#pg-save',  icn('starOutline', 24, '#2ecc71') + 'Save');
  fill('.chart-back-icn', icn('arrowLeft', 24, '#212121'));
  fill('.tbl-info',     icn('infoOutline', 20, '#757575'));
  fill('.tbl-cols-icn', icn('viewColumn', 18, '#2ecc71'));
  fill('.tbl-caret',    icn('caret', 18, '#212121'));
  fill('.tbl-dl-icn',   icn('download', 24, '#212121'));
  document.querySelectorAll('.tbl-time-icn').forEach(el => el.remove());
}

// Writes a control chip's value without disturbing its icon or caret.
function setChipLabel(id, text) {
  const el = document.getElementById(id);
  if (!el) return;
  (el.querySelector('.chip-label') || el).textContent = text;
}

// A chart-control chip turns green once it carries a selection. Only "Split
// by" and the 2nd Y-axis have an empty state to turn it off again.
function setChipActive(id, on) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle('active', !!on);
  // Live: an applied Split by swaps its caret for a clear icon that removes it.
  const clear = { 'splitby-btn': () => selectSplit(null), 'oee-splitby-btn': () => selectOeeSplit(null),
                  'qty-splitby-btn': () => selectQtySplit(null) }[id];
  const tail = el.lastElementChild;
  if (!clear || !tail || !el.querySelector('.chip-label')) return;
  const icon = on ? icn('closeCircle', 18, '#616161') : icn('caret');
  tail.outerHTML = on ? icon.replace('<svg class="chip-icn"', '<svg class="chip-icn chip-clear"') : icon;
  if (on) el.lastElementChild.addEventListener('click', e => { e.stopPropagation(); clear(); });
}

// OEE / Quantities: the people splits only (their own axes map).
const PEOPLE_SPLITS = ['Shift leaders', 'Operators', 'Operator groups'];
function splitOptionsFor(xAxis) {
  return [{ val: null, label: '–' }]
    .concat(PEOPLE_SPLITS.filter(d => d !== xAxis).map(d => ({ val: d, label: d })));
}

// Close dropdowns when clicking outside them.
document.addEventListener('click', () => {
  closeAllDropdowns();
  if (typeof closeFilterMenus === 'function') closeFilterMenus();
});

// ══════════════════════════════════════════════════════════════════════════════
//  Filter bar (spec §6)
//  Fixed chips: date, Factories, Stations, Stop groups, Stops. + FILTER adds
//  the rest. Every chip filters the stops; they combine with AND.
// ══════════════════════════════════════════════════════════════════════════════

// Applied selections: dim → { values: Set, inverted }. Inverted = everything
// except the values (the product's selection inversion).
const filters = {};
function filt(k) { return filters[k] || (filters[k] = { values: new Set(), inverted: false }); }

// stopVals(stop): the values a stop has on the dimension.
// segVals(segment): the same for planned time (null = a stop-only filter).
// blockVals(block): OEE / Quantities (null = Downtime only).
const opsOrUnknown = (ops) => (ops.length ? ops : [OP_UNKNOWN]);
const FILTER_DEFS = {
  factories:      { label: 'Factories', icon: 'factories', fixed: true,
                    stopVals: s => [s.factory], segVals: g => [FACTORY_OF[g.b.station]], blockVals: b => [FACTORY_OF[b.station]] },
  stations:       { label: 'Stations', icon: 'stations', fixed: true,
                    stopVals: s => [s.station], segVals: g => [g.b.station], blockVals: b => [b.station] },
  stopGroups:     { label: 'Stop groups', icon: 'group', fixed: true, stopVals: s => [s.group] },
  stops:          { label: 'Stops', icon: 'stops', fixed: true, invertible: true, grouped: true,
                    stopVals: s => [s.reason] },
  productGroups:  { label: 'Product groups', icon: 'group', stopVals: s => [s.productGroup], segVals: g => [g.r.productGroup] },
  products:       { label: 'Products', icon: 'products', invertible: true, secondary: v => SKU_OF[v] || '',
                    stopVals: s => [s.product], segVals: g => [g.r.product] },
  operators:      { label: 'Operators', icon: 'operators', invertible: true,
                    stopVals: s => opsOrUnknown(s.operators), segVals: g => opsOrUnknown(g.b.operatorIds), blockVals: b => blockOperatorValues(b) },
  operatorGroups: { label: 'Operator groups', icon: 'group',
                    stopVals: s => opsOrUnknown(s.operatorGroups),
                    segVals: g => opsOrUnknown([...new Set(g.b.operatorIds.map(o => OPERATOR_DIRECTORY[o]?.group).filter(Boolean))]) },
  leaders:        { label: 'Shift leaders', icon: 'leaders',
                    stopVals: s => [s.leader || OP_NO_LEADER], segVals: g => [g.b.leaderId || OP_NO_LEADER], blockVals: b => [b.leaderId || OP_NO_LEADER] },
  shifts:         { label: 'Shifts', icon: 'shifts', invertible: true, stopVals: s => [s.shift], segVals: g => [g.b.shift] },
  lots:           { label: 'LOT/Batch', icon: 'products', invertible: true, stopVals: s => [s.lot], segVals: g => [g.r.lot] },
  orders:         { label: 'Orders', icon: 'products', invertible: true, stopVals: s => [s.order], segVals: g => [g.r.order] },
  stopTypes:      { label: 'Stop types', icon: 'stops', grouped: true, stopVals: s => [s.stopType],
                    text: v => STOP_TYPES.find(t => t.value === v)?.short || v },
  locations:      { label: 'Machine locations', icon: 'mapMarkerRadius', invertible: true, stopVals: s => (s.location ? [s.location] : []) },
};
const FIXED_FILTERS = ['factories', 'stations', 'stopGroups', 'stops'];

// What + FILTER offers, per report and in its order. On OEE and Quantities only
// the people filters are wired (they read shift blocks); the rest are listed
// so the menu reads like the product, and do nothing.
const FILTER_MENU = {
  // +FILTER order per the Figma action menu; Operator groups and Shift leaders sit with Operators.
  downtime:   ['productGroups', 'products', 'orders', 'lots', 'operators', 'operatorGroups', 'leaders', 'tags', 'shifts', 'stopTypes', 'locations'],
  oee:        ['productGroups', 'products', 'orders', 'lots', 'operators', 'leaders', 'shifts', 'speedLoss', 'locations'],
  quantities: ['productGroups', 'products', 'orders', 'lots', 'operators', 'leaders', 'shifts'],
};
const OTHER_REPORT_LIVE = new Set(['factories', 'stations', 'operators', 'leaders']);
const MENU_DECOR = { speedLoss: ['Speed loss reasons', 'speedLoss'] };

// Which + FILTER dimensions are shown as chips (in the order added).
let activeFilters = [];
let _slDim = null, _slDraft = null, _slSearch = '', _slOpenGroups = new Set();

// A chip is shown on this report.
function filterShown(key) {
  if (key === 'tags') return currentReport === 'downtime' && tagsFeatureOn();
  if (currentReport === 'downtime') return true;
  if (currentReport === 'quantities' && (key === 'stopGroups' || key === 'stops')) return false;
  return FIXED_FILTERS.includes(key) || OTHER_REPORT_LIVE.has(key);
}

// Does a stop pass one dimension's selection?
function passDim(k, s) {
  const f = filters[k];
  if (!f || !f.values.size) return true;
  const hit = FILTER_DEFS[k].stopVals(s).some(v => f.values.has(v));
  return f.inverted ? !hit : hit;
}
function stopPasses(s) {
  for (const k in FILTER_DEFS) if (!passDim(k, s)) return false;
  return true;
}
// A segment (planned time) passes the filters that describe it.
function segPasses(g) {
  for (const k in FILTER_DEFS) {
    const def = FILTER_DEFS[k], f = filters[k];
    if (!def.segVals || !f || !f.values.size) continue;
    const hit = def.segVals(g).some(v => f.values.has(v));
    if (f.inverted ? hit : !hit) return false;
  }
  return true;
}

// Options: values that exist in the period and the selected factories /
// stations; Stops also follow Stop groups.
function filterOptions(k) {
  const def = FILTER_DEFS[k];
  const all = rangeStart && rangeEnd ? periodData(rangeStart, rangeEnd).stops : [];
  const stops = all.filter(s => (k === 'factories' || passDim('factories', s))
    && (k === 'factories' || k === 'stations' || passDim('stations', s))
    && (k !== 'stops' || passDim('stopGroups', s)));
  const set = new Set();
  stops.forEach(s => def.stopVals(s).forEach(v => { if (v != null && v !== '') set.add(v); }));
  if (k === 'stopTypes') return STOP_TYPES.map(t => t.value).filter(v => set.has(v));
  return sortValues([...set]);
}

// The generic dimension, as the selection list reads it.
function genericDim(k) {
  const def = FILTER_DEFS[k];
  const text = def.text || (v => v);
  const dim = {
    label: def.label, icon: icn(def.icon, 20), fixed: !!def.fixed,
    values: () => filterOptions(k),
    pinned: () => filterOptions(k).filter(v => v === OP_UNKNOWN),
    text, secondary: def.secondary,
    // Draft = the ticked rows; an inverted filter ticks everything it does not hold.
    draft: () => {
      const f = filt(k);
      return f.inverted ? new Set(filterOptions(k).filter(v => !f.values.has(v))) : new Set(f.values);
    },
    extra: (draft) => {
      const opts = new Set(filterOptions(k));
      return [...new Set([...filt(k).values, ...draft])].filter(v => !opts.has(v));
    },
    // Apply, as the product does it: all (or none) = All; with inversion, more
    // than half of the options ticked (more than 2 options) is stored as the
    // unticked ones, inverted.
    commit: (draft) => {
      const opts = filterOptions(k);
      const ticked = opts.filter(v => draft.has(v));
      const extra = [...draft].filter(v => !opts.includes(v));
      if (!extra.length && (ticked.length === opts.length || !draft.size)) { filters[k] = { values: new Set(), inverted: false }; return; }
      if (def.invertible && opts.length > 2 && ticked.length > opts.length / 2) {
        filters[k] = { values: new Set(opts.filter(v => !draft.has(v))), inverted: true };
      } else filters[k] = { values: new Set(draft), inverted: false };
    },
    // Chip value (SelectionMenuInput): All · name · ≠ name · N · -N.
    chipText: () => {
      const f = filt(k), held = [...f.values];
      if (!held.length) return 'All';
      if (!f.inverted) { const opts = filterOptions(k); if (opts.length && opts.every(v => f.values.has(v))) return 'All'; }
      if (held.length === 1) return (f.inverted ? '≠ ' : '') + text(held[0]);
      return (f.inverted ? '-' : '') + held.length;
    },
    hasSel: () => filt(k).values.size > 0,
    clear: () => { filters[k] = { values: new Set(), inverted: false }; },
  };
  if (k === 'stops') {
    dim.defaultOpen = true;
    // Stop groups → their stop reasons, in the product's group order.
    dim.groupsOf = () => {
      const opts = filterOptions('stops');
      const groupOfReason = Object.fromEntries(DT_REASONS.map(r => [r.name, r.group]));
      return groupOrder().map(g => ({ group: g, members: opts.filter(v => groupOfReason[v] === g) })).filter(x => x.members.length);
    };
  }
  if (k === 'stopTypes') {
    dim.defaultOpen = true;
    dim.groupsOf = () => {
      const opts = filterOptions('stopTypes');
      return ['Unplanned', 'Planned'].map(g => ({ group: g, members: STOP_TYPES.filter(t => t.group === g && opts.includes(t.value)).map(t => t.value) }))
        .filter(x => x.members.length);
    };
  }
  return dim;
}
const FILTER_DIMS = Object.fromEntries(Object.keys(FILTER_DEFS).map(k => [k, genericDim(k)]));

function closeFilterMenus() {
  document.getElementById('filter-menu')?.classList.remove('open');
  document.getElementById('selection-list')?.classList.remove('open');
  _slDim = null; _slDraft = null; _slSearch = ''; _slOpenGroups = new Set();
}

// ── + FILTER menu ──
function toggleFilterMenu(event) {
  event.stopPropagation();
  const menu = document.getElementById('filter-menu');
  const wasOpen = menu.classList.contains('open');
  closeFilterMenus();
  closeAllDropdowns();
  if (wasOpen) return;
  menu.innerHTML = '';
  (FILTER_MENU[currentReport] || FILTER_MENU.downtime).forEach(key => {
    if (key === 'tags' && !filterShown('tags')) return;
    const row = document.createElement('div');
    const dim = FILTER_DIMS[key];
    const live = dim && (currentReport === 'downtime' || OTHER_REPORT_LIVE.has(key));
    if (!live) {                                    // listed, not wired on this report
      const [label, iconName] = MENU_DECOR[key] || [FILTER_DEFS[key].label, FILTER_DEFS[key].icon];
      row.className = 'action-menu-row is-inert';
      row.innerHTML = `${icn(iconName, 20)}<span>${label}</span>`;
      menu.appendChild(row);
      return;
    }
    const added = activeFilters.includes(key);
    row.className = 'action-menu-row' + (added ? ' is-added' : '');
    row.innerHTML = `${dim.icon}<span>${dim.label}</span>`;
    if (!added) row.addEventListener('click', (e) => { e.stopPropagation(); addFilter(key); });
    menu.appendChild(row);
  });
  menu.classList.add('open');
}
function addFilter(key) {
  if (!activeFilters.includes(key)) activeFilters.push(key);
  document.getElementById('filter-menu').classList.remove('open');
  renderActiveChips();
  openSelectionList(key);
}

// ── Chips ──
function chipLabel(key) { return FILTER_DIMS[key].label + ': ' + FILTER_DIMS[key].chipText(); }
function renderActiveChips() {
  const caret = '<svg width="18" height="18" viewBox="0 0 24 24" fill="#616161"><path d="M7 10L12 15L17 10H7Z"/></svg>';
  const x = '<span class="chip-x" title="Remove"><svg width="14" height="14" viewBox="0 0 24 24" fill="#616161"><path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"/></svg></span>';
  const make = (key, fixed) => {
    const dim = FILTER_DIMS[key];
    const chip = document.createElement('div');
    chip.className = 'active-chip' + (fixed ? ' is-fixed' : '') + (dim.hasSel() ? ' has-sel' : '');
    chip.dataset.key = key;
    if (key === 'stopGroups') chip.id = 'chip-stop-groups';
    if (key === 'stops') chip.id = 'chip-stops';
    const warn = dim.problems && dim.problems().length ? `<span class="chip-warn">${icn('alert', 18, '#f57c00')}</span>` : '';
    chip.innerHTML = `${dim.icon}${warn}<span class="chip-text">${htmlEsc(chipLabel(key))}</span>${fixed ? caret : x}`;
    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!fixed && e.target.closest('.chip-x')) { removeFilter(key); return; }
      openSelectionList(key, chip);
    });
    if (!(dim.problems && dim.problems().length)) chip.title = chipLabel(key);
    if (dim.problems) attachTagChipTip(chip, key);
    return chip;
  };
  const fixedWrap = document.getElementById('fixed-filters');
  if (fixedWrap) {
    fixedWrap.innerHTML = '';
    FIXED_FILTERS.forEach(k => { if (filterShown(k)) fixedWrap.appendChild(make(k, true)); });
  }
  const wrap = document.getElementById('active-filters');
  if (!wrap) return;
  const reset = document.getElementById('filter-reset');
  const any = activeFilters.length || FIXED_FILTERS.some(k => filt(k).values.size);
  if (reset) reset.style.opacity = any ? '1' : '0.38';
  wrap.innerHTML = '';
  activeFilters.forEach(key => { if (filterShown(key)) wrap.appendChild(make(key, false)); });
}
// Trash / ×: a + FILTER chip goes away; a fixed chip goes back to All.
function removeFilter(key) {
  if (!FIXED_FILTERS.includes(key)) activeFilters = activeFilters.filter(k => k !== key);
  FILTER_DIMS[key].clear();
  if (_slDim === key) closeFilterMenus();
  renderActiveChips();
  applyFilters();
}

// ── Selection list (per dimension) ──
// Ticking never moves anything: rows keep their order, the scroll position is
// kept across the redraw, and rows only the draft holds stay listed.
function openSelectionList(key, anchorEl) {
  const sl = document.getElementById('selection-list');
  document.getElementById('filter-menu').classList.remove('open');
  closeAllDropdowns();
  if (_slDim === key && sl.classList.contains('open')) { closeFilterMenus(); return; }
  const dim = FILTER_DIMS[key];
  _slDim = key;
  _slDraft = dim.draft();
  _slSearch = '';
  _slOpenGroups = new Set(dim.grouped || dim.groupsOf ? (dim.defaultOpen ? dim.groupsOf().map(g => g.group) : []) : []);
  renderSelectionList();
  const anchor = anchorEl || document.querySelector(`.active-chip[data-key="${key}"]`) || document.getElementById('filter-cta');
  if (anchor) {
    const r = anchor.getBoundingClientRect();
    const barRect = document.getElementById('app').getBoundingClientRect();
    let left = r.left - barRect.left;
    if (left + 320 > barRect.width) left = Math.max(0, barRect.width - 320);
    sl.style.left = left + 'px';
    sl.style.top = (r.bottom - barRect.top + 6) + 'px';   // under the chip's line
  }
  sl.classList.add('open');
}

function renderSelectionList() {
  const sl = document.getElementById('selection-list');
  if (!sl || !_slDim) return;
  const keepScroll = sl.querySelector('.sl-rows')?.scrollTop || 0;
  const dim = FILTER_DIMS[_slDim];
  const all = dim.values();
  const text = (v) => dim.text ? dim.text(v) : v;
  const q = _slSearch.trim().toLowerCase();
  const match = (v) => !q || text(v).toLowerCase().includes(q) || (dim.secondary && dim.secondary(v).toLowerCase().includes(q));
  const shown = all.filter(match);
  const allChecked = shown.length > 0 && shown.every(v => _slDraft.has(v));

  const check = (on) => on ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4Z"/></svg>' : '';
  const dash = '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M5 11h14v2H5z"/></svg>';
  const esc = (v) => htmlEsc(v);
  const label = (v) => `<span class="sl-label">${esc(text(v))}</span>` + (dim.secondary && dim.secondary(v) ? `<span class="sl-sec">${esc(dim.secondary(v))}</span>` : '');
  const row = (v, on, extraCls) =>
    `<div class="sl-row${on ? ' is-checked' : ''}${extraCls || ''}${dim.cls ? dim.cls(v) : ''}" data-val="${esc(v)}"><span class="sl-check">${check(on)}</span>${label(v)}</div>`;

  let body;
  const pinned = (dim.pinned ? dim.pinned() : []).filter(match);
  const pinnedHtml = pinned.map(v => row(v, _slDraft.has(v))).join('');
  const chevron = '<span class="sl-chevron"><svg width="18" height="18" viewBox="0 0 24 24" fill="#616161"><path d="M7 10L12 15L17 10H7Z"/></svg></span>';
  if (dim.groupsOf) {
    body = pinnedHtml + dim.groupsOf().map(({ group, members }) => {
      const vis = members.filter(match);
      if (!vis.length) return '';
      const selN = vis.filter(m => _slDraft.has(m)).length;
      const state = selN === 0 ? 'empty' : selN === vis.length ? 'full' : 'partial';
      const headMark = state === 'full' ? check(true) : state === 'partial' ? dash : '';
      const open = _slOpenGroups.has(group) || !!q;
      const header = `<div class="sl-row sl-row-group${open ? ' is-open' : ''}" data-group="${esc(group)}"><span class="sl-check${state !== 'empty' ? ' is-on' : ''}">${headMark}</span><span class="sl-label">${esc(group)}</span>${chevron}</div>`;
      return header + (open ? vis.map(m => row(m, _slDraft.has(m), ' sl-row-member')).join('') : '');
    }).join('');
  } else {
    const pinnedSet = new Set(pinned);
    body = pinnedHtml + shown.filter(v => !pinnedSet.has(v)).map(v => row(v, _slDraft.has(v))).join('');
  }
  const extra = (dim.extra ? dim.extra(_slDraft) : []).filter(match);
  body += extra.map(v => row(v, _slDraft.has(v))).join('');
  if (!body) body = `<div class="sl-empty">No search results</div>`;

  sl.innerHTML = `
    <div class="sl-search"><div class="sl-search-inner">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#2ecc71"><path d="M14.71 14H15.5L20.49 19L19 20.49L14 15.5V14.71L13.73 14.43C12.59 15.41 11.11 16 9.5 16C5.91 16 3 13.09 3 9.5C3 5.91 5.91 3 9.5 3C13.09 3 16 5.91 16 9.5C16 11.11 15.41 12.59 14.43 13.73L14.71 14ZM5 9.5C5 11.99 7.01 14 9.5 14C11.99 14 14 11.99 14 9.5C14 7.01 11.99 5 9.5 5C7.01 5 5 7.01 5 9.5Z"/></svg>
      <input type="text" placeholder="Search" id="sl-search-input" value="${esc(_slSearch)}">
    </div></div>
    <div class="sl-rows">
      <div class="sl-row" data-all="1"><span class="sl-check${allChecked ? ' is-on' : ''}">${allChecked ? check(true) : ''}</span><span>Select all</span></div>
      <div class="sl-divider"></div>
      ${body}
    </div>
    <div class="sl-footer">
      <span class="sl-trash" id="sl-trash" title="Remove"><svg width="20" height="20" viewBox="0 0 24 24" fill="#616161"><path d="M15.5 4H19V6H5V4H8.5L9.5 3H14.5L15.5 4ZM8 21C6.9 21 6 20.1 6 19V7H18V19C18 20.1 17.1 21 16 21H8Z"/></svg></span>
      <div class="sl-footer-right">
        <button class="sl-btn sl-btn-cancel" id="sl-cancel">Cancel</button>
        <button class="sl-btn sl-btn-apply"  id="sl-apply">Apply</button>
      </div>
    </div>`;

  sl.querySelector('.sl-rows').scrollTop = keepScroll;
  sl.onclick = e => e.stopPropagation();
  const input = sl.querySelector('#sl-search-input');
  input.addEventListener('input', e => { _slSearch = e.target.value; renderSelectionList(); sl.querySelector('#sl-search-input').focus(); });
  sl.querySelectorAll('.sl-row').forEach(r => r.addEventListener('click', (ev) => {
    if (r.dataset.group != null && ev.target.closest('.sl-chevron')) {
      const g = r.dataset.group;
      if (_slOpenGroups.has(g)) _slOpenGroups.delete(g); else _slOpenGroups.add(g);
      renderSelectionList();
      return;
    }
    if (r.dataset.all) {
      if (allChecked) shown.forEach(v => _slDraft.delete(v)); else shown.forEach(v => _slDraft.add(v));
    } else if (r.dataset.group != null) {
      const members = (dim.groupsOf().find(s => s.group === r.dataset.group)?.members || []).filter(match);
      const allOn = members.length && members.every(m => _slDraft.has(m));
      members.forEach(m => allOn ? _slDraft.delete(m) : _slDraft.add(m));
    } else {
      const v = r.dataset.val;
      if (_slDraft.has(v)) _slDraft.delete(v); else _slDraft.add(v);
    }
    renderSelectionList();
  }));
  sl.querySelector('#sl-trash').addEventListener('click', () => removeFilter(_slDim));
  sl.querySelector('#sl-cancel').addEventListener('click', () => closeFilterMenus());
  sl.querySelector('#sl-apply').addEventListener('click', () => {
    dim.commit(_slDraft);
    closeFilterMenus();
    renderActiveChips();
    applyFilters();
  });
}

// Escape closes an open selection list (= Cancel).
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && document.getElementById('selection-list')?.classList.contains('open')) closeFilterMenus();
});

function resetFilters() {
  activeFilters = [];
  Object.keys(FILTER_DEFS).forEach(k => FILTER_DIMS[k].clear());
  clearTagsFilter();
  closeFilterMenus();
  renderActiveChips();
  applyFilters();
}

// Re-feed the visible report. Only the visible report is drawn: a hidden chart
// measures 0 px. switchReport draws Downtime when it is shown again.
function applyFilters() {
  _tblPage.oee = 0; _tblPage.qty = 0; _dtPage = 0;
  saveTagsFilter();
  if (currentReport === 'downtime') drawDowntime();
  else if (currentReport === 'oee') drawOeeChart();
  else if (currentReport === 'quantities') drawQtyChart();
}
const applyOperatorFilters = applyFilters;


// ── Tags (spec §2) ────────────────────────────────────────────────────────────
// A stop's tags = the tags on its stop reason, its stop group, the operators
// registered at its start and their operator groups. ONE helper counts them
// (stopTagIds); the filter, the X-axis, the split and the column all read it.
//
// Filter: "+ FILTER → Tags", the selection list over every tag of the four
// types, names only, "No tag" pinned on top. Inversion as the product
// (more than half ticked → stored as the unticked ones, inverted).
// Meaning, as one rule for TagsStore.evaluate over the four FILTER_FIELDS:
//   S = OR of { is S };  No tag = AND of { hasNone };  plain = S OR No tag;
//   inverted = its negation. A deleted tag stays selected and matches nothing.
const TAG_NONE = 'none';
const TAGS_FILTER_KEY = 'evocon_reports_tags_filter';
const TAG_FIELDS = TagsStore.FILTER_FIELDS.map(f => f.key);
let tagsFilter = { tagIds: [], noTag: false, inverted: false };

function tagsFeatureOn() { return !!(window.TagsStore && TagsStore.isTagsEnabled()); }
function tagsFilterActive() {
  return tagsFeatureOn() && activeFilters.includes('tags') && (tagsFilter.tagIds.length > 0 || tagsFilter.noTag);
}
function tagsFilterRule() {
  if (!tagsFilterActive()) return null;
  const { tagIds, noTag, inverted } = tagsFilter;
  const groups = [];
  if (tagIds.length) groups.push({ kind: 'group', op: inverted ? 'AND' : 'OR',
    items: TAG_FIELDS.map(field => ({ field, cmp: inverted ? 'isNot' : 'is', tagIds: tagIds.slice() })) });
  if (noTag) groups.push({ kind: 'group', op: inverted ? 'OR' : 'AND',
    items: TAG_FIELDS.map(field => ({ field, cmp: inverted ? 'hasAny' : 'hasNone', tagIds: [] })) });
  return { op: inverted ? 'AND' : 'OR', items: groups };
}

// What a stop carries (TagsStore.subjectForStop over its reason, its group and
// the operators registered at its start). Memoised; dropped when tags change.
const _subjectMemo = new Map();
function stopSubject(s) {
  const k = `${s.reason}|${s.group}|${s.operators.join(',')}`;
  if (!_subjectMemo.has(k)) _subjectMemo.set(k, TagsStore.subjectForStop({ reason: s.reason, group: s.group, operators: s.operators }));
  return _subjectMemo.get(k);
}
// THE counting helper: every tag a stop carries, from all four sources.
function stopTagIds(s) {
  const sub = stopSubject(s);
  return [...new Set(TAG_FIELDS.flatMap(f => sub[f]))];
}
function tagsFilterPredicate() {
  const rule = tagsFilterRule();
  if (!rule) return () => true;
  return s => TagsStore.evaluate(rule, stopSubject(s));
}

// X-axis / Split by "Tags": one bar per tag plus "No tag"; a stop counts in
// every tag it carries. A Tags filter limits the bars to its selection.
const TAG_NONE_LABEL = 'No tag';
function tagBarAllowed(id) {
  if (!tagsFilterActive()) return true;
  const inS = tagsFilter.tagIds.includes(id);
  return tagsFilter.inverted ? !inS : inS;
}
function noTagBarAllowed() {
  if (!tagsFilterActive()) return true;
  return tagsFilter.inverted ? !tagsFilter.noTag : tagsFilter.noTag;
}
DT_AXES['Tags'] = {
  singular: 'Tag', planned: 'stops', overlap: true,
  keys: s => {
    const ids = stopTagIds(s);
    if (!ids.length) return noTagBarAllowed() ? [TAG_NONE_LABEL] : [];
    return ids.filter(tagBarAllowed).map(id => TagsStore.tagById(id)?.name).filter(Boolean);
  },
};

function tagState(id) {
  const states = TAG_FIELDS.map(field => TagsStore.tagStateInField(id, field));
  return states.includes('ok') ? 'ok' : states.includes('deleted') ? 'deleted' : 'wrongType';
}
function tagOptions() {
  return TagsStore.getTags().filter(t => t.types.some(x => TAG_FIELDS.includes(x)))
    .sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }))
    .map(t => String(t.id));
}

FILTER_DIMS.tags = {
  label: 'Tags',
  icon: icn('tag', 20),
  values: () => [TAG_NONE, ...tagOptions()],
  pinned: () => [TAG_NONE],
  text: (v) => v === TAG_NONE ? 'No tag' : (TagsStore.tagById(+v)?.name || 'Deleted'),
  cls: (v) => v === TAG_NONE ? '' : ({ ok: '', deleted: ' is-deleted', wrongType: ' is-unavailable' })[tagState(+v)],
  draft: () => {
    const held = new Set([...tagsFilter.tagIds.map(String), ...(tagsFilter.noTag ? [TAG_NONE] : [])]);
    return tagsFilter.inverted ? new Set(FILTER_DIMS.tags.values().filter(v => !held.has(v))) : held;
  },
  extra: (draft) => {
    const opts = new Set(FILTER_DIMS.tags.values());
    return [...new Set([...tagsFilter.tagIds.map(String), ...draft])].filter(v => !opts.has(v));
  },
  commit: (draft) => {
    const opts = FILTER_DIMS.tags.values();
    const ticked = opts.filter(v => draft.has(v));
    let held = [...draft], inverted = false;
    if (opts.length > 2 && ticked.length > opts.length / 2) { held = opts.filter(v => !draft.has(v)); inverted = true; }
    tagsFilter = { tagIds: held.filter(v => v !== TAG_NONE).map(Number), noTag: held.includes(TAG_NONE), inverted };
  },
  // Chip value, per the Figma filter bar (a deliberate new pattern):
  // All · Cleaning · Cleaning + 2 · ≠ Cleaning + 1. "No tag" first when selected.
  chipText: () => {
    const { tagIds, noTag, inverted } = tagsFilter;
    const names = TagsStore.tagNames(tagIds, { withDeleted: true }).sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
    const held = [...(noTag ? ['No tag'] : []), ...names];
    if (!held.length) return 'All';
    return (inverted ? '≠ ' : '') + held[0] + (held.length > 1 ? ` + ${held.length - 1}` : '');
  },
  hasSel: () => tagsFilter.tagIds.length > 0 || tagsFilter.noTag,
  problems: () => tagsFilter.tagIds.map(id => ({ id, st: tagState(id) })).filter(p => p.st !== 'ok'),
  clear: () => { tagsFilter = { tagIds: [], noTag: false, inverted: false }; },
};

// Hovering a Tags chip that holds a deleted or unavailable tag says so.
function attachTagChipTip(chip, key) {
  const tip = document.getElementById('chart-tooltip');
  const dim = FILTER_DIMS[key];
  chip.addEventListener('mousemove', (e) => {
    const problems = dim.problems();
    if (!problems.length || document.getElementById('selection-list').classList.contains('open')) { tip.style.display = 'none'; return; }
    const lines = [...new Set(problems.map(p => p.st === 'deleted'
      ? 'A selected tag was deleted. It matches no stops.'
      : `${TagsStore.tagById(p.id).name} is no longer available. It matches no stops.`))];
    tip.innerHTML = `<div style="font-family:'Open Sans',sans-serif;font-size:10px;font-weight:600;color:#cccccc;letter-spacing:0.8px;text-transform:uppercase;line-height:16px;">${htmlEsc(dim.label)}</div>`
      + lines.map(l => `<div style="font-family:'Open Sans',sans-serif;font-size:12px;color:#ffb74d;line-height:16px;max-width:360px;white-space:normal;">${htmlEsc(l)}</div>`).join('');
    tip.style.display = 'block';
    tip.style.left = (e.clientX + 14) + 'px';
    tip.style.top  = (e.clientY + 18) + 'px';
  });
  chip.addEventListener('mouseleave', () => { tip.style.display = 'none'; });
}

// Persistence: the Tags chip survives page navigation (Settings and back).
function saveTagsFilter() {
  try {
    if (activeFilters.includes('tags')) localStorage.setItem(TAGS_FILTER_KEY, JSON.stringify({ tags: tagsFilter }));
    else localStorage.removeItem(TAGS_FILTER_KEY);
  } catch (e) { /* private window: the chip just does not persist */ }
}
function loadTagsFilter() {
  if (!tagsFeatureOn()) return;
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(TAGS_FILTER_KEY) || 'null'); } catch (e) { saved = null; }
  const t = saved && saved.tags;
  if (!t) return;
  tagsFilter = { tagIds: (t.tagIds || []).map(Number), noTag: !!t.noTag, inverted: !!t.inverted };
  if (!activeFilters.includes('tags')) activeFilters.push('tags');
}
function clearTagsFilter() {
  FILTER_DIMS.tags.clear();
  activeFilters = activeFilters.filter(k => k !== 'tags');
}

// Settings changed a tag (maybe in another tab), or the feature was switched
// off. Feature off: no Tags anywhere; a Tags axis or split falls back.
function onTagsChanged() {
  _subjectMemo.clear();
  if (!tagsFeatureOn()) {
    clearTagsFilter();
    if (downtimeSplitBy === 'Tags') {
      downtimeSplitBy = null;
      setChipLabel('splitby-btn', 'Split by: -');
      setChipActive('splitby-btn', false);
    }
    if (currentXAxis === 'Tags') { currentXAxis = 'Stop reasons'; dtSort = null; }
    if (dtSort && dtSort.key === 'tags') dtSort = null;
    if (_slDim === 'tags') closeFilterMenus();
    document.getElementById('filter-menu')?.classList.remove('open');
    saveTagsFilter();
  } else if (_slDim === 'tags') {
    renderSelectionList();
  }
  renderActiveChips();
  setChipLabel('xaxis-btn', 'X-axis: ' + currentXAxis);
  if (currentReport === 'downtime') redrawChart(currentXAxis);
}
window.addEventListener('tags:changed', onTagsChanged);
window.addEventListener('proto:tagsFeature', onTagsChanged);
window.addEventListener('proto:tagColumns', () => { if (currentReport === 'downtime') drawDowntime(); });
window.addEventListener('proto:tagPills', () => { if (currentReport === 'downtime') drawDowntime(); });

// ── Test hook (spec: contract between builder and tester) ──
window.__tagsProto = {
  // Stop records of the selected period, before any filter.
  allStops() {
    return (rangeStart && rangeEnd ? periodData(rangeStart, rangeEnd).stops : [])
      .map(s => ({ ...s, operators: s.operators.slice(), operatorGroups: s.operatorGroups.slice() }));
  },
  // dim: a FILTER_DEFS key or 'tags'. values: names as shown; tags: ids plus 'none'.
  setFilter(dim, { values = [], inverted = false } = {}) {
    if (dim === 'tags') {
      tagsFilter = { tagIds: values.filter(v => v !== TAG_NONE).map(Number), noTag: values.includes(TAG_NONE), inverted: !!inverted };
      if (!activeFilters.includes('tags')) activeFilters.push('tags');
    } else {
      if (!FILTER_DEFS[dim]) throw new Error('unknown filter ' + dim);
      // Stop types also accept the list rows' short names.
      const vals = values.map(v => (dim === 'stopTypes' ? (STOP_TYPES.find(t => t.short === v)?.value || v) : String(v)));
      filters[dim] = { values: new Set(vals), inverted: !!inverted && vals.length > 0 };
      if (!FIXED_FILTERS.includes(dim) && !activeFilters.includes(dim)) activeFilters.push(dim);
    }
    closeFilterMenus(); renderActiveChips(); applyFilters();
  },
  clearFilters() { resetFilters(); },
  setXAxis(label) { if (xAxisOptions().includes(label)) redrawChart(label); },
  // Not a Split by option (a time unit, "-") = no split.
  setSplit(label) { selectSplit(label && dtSplitOptions().includes(label) && label !== '-' ? label : null); },
  setYAxis(metric) { selectY(metric); },
  setY2(metric) { selectY2(metric); },
  // One entry per drawn segment.
  chartData() {
    return _dtBars.flatMap(b => b.groups.map(g => ({ x: b.x, split: b.split, group: g.group, durSec: g.durSec, count: g.count })));
  },
  tableColumns() { return dtColumns().map(c => c.label); },
  tableRows() {
    const cols = dtColumns();
    return _dtData.map(r => Object.fromEntries(cols.map(c => [c.label, dtCellText(r, c)])));
  },
  totalRow() {
    if (dtTotalHidden() || !_dtData.length) return null;
    const t = dtTotalRow(_dtBase);
    return Object.fromEntries(dtColumns().map(c => [c.label, dtTotalCellText(t, c)]));
  },
  chipText(dim) {
    if (FILTER_DIMS[dim]) return chipLabel(dim);
    const id = { xAxis: 'xaxis-btn', split: 'splitby-btn', yAxis: 'dt-yaxis-btn', y2: 'y2axis-btn', date: 'date-btn' }[dim];
    if (id) return document.getElementById(id)?.querySelector('.chip-label')?.textContent || '';
    if (dim === 'columns') return document.getElementById('dt-col-count')?.textContent || '';
    if (dim === 'timeFormat') return document.getElementById('dt-time-label')?.textContent || '';
    return '';
  },
  // Earlier calls, kept for older scripts.
  setTags({ tagIds = [], noTag = false, inverted = false } = {}) {
    this.setFilter('tags', { values: [...tagIds.map(String), ...(noTag ? [TAG_NONE] : [])], inverted });
  },
  clearTags() { clearTagsFilter(); closeFilterMenus(); renderActiveChips(); applyFilters(); },
  events() { return (_dtBase ? _dtBase.stops : []).map(s => ({ reason: s.reason, group: s.group, dur: s.durSec, count: 1, station: s.station, operators: s.operators.slice() })); },
  total() { const t = dtTotalRow(_dtBase); return { dur: t.durSec, count: t.count }; },
  rows() { return _dtData.map(r => ({ name: r.name, dur: r.durSec, count: r.count })); },
};

// ── Report switching ──────────────────────────────────────────────────────────

function switchReport(type) {
  if (type === currentReport) return;
  currentReport = type;

  const TITLES = { downtime: 'Downtime', oee: 'OEE', quantities: 'Quantities' };
  document.getElementById('page-title').textContent = TITLES[type] || 'Downtime';
  document.getElementById('rnav-downtime').classList.toggle('active', type === 'downtime');
  document.getElementById('rnav-oee').classList.toggle('active', type === 'oee');
  document.getElementById('rnav-quantities')?.classList.toggle('active', type === 'quantities');
  document.getElementById('downtime-chart-section').style.display = type === 'downtime' ? '' : 'none';
  document.getElementById('downtime-table-section').style.display  = type === 'downtime' ? '' : 'none';
  document.getElementById('oee-chart-section').style.display       = type === 'oee'      ? '' : 'none';
  document.getElementById('qty-chart-section').style.display       = type === 'quantities' ? '' : 'none';

  closeFilterMenus();
  renderActiveChips();       // Downtime-only chips hide on the other reports

  if (type === 'oee') drawOeeChart();
  else if (type === 'quantities') drawQtyChart();
  else redrawChart(currentXAxis);
}

// OEE / Quantities read shift blocks: the filters that describe a block apply
// (Factories, Stations, Operators, Shift leaders).
function selectedBlocks() { return periodBlocks(); }
function passesFilters(b) {
  for (const k of OTHER_REPORT_LIVE) {
    const f = filters[k], def = FILTER_DEFS[k];
    if (!f || !f.values.size || !def.blockVals) continue;
    const hit = def.blockVals(b).some(v => f.values.has(v));
    if (f.inverted ? hit : !hit) return false;
  }
  return true;
}
function periodBlocks() {
  return blocksForRange(rangeStart, rangeEnd, SHIFT_BLOCKS).filter(passesFilters);
}

// Downtime's input: the period's stops and segments that pass every filter.
function downtimeBase() {
  if (!rangeStart || !rangeEnd) return { stops: [], segs: [], allSegs: [], range: [new Date(), new Date()] };
  const pd = periodData(rangeStart, rangeEnd);
  const tagOk = tagsFilterPredicate();
  return {
    stops: pd.stops.filter(s => stopPasses(s) && tagOk(s)),
    segs: pd.segs.filter(segPasses),
    allSegs: pd.segs,
    range: [rangeStart, rangeEnd],
  };
}

// ── OEE chart-type toggle (Line / Bar) ─────────────────────────────────────
// Line is only drawn on the Day axis with no split; on categorical axes or in
// split mode the chart is always bars (the toggle still records the preference
// so switching back to Day restores the line view).
function toggleOeeChartTypeDropdown(event) {
  event.stopPropagation();
  const dd = document.getElementById('oee-charttype-dropdown');
  const wasOpen = dd.classList.contains('open');
  document.querySelectorAll('.xaxis-dropdown, .filter-dropdown').forEach(el => el.classList.remove('open'));
  if (wasOpen) return;
  dd.innerHTML = '';
  [{ val:'line', label:'Line chart' }, { val:'bar', label:'Bar chart' }].forEach(opt => {
    const el = document.createElement('div');
    el.className = 'xaxis-opt' + (oeeChartType === opt.val ? ' selected' : '');
    el.textContent = opt.label;
    el.addEventListener('click', e => { e.stopPropagation(); selectOeeChartType(opt.val, opt.label); });
    dd.appendChild(el);
  });
  dd.classList.add('open');
}

function selectOeeChartType(val, label) {
  oeeChartType = val;
  _oeePage = 0; _tblPage.oee = 0;
  document.getElementById('oee-charttype-dropdown').classList.remove('open');
  setChipLabel('oee-charttype-btn', label);
  drawOeeChart();
}

// ── OEE "X-axis" dropdown (Day / Operators / Operator group) ────────────────
function toggleOeeXAxisDropdown(event) {
  event.stopPropagation();
  const dd = document.getElementById('oee-xaxis-dropdown');
  const wasOpen = dd.classList.contains('open');
  document.querySelectorAll('.xaxis-dropdown, .filter-dropdown').forEach(el => el.classList.remove('open'));
  if (wasOpen) return;
  dd.innerHTML = '';
  ['Day', 'Operators', 'Operator groups', 'Shift leaders'].forEach(opt => {
    const el = document.createElement('div');
    el.className = 'xaxis-opt' + (oeeXAxis === opt ? ' selected' : '');
    el.textContent = opt;
    el.addEventListener('click', e => { e.stopPropagation(); selectOeeXAxis(opt); });
    dd.appendChild(el);
  });
  dd.classList.add('open');
}

function selectOeeXAxis(opt) {
  oeeXAxis = opt;
  if (oeeSplitBy === opt) {
    oeeSplitBy = null;
    setChipLabel('oee-splitby-btn', 'Split by: –');
    setChipActive('oee-splitby-btn', false);
  }
  _oeePage = 0; _tblPage.oee = 0;
  document.getElementById('oee-xaxis-dropdown').classList.remove('open');
  setChipLabel('oee-xaxis-btn', 'X-axis: ' + opt);
  drawOeeChart();
}

// ── OEE "Split by" dropdown (Shift leader) ──────────────────────────────────
function toggleOeeSplitDropdown(event) {
  event.stopPropagation();
  const dd = document.getElementById('oee-splitby-dropdown');
  const wasOpen = dd.classList.contains('open');
  document.querySelectorAll('.xaxis-dropdown, .filter-dropdown').forEach(el => el.classList.remove('open'));
  if (wasOpen) return;
  dd.innerHTML = '';
  splitOptionsFor(oeeXAxis).forEach(opt => {
    const el = document.createElement('div');
    el.className = 'xaxis-opt' + (oeeSplitBy === opt.val ? ' selected' : '');
    el.textContent = opt.label;
    el.addEventListener('click', e => { e.stopPropagation(); selectOeeSplit(opt.val); });
    dd.appendChild(el);
  });
  dd.classList.add('open');
}

function selectOeeSplit(val) {
  oeeSplitBy = val;
  _oeeHiddenLeaders = new Set();
  _oeePage = 0; _tblPage.oee = 0;
  document.getElementById('oee-splitby-dropdown').classList.remove('open');
  setChipLabel('oee-splitby-btn', 'Split by: ' + (val || '–'));
  setChipActive('oee-splitby-btn', val);
  drawOeeChart();
}

// Map an OEE axis/split label → a dimension key for the matrix builder.
function oeeDimKey(label) {
  if (label === 'Operator groups') return 'group';
  if (label === 'Shift leaders')  return 'leader';
  if (label === 'Day')            return 'day';
  return 'operator'; // 'Operators' (and anything else categorical)
}

// OEE bar chart — Evocon's grouped-bar layout (see ref screenshots).
//   No split:   one cluster per X-axis category (operator / group / leader),
//               each cluster = the 4 OEE % component bars.
//   With split: two-level layout — X-axis category is the top cluster, the
//               split-by value is the sub-cluster, each holding the 4 bars.
// Components are separate bars (OEE = A×P×Q is multiplicative, never stacked).
// Manhours is NOT charted — it appears only in the data table below.
// _oeeHiddenLeaders hides COMPONENT metrics (legend = metrics, like Evocon).
function drawOeeBars(chart, width, height) {
  const split = !!oeeSplitBy;
  // Outer dim = the OEE X-axis. Day maps to the 'day' dimension, so a Day bar
  // view (and Day × split) shows real per-day clusters from the blocks.
  const outerDim = oeeDimKey(oeeXAxis);
  // Inner dim = the split-by, or a single implicit bucket when not splitting.
  const innerDim = split ? oeeDimKey(oeeSplitBy) : outerDim;
  const { data, innerLabels, outerHeader, innerHeader } =
    oeeMatrixFromBlocks(selectedBlocks(), outerDim, innerDim);
  const labels = OEE_DIMS[outerDim].labels();
  // When not splitting, collapse each category to one sub-cluster keyed by the
  // category itself (the diagonal cell data[cat][cat] holds that category's roll-up).
  const inners = split ? innerLabels : labels;

  const METRICS = [
    { key:'quality',      label:'Quality',      color:'#ff9800' },
    { key:'performance',  label:'Performance',  color:'#fdd835' },
    { key:'availability', label:'Availability', color:'#2ecc71' },
    { key:'oee',          label:'OEE',          color:'#212121' },
  ];
  const metrics = METRICS.filter(m => !_oeeHiddenLeaders.has(m.key));

  // For each category, the inner values that actually have data. No split → the
  // single self-cell (cat,cat); split → every present split value.
  const innersForCat = (cat) => split
    ? inners.filter(l => data[cat] && data[cat][l])
    : (data[cat] && data[cat][cat] ? [cat] : []);

  // Only categories with ≥1 populated sub-cluster.
  const allCats = labels.filter(c => innersForCat(c).length);
  // Paginate — too many clusters become unreadably thin (Evocon paginates too).
  const pageCount = Math.max(1, Math.ceil(allCats.length / OEE_CATS_PER_PAGE));
  if (_oeePage >= pageCount) _oeePage = pageCount - 1;
  const cats = allCats.slice(_oeePage * OEE_CATS_PER_PAGE, (_oeePage + 1) * OEE_CATS_PER_PAGE);

  const y  = d3.scaleLinear().domain([0, 110]).range([height, 0]);
  const x0 = d3.scaleBand().domain(cats).range([0, width]).paddingInner(0.25).paddingOuter(0.1);
  const tooltipEl = document.getElementById('chart-tooltip');

  // Gridlines
  chart.append('g')
    .call(d3.axisLeft(y).ticks(11).tickSize(-width).tickFormat(''))
    .call(ax => ax.select('.domain').remove())
    .call(ax => ax.selectAll('line').style('stroke', '#eeeeee'));

  const subTicks = []; // {x, label} sub-cluster labels — row 1 (split only)
  const catTicks = []; // {x, label} category labels — bottom row

  cats.forEach(cat => {
    const present = innersForCat(cat);
    const catG = chart.append('g').attr('transform', `translate(${x0(cat)},0)`);
    // Sub-cluster band: one slot per present inner value (1 slot when not split).
    const x1 = d3.scaleBand().domain(present).range([0, x0.bandwidth()]).paddingInner(0.18).paddingOuter(split ? 0.05 : 0.18);
    // Component band inside each sub-cluster.
    const x2 = d3.scaleBand().domain(metrics.map(m => m.key)).range([0, x1.bandwidth()]).padding(0.12);

    present.forEach(l => {
      const sub = catG.append('g').attr('transform', `translate(${x1(l)},0)`);
      const vals = data[cat][l];
      metrics.forEach(m => {
        const v = vals[m.key] || 0;
        sub.append('rect')
          .attr('x', x2(m.key)).attr('width', x2.bandwidth())
          .attr('y', y(v)).attr('height', height - y(v))
          .attr('fill', m.color).attr('rx', 1)
          .on('mousemove', (event) => {
            if (!tooltipEl) return;
            const title = split ? `${cat} — ${l}` : cat;
            tooltipEl.innerHTML =
              `<div style="font-family:'Open Sans',sans-serif;font-size:12px;">` +
              `<div style="font-weight:600;margin-bottom:2px;">${title}</div>` +
              `<div>${m.label}: <b>${v.toFixed(1)}%</b></div></div>`;
            tooltipEl.style.display = 'block';
            tooltipEl.style.left = (event.offsetX + 64) + 'px';
            tooltipEl.style.top  = (event.offsetY + 24) + 'px';
          })
          .on('mouseleave', () => { if (tooltipEl) tooltipEl.style.display = 'none'; });
      });
      if (split) subTicks.push({ x: x0(cat) + x1(l) + x1.bandwidth() / 2, label: l });
    });
    catTicks.push({ x: x0(cat) + x0.bandwidth() / 2, label: cat });
  });

  // Baseline
  chart.append('line').attr('x1', 0).attr('x2', width).attr('y1', height).attr('y2', height).style('stroke', '#e0e0e0');

  // Row 1 — sub-cluster labels (split mode only)
  if (split) {
    chart.append('g').selectAll('text.sub').data(subTicks).join('text')
      .attr('x', d => d.x).attr('y', height + 14).attr('text-anchor', 'middle')
      .style('font-family','Inter,sans-serif').style('font-size','10px').style('fill','#616161')
      .text(d => d.label);
  }
  // Category labels — row 2 in split mode, the only row otherwise.
  chart.append('g').selectAll('text.cat').data(catTicks).join('text')
    .attr('x', d => d.x).attr('y', height + (split ? 30 : 16)).attr('text-anchor', 'middle')
    .style('font-family','Inter,sans-serif').style('font-size','11px').style('font-weight','600').style('fill','#424242')
    .text(d => d.label);

  // Y axis (left, %)
  const yAxisG = chart.append('g').call(d3.axisLeft(y).ticks(11).tickFormat(d => d + '%').tickSize(0));
  yAxisG.select('.domain').remove();
  yAxisG.selectAll('text').style('font-family','Inter,sans-serif').style('font-size','11px').style('fill','#616161');

  // Legend — the 4 component metrics. Click any to hide/show.
  const legendEl = document.getElementById('oee-chart-legend');
  legendEl.innerHTML = '';
  METRICS.forEach(m => {
    const hidden = _oeeHiddenLeaders.has(m.key);
    const item = document.createElement('div');
    item.style.cssText = 'display:flex;align-items:center;gap:6px;cursor:pointer;opacity:' + (hidden ? '0.4' : '1') + ';';
    item.innerHTML = `<span style="display:inline-block;width:14px;height:14px;border-radius:2px;background:${m.color};flex-shrink:0;"></span><span style="font-family:'Open Sans',sans-serif;font-size:12px;color:#212121;">${m.label}</span>`;
    item.addEventListener('click', () => {
      if (_oeeHiddenLeaders.has(m.key)) _oeeHiddenLeaders.delete(m.key);
      else _oeeHiddenLeaders.add(m.key);
      drawOeeChart();
    });
    legendEl.appendChild(item);
  });

  // Pager (only when more than one page of category clusters).
  renderOeePager(allCats.length, pageCount);

  // Data table. Spec: in split mode the table follows existing Reports
  // behaviour and shows the main X-axis data only — the split lives in the
  // chart; the table's people columns say who was in each row.
  renderOeeMainTable(oeeTableRows(selectedBlocks(), outerDim), OEE_DIMS[outerDim].header);
}

// Pager for the OEE split chart — N category clusters per page.
function renderOeePager(totalCats, pageCount) {
  renderChartPager('oee-pager', totalCats, pageCount, _oeePage, OEE_CATS_PER_PAGE, p => { _oeePage = p; drawOeeChart(); });
}

// The chart footer, as live: "Items per page 100 ▾   1-10/10   ‹ ›".
function renderChartPager(id, total, pageCount, page, per, go) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = 'flex';
  const from = total ? page * per + 1 : 0, to = Math.min(total, (page + 1) * per);
  const chev = (dir, off) =>
    `<button class="chart-pg" data-dir="${dir}" ${off ? 'disabled' : ''}>` +
    icn(dir < 0 ? 'chevLeft' : 'chevRight', 24, off ? '#bdbdbd' : '#616161') + `</button>`;
  el.innerHTML =
    `<span class="chart-pg-label">Items per page</span>` +
    `<span class="chart-pg-size">${per}${icn('caret', 24, '#616161')}</span>` +
    `<span class="chart-pg-range">${from}-${to}/${total}</span>` +
    chev(-1, page === 0) + chev(1, page >= pageCount - 1);
  el.querySelectorAll('.chart-pg').forEach(b => b.addEventListener('click', () => {
    const p = page + Number(b.dataset.dir);
    if (p >= 0 && p < pageCount) go(p);
  }));
}

// Minutes → "Xh Ym" (readable time format, like the OEE.csv columns).
function fmtMin(min) {
  const m = Math.round(min || 0);
  const h = Math.floor(m / 60), mm = m % 60;
  return h > 0 ? `${h}h ${String(mm).padStart(2,'0')}m` : `${mm}m`;
}

// ── Generic styled data table (shared by OEE + Quantities) ──────────────────
// Produces the same chrome as the Downtime table: a sticky first column
// (dt-fixed), styled headers with the dimension icon, zebra rows, a bold Total
// row, horizontal scroll, and a paginated footer. One renderer so all the
// report tables look identical.
//
// ctx = {
//   key,                 // 'oee' | 'qty' — drives element ids + page state
//   firstHeader,         // sticky first-column header label
//   cols: [{ label, align, render(row)->html }],   // the scrolling columns
//   rows,                // data rows; a row with _total:true renders as the bold Total
// }
// Page state is held per key in _tblPage; the footer prev/next re-render.
const _tblPage = { oee: 0, qty: 0 };
const TBL_PER_PAGE = 10;
let _tblCtx = { oee: null, qty: null }; // last ctx, so the pager can re-render

function renderStyledTable(ctx) {
  _tblCtx[ctx.key] = ctx;
  const wrap = document.getElementById(ctx.key + '-table-wrap');
  const head = document.getElementById(ctx.key + '-head');
  const body = document.getElementById(ctx.key + '-body');
  if (!wrap || !head || !body) return;
  wrap.style.display = '';

  // Separate the Total row — it always pins to the bottom, off-pagination.
  const dataRows  = ctx.rows.filter(r => !r._total);
  const totalRow  = ctx.rows.find(r => r._total) || null;
  const pageCount = Math.max(1, Math.ceil(dataRows.length / TBL_PER_PAGE));
  if (_tblPage[ctx.key] >= pageCount) _tblPage[ctx.key] = pageCount - 1;
  const pg    = _tblPage[ctx.key];
  const start = pg * TBL_PER_PAGE;
  const end   = Math.min(start + TBL_PER_PAGE, dataRows.length);
  const page  = dataRows.slice(start, end);

  // Header — sticky first col + scrolling cols.
  let headHtml = `<tr style="height:32px;">`;
  headHtml += `<th class="dt-fixed" style="text-align:left;padding:0 16px;font-family:'Open Sans',sans-serif;font-size:13px;font-weight:600;color:#424242;position:sticky;left:0;">`
    + `<div class="dt-th-inner">${icn('xAxis', 16, '#424242')}&nbsp;${ctx.firstHeader}</div></th>`;
  ctx.cols.forEach(c => {
    const right = c.align === 'right';
    headHtml += `<th style="text-align:${right?'right':'left'};white-space:nowrap;padding:0 16px 0 8px;font-family:'Open Sans',sans-serif;font-size:12px;font-weight:600;color:#424242;">`
      + `<div class="dt-th-inner ${right?'right':''}">${c.label}</div></th>`;
  });
  headHtml += `</tr>`;
  head.innerHTML = headHtml;

  // Body
  const cellTd = (html, align, bold) =>
    `<td style="text-align:${align==='right'?'right':'left'};font-family:'Open Sans',sans-serif;font-variant-numeric:tabular-nums;font-size:14px;${bold?'font-weight:600;':''}color:#212121;vertical-align:middle;padding:6px 16px 6px 8px;white-space:nowrap;">${html}</td>`;
  const firstTd = (label, rowClass) =>
    `<td class="dt-fixed" style="font-family:'Open Sans',sans-serif;font-size:14px;font-weight:600;color:#212121;vertical-align:middle;padding:6px 16px;"><div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${label}</div></td>`;

  let bodyHtml = '';
  page.forEach((r, i) => {
    const rowClass = (start + i) % 2 === 0 ? 'dt-row-even' : 'dt-row-odd';
    bodyHtml += `<tr class="${rowClass}" style="height:44px;">`;
    bodyHtml += firstTd(r.name, rowClass);
    ctx.cols.forEach(c => { bodyHtml += cellTd(c.render(r), c.align, false); });
    bodyHtml += `</tr>`;
  });
  if (totalRow) {
    bodyHtml += `<tr class="dt-row-total" style="height:44px;">`;
    bodyHtml += firstTd('Total');
    ctx.cols.forEach(c => { bodyHtml += cellTd(c.render(totalRow), c.align, true); });
    bodyHtml += `</tr>`;
  }
  body.innerHTML = bodyHtml;

  // Footer pagination
  const info = document.getElementById(ctx.key + '-tbl-page-info');
  const prev = document.getElementById(ctx.key + '-tbl-prev');
  const next = document.getElementById(ctx.key + '-tbl-next');
  if (info) info.textContent = dataRows.length ? `${start + 1}–${end} / ${dataRows.length}` : '0 / 0';
  if (prev) prev.disabled = pg === 0;
  if (next) next.disabled = end >= dataRows.length;
}

// Pager handlers (wired from the footer buttons in index.html).
function _tblPrev(key) { if (_tblPage[key] > 0) { _tblPage[key]--; if (_tblCtx[key]) renderStyledTable(_tblCtx[key]); } }
function _tblNext(key) {
  const ctx = _tblCtx[key]; if (!ctx) return;
  const n = ctx.rows.filter(r => !r._total).length;
  if ((_tblPage[key] + 1) * TBL_PER_PAGE < n) { _tblPage[key]++; renderStyledTable(ctx); }
}
function oeeTblPrev() { _tblPrev('oee'); }
function oeeTblNext() { _tblNext('oee'); }
function qtyTblPrev() { _tblPrev('qty'); }
function qtyTblNext() { _tblNext('qty'); }


// Format one OEE_TABLE_COLS cell value for a row.
function oeeCellValue(c, r) {
  if (c.type === 'descr')       return r[c.key] || (r._total ? '' : '—');
  else if (c.type === 'metric') return (r[c.key]).toFixed(1) + '%';
  else if (c.type === 'hours')  return (r[c.key]).toFixed(0) + 'h';
  else if (c.type === 'time')   return fmtMin(r[c.key]);
  else if (c.type === 'qty')    return Math.round(r[c.key]).toLocaleString();
  return r[c.key];
}

// The proper OEE report data table (mirrors OEE.csv / screenshot): a dynamic
// first column = the current X-axis dimension, then the full OEE columns, then a
// bold Total row. Rows derive from blocks so they reconcile with chart + chips.
function renderOeeMainTable(rows, firstHeader) {
  const cc = document.getElementById('oee-col-count');
  if (cc) cc.textContent = 'Columns: ' + (OEE_TABLE_COLS.length + 1);
  renderStyledTable({
    key: 'oee',
    firstHeader,
    cols: OEE_TABLE_COLS.map(c => ({
      label: c.label,
      align: c.type === 'descr' ? 'left' : 'right',
      render: r => oeeCellValue(c, r),
    })),
    rows,
  });
}

function drawOeeChart() {
  const container = document.getElementById('oee-chart-container');
  const W = container.clientWidth;
  const H = container.clientHeight;
  // A line chart is only meaningful on the Day (time) axis with no split.
  // Anything categorical, or any split, renders as bars — and the user's Bar
  // toggle forces bars on the Day axis too.
  const lineMode = oeeChartType === 'line' && oeeXAxis === 'Day' && !oeeSplitBy;

  // Bars (split or single-cluster) use a roomier bottom margin (two x-axis rows
  // in split mode); the line chart keeps the tighter margin.
  const margin = { top: 16, right: 24, bottom: oeeSplitBy ? 52 : 40, left: 56 };
  const width  = W - margin.left - margin.right;
  const height = H - margin.top  - margin.bottom;

  d3.select('#oee-chart-container').selectAll('svg').remove();
  const svg   = d3.select('#oee-chart-container').append('svg').attr('width', W).attr('height', H);
  const chart = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  // Bar path: grouped (split) or single-cluster (no split). One cluster per
  // X-axis category; bars inside = the 4 OEE % components (A×P×Q is
  // multiplicative, never stacked). Manhours is NOT charted — it lives in the
  // data table only.
  if (!lineMode) {
    drawOeeBars(chart, width, height);
    return;
  }

  // Line path (Day axis, no split): no pager. The points are rolled up from the
  // same blocks as the Day table under the chart, so each point is its row.
  const _pg = document.getElementById('oee-pager');
  if (_pg) _pg.style.display = 'none';
  const series = oeeDailySeries(periodBlocks(), [rangeStart, rangeEnd]);
  renderOeeMainTable(oeeTableRows(selectedBlocks(), 'day'), OEE_DIMS.day.header);
  if (!series.length) return;

  const x = d3.scaleLinear().domain([1, Math.max(2, series.length)]).range([0, width]);
  const y = d3.scaleLinear().domain([0, 100]).range([height, 0]);

  // Horizontal gridlines
  chart.append('g')
    .call(d3.axisLeft(y).ticks(10).tickSize(-width).tickFormat(''))
    .call(ax => ax.select('.domain').remove())
    .call(ax => ax.selectAll('line').style('stroke', '#eeeeee'));

  // ── Main solid lines ──────────────────────────────────────────────────────
  OEE_LINES.forEach(line => {
    const lineGen = d3.line()
      .x(d => x(d.day))
      .y(d => y(d[line.key]))
      .curve(d3.curveMonotoneX);

    chart.append('path').datum(series)
      .attr('class', `oee-line-main line-main-${line.key}`)
      .attr('fill', 'none').attr('stroke', line.color).attr('stroke-width', 2)
      .attr('d', lineGen);
  });

  // ── Main dots ─────────────────────────────────────────────────────────────
  OEE_LINES.forEach(line => {
    chart.selectAll(`.dot-${line.key}`).data(series).join('circle')
      .attr('class', `dot-${line.key}`)
      .attr('cx', d => x(d.day)).attr('cy', d => y(d[line.key]))
      .attr('r', 4).attr('fill', line.color).attr('stroke', 'white').attr('stroke-width', 1.5);
  });

  // X axis
  const xAxisG = chart.append('g').attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(series.length).tickFormat(d => (series[d - 1] ? series[d - 1].label : '')).tickSize(0));
  xAxisG.select('.domain').style('stroke', '#e0e0e0');
  xAxisG.selectAll('text').style('font-family','Inter,sans-serif').style('font-size','11px').style('fill','#616161').attr('dy','1.4em');

  // Y axis
  const yAxisG = chart.append('g')
    .call(d3.axisLeft(y).ticks(10).tickFormat(d => d + '%').tickSize(0));
  yAxisG.select('.domain').remove();
  yAxisG.selectAll('text').style('font-family','Inter,sans-serif').style('font-size','11px').style('fill','#616161');

  // ── Column background rects (visual highlight, pointer-events:none) ───────
  const gapHalf = (x(2) - x(1)) / 2;
  chart.selectAll('.oee-col-bg').data(series).join('rect')
    .attr('class', 'oee-col-bg')
    .attr('x', (d, i) => i === 0 ? 0 : x(d.day) - gapHalf)
    .attr('y', 0)
    .attr('width', (d, i) => {
      const left  = i === 0 ? 0 : x(d.day) - gapHalf;
      const right = i === series.length - 1 ? width : x(d.day) + gapHalf;
      return right - left;
    })
    .attr('height', height)
    .attr('fill', 'transparent')
    .style('pointer-events', 'none');

  // ── Tooltip helpers ───────────────────────────────────────────────────────
  const tooltipEl = document.getElementById('chart-tooltip');
  const fmtPct = v => v.toFixed(2).replace('.', ',') + '%';
  const icoDot = (color) => {
    return color
      ? `<svg width="8" height="8" viewBox="0 0 8 8" style="flex-shrink:0"><circle cx="4" cy="4" r="4" fill="${color}"/></svg>`
      : `<svg width="8" height="8" viewBox="0 0 8 8" style="flex-shrink:0"><circle cx="4" cy="4" r="3" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="1.5"/></svg>`;
  };
  const oeeDayIcon = `<svg width="12" height="12" viewBox="0 0 16 13" fill="rgba(255,255,255,0.55)" style="flex-shrink:0"><rect x="0" y="5" width="3" height="8" rx="1"/><rect x="4.5" y="2" width="3" height="11" rx="1"/><rect x="9" y="0" width="3" height="13" rx="1"/><rect x="13.5" y="4" width="2.5" height="9" rx="1"/></svg>`;

  function moveTooltip(event) {
    const tw = tooltipEl.offsetWidth, th = tooltipEl.offsetHeight;
    let tx = event.clientX + 14, ty = event.clientY - 10;
    if (tx + tw > window.innerWidth  - 8) tx = event.clientX - tw - 14;
    if (ty + th > window.innerHeight - 8) ty = event.clientY - th + 10;
    tooltipEl.style.left = tx + 'px'; tooltipEl.style.top = ty + 'px';
  }

  const tipRow = (dot, label, value) =>
    `<div style="display:flex;align-items:center;gap:2px;">`
    + `<div style="display:flex;align-items:center;padding-right:4px;padding-top:2px;padding-bottom:2px;flex-shrink:0;">${dot}</div>`
    + `<span style="font-family:'Open Sans',sans-serif;font-size:10px;font-weight:600;color:#cccccc;letter-spacing:0.8px;text-transform:uppercase;line-height:16px;white-space:nowrap;">${label}:</span>`
    + `<span style="font-family:'Open Sans',sans-serif;font-size:12px;font-weight:400;color:white;line-height:16px;white-space:nowrap;">${value}</span>`
    + `</div>`;

  function showDayTooltip(event, d) {
    const date = addDays(rangeStart, d.day - 1);
    let html = '';

    html += `<div style="display:flex;align-items:center;gap:4px;font-family:'Open Sans',sans-serif;font-size:10px;font-weight:600;color:white;letter-spacing:0.8px;text-transform:uppercase;line-height:16px;">`
          + `<div style="display:flex;align-items:center;padding-right:4px;flex-shrink:0;">${oeeDayIcon}</div>`
          + `<span>DAY</span>`
          + `</div>`
          + `<div style="font-family:'Open Sans',sans-serif;font-size:16px;font-weight:600;color:white;line-height:24px;">${fmtDMY(date)}</div>`;

    html += tipRow(icoDot(null),      'OEE',          fmtPct(d.oee));
    html += tipRow(icoDot('#2ecc71'), 'AVAILABILITY', fmtPct(d.availability));
    html += tipRow(icoDot('#fdd835'), 'PERFORMANCE',  fmtPct(d.performance));
    html += tipRow(icoDot('#ff9800'), 'QUALITY',      fmtPct(d.quality));
    tooltipEl.innerHTML = html;
    tooltipEl.style.display = 'block';
    moveTooltip(event);
  }

  // ── Transparent overlay for unified mouse handling ────────────────────────
  const overlay = chart.append('rect')
    .attr('width', width).attr('height', height)
    .attr('fill', 'transparent');

  let _hoveredColIdx = -1;

  overlay
    .on('mousemove', function(event) {
      const [mx, my] = d3.pointer(event);

      // Find column index
      let colIdx = -1;
      for (let i = 0; i < series.length; i++) {
        const cx = x(series[i].day);
        const left  = i === 0 ? 0 : (cx + x(series[i-1].day)) / 2;
        const right = i === series.length - 1 ? width : (cx + x(series[i+1].day)) / 2;
        if (mx >= left && mx <= right) { colIdx = i; break; }
      }

      // Highlight column
      if (colIdx !== _hoveredColIdx) {
        _hoveredColIdx = colIdx;
        chart.selectAll('.oee-col-bg')
          .attr('fill', (d, i) => i === colIdx ? 'rgba(46,204,113,0.08)' : 'transparent');
      }

      if (colIdx === -1) {
        tooltipEl.style.display = 'none';
        return;
      }

      const d = series[colIdx];

      showDayTooltip(event, d);
      moveTooltip(event);
    })
    .on('mouseleave', function() {
      _hoveredColIdx = -1;
      chart.selectAll('.oee-col-bg').attr('fill', 'transparent');
      tooltipEl.style.display = 'none';
    });

  // Legend
  const legendEl = document.getElementById('oee-chart-legend');
  legendEl.innerHTML = '';
  OEE_LINES.forEach(line => {
    const item = document.createElement('div');
    item.style.cssText = 'display:flex;align-items:center;gap:6px;';
    item.innerHTML = `<span style="display:inline-block;width:14px;height:14px;border-radius:2px;background:${line.color};flex-shrink:0;"></span><span style="font-family:'Open Sans',sans-serif;font-size:12px;color:#212121;">${line.label}</span>`;
    legendEl.appendChild(item);
  });
}

// ── Quantities report ───────────────────────────────────────────────────────
// Stacked bar chart (Figma 2045-7344): per X-axis value, Scrap + Good quality +
// Potential stack up to the ideal output. Derived from SHIFT_BLOCKS, so it
// reconciles with OEE and the filter chips. Controls mirror OEE (X-axis / Split
// by); Y-axis is fixed to "Quantity (primary unit)".

function toggleQtyXAxisDropdown(event) {
  event.stopPropagation();
  const dd = document.getElementById('qty-xaxis-dropdown');
  const wasOpen = dd.classList.contains('open');
  document.querySelectorAll('.xaxis-dropdown, .filter-dropdown').forEach(el => el.classList.remove('open'));
  if (wasOpen) return;
  dd.innerHTML = '';
  ['Day', 'Operators', 'Operator groups', 'Shift leaders'].forEach(opt => {
    const el = document.createElement('div');
    el.className = 'xaxis-opt' + (qtyXAxis === opt ? ' selected' : '');
    el.textContent = opt;
    el.addEventListener('click', e => { e.stopPropagation(); selectQtyXAxis(opt); });
    dd.appendChild(el);
  });
  dd.classList.add('open');
}
function selectQtyXAxis(opt) {
  qtyXAxis = opt;
  if (qtySplitBy === opt) {
    qtySplitBy = null;
    setChipLabel('qty-splitby-btn', 'Split by: –');
    setChipActive('qty-splitby-btn', false);
  }
  _qtyPage = 0; _tblPage.qty = 0;
  document.getElementById('qty-xaxis-dropdown').classList.remove('open');
  setChipLabel('qty-xaxis-btn', 'X-axis: ' + opt);
  drawQtyChart();
}

function toggleQtySplitDropdown(event) {
  event.stopPropagation();
  const dd = document.getElementById('qty-splitby-dropdown');
  const wasOpen = dd.classList.contains('open');
  document.querySelectorAll('.xaxis-dropdown, .filter-dropdown').forEach(el => el.classList.remove('open'));
  if (wasOpen) return;
  dd.innerHTML = '';
  splitOptionsFor(qtyXAxis).forEach(opt => {
    const el = document.createElement('div');
    el.className = 'xaxis-opt' + (qtySplitBy === opt.val ? ' selected' : '');
    el.textContent = opt.label;
    el.addEventListener('click', e => { e.stopPropagation(); selectQtySplit(opt.val); });
    dd.appendChild(el);
  });
  dd.classList.add('open');
}
function selectQtySplit(val) {
  qtySplitBy = val;
  _qtyPage = 0; _tblPage.qty = 0;
  document.getElementById('qty-splitby-dropdown').classList.remove('open');
  setChipLabel('qty-splitby-btn', 'Split by: ' + (val || '–'));
  setChipActive('qty-splitby-btn', val);
  drawQtyChart();
}

// Format a quantity for axis / tooltip — thousands spaced like Evocon ("4 000").
function fmtQty(n) {
  return Math.round(n || 0).toLocaleString('en-US').replace(/,/g, ' ');
}

// The quantities pager (N bars per page).
function renderQtyPager(totalCats, pageCount) {
  renderChartPager('qty-pager', totalCats, pageCount, _qtyPage, QTY_CATS_PER_PAGE, p => { _qtyPage = p; drawQtyChart(); });
}

// Quantities data table — dynamic first column + descr + qty columns + Total row.
// Uses the shared styled-table renderer (same chrome as Downtime / OEE).
function renderQtyTable(rows, firstHeader) {
  const cc = document.getElementById('qty-col-count');
  if (cc) cc.textContent = 'Columns: ' + (QTY_TABLE_COLS.length + 1);
  renderStyledTable({
    key: 'qty',
    firstHeader,
    cols: QTY_TABLE_COLS.map(c => ({
      label: c.label,
      align: c.type === 'descr' ? 'left' : 'right',
      render: r => c.type === 'descr' ? (r[c.key] || (r._total ? '' : '—'))
                 : c.type === 'hours' ? (r[c.key] || 0).toFixed(0) + 'h'
                 : fmtQty(r[c.key]),
    })),
    rows,
  });
}

function drawQtyChart() {
  const container = document.getElementById('qty-chart-container');
  const W = container.clientWidth;
  const H = container.clientHeight;
  const split = !!qtySplitBy;
  // Split mode: bar labels and category labels run diagonally below the axis,
  // as on the live chart, so the bottom margin makes room for both rows.
  const margin = { top: 24, right: 24, bottom: split ? 172 : 40, left: 72 };
  const width  = W - margin.left - margin.right;
  const height = H - margin.top  - margin.bottom;

  d3.select('#qty-chart-container').selectAll('svg').remove();
  const svg   = d3.select('#qty-chart-container').append('svg').attr('width', W).attr('height', H);
  const chart = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
  const tooltipEl = document.getElementById('chart-tooltip');

  // Build the (outer, inner) cells. Day axis → one cell per day; categorical
  // axes → the matrix (self-cell when not split, split cells when split).
  let cats, innersForCat, cellOf, catLabel, outerHeader, inners;
  if (qtyXAxis === 'Day' && !split) {
    const days = qtyByDay(selectedBlocks());
    const byKey = {}; days.forEach(d => byKey[d.name] = d);
    cats = days.map(d => d.name);
    inners = [null];
    innersForCat = () => [null];
    cellOf = (cat) => byKey[cat];
    catLabel = (cat) => String(cat);
    outerHeader = 'Day';
  } else {
    const outerDim = oeeDimKey(qtyXAxis);
    const innerDim = split ? oeeDimKey(qtySplitBy) : outerDim;
    const m = qtyMatrixFromBlocks(selectedBlocks(), outerDim, innerDim);
    inners = split ? m.innerLabels : m.labels;
    cellOf = (cat, l) => m.data[cat] && m.data[cat][split ? l : cat];
    innersForCat = (cat) => split
      ? inners.filter(l => m.data[cat] && m.data[cat][l])
      : (m.data[cat] && m.data[cat][cat] ? [cat] : []);
    cats = m.labels.filter(c => innersForCat(c).length);
    catLabel = (cat) => String(cat);
    outerHeader = m.outerHeader;
  }

  // Paginate.
  const pageCount = Math.max(1, Math.ceil(cats.length / QTY_CATS_PER_PAGE));
  if (_qtyPage >= pageCount) _qtyPage = pageCount - 1;
  const allCats = cats;
  cats = cats.slice(_qtyPage * QTY_CATS_PER_PAGE, (_qtyPage + 1) * QTY_CATS_PER_PAGE);

  // Y domain = max stacked total (ideal output) across visible cells.
  let maxTotal = 0;
  cats.forEach(cat => innersForCat(cat).forEach(l => {
    const d = cellOf(cat, l); if (d) maxTotal = Math.max(maxTotal, d.idealQty || 0);
  }));
  const y  = d3.scaleLinear().domain([0, Math.max(10, maxTotal * 1.05)]).range([height, 0]).nice();

  // Bar slots, laid out flat across the chart: every bar is the same width, and
  // split clusters are separated by a gap — so a one-bar cluster doesn't
  // balloon to fill its category's band (live behaviour).
  const GAP = split ? 0.8 : 0;                 // gap between clusters, in slots
  const slots = [];                             // { cat, l, pos }
  let pos = 0;
  cats.forEach((cat, ci) => {
    if (ci > 0) pos += GAP;
    innersForCat(cat).forEach(l => { slots.push({ cat, l, pos }); pos += 1; });
  });
  const unit  = width / Math.max(1, pos + (split ? 0.6 : 0.2));
  const bw    = Math.min(unit * (split ? 0.72 : 0.8), 160);
  const slotX = sl => (sl.pos + (split ? 0.3 : 0.1)) * unit + (unit - bw) / 2;

  // Gridlines
  chart.append('g')
    .call(d3.axisLeft(y).ticks(8).tickSize(-width).tickFormat(''))
    .call(ax => ax.select('.domain').remove())
    .call(ax => ax.selectAll('line').style('stroke', '#eeeeee'));

  const AXIS_FONT = "'Open Sans',sans-serif";
  const order = QTY_SEGMENTS.filter(s => !_qtyHidden.has(s.key))
    .sort((a, b) => QTY_SEGMENTS.indexOf(b) - QTY_SEGMENTS.indexOf(a)); // scrap→good→potential
  const barCenters = new Map();                 // cat → [bar centre x]

  slots.forEach(sl => {
    const d = cellOf(sl.cat, sl.l);
    if (!d) return;
    const bx = slotX(sl);
    (barCenters.get(sl.cat) || barCenters.set(sl.cat, []).get(sl.cat)).push(bx + bw / 2);
    // Stack bottom→top: Scrap, then Good quantity, then Potential (top).
    let acc = 0;
    order.forEach(s => {
      const v = d[s.key] || 0;
      if (v <= 0) return;
      const yTop = y(acc + v), yBot = y(acc);
      chart.append('rect')
        .attr('x', bx).attr('width', bw)
        .attr('y', yTop).attr('height', Math.max(0, yBot - yTop))
        .attr('fill', s.color)
        .on('mousemove', (event) => {
          if (!tooltipEl) return;
          const title = split ? `${sl.cat} — ${sl.l}` : sl.cat;
          tooltipEl.innerHTML =
            `<div style="font-family:'Open Sans',sans-serif;font-size:12px;">` +
            `<div style="font-weight:600;margin-bottom:2px;">${title}</div>` +
            `<div>${s.label}: <b>${fmtQty(v)}</b></div></div>`;
          tooltipEl.style.display = 'block';
          tooltipEl.style.left = (event.offsetX + 72) + 'px';
          tooltipEl.style.top  = (event.offsetY + 24) + 'px';
        })
        .on('mouseleave', () => { if (tooltipEl) tooltipEl.style.display = 'none'; });
      // The value inside its segment, as live — only where it fits.
      if (yBot - yTop >= 18 && bw >= 56) {
        chart.append('text')
          .attr('x', bx + bw / 2).attr('y', (yTop + yBot) / 2 + 4).attr('text-anchor', 'middle')
          .style('font-family', AXIS_FONT).style('font-size', '12px').style('fill', '#212121')
          .style('pointer-events', 'none')
          .text(fmtQty(v));
      }
      acc += v;
    });
  });

  // Baseline, and a tick under every bar
  chart.append('line').attr('x1', 0).attr('x2', width).attr('y1', height).attr('y2', height).style('stroke', '#212121');
  barCenters.forEach(xs => xs.forEach(x =>
    chart.append('line').attr('x1', x).attr('x2', x).attr('y1', height).attr('y2', height + 6).style('stroke', '#212121')));

  if (split) {
    // The split value under each bar, then the category under its cluster —
    // both diagonal, reading down to the right, as on the live chart.
    slots.forEach(sl => {
      if (!cellOf(sl.cat, sl.l)) return;
      const x = slotX(sl) + bw / 2;
      chart.append('text').attr('transform', `translate(${x - 4},${height + 16}) rotate(45)`)
        .style('font-family', AXIS_FONT).style('font-size', '12px').style('fill', '#212121')
        .text(sl.l);
    });
    barCenters.forEach((xs, cat) => {
      const x = (xs[0] + xs[xs.length - 1]) / 2;
      chart.append('line').attr('x1', x).attr('x2', x).attr('y1', height + 92).attr('y2', height + 98).style('stroke', '#212121');
      chart.append('text').attr('transform', `translate(${x - 4},${height + 108}) rotate(45)`)
        .style('font-family', AXIS_FONT).style('font-size', '12px').style('fill', '#212121')
        .text(catLabel(cat));
    });
  } else {
    barCenters.forEach((xs, cat) => {
      chart.append('text').attr('x', xs[0]).attr('y', height + 22).attr('text-anchor', 'middle')
        .style('font-family', AXIS_FONT).style('font-size', '12px').style('fill', '#212121')
        .text(catLabel(cat));
    });
  }

  // Y axis (quantity)
  const yAxisG = chart.append('g').call(d3.axisLeft(y).ticks(8).tickFormat(d => fmtQty(d)).tickSize(0));
  yAxisG.select('.domain').remove();
  yAxisG.selectAll('text').style('font-family',"'Open Sans',sans-serif").style('font-size','12px').style('fill','#212121');

  // Legend — Potential / Good quantity / Scrap, click to toggle.
  const legendEl = document.getElementById('qty-chart-legend');
  legendEl.innerHTML = '';
  QTY_SEGMENTS.forEach(s => {
    const hidden = _qtyHidden.has(s.key);
    const item = document.createElement('div');
    item.style.cssText = 'display:flex;align-items:center;gap:6px;cursor:pointer;opacity:' + (hidden ? '0.4' : '1') + ';';
    item.innerHTML = `<span style="display:inline-block;width:14px;height:14px;border-radius:2px;background:${s.color};flex-shrink:0;"></span><span style="font-family:'Open Sans',sans-serif;font-size:12px;color:#212121;">${s.label}</span>`;
    item.addEventListener('click', () => {
      if (_qtyHidden.has(s.key)) _qtyHidden.delete(s.key); else _qtyHidden.add(s.key);
      drawQtyChart();
    });
    legendEl.appendChild(item);
  });

  // Pager
  renderQtyPager(allCats.length, pageCount);

  // Data table. Spec: in split mode the table shows the main X-axis data only
  // (existing Reports behaviour) — the split lives in the chart.
  if (qtyXAxis === 'Day') {
    // Day view: one table row per day (familiar to the OEE Day-less table).
    const days = qtyByDay(selectedBlocks());
    const rows = days.map(d => {
      const r = { ...d };
      QTY_TABLE_COLS.filter(c => c.type === 'descr').forEach(c => { r[c.key] = descrValues(d.blocks, c.key); });
      return r;
    });
    if (rows.length) {
      const tot = rollupQty(selectedBlocks()); tot.name = 'Total'; tot._total = true;
      tot.manhours = blockManhours(selectedBlocks());
      QTY_TABLE_COLS.filter(c => c.type === 'descr').forEach(c => { tot[c.key] = ''; });
      rows.push(tot);
    }
    renderQtyTable(rows, 'Day');
  } else {
    const outerDim = oeeDimKey(qtyXAxis);
    renderQtyTable(qtyTableRows(selectedBlocks(), outerDim), OEE_DIMS[outerDim].header);
  }
}

// ── Init ──────────────────────────────────────────────────────────────────────

decorateChartChips();      // icon + label + caret, before anything writes a value
setDisplayMonths(rangeStart, rangeEnd);
selectChipByPreset('last7');
updateFilterBtn();         // the date chip in its live form (‹ Last 7 days ›)
renderCalendars();
buildY2Dropdown();
loadTagsFilter();          // Tags and Tag type survive navigation (localStorage)
initChart();
buildXAxisDropdown();
initTableEvents();
renderActiveChips();       // filter bar: chips kept from an earlier visit (loadTagsFilter)
// The prototype panel (../shared/proto-panel.js) loads after this file and seeds
// window.__protoTagColumns; draw the table once more when it has.
window.addEventListener('DOMContentLoaded', () => { if (currentReport === 'downtime') drawDowntime(); });
