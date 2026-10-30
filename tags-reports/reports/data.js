// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  data.js — Model                                                             ║
// ║  Static constants, asset URLs, mock dataset, and pure utility functions.     ║
// ║  No DOM access. No app state. Safe to read in isolation.                     ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

// ── Calendar constants ────────────────────────────────────────────────────────

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
const DOW    = ['M','T','W','T','F','S','S'];

// ── Date-preset labels (shown on the filter-bar button) ───────────────────────

const PRESET_LABELS = {
  today: 'Today', yesterday: 'Yesterday', this_week: 'This week',
  last_week: 'Last week', last7: 'Last 7 days', this_month: 'This month',
  last_month: 'Last month', last30: 'Last 30 days', this_quarter: 'This quarter',
  last_quarter: 'Last quarter', last4quarters: 'Last 4 quarters',
  this_year: 'This year', last_year: 'Last year',
};

// ── X-axis options ────────────────────────────────────────────────────────────

// Product order, no separator. Every option except the time units is also a
// Split by option (Downtime).
const XAXIS_OPTIONS = [
  'Stop reasons', 'Stop groups', 'Machine locations', 'Stations',
  'Station groups', 'Factories', 'Operators', 'Operator groups', 'Shift leaders',
  'Tags',            // Downtime with the Tags feature on only (see buildXAxisDropdown)
  'Products', 'Product code', 'Orders', 'LOT/Batch', 'Product groups', 'Shifts',
  'Day', 'Day of the week', 'Week', 'Month', 'Quarter', 'Year'
];
const TIME_AXES = new Set(['Day','Day of the week','Week','Month','Quarter','Year']);

// ── Operator directory (role + group lookup by name) ────────────────────────
// Mock data uses comma-separated operator name strings; this directory lets
// the role/group dimensions resolve those strings into structured values.
// Roles flagged `enterprise:true` are visually disabled in the picker
// (greyed + ENTERPRISE pill); Pro tier sees only Operator + Supervisor.

const OPERATOR_ROLES = [
  { name: 'Operator',    enterprise: false },
  { name: 'Supervisor',  enterprise: false },
  { name: 'Quality',     enterprise: true  },
  { name: 'Maintenance', enterprise: true  },
  { name: 'Other',       enterprise: true  },
];

// Operator groups: four teams, each with its own shift leader. The group
// dimension / filter / Split-by all read from this list, sorted A–Z (see
// allGroupOptions for the variant with Unknown pinned on top).
const OPERATOR_GROUPS = ['Blue Team', 'Maintenance', 'Night Crew', 'Red Team'];

// Every operator appearing in the mock data → role, group, and whether they can
// lead a shift (Settings "Allow as shift leader"; drives the Shift-leaders
// X-axis / split / filter). Each team has a leader and a deputy who leads some
// of its shifts — so Split by Shift leaders shows two leaders per team, while
// every team, and every leader, still adds up exactly to the Total.
const OPERATOR_DIRECTORY = {
  // Blue Team
  'V. Mavroeidis':    { role: 'Supervisor', group: 'Blue Team',   canLead: true  },
  'M. Kostopoulou':   { role: 'Operator',   group: 'Blue Team',   canLead: true  },
  'G. Antoniou':      { role: 'Operator',   group: 'Blue Team',   canLead: false },
  'P. Lambrou':       { role: 'Operator',   group: 'Blue Team',   canLead: false },
  'A. Dimitriou':     { role: 'Operator',   group: 'Blue Team',   canLead: false },
  // Red Team
  'N. Papadopoulos':  { role: 'Supervisor', group: 'Red Team',    canLead: true  },
  'E. Christodoulou': { role: 'Operator',   group: 'Red Team',    canLead: false },
  'D. Ekonomou':      { role: 'Operator',   group: 'Red Team',    canLead: false },
  'K. Vlachos':       { role: 'Operator',   group: 'Red Team',    canLead: true  },
  'D. Roussou':       { role: 'Operator',   group: 'Red Team',    canLead: false },
  // Night Crew
  'I. Georgiou':      { role: 'Supervisor', group: 'Night Crew',  canLead: true  },
  'T. Karalis':       { role: 'Operator',   group: 'Night Crew',  canLead: true  },
  'L. Mitsou':        { role: 'Operator',   group: 'Night Crew',  canLead: false },
  'A. Petrou':        { role: 'Operator',   group: 'Night Crew',  canLead: false },
  // Maintenance
  'S. Nikolaou':      { role: 'Supervisor', group: 'Maintenance', canLead: true  },
  'S. Panagiotou':    { role: 'Operator',   group: 'Maintenance', canLead: true  },
  'H. Stavrou':       { role: 'Operator',   group: 'Maintenance', canLead: false },
};

// Operators allowed to lead a shift (mirrors Settings "Allow as shift leader").
const CAN_LEAD_OPERATORS = Object.keys(OPERATOR_DIRECTORY).filter(n => OPERATOR_DIRECTORY[n].canLead);

// ── Unknown: the people nobody named ─────────────────────────────────────────
// Reports have one non-person entry, "Unknown", and it behaves like an operator
// everywhere — filter list, X-axis / split-by categories, table rows, descr
// columns. It stands for the unnamed part of a shift, with a headcount:
//
//   Unknown ×0 — no operator was selected at all (an empty shift)
//   Unknown ×N — N additional-workforce people from Shift View, on their own or
//                alongside named operators
//
// "Additional workforce" is a Shift View term only; in reports those people are
// Unknown, and their headcount feeds Unknown's man-hours (N × the shift's
// planned hours). Unknown ×0 contributes none. It is NOT in OPERATOR_DIRECTORY
// (a directory of real people) and is pinned above the real operators, which
// follow alphabetically.
const OP_UNKNOWN = 'Unknown';
// Catch-all on the Shift-leader axis: production that ran without an assigned
// leader. Reported as "Unknown", the same label the operator axis uses for
// "nobody was recorded" — one word for one concept across every people axis.
const OP_NO_LEADER = OP_UNKNOWN;
const PSEUDO_OPERATORS = [OP_UNKNOWN];
const isPseudoOperator = (n) => PSEUDO_OPERATORS.includes(n);

// The canonical operator option list: pseudo-operators pinned to the top, real
// people sorted alphabetically by surname (the name is already "I. Surname").
function allOperatorOptions() {
  const people = Object.keys(OPERATOR_DIRECTORY)
    .sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
  return [...PSEUDO_OPERATORS, ...people];
}

// Same rule one level up: Unknown people belong to no operator group, so
// Unknown is a group of its own on the group axis — pinned on top, real groups
// alphabetically after.
function allGroupOptions() {
  const groups = OPERATOR_GROUPS.slice()
    .sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
  return [...PSEUDO_OPERATORS, ...groups];
}

// ── Downtime table columns (spec §7, product order) ──────────────────────────
// The X-axis column comes first (logic.js), then these; the one equal to the
// X-axis is left out. Text columns read the row's stops: `vals(stop)` gives a
// stop's values, the cell shows the distinct ones A–Z. Numeric columns read
// the row's sums. `total`: the column has a value in the Total row.

const DT_PER_PAGE = 100;

const DT_TEXT_COLS = [
  { key:'reason',         label:'Stop reasons',      width:160, vals: s => [s.reason] },
  { key:'group',          label:'Stop groups',       width:140, vals: s => [s.group] },
  { key:'station',        label:'Stations',          width:130, vals: s => [s.station] },
  { key:'stationGroup',   label:'Station groups',    width:140, vals: s => [s.stationGroup] },
  { key:'factory',        label:'Factories',         width:120, vals: s => [s.factory] },
  { key:'stopType',       label:'Stop types',        width:200, vals: s => [s.stopType] },
  { key:'location',       label:'Machine locations', width:180, vals: s => (s.location ? [s.location] : []) },
  { key:'productGroup',   label:'Product groups',    width:140, vals: s => [s.productGroup] },
  { key:'product',        label:'Products',          width:140, vals: s => [s.product] },
  { key:'productCode',    label:'Product code',      width:120, vals: s => [s.productCode] },
  { key:'lot',            label:'LOT/Batch',         width:120, vals: s => [s.lot] },
  { key:'order',          label:'Orders',            width:120, vals: s => [s.order] },
  { key:'shift',          label:'Shifts',            width:110, vals: s => [s.shift] },
  // People: names only, A–Z; "Unknown" only when the row has no name at all.
  // Operators are the people registered at the stop start.
  { key:'operators',      label:'Operators',         width:180, vals: s => s.operators, empty: 'Unknown' },
  { key:'operatorGroups', label:'Operator groups',   width:150, vals: s => s.operatorGroups, empty: 'Unknown' },
  { key:'leader',         label:'Shift leaders',     width:150, vals: s => (s.leader ? [s.leader] : []), empty: 'Unknown' },
  // Tags (NEW) is inserted here by logic.js (it needs the tag store and the feature flag).
];
const DT_NUM_COLS = [
  { key:'count',     label:'Count',                   type:'int', total:true },
  { key:'notes',     label:'Notes',                   type:'int', total:true, hasNote:true },
  { key:'loss',      label:'Loss',                    type:'int', total:true },
  { key:'durSec',    label:'Duration (All)',          type:'dur', total:true, iconY:true },
  { key:'avgSec',    label:'Average duration',        type:'dur' },
  { key:'durOeeSec', label:'Duration (incl. in OEE)', type:'dur', total:true },
  { key:'plannedSec',label:'Planned time',            type:'dur', planned:true },   // label set per X-axis
  { key:'pct',       label:'% of planned time',       type:'pct' },
];

