// tags-store.js — the one source of truth for tags, shared by Settings and Reports.
//
// Plain script: defines `window.TagsStore` in the browser and `module.exports`
// in Node (tests). Settings writes through it; Reports reads through it. State
// persists in localStorage, so tagging a reason in Settings changes the report
// after switching pages (and live, in another tab, via the `storage` event).
//
// Entities and their tag Type keys:
//   STOP_REASON, STOP_GROUP             — exist in the product today
//   SPEED_LOSS_REASON, SPEED_LOSS_GROUP — exist today, not used by the prototype
//   SCRAP_REASON, SCRAP_GROUP           — exist today, not used by the prototype
//   OPERATOR, OPERATOR_GROUP            — NEW in this mission
//
// Names in this file are the names Reports already uses (data.js): stop reason
// and group names match DT_REASONS, operator short names match
// OPERATOR_DIRECTORY ("V. Mavroeidis"), groups match OPERATOR_GROUPS.
(function (root) {
  const DATA_VERSION = 3; // bump to wipe stale browser state (2: Settings seed fields; 3: CIP wash stations)
  const KEY = 'evocon_tags_proto_state';
  const KEY_VERSION = 'evocon_tags_proto_version';

  const TAG_TYPES = [
    { key: 'STOP_REASON',       label: 'Stop reasons' },
    { key: 'STOP_GROUP',        label: 'Stop groups' },
    { key: 'SPEED_LOSS_REASON', label: 'Speed loss reasons' },
    { key: 'SPEED_LOSS_GROUP',  label: 'Speed loss groups' },
    { key: 'SCRAP_REASON',      label: 'Scrap reasons' },
    { key: 'SCRAP_GROUP',       label: 'Scrap groups' },
    { key: 'OPERATOR',          label: 'Operators',       isNew: true },
    { key: 'OPERATOR_GROUP',    label: 'Operator groups', isNew: true },
  ];

  // Fields of the Reports "Tags" rule filter (Downtime). Each field reads the
  // tags of one entity, and offers only the tags whose Type includes it.
  const FILTER_FIELDS = [
    { key: 'STOP_REASON',    label: 'Stop reason tags',    type: 'STOP_REASON' },
    { key: 'STOP_GROUP',     label: 'Stop group tags',     type: 'STOP_GROUP' },
    { key: 'OPERATOR',       label: 'Operator tags',       type: 'OPERATOR' },
    { key: 'OPERATOR_GROUP', label: 'Operator group tags', type: 'OPERATOR_GROUP' },
  ];

  // Comparisons. `needsTags: false` hides the tag picker.
  const COMPARISONS = [
    { key: 'is',      label: 'is',           needsTags: true  }, // has at least one selected tag
    { key: 'isNot',   label: 'is not',       needsTags: true  }, // has none of the selected tags
    { key: 'isAll',   label: 'includes all', needsTags: true  }, // has every selected tag
    { key: 'hasAny',  label: 'has any tag',  needsTags: false },
    { key: 'hasNone', label: 'has no tag',   needsTags: false },
  ];

  const FACTORIES = ['Factory 1', 'Factory 2'];

  // Stations and their factory, as Reports names them (data.js FACTORY_OF).
  // Settings shows them on stop reasons and operators and derives the
  // Factories column from them, as the product does.
  const STATIONS = [
    { name: 'CNC-01',      factory: 'Factory 1' },
    { name: 'CNC-02',      factory: 'Factory 1' },
    { name: 'CNC-03',      factory: 'Factory 1' },
    { name: 'Press-01',    factory: 'Factory 1' },
    { name: 'Press-02',    factory: 'Factory 1' },
    { name: 'Press-03',    factory: 'Factory 1' },
    { name: 'Assembly-01', factory: 'Factory 2' },
    { name: 'Assembly-02', factory: 'Factory 2' },
    { name: 'Packing-01',  factory: 'Factory 2' },
    { name: 'Warehouse',   factory: 'Factory 2' },
    { name: 'Quality Lab', factory: 'Factory 2' },
  ];
  const ALL_STATIONS = STATIONS.map(s => s.name);

  // ── Seed data ────────────────────────────────────────────────────────────
  const SEED = {
    tagsEnabled: true, // the Enterprise "Tags" feature flag for this company
    tags: [
      { id: 1,  name: 'Cleaning',    alias: 'CLN',  types: ['STOP_REASON', 'STOP_GROUP'] },
      { id: 2,  name: 'Breakdown',   alias: 'BRK',  types: ['STOP_REASON', 'STOP_GROUP'] },
      { id: 3,  name: 'Material',    alias: 'MAT',  types: ['STOP_REASON', 'STOP_GROUP'] },
      { id: 4,  name: 'Quality',     alias: 'QLT',  types: ['STOP_REASON', 'STOP_GROUP', 'SCRAP_REASON'] },
      { id: 5,  name: 'Waiting',     alias: 'WAIT', types: ['STOP_REASON'] },
      { id: 6,  name: 'Planned',     alias: 'PLN',  types: ['STOP_GROUP'] },
      { id: 7,  name: 'External',    alias: 'EXT',  types: ['STOP_REASON', 'STOP_GROUP'] },
      { id: 8,  name: 'Trainer',     alias: 'TRN',  types: ['OPERATOR'] },
      { id: 9,  name: 'Newcomer',    alias: 'NEW',  types: ['OPERATOR'] },
      { id: 10, name: 'Night-shift', alias: 'NGT',  types: ['OPERATOR', 'OPERATOR_GROUP'] },
      { id: 11, name: 'Production',  alias: 'PRD',  types: ['OPERATOR_GROUP'] },
      { id: 12, name: 'Support',     alias: 'SUP',  types: ['OPERATOR_GROUP'] },
    ],
    // "Uncommented" is not a group or reason: it is the absence of a reason, so
    // it is not listed here and an uncommented stop carries no stop tags.
    stopGroups: [
      { id: 1, name: 'Mechanical', color: '#E01C21', tagIds: [2] },
      { id: 2, name: 'Planned',    color: '#9E9E9E', tagIds: [6] },
      { id: 3, name: 'Material',   color: '#3498DB', tagIds: [3] },
      { id: 4, name: 'Setup',      color: '#0066CC', tagIds: [] },
      { id: 5, name: 'Quality',    color: '#2ECC71', tagIds: [4] },
      { id: 6, name: 'Operator',   color: '#F1C40F', tagIds: [] },
      { id: 7, name: 'Other',      color: '#1ABC9C', tagIds: [7] },
    ],
    // factory: null = global reason; a factory name = local to that factory.
    // includeInOee and stations are Settings-only detail (read-only there).
    stopReasons: [
      { id: 1,  name: 'Motor failure',  group: 'Mechanical', type: 'Unplanned', factory: null,        tagIds: [], includeInOee: true, stations: ALL_STATIONS },      // group gives Breakdown
      { id: 2,  name: 'Belt broken',    group: 'Mechanical', type: 'Unplanned', factory: null,        tagIds: [2], includeInOee: true, stations: ALL_STATIONS },
      { id: 3,  name: 'Bearing worn',   group: 'Mechanical', type: 'Unplanned', factory: null,        tagIds: [], includeInOee: true, stations: ALL_STATIONS },
      { id: 4,  name: 'Planned maint.', group: 'Planned',    type: 'Planned',   factory: null,        tagIds: [], includeInOee: true, stations: ALL_STATIONS },
      { id: 5,  name: 'Planned break',  group: 'Planned',    type: 'Planned',   factory: null,        tagIds: [], includeInOee: false, stations: ALL_STATIONS },
      { id: 6,  name: 'Mat. shortage',  group: 'Material',   type: 'Unplanned', factory: null,        tagIds: [3, 5], includeInOee: true, stations: ALL_STATIONS },  // two tags
      { id: 7,  name: 'Waiting parts',  group: 'Material',   type: 'Unplanned', factory: null,        tagIds: [5], includeInOee: true, stations: ALL_STATIONS },
      { id: 8,  name: 'Changeover',     group: 'Setup',      type: 'Planned',   factory: null,        tagIds: [], includeInOee: true, stations: ALL_STATIONS },
      { id: 9,  name: 'Calibration',    group: 'Setup',      type: 'Planned',   factory: null,        tagIds: [4], includeInOee: true, stations: ALL_STATIONS },
      { id: 10, name: 'Line cleaning',  group: 'Setup',      type: 'Planned',   factory: 'Factory 1', tagIds: [1], includeInOee: true, stations: ['Press-01', 'Press-02', 'Press-03'] },     // local, Syngenta case
      { id: 11, name: 'CIP wash',       group: 'Planned',    type: 'Planned',   factory: 'Factory 2', tagIds: [1], includeInOee: true, stations: ['Assembly-02', 'Packing-01'] },     // local; group says Planned
      { id: 12, name: 'Quality check',  group: 'Quality',    type: 'Unplanned', factory: null,        tagIds: [4], includeInOee: true, stations: ALL_STATIONS },
      { id: 13, name: 'Prod. defect',   group: 'Quality',    type: 'Unplanned', factory: null,        tagIds: [4], includeInOee: true, stations: ALL_STATIONS },
      { id: 14, name: 'Operator break', group: 'Operator',   type: 'Planned',   factory: null,        tagIds: [], includeInOee: false, stations: ALL_STATIONS },
      { id: 15, name: 'Training',       group: 'Operator',   type: 'Planned',   factory: null,        tagIds: [], includeInOee: false, stations: ALL_STATIONS },
      { id: 16, name: 'Ext. factor',    group: 'Other',      type: 'Unplanned', factory: null,        tagIds: [], includeInOee: true, stations: ALL_STATIONS },
      { id: 17, name: 'Power outage',   group: 'Other',      type: 'Unplanned', factory: null,        tagIds: [2], includeInOee: true, stations: ALL_STATIONS },     // reason Breakdown, group External
    ],
    // factories: Settings-only detail (read-only there).
    operatorGroups: [
      { id: 1, name: 'Blue Team',   tagIds: [11], factories: ['Factory 1', 'Factory 2'] },
      { id: 2, name: 'Red Team',    tagIds: [11], factories: ['Factory 1', 'Factory 2'] },
      { id: 3, name: 'Night Crew',  tagIds: [11, 10], factories: ['Factory 1', 'Factory 2'] },
      { id: 4, name: 'Maintenance', tagIds: [12], factories: ['Factory 2'] },
    ],
    // `short` is how Reports names the operator. stations, canLead ("Allow as
    // shift leader") and passcode are Settings-only detail (read-only there).
    operators: [
      { id: 1,  firstName: 'Vasilis',   lastName: 'Mavroeidis',    short: 'V. Mavroeidis',    group: 'Blue Team',   tagIds: [8],
        stations: ['CNC-01', 'CNC-02', 'Assembly-02'], canLead: true, passcode: true },
      { id: 2,  firstName: 'Maria',     lastName: 'Kostopoulou',   short: 'M. Kostopoulou',   group: 'Blue Team',   tagIds: [],
        stations: ['CNC-01', 'CNC-02', 'Press-01', 'Assembly-02'], canLead: true, passcode: true },
      { id: 3,  firstName: 'Giorgos',   lastName: 'Antoniou',      short: 'G. Antoniou',      group: 'Blue Team',   tagIds: [],
        stations: ['CNC-01', 'CNC-02', 'Press-01'], canLead: false, passcode: false },
      { id: 4,  firstName: 'Petros',    lastName: 'Lambrou',       short: 'P. Lambrou',       group: 'Blue Team',   tagIds: [],
        stations: ['CNC-01', 'CNC-02', 'Assembly-02'], canLead: false, passcode: false },
      { id: 5,  firstName: 'Anna',      lastName: 'Dimitriou',     short: 'A. Dimitriou',     group: 'Blue Team',   tagIds: [9],
        stations: ['CNC-02', 'Press-01'], canLead: false, passcode: false },
      { id: 6,  firstName: 'Nikos',     lastName: 'Papadopoulos',  short: 'N. Papadopoulos',  group: 'Red Team',    tagIds: [8],
        stations: ['Press-01', 'Press-02', 'Press-03', 'Assembly-01'], canLead: true, passcode: true },
      { id: 7,  firstName: 'Elena',     lastName: 'Christodoulou', short: 'E. Christodoulou', group: 'Red Team',    tagIds: [9],
        stations: ['Press-01', 'Press-03', 'Assembly-01'], canLead: false, passcode: false },
      { id: 8,  firstName: 'Dimitris',  lastName: 'Ekonomou',      short: 'D. Ekonomou',      group: 'Red Team',    tagIds: [],
        stations: ['CNC-03', 'Press-01', 'Press-02'], canLead: false, passcode: false },
      { id: 9,  firstName: 'Kostas',    lastName: 'Vlachos',       short: 'K. Vlachos',       group: 'Red Team',    tagIds: [],
        stations: ['CNC-03', 'Press-02', 'Press-03', 'Assembly-01'], canLead: true, passcode: false },
      { id: 10, firstName: 'Despina',   lastName: 'Roussou',       short: 'D. Roussou',       group: 'Red Team',    tagIds: [10],
        stations: ['CNC-03', 'Press-02'], canLead: false, passcode: false },
      { id: 11, firstName: 'Ioannis',   lastName: 'Georgiou',      short: 'I. Georgiou',      group: 'Night Crew',  tagIds: [8, 10],
        stations: ['Assembly-02', 'Packing-01'], canLead: true, passcode: true },
      { id: 12, firstName: 'Thanos',    lastName: 'Karalis',       short: 'T. Karalis',       group: 'Night Crew',  tagIds: [10],
        stations: ['CNC-03', 'Assembly-02', 'Packing-01'], canLead: true, passcode: false },
      { id: 13, firstName: 'Lena',      lastName: 'Mitsou',        short: 'L. Mitsou',        group: 'Night Crew',  tagIds: [9, 10],
        stations: ['CNC-03', 'Packing-01'], canLead: false, passcode: false },
      { id: 14, firstName: 'Alexandros',lastName: 'Petrou',        short: 'A. Petrou',        group: 'Night Crew',  tagIds: [],
        stations: ['CNC-03', 'Assembly-02', 'Packing-01'], canLead: false, passcode: false },
      { id: 15, firstName: 'Stavros',   lastName: 'Nikolaou',      short: 'S. Nikolaou',      group: 'Maintenance', tagIds: [],
        stations: ['Warehouse', 'Quality Lab'], canLead: true, passcode: true },
      { id: 16, firstName: 'Sofia',     lastName: 'Panagiotou',    short: 'S. Panagiotou',    group: 'Maintenance', tagIds: [],
        stations: ['Warehouse', 'Quality Lab'], canLead: true, passcode: false },
      { id: 17, firstName: 'Haris',     lastName: 'Stavrou',       short: 'H. Stavrou',       group: 'Maintenance', tagIds: [9],
        stations: ['Warehouse', 'Quality Lab'], canLead: false, passcode: false },
    ],
  };

  // ── Persistence ──────────────────────────────────────────────────────────
  const hasLS = (() => { try { return typeof localStorage !== 'undefined'; } catch (e) { return false; } })();
  const clone = (o) => JSON.parse(JSON.stringify(o));
  let mem = null; // in-memory state (Node, or when localStorage fails)

  function load() {
    if (mem) return mem;
    let s = null;
    if (hasLS) {
      try {
        if (localStorage.getItem(KEY_VERSION) !== String(DATA_VERSION)) {
          localStorage.removeItem(KEY);
          localStorage.setItem(KEY_VERSION, String(DATA_VERSION));
        }
        const raw = localStorage.getItem(KEY);
        if (raw) s = JSON.parse(raw);
      } catch (e) { s = null; }
    }
    mem = s || clone(SEED);
    return mem;
  }
  function save() {
    if (hasLS) { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { /* ignore */ } }
    if (typeof root.dispatchEvent === 'function' && typeof CustomEvent !== 'undefined') {
      root.dispatchEvent(new CustomEvent('tags:changed'));
    }
  }
  // Another tab (Settings) saved: drop the cache and tell this page.
  if (typeof root.addEventListener === 'function') {
    root.addEventListener('storage', (e) => {
      if (e.key === KEY) { mem = null; root.dispatchEvent(new CustomEvent('tags:changed')); }
    });
  }

  const COLLECTIONS = ['tags', 'stopGroups', 'stopReasons', 'operatorGroups', 'operators'];

  // ── Read ─────────────────────────────────────────────────────────────────
  function list(collection) { return clone(load()[collection] || []); }
  function getTags() { return list('tags'); }
  function tagById(id) { return load().tags.find(t => t.id === id) || null; }
  function tagsOfType(type) {
    return load().tags.filter(t => t.types.includes(type))
      .slice().sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
  }
  // Tag names for ids. A deleted tag's id has no record any more; with
  // `withDeleted` it reads "Deleted" (the product's label for deleted filter
  // values), otherwise it is left out.
  function tagNames(ids, opts) {
    return (ids || []).map(id => tagById(id)?.name || (opts?.withDeleted ? 'Deleted' : null)).filter(Boolean);
  }
  // Where a tag is used, per Type: item names (operators by short name).
  // Feeds the Reports tag picker's secondary text and Settings' warnings.
  function tagUsage(tagId) {
    const s = load();
    const names = (arr, key = 'name') => arr.filter(x => (x.tagIds || []).includes(tagId)).map(x => x[key]);
    return {
      STOP_REASON: names(s.stopReasons), STOP_GROUP: names(s.stopGroups),
      OPERATOR: names(s.operators, 'short'), OPERATOR_GROUP: names(s.operatorGroups),
    };
  }
  // A selected tag inside a rule condition: usable, deleted, or no longer of
  // the field's Type (its Type was removed in Settings). Not 'ok' = it matches
  // nothing, and the UI must say so instead of dropping it.
  function tagStateInField(tagId, fieldKey) {
    const t = tagById(tagId);
    if (!t) return 'deleted';
    const f = FILTER_FIELDS.find(x => x.key === fieldKey);
    return f && t.types.includes(f.type) ? 'ok' : 'wrongType';
  }
  function isNameTaken(name, exceptId) {
    const n = String(name || '').trim().toLocaleLowerCase();
    return load().tags.some(t => t.id !== exceptId && t.name.trim().toLocaleLowerCase() === n);
  }
  function isTagsEnabled() { return !!load().tagsEnabled; }

  // ── Write ────────────────────────────────────────────────────────────────
  function setTagsEnabled(on) { load().tagsEnabled = !!on; save(); }
  function nextId(arr) { return arr.reduce((m, x) => Math.max(m, x.id), 0) + 1; }

  // Upsert one item of a collection. Returns the saved copy.
  function saveItem(collection, item) {
    const arr = load()[collection];
    if (item.id == null) { item = { ...item, id: nextId(arr) }; arr.push(item); }
    else {
      const i = arr.findIndex(x => x.id === item.id);
      if (i < 0) arr.push(item); else arr[i] = { ...arr[i], ...item };
    }
    save();
    return clone(arr.find(x => x.id === item.id));
  }
  function deleteItem(collection, id) {
    const s = load();
    s[collection] = s[collection].filter(x => x.id !== id);
    save();
  }
  // Deleting a tag removes it from every assignment (history changes too).
  function deleteTag(id) {
    const s = load();
    s.tags = s.tags.filter(t => t.id !== id);
    COLLECTIONS.slice(1).forEach(c => s[c].forEach(x => { x.tagIds = (x.tagIds || []).filter(t => t !== id); }));
    save();
  }
  // Narrowing a tag's Types removes it from entities of the dropped Types.
  function saveTag(tag) {
    const saved = saveItem('tags', tag);
    const s = load();
    const byType = { STOP_REASON: 'stopReasons', STOP_GROUP: 'stopGroups', OPERATOR: 'operators', OPERATOR_GROUP: 'operatorGroups' };
    Object.entries(byType).forEach(([type, c]) => {
      if (!saved.types.includes(type)) s[c].forEach(x => { x.tagIds = (x.tagIds || []).filter(t => t !== saved.id); });
    });
    save();
    return saved;
  }
  function reset() {
    mem = clone(SEED);
    if (hasLS) { try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } }
    save();
  }

  // ── Subjects: what a stop carries ────────────────────────────────────────
  // A stop's tag subject, one set of tag ids per filter field. People follow
  // Reports attribution: a stop belongs to everyone registered at its start, so
  // its operator tags are the union of those operators' tags, and its operator
  // group tags the union of their groups' tags.
  function subjectForStop({ reason, group, operators }) {
    const s = load();
    const r = s.stopReasons.find(x => x.name === reason);
    const g = s.stopGroups.find(x => x.name === group);
    const ops = (operators || []).map(n => s.operators.find(o => o.short === n)).filter(Boolean);
    const opGroups = [...new Set(ops.map(o => o.group))].map(n => s.operatorGroups.find(x => x.name === n)).filter(Boolean);
    const union = (items) => [...new Set(items.flatMap(x => x.tagIds || []))];
    return {
      STOP_REASON: r ? [...r.tagIds] : [],
      STOP_GROUP: g ? [...g.tagIds] : [],
      OPERATOR: union(ops),
      OPERATOR_GROUP: union(opGroups),
    };
  }

  // ── Rule filter ──────────────────────────────────────────────────────────
  // rule  = { op: 'AND'|'OR', items: [condition | group] }   (top level)
  // group = { kind: 'group', op: 'AND'|'OR', items: [condition] } (one level)
  // condition = { field: FILTER_FIELDS key, cmp: COMPARISONS key, tagIds: number[] }
  //
  // A condition that needs tags but has none is incomplete and ignored. A group
  // or rule with no complete conditions matches everything.
  function isComplete(c) {
    const cmp = COMPARISONS.find(x => x.key === c.cmp);
    return !!cmp && !!FILTER_FIELDS.find(f => f.key === c.field) && (!cmp.needsTags || (c.tagIds || []).length > 0);
  }
  function evalCondition(c, subject) {
    const have = new Set(subject[c.field] || []);
    const sel = c.tagIds || [];
    switch (c.cmp) {
      case 'is':      return sel.some(t => have.has(t));
      case 'isNot':   return !sel.some(t => have.has(t));
      case 'isAll':   return sel.every(t => have.has(t));
      case 'hasAny':  return have.size > 0;
      case 'hasNone': return have.size === 0;
      default:        return true;
    }
  }
  function evalNode(node, subject) {
    if (node.kind === 'group' || Array.isArray(node.items)) {
      const parts = (node.items || []).filter(n => n.kind === 'group' || Array.isArray(n.items) ? hasComplete(n) : isComplete(n));
      if (!parts.length) return true;
      return node.op === 'OR' ? parts.some(n => evalNode(n, subject)) : parts.every(n => evalNode(n, subject));
    }
    return evalCondition(node, subject);
  }
  function hasComplete(node) {
    if (node.kind === 'group' || Array.isArray(node.items)) return (node.items || []).some(hasComplete);
    return isComplete(node);
  }
  function isGroupNode(node) { return node?.kind === 'group' || Array.isArray(node?.items); }
  function evaluate(rule, subject) { return !rule ? true : evalNode(rule, subject); }
  function countConditions(rule) {
    if (!rule) return 0;
    return (rule.items || []).reduce((n, x) => n + (x.kind === 'group' || Array.isArray(x.items) ? countConditions(x) : (isComplete(x) ? 1 : 0)), 0);
  }
  function emptyRule() { return { op: 'AND', items: [] }; }

  // Plain-language reading of a rule, for the chip tooltip.
  function describeCondition(c) {
    const f = FILTER_FIELDS.find(x => x.key === c.field);
    const cmp = COMPARISONS.find(x => x.key === c.cmp);
    if (!f || !cmp) return '';
    if (!cmp.needsTags) return `${f.label} ${cmp.label}`;
    // "is" means any of the tags, "includes all" every one of them.
    const sep = c.cmp === 'is' ? ' or ' : c.cmp === 'isAll' ? ' and ' : ', ';
    return `${f.label} ${cmp.label} ${tagNames(c.tagIds, { withDeleted: true }).join(sep)}`;
  }
  function describe(rule, nested) {
    if (!rule) return '';
    const parts = (rule.items || []).filter(hasComplete).map(n =>
      (n.kind === 'group' || Array.isArray(n.items)) ? `(${describe(n, true)})` : describeCondition(n));
    return parts.join(` ${rule.op === 'OR' ? 'OR' : 'AND'} `);
  }

  // Problems in a saved rule: selected tags that were deleted or lost the
  // field's Type. They stay in the rule and match nothing; the UI flags them.
  function ruleProblems(rule) {
    const out = [];
    const walk = (n) => isGroupNode(n) ? (n.items || []).forEach(walk)
      : (n.tagIds || []).forEach(id => { const st = tagStateInField(id, n.field); if (st !== 'ok') out.push({ tagId: id, field: n.field, state: st }); });
    if (rule) walk(rule);
    return out;
  }
  // Superseded: dropping deleted tags silently widened saved rules. Kept for
  // reference only; do not use.
  function pruneRule(rule) {
    if (!rule) return rule;
    const ids = new Set(load().tags.map(t => t.id));
    const walk = (n) => (n.kind === 'group' || Array.isArray(n.items))
      ? { ...n, items: (n.items || []).map(walk) }
      : { ...n, tagIds: (n.tagIds || []).filter(t => ids.has(t)) };
    return walk(rule);
  }

  const api = {
    DATA_VERSION, TAG_TYPES, FILTER_FIELDS, COMPARISONS, FACTORIES, STATIONS, SEED,
    getTags, tagById, tagsOfType, tagNames, tagUsage, tagStateInField, isNameTaken, isTagsEnabled, setTagsEnabled,
    getStopGroups: () => list('stopGroups'), getStopReasons: () => list('stopReasons'),
    getOperatorGroups: () => list('operatorGroups'), getOperators: () => list('operators'),
    saveItem, deleteItem, saveTag, deleteTag, reset,
    subjectForStop, evaluate, isComplete, countConditions, emptyRule, describe, describeCondition, ruleProblems, isGroupNode, pruneRule,
  };
  root.TagsStore = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
