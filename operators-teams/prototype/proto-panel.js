/**
 * proto-panel.js — shared "Prototype settings" panel (H-key toggle).
 *
 * Self-contained, framework-agnostic. Include it on any prototype page and it
 * injects a fixed panel into <body>, toggled with the H key. It is the single
 * source of truth for the prototype options: it reads/writes localStorage,
 * mirrors each value onto a window.__proto* global, and dispatches a
 * `proto:<key>` CustomEvent on change. Other code (Vue components, vanilla
 * renders) just listens for those events / reads the globals — no per-page
 * panel wiring. This keeps the settings working identically in Settings and
 * Shift View.
 */
(function () {
  // Each option is a boolean feature: a sentence + an on/off tickbox. The stored
  // value is still a string (`on` / `off` below) so consumer code keeps reading
  // the same values it always did (e.g. 'chip', 'flat'). `defOn` is the default
  // checked state. Add an option here and it appears on every page.
  const OPTIONS = [
    {
      key: 'protoCardLayout', global: '__protoCardLayout', event: 'proto:cardLayout',
      label: 'Alternative operator card layout (time + roles, one row per tag)',
      on: 'twoRow', off: 'classic', defOn: true,
    },
    {
      key: 'protoTier', global: '__protoTier', event: 'proto:tier',
      label: 'Enterprise plan (all roles available)',
      on: 'enterprise', off: 'pro', defOn: false,
    },
    {
      key: 'protoOpList', global: '__protoOpList', event: 'proto:opList',
      label: 'Flat operator list (all operators in one list, like live today)',
      on: 'flat', off: 'grouped', defOn: false,
    },
    {
      // 3-way (mutually-exclusive) — rendered as a small group of radio-style
      // tickboxes. Stored value is one of the `radio` values. Chip is the
      // spec-final UX; field/dropdown kept as reference variants.
      key: 'protoLeaderStyle', global: '__protoLeaderStyle', event: 'proto:leaderStyle',
      def: 'chip',
      radio: [
        { value: 'chip',     label: 'Shift leader — chip (flag chip on each operator row) — SPEC' },
        { value: 'field',    label: 'Shift leader — field (dropdown below the list)' },
        { value: 'dropdown', label: 'Shift leader — row dropdown (role menu per operator, extensible)' },
      ],
    },
    {
      // Stands in for Settings → Stations → "Allow additional workforce on
      // shift" (the real Stations screen is out of prototype scope). Gates the
      // Additional workforce row in the Shift View picker.
      key: 'protoAllowAW', global: '__protoAllowAW', event: 'proto:allowAW',
      label: 'Station setting: "Allow additional workforce on shift"',
      on: 'on', off: 'off', defOn: true,
    },
    {
      key: 'protoExcludeManhours', global: '__protoExcludeManhours', event: 'proto:excludeManhours',
      label: 'Show "Exclude from man-hours" switch on operators',
      on: 'on', off: 'off', defOn: false,
    },
    {
      key: 'protoLeaderPrefill', global: '__protoLeaderPrefill', event: 'proto:leaderPrefill',
      label: 'Pre-fill the first eligible operator as shift leader',
      on: 'on', off: 'off', defOn: false,
    },
    {
      key: 'protoMultiLeader', global: '__protoMultiLeader', event: 'proto:multiLeader',
      label: 'Allow multiple shift leaders (multi-select / multiple chips)',
      on: 'on', off: 'off', defOn: false,
    },
    {
      // Tags are still an open question, so the panel can take them out of the
      // page entirely: both table columns, both modal fields, and the
      // dropdowns behind them. Off answers "what does this look like without
      // tags at all", which is cheaper to look at than to argue about.
      key: 'protoTags', global: '__protoTags', event: 'proto:tags',
      label: 'Tags on operators and operator groups',
      on: 'on', off: 'off', defOn: false,
    },
    {
      // How an overlapping entry's additional-workforce count combines with
      // what is already recorded for that stretch of time.
      //   off (default) — the new count states the reality for that stretch and
      //                   replaces what was there. 5 people 12:00-17:00 plus 3
      //                   entered for 13:00-14:00 gives 3 for that hour.
      //   on            — the counts add up, giving 8 for that hour.
      key: 'protoAWMerge', global: '__protoAWMerge', event: 'proto:awMerge',
      label: 'Additional workforce adds up on overlap (instead of restating it)',
      on: 'on', off: 'off', defOn: false,
    },
  ];

  function get(opt) {
    const stored = localStorage.getItem(opt.key);
    if (stored != null) return stored;
    return opt.radio ? opt.def : (opt.defOn ? opt.on : opt.off);
  }
  function isOn(opt) {
    return get(opt) === opt.on;
  }
  function set(opt, value) {
    localStorage.setItem(opt.key, value);
    window[opt.global] = value;
    window.dispatchEvent(new CustomEvent(opt.event, { detail: value }));
    syncInputs(opt, value);
  }

  // Spec-finalisation reset: when defaults change (leader style → chip, then
  // tags off) bump PANEL_VERSION so stale stored choices are cleared once and
  // everyone lands on the spec defaults.
  const PANEL_VERSION = '3';
  if (localStorage.getItem('protoPanelVersion') !== PANEL_VERSION) {
    OPTIONS.forEach(opt => localStorage.removeItem(opt.key));
    localStorage.setItem('protoPanelVersion', PANEL_VERSION);
  }

  // Seed globals immediately (before DOM/panel) so components reading them at
  // construction time get the persisted value.
  OPTIONS.forEach(opt => { window[opt.global] = get(opt); });

  let panelEl = null;

  function syncInputs(opt, value) {
    if (!panelEl) return;
    panelEl.querySelectorAll('input[data-key="' + opt.key + '"]').forEach(inp => {
      // Radio-style options carry the value on data-value; boolean ones check
      // against `on`.
      inp.checked = opt.radio ? (inp.dataset.value === value) : (value === opt.on);
    });
  }

  function buildPanel() {
    const panel = document.createElement('div');
    panel.className = 'proto-panel';
    panel.hidden = true;

    const rows = OPTIONS.map(opt => {
      if (opt.radio) {
        const cur = get(opt);
        // One tickbox per choice; mutually exclusive (handled in change).
        return opt.radio.map(c => `
          <label class="proto-panel__check proto-panel__check--radio">
            <input type="checkbox" data-key="${opt.key}" data-value="${c.value}" ${c.value === cur ? 'checked' : ''}>
            <span>${c.label}</span>
          </label>
        `).join('');
      }
      return `
        <label class="proto-panel__check">
          <input type="checkbox" data-key="${opt.key}" ${isOn(opt) ? 'checked' : ''}>
          <span>${opt.label}</span>
        </label>
      `;
    }).join('');

    panel.innerHTML = `
      <div class="proto-panel__title">Prototype settings</div>
      <div class="proto-panel__hint">Press <kbd>H</kbd> to toggle</div>
      ${rows}
    `;

    panel.addEventListener('click', e => e.stopPropagation());
    panel.addEventListener('change', e => {
      const inp = e.target;
      if (inp.tagName !== 'INPUT') return;
      const opt = OPTIONS.find(o => o.key === inp.dataset.key);
      if (!opt) return;
      if (opt.radio) {
        // Mutually exclusive: ticking sets that value; unticking the active one
        // falls back to the default. Then re-sync so the others reflect it.
        set(opt, inp.checked ? inp.dataset.value : opt.def);
      } else {
        set(opt, inp.checked ? opt.on : opt.off);
      }
    });
    return panel;
  }

  function toggle(force) {
    if (!panelEl) return;
    panelEl.hidden = force != null ? !force : !panelEl.hidden;
  }

  function onKey(e) {
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (e.key === 'h' || e.key === 'H') toggle();
    else if (e.key === 'Escape' && panelEl && !panelEl.hidden) toggle(false);
  }

  function init() {
    if (document.querySelector('.proto-panel')) return; // guard against double-include
    panelEl = buildPanel();
    document.body.appendChild(panelEl);
    document.addEventListener('keydown', onKey);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose a tiny API for debugging / programmatic control.
  window.ProtoPanel = {
    get: (key) => { const o = OPTIONS.find(x => x.key === key); return o ? get(o) : undefined; },
    set: (key, v) => { const o = OPTIONS.find(x => x.key === key); if (o) set(o, v); },
    toggle,
  };
})();
