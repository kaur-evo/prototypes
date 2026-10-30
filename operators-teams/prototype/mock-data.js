// Shared mock data for operators & teams prototypes
// Used by: setup-proto.html, index.html

const DATA_VERSION = 22; // bump to wipe stale localStorage

// Tags are setup-only descriptive labels (not used in Shift View role pick).
const MOCK_TAGS = ['Night-shift', 'Trainer', 'Newcomer', 'Bilingual'];

// Roles are picked per operator (single-select). Supervisor is available on
// the Pro tier; the rest are Enterprise-flagged in the UI (greyed + pill).
const MOCK_ROLES = ['Supervisor', 'Quality', 'Maintenance', 'External'];

const MOCK_STATIONS = [
  'Filling Line 1', 'Filling Line 2', 'Packaging A', 'Packaging B',
  'Warehouse', 'Quality Lab'
];

const MOCK_FACTORIES = [
  { id: 1, name: 'Athens Plant' },
  { id: 2, name: 'Warsaw Packaging' },
  { id: 3, name: 'Casablanca Production' },
];

// Station groups. Product rule (Settings → Stations): a station group belongs
// to exactly ONE factory, and every station sits in exactly one group. This is
// the only link between a station and a factory — which makes it the only way
// to tell which factory an operator works in, since operators carry stations
// and never a factory of their own.
const MOCK_STATION_GROUPS = [
  { id: 1, name: 'Athens Lines',       factoryId: 1, stations: ['Filling Line 1', 'Filling Line 2'] },
  { id: 2, name: 'Warsaw Packaging',   factoryId: 2, stations: ['Packaging A', 'Packaging B'] },
  { id: 3, name: 'Casablanca Support', factoryId: 3, stations: ['Warehouse', 'Quality Lab'] },
];

// station name → factory id, via the station's group.
function factoryOfStation(stationName) {
  const g = MOCK_STATION_GROUPS.find(sg => sg.stations.includes(stationName));
  return g ? g.factoryId : null;
}

// The factories an operator works in — derived from their assigned stations.
// An operator assigned stations in two groups genuinely spans two factories.
function factoriesOfOperator(op) {
  const ids = new Set();
  (op?.stations || []).forEach(st => {
    const f = factoryOfStation(st);
    if (f != null) ids.add(f);
  });
  return [...ids].sort((a, b) => a - b);
}

// Operator groups. "Operators" is the mandatory fallback bucket for operators
// who don't fit into any named group. Always present.
// Teams (operator groups). `isGlobal: true` → visible across all factories
// (factoryIds ignored). Otherwise `factoryIds: number[]` lists which factories
// the group is scoped to.
const MOCK_TEAMS = [
  { id: 1, name: 'Operators', color: '#9e9e9e', isGlobal: true,  factoryIds: [1, 2, 3], tags: [] },
  { id: 2, name: 'Blue Team', color: '#2196f3', isGlobal: false, factoryIds: [1, 2],    tags: [] },
  { id: 3, name: 'Red Team',  color: '#e53935', isGlobal: false, factoryIds: [2],       tags: [] },
  // Empty on purpose: the only group that can actually be deleted, so the
  // "cannot delete a group with members" rule has a counter-example to test.
  { id: 4, name: 'Night Crew', color: '#7e57c2', isGlobal: false, factoryIds: [3],      tags: [] },
];