// Durations, as the "Time format" chip sets them (formatDuration in the product).
const TIME_FORMATS = ['Readable', 'Seconds', 'Minutes', 'Hours'];
// 28 000: a space as the thousands separator.
function fmtInt(n) {
  const v = Math.round(n || 0);
  return (v < 0 ? '-' : '') + String(Math.abs(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
function fmtDec(n, d) {
  const [i, f] = Math.abs(n || 0).toFixed(d).split('.');
  return (n < 0 ? '-' : '') + fmtInt(+i) + (f ? '.' + f : '');
}
// Readable: "45s", "05m 07s", "3h 05m 07s".
function fmtDur(sec, format = 'Readable') {
  const s = Math.round(sec || 0);
  if (format === 'Seconds') return fmtInt(s) + ' sec';
  if (format === 'Minutes') return fmtDec(s / 60, 1) + ' min';
  if (format === 'Hours')   return fmtDec(s / 3600, 2) + ' hr';
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
  const p = (x) => String(x).padStart(2, '0');
  if (h) return `${fmtInt(h)}h ${p(m)}m ${p(ss)}s`;
  if (m) return `${p(m)}m ${p(ss)}s`;
  return `${ss}s`;
}
function fmtPct(p) { return p == null || !isFinite(p) ? '-' : fmtDec(p, 1) + '%'; }

// ── Evocon icon set ──────────────────────────────────────────────────────────
// Path data lifted from the real assets in ../prototype/icn, so the filter bar,
// the action menu and the chart controls carry the same glyphs as the product
// rather than look-alikes. `icn(name, size, color)` renders one.
const ICN = {
  factories:     'M12 7H22V21H2V3H12V7ZM4 19H6V17H4V19ZM6 15H4V13H6V15ZM4 11H6V9H4V11ZM6 7H4V5H6V7ZM8 19H10V17H8V19ZM10 15H8V13H10V15ZM8 11H10V9H8V11ZM10 7H8V5H10V7ZM20 19V9H12V11H14V13H12V15H14V17H12V19H20ZM18 11H16V13H18V11ZM16 15H18V17H16V15Z',
  stations:      'M3 2H21C22.1 2 23 2.9 23 4V16C23 17.1 22.1 18 21 18H14V20H16V22H8V20H10V18H3C1.9 18 1 17.1 1 16V4C1 2.9 1.9 2 3 2ZM3 16H21V4H3V16Z',
  group:         'M5 5V19H7V21H3V3H7V5H5ZM20 7H7V9H20V7ZM20 11H7V13H20V11ZM20 15H7V17H20V15Z',
  products:      'M15 4C10.58 4 7 7.58 7 12C7 16.42 10.58 20 15 20C19.42 20 23 16.42 23 12C23 7.58 19.42 4 15 4ZM15 18C11.69 18 9 15.31 9 12C9 8.69 11.69 6 15 6C18.31 6 21 8.69 21 12C21 15.31 18.31 18 15 18ZM7 6.35C4.67 7.17 3 9.39 3 12C3 14.61 4.67 16.83 7 17.65V19.74C3.55 18.85 1 15.73 1 12C1 8.27 3.55 5.15 7 4.26V6.35Z',
  operators:     'M12 15C7.58 15 4 16.79 4 19V21H20V19C20 16.79 16.42 15 12 15ZM8 9C8 10.0609 8.42143 11.0783 9.17157 11.8284C9.92172 12.5786 10.9391 13 12 13C13.0609 13 14.0783 12.5786 14.8284 11.8284C15.5786 11.0783 16 10.0609 16 9H8ZM11.5 2C11.2 2 11 2.21 11 2.5V5.5H10V3C10 3 7.75 3.86 7.75 6.75C7.75 6.75 7 6.89 7 8H17C16.95 6.89 16.25 6.75 16.25 6.75C16.25 3.86 14 3 14 3V5.5H13V2.5C13 2.21 12.81 2 12.5 2H11.5Z',
  leaders:       'M14.4 6L14 4H5V21H7V14H12.6L13 16H20V6H14.4Z',
  shifts:        'M15 13H16.5V15.82L18.94 17.23L18.19 18.53L15 16.69V13ZM19 8H5V19H9.67C9.24 18.09 9 17.07 9 16C9 14.1435 9.7375 12.363 11.0503 11.0503C12.363 9.73752 14.1435 9 16 9C17.07 9 18.09 9.24 19 9.67V8ZM5 21C3.89 21 3 20.1 3 19V5C3 3.89 3.89 3 5 3H6V1H8V3H16V1H18V3H19C19.5304 3 20.0391 3.21074 20.4142 3.58581C20.7893 3.96089 21 4.46959 21 5V11.1C22.24 12.36 23 14.09 23 16C23 17.8565 22.2625 19.637 20.9497 20.9498C19.637 22.2625 17.8565 23 16 23C14.09 23 12.36 22.24 11.1 21H5ZM16 11.15C14.7137 11.15 13.4801 11.661 12.5705 12.5706C11.661 13.4801 11.15 14.7137 11.15 16C11.15 18.68 13.32 20.85 16 20.85C16.6369 20.85 17.2676 20.7246 17.856 20.4808C18.4444 20.2371 18.9791 19.8799 19.4295 19.4295C19.8798 18.9791 20.2371 18.4445 20.4808 17.856C20.7246 17.2676 20.85 16.6369 20.85 16C20.85 13.32 18.68 11.15 16 11.15Z',
  stops:         'M2 12C2 6.48 6.48 2 12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12ZM13 16V18H11V16H13ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM8 10C8 7.79 9.79 6 12 6C14.21 6 16 7.79 16 10C16 11.2829 15.21 11.9733 14.4408 12.6455C13.711 13.2833 13 13.9046 13 15H11C11 13.1787 11.9421 12.4566 12.7704 11.8217C13.4202 11.3236 14 10.8792 14 10C14 8.9 13.1 8 12 8C10.9 8 10 8.9 10 10H8Z',
  speedLoss:     'M12 16C13.66 16 15 14.66 15 13C15 11.88 14.39 10.9 13.5 10.39L3.79 4.77L9.32 14.35C9.82 15.33 10.83 16 12 16ZM12 3C10.19 3 8.5 3.5 7.03 4.32L9.13 5.53C10 5.19 11 5 12 5C16.42 5 20 8.58 20 13C20 15.21 19.11 17.21 17.66 18.65H17.65C17.26 19.04 17.26 19.67 17.65 20.06C18.04 20.45 18.68 20.45 19.07 20.07C20.88 18.26 22 15.76 22 13C22 7.5 17.5 3 12 3ZM2 13C2 15.76 3.12 18.26 4.93 20.07C5.32 20.45 5.95 20.45 6.34 20.06C6.73 19.67 6.73 19.04 6.34 18.65C4.89 17.2 4 15.21 4 13C4 12 4.19 11 4.54 10.1L3.33 8C2.5 9.5 2 11.18 2 13Z',
  machineLoc:    'M15 20C15 19.7348 14.8946 19.4804 14.7071 19.2929C14.5196 19.1054 14.2652 19 14 19H13V17H17C17.5304 17 18.0391 16.7893 18.4142 16.4142C18.7893 16.0391 19 15.5304 19 15V5C19 4.46957 18.7893 3.96086 18.4142 3.58579C18.0391 3.21071 17.5304 3 17 3H7C6.46957 3 5.96086 3.21071 5.58579 3.58579C5.21071 3.96086 5 4.46957 5 5V15C5 15.5304 5.21071 16.0391 5.58579 16.4142C5.96086 16.7893 6.46957 17 7 17H11V19H10C9.73478 19 9.48043 19.1054 9.29289 19.2929C9.10536 19.4804 9 19.7348 9 20H2V22H9C9 22.2652 9.10536 22.5196 9.29289 22.7071C9.48043 22.8946 9.73478 23 10 23H14C14.2652 23 14.5196 22.8946 14.7071 22.7071C14.8946 22.5196 15 22.2652 15 22H22V20H15ZM7 15V5H17V15H7ZM12 14L16 10H13V6H11V10H8L12 14Z',
  // mdi tag-text: the Tags filter (menu row and chip), as in the Figma and Settings.
  tag:           'M21.41 11.58L12.41 2.58A2 2 0 0 0 11 2H4A2 2 0 0 0 2 4V11A2 2 0 0 0 2.59 12.41L11.59 21.41A2 2 0 0 0 13 22A2 2 0 0 0 14.41 21.41L21.41 14.41A2 2 0 0 0 22 13A2 2 0 0 0 21.41 11.58M6.5 8A1.5 1.5 0 1 1 8 6.5A1.5 1.5 0 0 1 6.5 8M11.59 15.41L7.59 11.41L9 10L13 14M15.59 14.41L10.09 8.91L11.5 7.5L17 13Z',
  // mdi map-marker-radius: Machine locations in the +FILTER menu (Figma).
  mapMarkerRadius: 'M12,2C15.31,2 18,4.66 18,7.95C18,12.41 12,19 12,19C12,19 6,12.41 6,7.95C6,4.66 8.69,2 12,2M12,6A2,2 0 0,0 10,8A2,2 0 0,0 12,10A2,2 0 0,0 14,8A2,2 0 0,0 12,6M20,19C20,21.21 16.42,23 12,23C7.58,23 4,21.21 4,19C4,17.71 5.22,16.56 7.11,15.83L7.75,16.74C6.67,17.19 6,17.81 6,18.5C6,19.88 8.69,21 12,21C15.31,21 18,19.88 18,18.5C18,17.81 17.33,17.19 16.25,16.74L16.89,15.83C18.78,16.56 20,17.71 20,19Z',
  alert:         'M13 14H11V9H13M13 18H11V16H13M1 21H23L12 2L1 21Z',
  close:         'M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z',
  caret:         'M7 10L12 15L17 10H7Z',
  chevLeft:      'M15.41 16.58L10.83 12L15.41 7.41L14 6L8 12L14 18L15.41 16.58Z',
  chevRight:     'M8.59 16.58L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.58Z',
  arrowLeft:     'M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z',
  closeCircle:   'M12 2C17.53 2 22 6.47 22 12C22 17.53 17.53 22 12 22C6.47 22 2 17.53 2 12C2 6.47 6.47 2 12 2ZM15.59 7L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41L15.59 7Z',
  download:      'M15 9H19L12 16L5 9H9V3H15V9ZM5 20V18H19V20H5Z',
  viewColumn:    'M4 18H9V5H4V18ZM10 18H15V5H10V18ZM16 18V5H21V18H16Z',
  infoOutline:   'M2 12C2 6.48 6.48 2 12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12ZM13 11V17H11V11H13ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM13 7V9H11V7H13Z',
  dotsVertical:  'M12 8C13.1 8 14 7.1 14 6C14 4.9 13.1 4 12 4C10.9 4 10 4.9 10 6C10 7.1 10.9 8 12 8ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10ZM10 18C10 16.9 10.9 16 12 16C13.1 16 14 16.9 14 18C14 19.1 13.1 20 12 20C10.9 20 10 19.1 10 18Z',
  share:         'M17.5542 15.7229C16.8675 15.7229 16.253 15.994 15.7831 16.4187L9.34036 12.6687C9.38554 12.4608 9.42169 12.253 9.42169 12.0361C9.42169 11.8193 9.38554 11.6114 9.34036 11.4036L15.7108 7.68976C16.1988 8.14157 16.8404 8.42169 17.5542 8.42169C19.0542 8.42169 20.2651 7.21084 20.2651 5.71084C20.2651 4.21084 19.0542 3 17.5542 3C16.0542 3 14.8434 4.21084 14.8434 5.71084C14.8434 5.92771 14.8795 6.13554 14.9247 6.34337L8.55422 10.0572C8.06627 9.60542 7.4247 9.3253 6.71084 9.3253C5.21084 9.3253 4 10.5361 4 12.0361C4 13.5361 5.21084 14.747 6.71084 14.747C7.4247 14.747 8.06627 14.4669 8.55422 14.0151L14.988 17.7741C14.9428 17.9639 14.9157 18.1627 14.9157 18.3614C14.9157 19.8163 16.0994 21 17.5542 21C19.009 21 20.1928 19.8163 20.1928 18.3614C20.1928 16.9066 19.009 15.7229 17.5542 15.7229Z',
  starOutline:   'M12 15.39L8.24 17.66L9.23 13.38L5.91 10.5L10.29 10.13L12 6.09L13.71 10.13L18.09 10.5L14.77 13.38L15.76 17.66M22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24Z',
  plus:          'M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z',
  lineChart:     'M3.5 18.49L9.5 12.48L13.5 16.48L22 6.92L20.59 5.51L13.5 13.48L9.5 9.48L2 16.99L3.5 18.49Z',
  barChart:      'M3 2.5H7V17.5H3V2.5Z',
  cog:           'M12 15.5C11.0717 15.5 10.1815 15.1313 9.52509 14.4749C8.86871 13.8185 8.49996 12.9283 8.49996 12C8.49996 11.0717 8.86871 10.1815 9.52509 9.52513C10.1815 8.86875 11.0717 8.5 12 8.5C12.9282 8.5 13.8185 8.86875 14.4748 9.52513C15.1312 10.1815 15.5 11.0717 15.5 12C15.5 12.9283 15.1312 13.8185 14.4748 14.4749C13.8185 15.1313 12.9282 15.5 12 15.5ZM19.43 12.97C19.47 12.65 19.5 12.33 19.5 12C19.5 11.67 19.47 11.34 19.43 11L21.54 9.37C21.73 9.22 21.78 8.95 21.66 8.73L19.66 5.27C19.54 5.05 19.27 4.96 19.05 5.05L16.56 6.05C16.04 5.66 15.5 5.32 14.87 5.07L14.5 2.42C14.46 2.18 14.25 2 14 2H9.99996C9.74996 2 9.53996 2.18 9.49996 2.42L9.12996 5.07C8.49996 5.32 7.95996 5.66 7.43996 6.05L4.94996 5.05C4.72996 4.96 4.45996 5.05 4.33996 5.27L2.33996 8.73C2.20996 8.95 2.26996 9.22 2.45996 9.37L4.56996 11C4.52996 11.34 4.49996 11.67 4.49996 12C4.49996 12.33 4.52996 12.65 4.56996 12.97L2.45996 14.63C2.26996 14.78 2.20996 15.05 2.33996 15.27L4.33996 18.73C4.45996 18.95 4.72996 19.03 4.94996 18.95L7.43996 17.94C7.95996 18.34 8.49996 18.68 9.12996 18.93L9.49996 21.58C9.53996 21.82 9.74996 22 9.99996 22H14C14.25 22 14.46 21.82 14.5 21.58L14.87 18.93C15.5 18.67 16.04 18.34 16.56 17.94L19.05 18.95C19.27 19.03 19.54 18.95 19.66 18.73L21.66 15.27C21.78 15.05 21.73 14.78 21.54 14.63L19.43 12.97Z',
};
// Multi-path icons (the axis glyphs are three bars, not one outline).
const ICN_MULTI = {
  xAxis:  ['M3 2.5H7V17.5H3V2.5Z', 'M10 5.5H14V17.5H10V5.5Z', 'M17 8.5H21V17.5H17V8.5Z'],
  yAxis:  ['M5 5.5H9V20.5H5V5.5Z', 'M12 8.5H16V20.5H12V8.5Z', 'M19 11.5H23V20.5H19V11.5Z'],
};
// The 2nd-Y glyph keeps its green axis bar, as in the asset.
const ICN_Y2 = '<path d="M4.76562 7.69407C5.5927 7.40804 6.53832 7.39927 7.46484 7.93333L7.62207 8.02903C8.40249 8.53257 9.09272 9.3775 9.69141 10.2585C10.3484 11.2254 10.9809 12.369 11.5674 13.4753C12.1653 14.6032 12.705 15.6717 13.2148 16.5759C13.7437 17.5138 14.1452 18.095 14.4189 18.3318C14.5651 18.4581 14.781 18.5323 15.1562 18.4861C15.547 18.4378 16.0111 18.2659 16.4922 18.0163C16.9633 17.7719 17.3968 17.4819 17.7168 17.2478C17.8753 17.1318 18.0028 17.0319 18.0889 16.9626C18.1318 16.9281 18.1647 16.9009 18.1855 16.8835L18.2119 16.8611L19.5186 18.3757C19.5167 18.3775 19.4944 18.3957 19.4678 18.4177C19.438 18.4426 19.3961 18.4783 19.3428 18.5212C19.2363 18.6069 19.0841 18.7255 18.8975 18.862C18.5269 19.1331 18.0041 19.4851 17.4131 19.7917C16.8318 20.0933 16.1271 20.3818 15.4023 20.4714C14.6623 20.5628 13.8152 20.453 13.1113 19.8445C12.535 19.3462 11.9796 18.4574 11.4727 17.5583C10.9467 16.6256 10.3714 15.4892 9.80078 14.4128C9.21854 13.3145 8.62847 12.2528 8.03711 11.3825C7.50359 10.5974 7.02984 10.0617 6.63184 9.77415L6.46582 9.66575C6.1174 9.46498 5.78713 9.45639 5.41895 9.58372C5.01411 9.7238 4.57845 10.0289 4.15137 10.4392C3.7327 10.8414 3.37459 11.2947 3.11719 11.655C2.99 11.8331 2.89063 11.984 2.82422 12.0886C2.79106 12.1408 2.76577 12.1816 2.75 12.2077L2.73047 12.2409L1 11.238C1.00167 11.2349 1.01825 11.2074 1.03906 11.1726C1.06188 11.1348 1.09436 11.0815 1.13574 11.0163C1.2187 10.8857 1.33881 10.7039 1.49023 10.4919C1.79062 10.0715 2.22915 9.51311 2.7666 8.9968C3.29556 8.48872 3.9755 7.96736 4.76562 7.69407Z"/><path fill-rule="evenodd" clip-rule="evenodd" d="M23 20.5V3.5H21V20.5H23Z" fill="#2ECC71"/>';

// Assets drawn with even-odd fill (an outline cut out of a solid) — without the
// rule they render as filled blobs.
const ICN_EVENODD = new Set(['viewColumn', 'download', 'infoOutline', 'dotsVertical', 'products', 'stops', 'factories', 'stations']);

function icn(name, size = 18, color = '#616161') {
  const rule = ICN_EVENODD.has(name) ? ' fill-rule="evenodd" clip-rule="evenodd"' : '';
  const paths = ICN_MULTI[name]
    ? ICN_MULTI[name].map(d => `<path d="${d}"/>`).join('')
    : (name === 'y2Axis' ? ICN_Y2 : `<path${rule} d="${ICN[name] || ''}"/>`);
  return `<svg class="chip-icn" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}">${paths}</svg>`;
}

// ── Inline SVG icons used in the table ───────────────────────────────────────

const ICON_Y_INLINE = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" stroke-width="2" stroke-linecap="round" style="flex-shrink:0"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`;
const ICON_OPEN     = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="flex-shrink:0"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`;

// ── Tooltip icons ─────────────────────────────────────────────────────────────

const ICON_X_URL = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.65)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="17" y2="18"/></svg>`;
const ICON_Y_URL = `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.65)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`;

// ── Chart colors ──────────────────────────────────────────────────────────────

// Base colors keyed by stop-group name; fallback uses CHART_PALETTE by index.
const STOP_GROUP_COLORS = {
  'Uncommented':'#E01C21', 'Mechanical':'#3498DB', 'Planned':'#0066CC',
  'Material':'#2ECC71',    'Setup':'#F1C40F',       'Quality':'#1ABC9C',
  'Operator':'#A7D129',    'Other':'#FA8072'
};
const CHART_PALETTE = ['#E01C21','#3498DB','#0066CC','#2ECC71','#F1C40F','#1ABC9C','#A7D129','#FA8072','#9B59B6','#E67E22','#27AE60','#D35400'];

const OEE_LINES = [
  { key:'quality',      label:'Quality',      color:'#ff9800' },
  { key:'performance',  label:'Performance',  color:'#fdd835' },
  { key:'availability', label:'Availability', color:'#2ecc71' },
  { key:'oee',          label:'OEE',          color:'#212121' },
];

const SHIFT_LEADERS = CAN_LEAD_OPERATORS;

// ── Shift blocks — the single source of truth for OEE-by-people ───────────────
// A block is one stretch of production: a station, a time window, a shift
// leader, and the operators on it, plus raw production counters. EVERYTHING the
// OEE report shows about leaders / operators / groups is *derived* from these
// blocks by selecting a subset (filters) and rolling up — so all the views
// reconcile with each other and with the filters.
//
//   leaderId      — the operator leading this block (one of CAN_LEAD_OPERATORS),
//                   or '' when nobody was assigned (an Unknown block)
//   operatorIds   — everyone who worked the block (includes the leader). Empty
//                   means no operator was selected → the block counts as Unknown.
//   awCount       — Shift View's additional-workforce headcount on this block
//                   (0 = none). Reports show those people as Unknown ×awCount.
//                   Unnamed extra hands; contributes man-hours but never leads.
//   plannedMin    — planned production time (denominator of availability)
//   runMin        — operating time (green+yellow) ≤ plannedMin
//   idealQty      — qty achievable at ideal cycle time over runMin
//   totalQty      — qty actually produced
//   goodQty       — good qty (≤ totalQty); scrap = totalQty − goodQty
//
// OEE = Availability(runMin/plannedMin) × Performance(totalQty/idealQty)
//       × Quality(goodQty/totalQty).
// Crews are kept within one team per block so the group comparison is clean:
//   Blue Team  — led by V. Mavroeidis, runs a bit hotter (higher OEE)
//   Red Team   — led by N. Papadopoulos, runs a bit lower
//   Operators  — the fallback bucket (S. Nikolaou / S. Panagiotou), a couple shifts
// so each named group shows a distinct OEE / quantity profile in the report.
const SHIFT_BLOCKS = [
  // day, station, leader, operators, plannedMin, runMin, idealQty, totalQty, goodQty, awCount
  // Every team shift has a leader and named operators; the last two blocks had
  // nobody registered, so they report as Unknown on every people axis.
  // ── Blue Team (strongest; deputy Kostopoulou leads Thu + Sat) ────────────
  blk(1, 'CNC-01',      'V. Mavroeidis',   ['V. Mavroeidis','M. Kostopoulou','G. Antoniou'],   480, 336, 1000, 648, 634),
  blk(2, 'CNC-02',      'V. Mavroeidis',   ['V. Mavroeidis','P. Lambrou','A. Dimitriou'],      480, 328, 1000, 632, 618),
  blk(3, 'CNC-01',      'V. Mavroeidis',   ['V. Mavroeidis','M. Kostopoulou','P. Lambrou'],    480, 342, 1000, 661, 648),
  blk(4, 'Press-01',    'M. Kostopoulou',  ['M. Kostopoulou','G. Antoniou','A. Dimitriou'],    480, 302,  900, 524, 506),
  blk(5, 'Assembly-02', 'V. Mavroeidis',   ['V. Mavroeidis','P. Lambrou','M. Kostopoulou'],    480, 334,  850, 584, 571),
  blk(6, 'CNC-02',      'M. Kostopoulou',  ['M. Kostopoulou','G. Antoniou','A. Dimitriou'],    480, 318, 1000, 611, 596),
  // ── Red Team (most scrap; deputy Vlachos leads Thu + Sat) ────────────────
  blk(1, 'Press-01',    'N. Papadopoulos', ['N. Papadopoulos','E. Christodoulou','D. Ekonomou'],480, 272,  900, 472, 446),
  blk(2, 'Press-02',    'N. Papadopoulos', ['N. Papadopoulos','K. Vlachos','D. Roussou'],      480, 264,  900, 460, 433),
  blk(3, 'Assembly-01', 'N. Papadopoulos', ['N. Papadopoulos','E. Christodoulou','K. Vlachos'],480, 276,  850, 464, 441),
  blk(4, 'CNC-03',      'K. Vlachos',      ['K. Vlachos','D. Ekonomou','D. Roussou'],          480, 284, 1000, 512, 487),
  blk(5, 'Press-03',    'N. Papadopoulos', ['N. Papadopoulos','K. Vlachos','E. Christodoulou'],480, 270,  900, 468, 442),
  blk(6, 'Press-02',    'K. Vlachos',      ['K. Vlachos','D. Roussou','D. Ekonomou'],          480, 258,  900, 449, 421),
  // ── Night Crew (steady; deputy Karalis leads Fri) ───────────────────────
  blk(1, 'Packing-01',  'I. Georgiou',     ['I. Georgiou','T. Karalis','L. Mitsou'],           480, 302,  800, 484, 470),
  blk(2, 'Assembly-02', 'I. Georgiou',     ['I. Georgiou','A. Petrou','T. Karalis'],           480, 296,  850, 503, 488),
  blk(3, 'Packing-01',  'I. Georgiou',     ['I. Georgiou','L. Mitsou','A. Petrou'],            480, 306,  800, 490, 476),
  blk(5, 'CNC-03',      'T. Karalis',      ['T. Karalis','L. Mitsou','A. Petrou'],             480, 312, 1000, 594, 578),
  blk(6, 'Packing-01',  'I. Georgiou',     ['I. Georgiou','A. Petrou','T. Karalis'],           480, 300,  800, 486, 472),
  // ── Maintenance (low volume; deputy Panagiotou leads Fri) ────────────────
  blk(1, 'Warehouse',   'S. Nikolaou',     ['S. Nikolaou','S. Panagiotou','H. Stavrou'],       480, 292,  600, 362, 352),
  blk(3, 'Quality Lab', 'S. Nikolaou',     ['S. Nikolaou','H. Stavrou'],                       480, 282,  600, 352, 340),
  blk(5, 'Warehouse',   'S. Panagiotou',   ['S. Panagiotou','H. Stavrou'],                     480, 286,  600, 356, 345),
  blk(7, 'Quality Lab', 'S. Nikolaou',     ['S. Nikolaou','S. Panagiotou'],                    480, 296,  600, 366, 356),
  // ── Nobody registered (Unknown ×0): no operator, no shift leader ────────
  // The stops still count; they carry no operator or operator group tags.
  blk(4, 'Packing-01',  '',                [],                                                 480, 290,  800, 470, 456),
  blk(7, 'Press-03',    '',                [],                                                 480, 262,  900, 452, 428),
];
function blk(day, station, leaderId, operatorIds, plannedMin, runMin, idealQty, totalQty, goodQty, awCount) {
  // shiftMin: scheduled shift length (≥ planned). allMin: calendar time the
  // station could run (here a full day). techStopMin: unplanned technical-stop
  // minutes inside planned time (drives Technical availability). Defaults keep
  // the 14-row table terse — an 8h shift inside a 24h day, ~6% tech stops.
  const shiftMin = 480, allMin = 1440;
  const techStopMin = Math.round((plannedMin - runMin) * 0.4); // ~40% of downtime is technical
  // Demo product/order metadata, varied by station family. Every station has
  // one, so the Products / Orders / LOT axes account for every block and add up
  // to the same total as any other axis.
  const fam = station.split('-')[0];
  const META = {
    CNC:           { products:['Widget Pro'],  productCodes:['PRD-001'], productGroups:['Electronics'], lots:['LOT-A1'], orders:['ORD-1001'] },
    Press:         { products:['Gear Kit'],    productCodes:['PRD-002'], productGroups:['Components'],  lots:['LOT-B1'], orders:['ORD-1002'] },
    Assembly:      { products:['Frame Set'],   productCodes:['PRD-003'], productGroups:['Assembly'],    lots:['LOT-C1'], orders:['ORD-1003'] },
    'Quality Lab': { products:['Circuit Bd.'], productCodes:['PRD-004'], productGroups:['Electronics'], lots:['LOT-A2'], orders:['ORD-1004'] },
    Packing:       { products:['Bolt Pack'],   productCodes:['PRD-005'], productGroups:['Components'],  lots:['LOT-B2'], orders:['ORD-1005'] },
    Warehouse:     { products:['Panel Set'],   productCodes:['PRD-006'], productGroups:['Assembly'],    lots:['LOT-C2'], orders:['ORD-1006'] },
  };
  const meta = META[fam];
  // Each team runs a fixed shift.
  const shift = { 'Blue Team': 'Morning', 'Red Team': 'Afternoon', 'Night Crew': 'Night',
                  'Maintenance': 'Morning' }[OPERATOR_DIRECTORY[leaderId]?.group] || 'Morning';
  return { day, station, leaderId, operatorIds, plannedMin, runMin, idealQty, totalQty, goodQty,
           awCount: awCount || 0,
           shiftMin, allMin, techStopMin, shift, ...meta };
}

// Whether a block carries Unknown in its operator list: when nobody was named
// (Unknown ×0), or when it had additional workforce (Unknown ×N) — those people
// are there but unnamed, and their hours need a row to land on.
function blockPseudoOps(b) {
  return (!b.operatorIds.length || b.awCount > 0) ? [OP_UNKNOWN] : [];
}

// Everyone on a block as operator-list values: named people + pseudo-operators.
function blockOperatorValues(b) {
  return [...b.operatorIds, ...blockPseudoOps(b)];
}

// OEE of a single block (components 0–100).
function blockOEE(b) {
  const a = b.plannedMin ? b.runMin   / b.plannedMin : 0;
  const p = b.idealQty   ? b.totalQty / b.idealQty   : 0;
  const q = b.totalQty   ? b.goodQty  / b.totalQty   : 0;
  return { availability: a*100, performance: p*100, quality: q*100, oee: a*p*q*100 };
}

// Weighted roll-up of many blocks (Evocon method: sum raw counters first, then
// apply the formulas — weighted by planned time). Returns the full OEE metric
// set (0–100) plus the raw time totals (minutes) and quantity. This is what the
// OEE report's data table rows are built from.
function rollupOEE(blocks) {
  let planned=0, run=0, ideal=0, total=0, good=0, shift=0, all=0, techStop=0;
  blocks.forEach(b => {
    planned+=b.plannedMin; run+=b.runMin; ideal+=b.idealQty; total+=b.totalQty;
    good+=b.goodQty; shift+=b.shiftMin; all+=b.allMin; techStop+=b.techStopMin;
  });
  const a = planned ? run/planned : 0;
  const p = ideal   ? total/ideal : 0;
  const q = total   ? good/total  : 0;
  const oeeR = a*p*q;
  return {
    availability: a*100, performance: p*100, quality: q*100, oee: oeeR*100,
    techAvailability: planned ? (planned - techStop)/planned*100 : 0,
    ooe:  shift ? (run/shift) * p * q * 100 : 0,
    teep: all   ? (run/all)   * p * q * 100 : 0,
    operatingMin: run, plannedMin: planned, shiftMin: shift, allMin: all,
    qty: total,
  };
}

// ── OEE report data-table columns (mirrors the real OEE.csv / screenshot) ─────
// The first column is dynamic (the current X-axis dimension); these are the
// fixed columns that follow. `descr` columns are comma-joined value lists for
// the row's blocks; `metric` columns are %; `time` columns are minute totals
// rendered as durations; `qty` is a number.
const OEE_TABLE_COLS = [
  { key:'stations',        label:'Stations',          et:'Töökeskused',          type:'descr' },
  { key:'stationGroups',   label:'Station groups',    et:'Töökeskuste grupid',   type:'descr' },
  { key:'factories',       label:'Factories',         et:'Tehased',              type:'descr' },
  { key:'products',        label:'Products',          et:'Tooted',               type:'descr' },
  { key:'productCodes',    label:'Product code',      et:'Tootekood',            type:'descr' },
  { key:'lots',            label:'LOT/Batch',         et:'LOT/Partii',           type:'descr' },
  { key:'orders',          label:'Orders',            et:'Tootmistellimused',    type:'descr' },
  { key:'shifts',          label:'Shifts',            et:'Vahetused',            type:'descr' },
  // People columns — spec order: Shifts → Shift leader → Operators → Operator groups.
  { key:'leader',          label:'Shift leader',      et:'Vahetuse juht',        type:'descr' },
  { key:'operators',       label:'Operators',         et:'Operaatorid',          type:'descr' },
  { key:'operatorGroup',   label:'Operator groups',   et:'Operaatorite grupid',  type:'descr' },
  // Man-hours = first numeric column, kept next to the people context.
  { key:'manhours',        label:'Man-hours',         et:'Inimtunnid',           type:'hours'  },
  { key:'availability',    label:'Availability',      et:'Kasulik tööaeg',       type:'metric' },
  { key:'techAvailability',label:'Technical availability', et:'Tehniline valmidus', type:'metric' },
  { key:'performance',     label:'Performance',       et:'Tootmiskiirus',        type:'metric' },
  { key:'quality',         label:'Quality',           et:'Kvaliteet',            type:'metric' },
  { key:'oee',             label:'OEE',               et:'OEE',                  type:'metric' },
  { key:'ooe',             label:'OOE',               et:'OOE',                  type:'metric' },
  { key:'teep',            label:'TEEP',              et:'TEEP',                 type:'metric' },
  { key:'operatingMin',    label:'Operating time',    et:'Tööaeg',               type:'time'   },
  { key:'plannedMin',      label:'Planned time',      et:'Planeeritud tööaeg',   type:'time'   },
  { key:'shiftMin',        label:'Shift time',        et:'Vahetuse aeg',         type:'time'   },
  { key:'allMin',          label:'All time',          et:'Kogu aeg',             type:'time'   },
  { key:'qty',             label:'Total quantity',    et:'Kogutoodang',          type:'qty'    },
];

// Descriptive (comma-joined distinct) values for a block set, per descr column.
function descrValues(blocks, key) {
  const set = new Set();
  blocks.forEach(b => {
    let vals = [];
    switch (key) {
      case 'stations':      vals = [b.station]; break;
      case 'stationGroups': vals = [STATION_GROUP_OF[b.station] || '-']; break;
      case 'factories':     vals = [FACTORY_OF[b.station] || '-']; break;
      // What ran on the block (the same runs Downtime's stops read).
      case 'products':      vals = blockRuns(b).map(r => r.product); break;
      case 'productCodes':  vals = blockRuns(b).map(r => r.productCode); break;
      case 'lots':          vals = blockRuns(b).map(r => r.lot); break;
      case 'orders':        vals = blockRuns(b).map(r => r.order); break;
      case 'shifts':        vals = [b.shift || 'Day']; break;
      // People columns read the blocks exactly as the people axes do, so a
      // row's cells always agree with the axis it would land on:
      //   Operators       — named people, plus Unknown
      //   Operator groups — the named people's groups, plus Unknown
      //   Shift leader    — spec: no leader selected reports as "Unknown"
      case 'operators':     vals = blockOperatorValues(b); break;
      case 'operatorGroup': vals = OEE_DIMS.group.valsOf(b); break;
      case 'leader':        vals = OEE_DIMS.leader.valsOf(b); break;
    }
    vals.forEach(v => v && set.add(v));
  });
  return [...set].join(', ') || '-';
}

// Lightweight station → group / factory lookups for the descr columns.
const STATION_GROUP_OF = { 'CNC-01':'CNC','CNC-02':'CNC','CNC-03':'CNC','Press-01':'Press','Press-02':'Press','Press-03':'Press','Assembly-01':'Assembly','Assembly-02':'Assembly','Packing-01':'Packing','Warehouse':'Logistics','Quality Lab':'Quality' };
const FACTORY_OF       = { 'CNC-01':'Factory 1','CNC-02':'Factory 1','CNC-03':'Factory 1','Press-01':'Factory 1','Press-02':'Factory 1','Press-03':'Factory 1','Assembly-01':'Factory 2','Assembly-02':'Factory 2','Packing-01':'Factory 2','Warehouse':'Factory 2','Quality Lab':'Factory 2' };

// Build one OEE table row per value of the chosen X-axis dimension, from a
// (filtered) block set. Each row = the dynamic first cell + the full metric +
// descriptive + time/qty columns, derived (so it reconciles with the chart).
function oeeTableRows(blocks, dimKey) {
  const dim = OEE_DIMS[dimKey] || OEE_DIMS.operator;
  const bucket = {};
  blocks.forEach(b => dim.valsOf(b).forEach(v => (bucket[v] = bucket[v] || []).push(b)));
  const rows = dim.labels()
    .filter(v => bucket[v] && bucket[v].length)
    .map(v => {
      const bs = bucket[v];
      const r = rollupOEE(bs);
      r.name = v;
      r.manhours = dim.isPeople ? manhoursScoped(bs, dimKey, v) : blockManhours(bs);
      OEE_TABLE_COLS.filter(c => c.type === 'descr').forEach(c => { r[c.key] = descrValues(bs, c.key); });
      return r;
    });
  // "Kokku" (total) row — weighted roll-up over ALL blocks in scope.
  if (rows.length) {
    const tot = rollupOEE(blocks);
    tot.name = 'Total';
    tot.manhours = blockManhours(blocks);
    tot._total = true;
    OEE_TABLE_COLS.filter(c => c.type === 'descr').forEach(c => { tot[c.key] = ''; });
    rows.push(tot);
  }
  return rows;
}

// Distinct operators across a set of blocks → total worked hours (manhours).
// Each operator counted once; their hours = Σ block durations they were on.
// Unknown ×N adds N × the block's planned hours (each unnamed head is a
// separate pair of hands, so there is nothing to dedup across blocks).
// Unknown contributes nothing — no people were recorded.
function blockManhours(blocks) {
  const perOp = new Map();
  let aw = 0;
  blocks.forEach(b => {
    b.operatorIds.forEach(o => {
      perOp.set(o, (perOp.get(o) || 0) + b.plannedMin / 60);
    });
    aw += awManhours(b);
  });
  let total = aw; perOp.forEach(h => total += h);
  return total;
}

// Man-hours of a block's unnamed people (Unknown ×N, N = the Shift View
// additional-workforce count).
function awManhours(b) {
  return (b.awCount || 0) * (b.plannedMin / 60);
}

// Dimension descriptors. A dim maps a block → the value(s) it belongs to on
// that dimension, and provides the full label list + a header for the table.
//   operator → each operator present on the block
//   group    → each distinct operator-group present
//   leader   → the single shift leader of the block
const OEE_DIMS = {
  operator: {
    header: 'Operators',
    // Unknown → real operators A–Z (see allOperatorOptions).
    labels: () => allOperatorOptions(),
    valsOf: (b) => blockOperatorValues(b),
    isPeople: true,
  },
  group: {
    header: 'Operator groups',
    // Unknown people are in no group, so they get a bucket of their own —
    // without it the group rows would not add up to the Total.
    labels: () => allGroupOptions(),
    // Every group the block's named operators belong to, plus Unknown when the
    // block carries it (see blockPseudoOps).
    valsOf: (b) => [
      ...new Set(b.operatorIds.map(o => OPERATOR_DIRECTORY[o]?.group || OP_UNKNOWN)),
      ...blockPseudoOps(b),
    ],
    isPeople: true,
  },
  leader: {
    header: 'Shift leader',
    // "Unknown" collects blocks that ran without an assigned shift leader
    // (AW-only and unmanned blocks), so the leader rows reconcile with the Total.
    // Pinned first and the rest A–Z, matching the operator / group axes.
    labels: () => [OP_NO_LEADER, ...SHIFT_LEADERS.slice()
      .sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))],
    valsOf: (b) => [b.leaderId || OP_NO_LEADER],
    isPeople: false,
  },
  // Time axis as an outer dimension, so Day × split-by (group / leader /
  // operators) works through the same matrix machinery as the people dims.
  // Calendar days of the selected range, labelled as on Downtime's Day axis.
  day: {
    header: 'Day',
    labels: () => (typeof rangeStart !== 'undefined' ? daysBetween(rangeStart, rangeEnd) : [])
      .map(d => timeBucket('Day', d).label),
    valsOf: (b) => [timeBucket('Day', b.date).label],
    isPeople: false,
  },
};

// Generic nested OEE matrix: outer dimension × inner dimension. A block lands
// in cell [outerVal][innerVal] for every combination of values it represents.
// Each cell = rolled-up OEE components + deduped manhours scoped to whichever
// side is the "people" dimension (so the number means a real headcount-time).
function oeeMatrixFromBlocks(blocks, outerDim, innerDim) {
  const O = OEE_DIMS[outerDim] || OEE_DIMS.operator;
  const I = OEE_DIMS[innerDim] || OEE_DIMS.leader;
  const bucket = {}; // [outer][inner] = blocks[]
  blocks.forEach(b => {
    O.valsOf(b).forEach(ov => {
      I.valsOf(b).forEach(iv => {
        (bucket[ov] = bucket[ov] || {});
        (bucket[ov][iv] = bucket[ov][iv] || []).push(b);
      });
    });
  });
  // Manhours scope: prefer the people dimension. If the OUTER is people, scope
  // to the outer value (e.g. "Operator A's hours"); else if INNER is people,
  // scope to the inner value; else (leader×leader, unused) all operators.
  const data = {};
  O.labels().forEach(ov => {
    data[ov] = {};
    I.labels().forEach(iv => {
      const bs = bucket[ov] && bucket[ov][iv];
      if (bs && bs.length) {
        const cell = rollupOEE(bs);
        if (O.isPeople)      cell.manhours = manhoursScoped(bs, outerDim, ov);
        else if (I.isPeople) cell.manhours = manhoursScoped(bs, innerDim, iv);
        else                 cell.manhours = blockManhours(bs);
        data[ov][iv] = cell;
      } else {
        data[ov][iv] = null;
      }
    });
  });
  return { labels: O.labels(), innerLabels: I.labels(), data, outerHeader: O.header, innerHeader: I.header };
}

// Manhours attributable to a single dimension value within a block set —
// distinct operators that belong to that value, hours counted once.
function manhoursScoped(blocks, dim, val) {
  // Unknown (on the operator and the group axis) = its headcount × the block's
  // hours — the additional workforce; an empty shift (×0) adds nothing.
  if (val === OP_UNKNOWN) return blocks.reduce((s, b) => s + awManhours(b), 0);

  const inVal = (o) => dim === 'group'
    ? ((OPERATOR_DIRECTORY[o]?.group || OP_UNKNOWN) === val)
    : (o === val); // 'operator'
  const perOp = new Map();
  blocks.forEach(b => b.operatorIds.forEach(o => {
    if (inVal(o)) perOp.set(o, (perOp.get(o) || 0) + b.plannedMin / 60);
  }));
  let total = 0; perOp.forEach(h => total += h);
  return total;
}

// ── Quantities report ─────────────────────────────────────────────────────────
// The Quantities chart (Figma 2045-7344) is a STACKED bar per X-axis value:
//   Scrap        (orange, bottom) = totalQty − goodQty
//   Good quantity (green)         = goodQty
//   Potential    (grey, top)      = idealQty − totalQty   (the gap to ideal speed)
// Stacked because they sum to the ideal output (unlike OEE's multiplicative
// components). Derived from the SAME SHIFT_BLOCKS as OEE, so the two reconcile
// and Split by operator / leader / group works for free.
const QTY_SEGMENTS = [
  { key:'potential', label:'Potential',    color:'#bdbdbd' },
  { key:'good',      label:'Good quantity', color:'#2ecc71' },
  { key:'scrap',     label:'Scrap',        color:'#ff9800' },
];

// Roll up a block set into the three quantity buckets (+ totals for the table).
function rollupQty(blocks) {
  let ideal=0, total=0, good=0;
  blocks.forEach(b => { ideal+=b.idealQty; total+=b.totalQty; good+=b.goodQty; });
  return {
    good, scrap: total - good, potential: Math.max(0, ideal - total),
    totalQty: total, goodQty: good, idealQty: ideal,
  };
}

// Quantities data-table columns: a dynamic first column (the X-axis dimension),
// then descriptive context, then the quantity numbers. Mirrors the OEE table
// shape (descr columns reuse descrValues / the same station lookups).
const QTY_TABLE_COLS = [
  { key:'stations',      label:'Stations',       type:'descr' },
  { key:'stationGroups', label:'Station groups', type:'descr' },
  { key:'factories',     label:'Factories',      type:'descr' },
  { key:'products',      label:'Products',       type:'descr' },
  { key:'productCodes',  label:'Product code',   type:'descr' },
  { key:'shifts',        label:'Shifts',         type:'descr' },
  // People columns — spec order: Shifts → Shift leader → Operators → Operator groups.
  { key:'leader',        label:'Shift leader',    type:'descr' },
  { key:'operators',     label:'Operators',       type:'descr' },
  { key:'operatorGroup', label:'Operator groups', type:'descr' },
  // Man-hours = first numeric column, kept next to the people context.
  { key:'manhours',      label:'Man-hours',      type:'hours' },
  { key:'goodQty',       label:'Good quantity',  type:'qty'   },
  { key:'scrap',         label:'Scrap',          type:'qty'   },
  { key:'potential',     label:'Potential',      type:'qty'   },
  { key:'totalQty',      label:'Total quantity', type:'qty'   },
];

// One quantities table row per value of the chosen X-axis dimension, from a
// (filtered) block set, + a bold Total row. Reuses OEE_DIMS / descrValues.
function qtyTableRows(blocks, dimKey) {
  const dim = OEE_DIMS[dimKey] || OEE_DIMS.operator;
  const bucket = {};
  blocks.forEach(b => dim.valsOf(b).forEach(v => (bucket[v] = bucket[v] || []).push(b)));
  const rows = dim.labels()
    .filter(v => bucket[v] && bucket[v].length)
    .map(v => {
      const bs = bucket[v];
      const r = rollupQty(bs);
      r.name = v;
      r.manhours = dim.isPeople ? manhoursScoped(bs, dimKey, v) : blockManhours(bs);
      QTY_TABLE_COLS.filter(c => c.type === 'descr').forEach(c => { r[c.key] = descrValues(bs, c.key); });
      return r;
    });
  if (rows.length) {
    const tot = rollupQty(blocks);
    tot.name = 'Total'; tot._total = true;
    tot.manhours = blockManhours(blocks);
    QTY_TABLE_COLS.filter(c => c.type === 'descr').forEach(c => { tot[c.key] = ''; });
    rows.push(tot);
  }
  return rows;
}

// Stacked quantities per X-axis category, optionally split by an inner
// dimension. Returns { labels, innerLabels, data } where data[outer][inner] is a
// rollupQty cell (or null). Mirrors oeeMatrixFromBlocks but for the qty buckets.
function qtyMatrixFromBlocks(blocks, outerDim, innerDim) {
  const O = OEE_DIMS[outerDim] || OEE_DIMS.operator;
  const I = OEE_DIMS[innerDim] || OEE_DIMS.leader;
  const bucket = {};
  blocks.forEach(b => {
    O.valsOf(b).forEach(ov => {
      I.valsOf(b).forEach(iv => {
        (bucket[ov] = bucket[ov] || {});
        (bucket[ov][iv] = bucket[ov][iv] || []).push(b);
      });
    });
  });
  // Manhours scope mirrors oeeMatrixFromBlocks: prefer the people dimension
  // so each cell's number is a real deduped headcount-time.
  const data = {};
  O.labels().forEach(ov => {
    data[ov] = {};
    I.labels().forEach(iv => {
      const bs = bucket[ov] && bucket[ov][iv];
      if (bs && bs.length) {
        const cell = rollupQty(bs);
        if (O.isPeople)      cell.manhours = manhoursScoped(bs, outerDim, ov);
        else if (I.isPeople) cell.manhours = manhoursScoped(bs, innerDim, iv);
        else                 cell.manhours = blockManhours(bs);
        data[ov][iv] = cell;
      } else {
        data[ov][iv] = null;
      }
    });
  });
  return { labels: O.labels(), innerLabels: I.labels(), data, outerHeader: O.header, innerHeader: I.header };
}

// Per-day stacked quantities for the Day (time) X-axis: one entry per calendar
// day with production, summing that day's blocks, so the Day view reconciles
// with the categorical views. `blocks` rides along for the descr columns.
function qtyByDay(blocks) {
  const byDay = new Map();
  blocks.forEach(b => { (byDay.get(b.idx) || byDay.set(b.idx, []).get(b.idx)).push(b); });
  return [...byDay.keys()].sort((a,b)=>a-b).map(idx => {
    const bs = byDay.get(idx);
    const r = rollupQty(bs);
    r.day = timeBucket('Day', bs[0].date).label; r.name = r.day; r.blocks = bs;
    r.manhours = blockManhours(bs);
    return r;
  });
}

// ── Date utilities ────────────────────────────────────────────────────────────

// True if two Date objects represent the same calendar day
function sameDay(a, b) {
  return a && b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate();
}

// Mon-first day-of-week index (0 = Mon … 6 = Sun)
function mondayDow(date) {
  const d = date.getDay();
  return d === 0 ? 6 : d - 1;
}

// DST-safe day offset — always constructs midnight local time
function addDays(date, n) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
}