// Operators spread across the named groups: Blue Team and Red Team each have a
// leader (canLead) plus members; the remaining two sit in the fallback
// "Operators" group. `canLead` (Leader mode) drives the leader-select demo.
const MOCK_OPERATORS = [
  // Blue Team — spans Athens Lines (factory 1) and Warsaw Packaging (factory 2),
  // which is why the group is scoped to both.
  { id: 1,  firstName: 'Vasilis',  lastName: 'Mavroeidis',   role: null, tags: ['Night-shift'], teamId: 2, canLead: true, stations: ['Filling Line 1', 'Filling Line 2'] },
  { id: 3,  firstName: 'Maria',    lastName: 'Kostopoulou',  role: null, tags: [],              teamId: 2,                stations: ['Filling Line 1'] },
  { id: 9,  firstName: 'Petros',   lastName: 'Lambrou',      role: null, tags: [],              teamId: 2,                stations: ['Filling Line 1', 'Filling Line 2'] },
  { id: 4,  firstName: 'Giorgos',  lastName: 'Antoniou',     role: null, tags: [],              teamId: 2,                stations: ['Packaging A', 'Packaging B'] },
  { id: 10, firstName: 'Anna',     lastName: 'Dimitriou',    role: null, tags: ['Newcomer'],    teamId: 2,                stations: ['Packaging A', 'Packaging B'] },
  // Red Team — Warsaw Packaging only (factory 2).
  { id: 2,  firstName: 'Nikos',    lastName: 'Papadopoulos', role: null, tags: ['Trainer'],     teamId: 3, canLead: true, stations: ['Packaging A', 'Packaging B'] },
  { id: 5,  firstName: 'Elena',    lastName: 'Christodoulou',role: null, tags: ['Newcomer'],    teamId: 3,                stations: ['Packaging A'] },
  { id: 6,  firstName: 'Dimitris', lastName: 'Ekonomou',     role: null, tags: [],              teamId: 3,                stations: ['Packaging B'] },
  { id: 11, firstName: 'Kostas',   lastName: 'Vlachos',      role: null, tags: [],              teamId: 3,                stations: ['Packaging A', 'Packaging B'] },
  { id: 12, firstName: 'Despina',  lastName: 'Roussou',      role: null, tags: ['Night-shift'], teamId: 3,                stations: ['Packaging A'] },
  // Operators (fallback group) — Casablanca Support (factory 3).
  { id: 7,  firstName: 'Stavros',  lastName: 'Nikolaou',     role: null, tags: [],              teamId: 1,                stations: ['Warehouse', 'Quality Lab'] },
  { id: 8,  firstName: 'Sofia',    lastName: 'Panagiotou',   role: null, tags: ['Night-shift'], teamId: 1,                stations: ['Quality Lab'] },
];

// Per-station feature toggles. Off by default — Spiros constraint: "must be optional".
const MOCK_STATION_SETTINGS = MOCK_STATIONS.map(name => ({
  name,
  enableShiftLeader: false,
}));

// The station currently shown in the Shift View prototype. Toggling its
// `enableShiftLeader` flag governs whether the bottom-bar chip elevates the leader.
const SHIFT_VIEW_STATION = MOCK_STATIONS[0]; // 'Filling Line 1'

// ── Shared persistence layer (localStorage) ──
// Both setup-proto and shift-view use this to stay in sync.
// _checkVersion() wipes stale data whenever DATA_VERSION is bumped.
const SharedData = {
  _KEY_TEAMS:    'evocon_teams',
  _KEY_OPS:      'evocon_operators',
  _KEY_STATIONS: 'evocon_stations',
  _KEY_VERSION:  'evocon_data_version',

  _checkVersion() {
    if (localStorage.getItem(this._KEY_VERSION) !== String(DATA_VERSION)) {
      localStorage.removeItem(this._KEY_TEAMS);
      localStorage.removeItem(this._KEY_OPS);
      localStorage.removeItem(this._KEY_STATIONS);
      localStorage.setItem(this._KEY_VERSION, String(DATA_VERSION));
    }
  },

  getTeams() {
    this._checkVersion();
    const s = localStorage.getItem(this._KEY_TEAMS);
    return s ? JSON.parse(s) : JSON.parse(JSON.stringify(MOCK_TEAMS));
  },
  getOperators() {
    this._checkVersion();
    const s = localStorage.getItem(this._KEY_OPS);
    return s ? JSON.parse(s) : JSON.parse(JSON.stringify(MOCK_OPERATORS));
  },
  getStations() {
    this._checkVersion();
    const s = localStorage.getItem(this._KEY_STATIONS);
    return s ? JSON.parse(s) : JSON.parse(JSON.stringify(MOCK_STATION_SETTINGS));
  },
  saveTeams(teams) {
    localStorage.setItem(this._KEY_TEAMS, JSON.stringify(teams));
  },
  saveOperators(operators) {
    localStorage.setItem(this._KEY_OPS, JSON.stringify(operators));
  },
  saveStations(stations) {
    localStorage.setItem(this._KEY_STATIONS, JSON.stringify(stations));
  },
  reset() {
    localStorage.removeItem(this._KEY_TEAMS);
    localStorage.removeItem(this._KEY_OPS);
    localStorage.removeItem(this._KEY_STATIONS);
    localStorage.removeItem(this._KEY_VERSION);
  },
};