// DD.MM.YYYY — used in tooltip headers
function fmtDMY(d) {
  return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
}

// DD.MM.YYYY — used for the filter-bar button label
function fmtDMslashM(d) {
  return `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
}

// ── One period, three reports ─────────────────────────────────────────────────
// All three reports describe the SAME production — the shift blocks above.
// OEE and Quantities roll the blocks up directly; Downtime reads stop events
// allocated from each block's actual downtime (planned − run minutes). So a
// station's downtime here is exactly what OEE's availability implies for it,
// and every axis of every report adds up to the same totals.
//
// Nothing is random. The selected range is the mock week repeated day by day,
// so switching axes, splits, filters or reports never changes a number.

const DOW3 = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

// Calendar days from start to end inclusive, as local midnights.
function daysBetween(start, end) {
  const out = [];
  if (!start || !end) return out;
  const cur  = new Date(start); cur.setHours(0,0,0,0);
  const last = new Date(end);   last.setHours(0,0,0,0);
  while (cur <= last) { out.push(new Date(cur)); cur.setDate(cur.getDate() + 1); }
  return out;
}

// The range's first day plays week day 1, the next day 2, and so on. Each tiled
// block keeps its calendar date, so every time axis groups by real dates.
function blocksForRange(start, end, pattern) {
  const out = [];
  const today = new Date(); today.setHours(0,0,0,0);
  daysBetween(start, end).forEach((date, idx) => {
    if (date > today) return;              // nothing has run on future days
    const day = (idx % 7) + 1;
    pattern.forEach(b => { if (b.day === day) out.push({ ...b, date, idx }); });
  });
  return out;
}

// ── Downtime: one record per stop (spec §1) ──────────────────────────────────
// Each shift block's downtime (planned − run minutes) is cut into single stops
// with a start time, a duration in seconds, and what was true at the start:
// the product / LOT / order running, the operators registered, the leader.
// Nothing is random: hash32 is the only variety, so every axis, split and
// filter reconciles, and the same period always gives the same stops.

// Shift start hours (8 h shifts).
const SHIFT_START_H = { Morning: 6, Afternoon: 14, Night: 22 };

// Products per station family: [name, SKU, product group]. Families with two
// products change over during some shifts, so a block can run both.
const PRODUCTS_OF = {
  CNC:           [['Widget Pro', 'PRD-001', 'Electronics'], ['Widget Mini', 'PRD-007', 'Electronics']],
  Press:         [['Gear Kit', 'PRD-002', 'Components'],    ['Gear Kit XL', 'PRD-008', 'Components']],
  Assembly:      [['Frame Set', 'PRD-003', 'Assembly'],     ['Frame Set Lite', 'PRD-009', 'Assembly']],
  'Quality Lab': [['Circuit Bd.', 'PRD-004', 'Electronics']],
  Packing:       [['Bolt Pack', 'PRD-005', 'Components'],   ['Nut Pack', 'PRD-010', 'Components']],
  Warehouse:     [['Panel Set', 'PRD-006', 'Assembly']],
};
const SKU_OF = Object.fromEntries(Object.values(PRODUCTS_OF).flat().map(([n, sku]) => [n, sku]));

// Calendar day number (orders and LOTs follow the calendar, not the range).
function dayNo(d) { return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000); }

// What ran on a block: one or two runs (a changeover), each with its product,
// order (changes every 4 days) and LOT (every 2 days). `from` / `to` are
// seconds from the shift start; `plannedSec` is the run's share of planned time.
const _runsMemo = new Map();
function blockRuns(b) {
  const dn = dayNo(b.date || new Date());
  const k = `${b.station}|${dn}|${b.shift}|${b.plannedMin}`;
  if (_runsMemo.has(k)) return _runsMemo.get(k);
  const prods = PRODUCTS_OF[b.station.split('-')[0]] || PRODUCTS_OF.CNC;
  const h = hash32(`run|${b.station}|${dn}|${b.shift}`);
  const shiftSec = b.shiftMin * 60;
  const first = h % prods.length;
  const cuts = prods.length > 1 && (h >> 5) % 3 === 0
    ? [0, Math.round(shiftSec * (0.35 + ((h >> 9) % 31) / 100)), shiftSec] : [0, shiftSec];
  const runs = [];
  for (let i = 0; i < cuts.length - 1; i++) {
    const [product, productCode, productGroup] = prods[(first + i) % prods.length];
    const pnum = +productCode.slice(4);
    runs.push({
      product, productCode, productGroup,
      order: `ORD-${(Math.floor(dn / 4) % 900) + 100}${String(pnum).padStart(2, '0')}`,
      lot:   `L${String(pnum).padStart(2, '0')}-${(Math.floor(dn / 2) % 900) + 100}`,
      from: cuts[i], to: cuts[i + 1],
      plannedSec: b.plannedMin * 60 * (cuts[i + 1] - cuts[i]) / shiftSec,
    });
  }
  _runsMemo.set(k, runs);
  return runs;
}

// Stop reason catalogue. Names, groups, types and factories come from the
// shared TagsStore (the Settings data); only the mock's weights live here,
// keyed by name (Settings edits tags, never reason names, so the join holds).
//   slot    — fixed hash slot, so adding a reason never reshuffles the others
//   w       — how common the reason is
//   typical — minutes a single stop of it usually lasts (drives the stop count)
//   loc     — the machine location it is reported on (with the station name)
//   tech    — unplanned and included in Technical Availability
// "Uncommented" is not a reason: it is the stop nobody commented, has no group
// in Settings, carries no stop tags and has no machine location.
const DT_REASON_WEIGHTS = {
  'Uncommented':    { slot: 0, w:145, typical:12 },
  'Motor failure':  { slot: 1, w:112, typical:22, loc:'Drive',     tech:true },
  'Belt broken':    { slot: 2, w: 78, typical:26, loc:'Conveyor',  tech:true },
  'Bearing worn':   { slot: 3, w: 34, typical: 9, loc:'Spindle',   tech:true },
  'Planned maint.': { slot: 4, w: 89, typical:45, loc:'Drive' },
  'Planned break':  { slot: 5, w: 45, typical:15 },
  'Mat. shortage':  { slot: 6, w: 91, typical:13, loc:'Infeed' },
  'Waiting parts':  { slot: 7, w: 47, typical:12, loc:'Infeed' },
  'Changeover':     { slot: 8, w: 62, typical:16, loc:'Tooling' },
  'Calibration':    { slot: 9, w: 28, typical:14, loc:'Sensors' },
  'Quality check':  { slot:10, w: 56, typical:11, loc:'Outfeed' },
  'Prod. defect':   { slot:11, w: 23, typical: 8, loc:'Outfeed' },
  'Operator break': { slot:12, w: 38, typical: 6 },
  'Training':       { slot:13, w: 19, typical:10 },
  'Ext. factor':    { slot:14, w: 15, typical: 8 },
  'Power outage':   { slot:15, w: 42, typical:42, loc:'Control cabinet', tech:true },
  // Local reasons: only the stations their Settings record lists stop for them
  // (reasonRunsOn); a higher weight gives each a visible bar (~150–300 min a week).
  'Line cleaning':  { slot:16, w:200, typical:30, loc:'Tooling' },   // Factory 1, its Settings stations
  'CIP wash':       { slot:17, w:150, typical:35, loc:'Piping' },    // Factory 2, its Settings stations
};
const DT_UNCOMMENTED = { name:'Uncommented', group:'Uncommented', type:'Unplanned', factory:null, includeInOee:true };
const DT_REASONS = [DT_UNCOMMENTED, ...TagsStore.getStopReasons()]
  .filter(r => DT_REASON_WEIGHTS[r.name])
  .map(r => ({ name: r.name, group: r.group, type: r.type, factory: r.factory || null, stations: r.stations || null,
                includeInOee: r.includeInOee !== false, ...DT_REASON_WEIGHTS[r.name] }))
  .sort((a, b) => a.slot - b.slot);

// Stop types, as the product names them (FilterBarConfig: Unplanned / Planned
// groups). `short` is the selection-list row under its group header.
const STOP_TYPES = [
  { value: 'Unplanned (incl. in Technical Availability)', group: 'Unplanned', short: 'Incl. in Technical Availability', inOee: true },
  { value: 'Unplanned (excl. from Technical Availability)', group: 'Unplanned', short: 'Excl. from Technical Availability', inOee: true },
  { value: 'Planned (incl. in OEE)',  group: 'Planned', short: 'Incl. in OEE',  inOee: true },
  { value: 'Planned (excl. from OEE)', group: 'Planned', short: 'Excl. from OEE', inOee: false },
];
function stopTypeOf(r) {
  if (r.type === 'Planned') return r.includeInOee ? STOP_TYPES[2] : STOP_TYPES[3];
  return r.tech ? STOP_TYPES[0] : STOP_TYPES[1];
}

// Where a reason can occur, as Settings says: a local reason only in its own
// factory, and only on the stations its record lists ('All' or none = every
// station of that factory). Global reasons list every station.
function reasonRunsOn(r, station) {
  if (r.factory && FACTORY_OF[station] !== r.factory) return false;
  const st = r.stations;
  return !Array.isArray(st) || !st.length || st.includes('All') || st.includes(station);
}
// Local reasons sit on few stations, so they are picked more often there
// (otherwise a week could pass without one).
const LOCAL_PICK = 70;

// Stable 32-bit hash (FNV-1a) — the only source of variety in the mock.
function hash32(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// Largest-remainder split of an integer total by weights (exact sums).
function splitExact(total, weights) {
  const W = weights.reduce((s, w) => s + w, 0) || 1;
  const parts = weights.map(w => ({ exact: total * w / W }));
  parts.forEach(p => { p.v = Math.floor(p.exact); });
  let rest = total - parts.reduce((s, p) => s + p.v, 0);
  parts.map((p, i) => i).sort((a, c) => (parts[c].exact - parts[c].v) - (parts[a].exact - parts[a].v))
    .slice(0, rest).forEach(i => { parts[i].v++; });
  return parts.map(p => p.v);
}

// When each operator of a block is registered (seconds from the shift start).
// The leader is there all shift; others may log in late or leave early.
function registrationWindows(b, seed) {
  const shiftSec = b.shiftMin * 60;
  return b.operatorIds.map(op => {
    if (op === b.leaderId) return { op, from: 0, to: shiftSec };
    const h = hash32(`reg|${seed}|${op}`);
    const late = [0, 0, 0, 0, 45, 90][h % 6] * 60;
    const early = [0, 0, 0, 0, 60, 120][(h >> 3) % 6] * 60;
    return { op, from: late, to: shiftSec - early };
  });
}

// One block → its stops. The minutes per reason are allocated as before
// (largest remainder, so Σ stops = planned − run exactly), then each reason's
// minutes are cut into stops and laid out across the shift with gaps between.
function blockStops(b) {
  const D = b.plannedMin - b.runMin;
  if (D <= 0) return [];
  // The "main|" prefix is the seed the mock has always used.
  const seed = `main|${b.station}|${b.idx}`;
  const picks = DT_REASONS.map(r => {
    const h = hash32(seed + '|' + r.slot);
    return { r, on: reasonRunsOn(r, b.station) && (r.slot === 0 || h % 100 < (r.factory ? LOCAL_PICK : 38)),
             w: r.w * (0.6 + (h % 81) / 100) };
  }).filter(p => p.on);
  const mins = splitExact(D, picks.map(p => p.w));
  const parts = [];
  picks.forEach((p, pi) => {
    const min = mins[pi];
    if (min <= 0) return;
    const n = Math.max(1, Math.round(min / p.r.typical));
    const secs = splitExact(min * 60, Array.from({ length: n }, (_, i) => 0.5 + (hash32(`${seed}|${p.r.slot}|${i}`) % 100) / 100));
    secs.forEach((durSec, i) => { if (durSec > 0) parts.push({ r: p.r, durSec, h: hash32(`${seed}|${p.r.slot}|${i}|at`) }); });
  });
  parts.sort((a, c) => a.h - c.h);
  // Lay the stops out over the shift: free time split into gaps.
  const shiftSec = b.shiftMin * 60;
  const gaps = splitExact(Math.max(0, shiftSec - D * 60), parts.map((p, i) => 0.3 + (hash32(`${seed}|gap|${i}`) % 100) / 100).concat([0.5]));
  const runs = blockRuns(b);
  const windows = registrationWindows(b, seed);
  const shiftStart = new Date(b.date); shiftStart.setHours(SHIFT_START_H[b.shift] ?? 6, 0, 0, 0);
  const ymd = `${b.date.getFullYear()}${String(b.date.getMonth() + 1).padStart(2, '0')}${String(b.date.getDate()).padStart(2, '0')}`;
  const out = [];
  let t = 0;
  parts.forEach((p, i) => {
    t += gaps[i];
    const at = t;
    t += p.durSec;
    const run = runs.find(r => at >= r.from && at < r.to) || runs[runs.length - 1];
    const operators = windows.filter(w => at >= w.from && at < w.to).map(w => w.op)
      .sort((x, y) => x.localeCompare(y, 'en', { sensitivity: 'base' }));
    const type = stopTypeOf(p.r);
    const stop = {
      id: `${b.station}-${ymd}-${i + 1}`,
      start: new Date(shiftStart.getTime() + at * 1000).toISOString(),
      shiftDate: `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6)}`,   // the day its shift started
      durSec: p.durSec,
      reason: p.r.name, group: p.r.group,
      station: b.station, stationGroup: STATION_GROUP_OF[b.station] || '-', factory: FACTORY_OF[b.station] || '-',
      location: p.r.loc ? `${b.station} ${p.r.loc}` : null,
      stopType: type.value, inOee: type.inOee,
      product: run.product, productCode: run.productCode, productGroup: run.productGroup,
      lot: run.lot, order: run.order,
      shift: b.shift,
      operators,
      operatorGroups: [...new Set(operators.map(o => OPERATOR_DIRECTORY[o]?.group).filter(Boolean))]
        .sort((x, y) => x.localeCompare(y, 'en', { sensitivity: 'base' })),
      leader: b.leaderId || null,
      notes: (() => { const h = hash32(`${seed}|note|${i}`) % 10; return h < 2 ? 1 : h === 2 ? 2 : 0; })(),
      // Units not produced during the stop, at the block's ideal rate.
      loss: Math.round(p.durSec / 60 * b.idealQty / b.plannedMin),
    };
    // Internal links (not part of the record): the block and the run it is on.
    Object.defineProperty(stop, '_b', { value: b, enumerable: false });
    Object.defineProperty(stop, '_seg', { value: segKey(b, run), enumerable: false });
    Object.defineProperty(stop, '_t', { value: new Date(shiftStart.getTime() + at * 1000), enumerable: false });
    out.push(stop);
  });
  return out;
}

// A segment = one run on one block: the unit planned time is counted in.
// Like its stops, it belongs to the day its shift started; its planned time
// is clipped to now (today's later shifts have not run yet).
function segKey(b, run) { return `${b.station}|${b.idx}|${run.from}`; }
function blockSegments(b, now) {
  const shiftStart = new Date(b.date); shiftStart.setHours(SHIFT_START_H[b.shift] ?? 6, 0, 0, 0);
  return blockRuns(b).map(r => {
    const t0 = shiftStart.getTime() + r.from * 1000, t1 = shiftStart.getTime() + r.to * 1000;
    const ran = Math.max(0, Math.min(t1, now) - t0) / Math.max(1, t1 - t0);
    return { key: segKey(b, r), b, r, plannedSec: r.plannedSec * ran };
  }).filter(g => g.plannedSec > 0);
}

// Every stop and segment of a period (before any filter), memoised per range.
// The range picks shifts by the day they started (shiftDate); stops after
// now are left out.
const _periodMemo = new Map();
const PAGE_NOW = Date.now();   // "now" is fixed when the page opens, so numbers hold while it is open
function periodData(start, end) {
  const k = `${start && start.toDateString()}|${end && end.toDateString()}`;
  if (_periodMemo.has(k)) return _periodMemo.get(k);
  let data = { blocks: [], stops: [], segs: [] };
  if (start && end) {
    const blocks = blocksForRange(start, end, SHIFT_BLOCKS);
    data = {
      blocks,
      stops: blocks.flatMap(blockStops).filter(s => s._t.getTime() < PAGE_NOW).sort((a, b) => a._t - b._t),
      segs: blocks.flatMap(b => blockSegments(b, PAGE_NOW)),
    };
  }
  if (_periodMemo.size > 12) _periodMemo.clear();
  _periodMemo.set(k, data);
  return data;
}

// ── Downtime axes (X-axis and Split by) ──
// keys(stop)  → the values a stop counts under (several = it is in several bars)
// seg(segment)→ the values a segment's planned time counts under (per-row planned time)
// planned     → 'total': the row's planned time is the period's ("Planned time (Total)");
//               'stops': the planned time of the segments the row's stops are on
// overlap     → a stop can be in several bars: the Total row is hidden
const DT_AXES = {
  'Stop reasons':      { singular: 'Stop reason',      planned: 'total', keys: s => [s.reason] },
  'Stop groups':       { singular: 'Stop group',       planned: 'total', keys: s => [s.group] },
  'Machine locations': { singular: 'Machine location', planned: 'total', keys: s => [s.location || '-'] },
  'Stations':          { singular: 'Station',          keys: s => [s.station],      seg: g => [g.b.station] },
  'Station groups':    { singular: 'Station group',    keys: s => [s.stationGroup], seg: g => [STATION_GROUP_OF[g.b.station] || '-'] },
  'Factories':         { singular: 'Factory',          keys: s => [s.factory],      seg: g => [FACTORY_OF[g.b.station] || '-'] },
  'Operators':         { singular: 'Operator',         overlap: true,
                         keys: s => (s.operators.length ? s.operators : [OP_UNKNOWN]),
                         seg: g => (g.b.operatorIds.length ? g.b.operatorIds : [OP_UNKNOWN]) },
  'Operator groups':   { singular: 'Operator group',   overlap: true,
                         keys: s => (s.operatorGroups.length ? s.operatorGroups : [OP_UNKNOWN]),
                         seg: g => (g.b.operatorIds.length ? [...new Set(g.b.operatorIds.map(o => OPERATOR_DIRECTORY[o]?.group || OP_UNKNOWN))] : [OP_UNKNOWN]) },
  'Shift leaders':     { singular: 'Shift leader',     keys: s => [s.leader || OP_UNKNOWN], seg: g => [g.b.leaderId || OP_UNKNOWN] },
  // 'Tags' is added by logic.js (it reads the tag store and the Tags filter).
  'Products':          { singular: 'Product',          keys: s => [s.product],      seg: g => [g.r.product] },
  'Product code':      { singular: 'Product code',     keys: s => [s.productCode],  seg: g => [g.r.productCode] },
  'Orders':            { singular: 'Order',            keys: s => [s.order],        seg: g => [g.r.order] },
  'LOT/Batch':         { singular: 'LOT/Batch',        keys: s => [s.lot],          seg: g => [g.r.lot] },
  'Product groups':    { singular: 'Product group',    keys: s => [s.productGroup], seg: g => [g.r.productGroup] },
  'Shifts':            { singular: 'Shift',            keys: s => [s.shift],        seg: g => [g.b.shift] },
};
// Values pinned before the A–Z rest, in bars, splits and lists.
const PINNED_VALUES = [OP_UNKNOWN, 'No tag', '-'];
function sortValues(vals) {
  const pin = vals.filter(v => PINNED_VALUES.includes(v)).sort((a, b) => PINNED_VALUES.indexOf(a) - PINNED_VALUES.indexOf(b));
  const rest = vals.filter(v => !PINNED_VALUES.includes(v))
    .sort((a, b) => String(a).localeCompare(String(b), 'en', { sensitivity: 'base', numeric: true }));
  return [...pin, ...rest];
}

// Day labels read "Mon 22" inside one month. A longer range adds the month
// ("Mon 22.09") and, across years, the year — the chart keys its bars by label,
// so a repeated "Wed 1" would fold two days into one bar.
function dayLabel(d) {
  const rs = typeof rangeStart !== 'undefined' ? rangeStart : null;
  const re = typeof rangeEnd   !== 'undefined' ? rangeEnd   : null;
  const multiYear  = rs && re && rs.getFullYear() !== re.getFullYear();
  const multiMonth = rs && re && (multiYear || rs.getMonth() !== re.getMonth());
  const dm = multiMonth ? `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}` : String(d.getDate());
  return `${DOW3[d.getDay()]} ${dm}${multiYear ? '.' + String(d.getFullYear()).slice(2) : ''}`;
}

// Time buckets: a grouping key and the label shown on the axis.
function timeBucket(unit, d, multiYear) {
  if (unit === 'Day') return { key: d.toDateString(), label: dayLabel(d) };
  if (unit === 'Week') {
    const mon = new Date(d); mon.setDate(mon.getDate() - ((mon.getDay() + 6) % 7));
    const jan1 = new Date(mon.getFullYear(), 0, 1);
    // ISO week: the week of its Thursday.
    const thu = new Date(mon); thu.setDate(mon.getDate() + 3);
    const wk = Math.ceil(((thu - new Date(thu.getFullYear(), 0, 1)) / 86400000 + 1) / 7);
    return { key: mon.toDateString(), label: `W${String(wk).padStart(2, '0')}` };
  }
  if (unit === 'Month')   return { key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTHS[d.getMonth()].slice(0, 3) };
  if (unit === 'Quarter') {
    const q = Math.floor(d.getMonth() / 3) + 1;
    return { key: `${d.getFullYear()}-Q${q}`, label: multiYear ? `Q${q} ${d.getFullYear()}` : `Q${q}` };
  }
  return { key: String(d.getFullYear()), label: String(d.getFullYear()) };   // Year
}

// Ordered time slots over a range.
function timeSlots(unit, range) {
  if (unit === 'Day of the week') {
    return [1, 2, 3, 4, 5, 6, 0].map(dow => ({ key: 'dow' + dow, label: DOW3[dow] }));
  }
  const [start, end] = range;
  const multiYear = start.getFullYear() !== end.getFullYear();
  const slots = [], seen = new Set();
  const cur = new Date(start); cur.setHours(0,0,0,0);
  const last = new Date(end);  last.setHours(0,0,0,0);
  while (cur <= last) {
    const b = timeBucket(unit, cur, multiYear);
    if (!seen.has(b.key)) { seen.add(b.key); slots.push(b); }
    cur.setDate(cur.getDate() + 1);
  }
  return slots;
}
// A date's slot key on a time axis.
function dateSlotKey(unit, d, multiYear) {
  return unit === 'Day of the week' ? 'dow' + d.getDay() : timeBucket(unit, d, multiYear).key;
}

// The sums every Downtime row, bar and segment is made of.
function dtSums(stops) {
  let durSec = 0, durOeeSec = 0, notes = 0, loss = 0;
  stops.forEach(s => { durSec += s.durSec; if (s.inOee) durOeeSec += s.durSec; notes += s.notes; loss += s.loss; });
  const count = stops.length;
  return { durSec, durOeeSec, count, notes, loss, avgSec: count ? Math.round(durSec / count) : 0 };
}

// One Downtime row per X-axis value. base = { stops, segs, allSegs, range }.
// Rows hold their stops (the text columns and the Tags column read them).
// Time axes list every slot of the range, entity axes only values with stops.
function dtRows(xAxis, base) {
  const rows = new Map();
  if (TIME_AXES.has(xAxis)) {
    const my = base.range[0].getFullYear() !== base.range[1].getFullYear();
    // Stops count on the day their shift started. Only slots with stops make rows.
    timeSlots(xAxis, base.range).forEach((sl, i) => rows.set(sl.key, { key: sl.key, name: sl.label, order: i, stops: [] }));
    base.stops.forEach(s => rows.get(dateSlotKey(xAxis, s._b.date, my))?.stops.push(s));
    [...rows.keys()].forEach(k => { if (!rows.get(k).stops.length) rows.delete(k); });
  } else {
    const dim = DT_AXES[xAxis] || DT_AXES['Stop reasons'];
    base.stops.forEach(s => dim.keys(s).forEach(k => {
      if (!rows.has(k)) rows.set(k, { key: k, name: k, stops: [] });
      rows.get(k).stops.push(s);
    }));
    sortValues([...rows.keys()]).forEach((k, i) => { rows.get(k).order = i; });
  }
  const plannedOf = dtPlannedFn(xAxis, base);
  return [...rows.values()].map(r => {
    const sums = dtSums(r.stops);
    const plannedSec = plannedOf(r);
    return { ...r, ...sums, plannedSec, pct: plannedSec ? sums.durOeeSec / plannedSec * 100 : null };
  });
}

// The period's planned time (segments that pass the filters).
function dtTotalPlanned(base) { return base.segs.reduce((t, g) => t + g.plannedSec, 0); }

// Planned time per row (spec §7): the period's on Stop reasons, Stop groups and
// Machine locations; elsewhere the planned time of the row's own segments
// (its station, product, shift, day…). Tags: the segments its stops are on.
function dtPlannedFn(xAxis, base) {
  const total = dtTotalPlanned(base);
  if (TIME_AXES.has(xAxis)) {
    const my = base.range[0].getFullYear() !== base.range[1].getFullYear();
    const m = new Map();
    base.segs.forEach(g => { const k = dateSlotKey(xAxis, g.b.date, my); m.set(k, (m.get(k) || 0) + g.plannedSec); });
    return r => m.get(r.key) || 0;
  }
  const dim = DT_AXES[xAxis];
  if (!dim || dim.planned === 'total') return () => total;
  if (dim.planned === 'stops') {
    const bySeg = new Map((base.allSegs || base.segs).map(g => [g.key, g.plannedSec]));
    return r => [...new Set(r.stops.map(s => s._seg))].reduce((t, k) => t + (bySeg.get(k) || 0), 0);
  }
  const m = new Map();
  base.segs.forEach(g => dim.seg(g).forEach(k => m.set(k, (m.get(k) || 0) + g.plannedSec)));
  return r => m.get(r.key) || 0;
}

// The Total row: the whole period from every stop, not a sum of rows (rows
// overlap on the people and Tags axes).
function dtTotalRow(base) {
  const sums = dtSums(base.stops);
  const plannedSec = dtTotalPlanned(base);
  return { key: 'Total', name: 'Total', stops: base.stops, ...sums, plannedSec,
           pct: plannedSec ? sums.durOeeSec / plannedSec * 100 : null };
}

// OEE's line chart, one point per day of the selected range, rolled up from the
// same blocks as the table under it (the Day rows). `day` is the 1-based
// position the chart plots against.
function oeeDailySeries(blocks, range) {
  const byIdx = new Map();
  blocks.forEach(b => (byIdx.get(b.idx) || byIdx.set(b.idx, []).get(b.idx)).push(b));
  const today = new Date(); today.setHours(0,0,0,0);
  const days = daysBetween(range[0], range[1]).filter(d => d <= today);
  return days.map((date, i) => {
    const bs = byIdx.get(i) || [];
    const r = rollupOEE(bs);
    return {
      day: i + 1, date, label: timeBucket('Day', date).label, hasMain: bs.length > 0,
      quality: r.quality, performance: r.performance, availability: r.availability, oee: r.oee,
    };
  });
}
