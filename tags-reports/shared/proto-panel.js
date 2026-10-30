/**
 * proto-panel.js — shared "Prototype settings" panel (H-key toggle).
 *
 * Self-contained: injects its own styles, a fixed panel and a small round
 * button in the bottom-right corner (opens / closes the panel, so reviewers
 * need not know the H key) into <body> on any page that includes it. Each
 * option is a sentence plus a tickbox. Stored options live in localStorage, are mirrored onto a
 * window.__proto* global, and dispatch a `proto:<name>` CustomEvent on change.
 *
 * Options with `read`/`write` are bound to TagsStore instead of localStorage,
 * so the store stays the one source of truth (e.g. the Tags feature flag).
 *
 * To add an option: append one entry to OPTIONS. Keep the label one plain
 * sentence that says what the reviewer will see.
 */
(function () {
  const store = () => window.TagsStore;

  const OPTIONS = [
    {
      key: 'protoTagsFeature', event: 'proto:tagsFeature',
      label: 'Tags feature is on for this company (Enterprise)',
      read: () => !!store()?.isTagsEnabled(),
      write: (on) => store()?.setTagsEnabled(on),
    },
    {
      key: 'protoTagColumns', global: '__protoTagColumns', event: 'proto:tagColumns',
      label: 'Downtime table shows the "Tags" column',
      defOn: true,
    },
  ];

  // Boolean options stored as 'on' / 'off'.
  function isOn(opt) {
    if (opt.read) return opt.read();
    const v = safeGet(opt.key);
    return v == null ? !!opt.defOn : v === 'on';
  }
  function set(opt, on) {
    if (opt.write) opt.write(on);
    else safeSet(opt.key, on ? 'on' : 'off');
    if (opt.global) window[opt.global] = on ? 'on' : 'off';
    window.dispatchEvent(new CustomEvent(opt.event, { detail: on }));
    sync();
  }
  function safeGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function safeSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }

  // Seed globals before any page code reads them.
  OPTIONS.forEach(opt => { if (opt.global) window[opt.global] = isOn(opt) ? 'on' : 'off'; });

  const CSS = `
.proto-panel { position: fixed; bottom: 40px; right: 12px; background: #fff; border-radius: 4px;
  box-shadow: 0 1px 5px rgba(0,0,0,.25), 0 2px 2px rgba(0,0,0,.12), 0 3px 1px -2px rgba(0,0,0,.12);
  padding: 16px; width: 320px; z-index: 99999; font-family: 'Open Sans', sans-serif; color: #212121; }
.proto-panel[hidden] { display: none; }
.proto-panel__title { font-size: 14px; font-weight: 600; line-height: 20px; }
.proto-panel__hint { font-size: 12px; color: #707070; margin: 2px 0 12px; }
.proto-panel__hint kbd { background: #eee; border-radius: 3px; padding: 1px 5px; font-family: inherit; font-size: 11px; }
.proto-panel__check { display: flex; gap: 10px; align-items: flex-start; cursor: pointer; font-size: 13px; line-height: 18px; padding: 6px 0; }
.proto-panel__check + .proto-panel__check { border-top: 1px solid #f0f0f0; }
.proto-panel__check input { margin: 1px 0 0; flex-shrink: 0; accent-color: #2ecc71; width: 16px; height: 16px; cursor: pointer; }
.proto-panel__reset { margin-top: 12px; width: 100%; height: 32px; border: 1px solid #e0e0e0; border-radius: 4px;
  background: #fff; font: 600 13px 'Open Sans', sans-serif; color: #616161; cursor: pointer; }
.proto-panel__reset:hover { background: #f5f5f5; }
/* Tucked into the corner, outside the page's 24 px content gutter, so it covers no control. */
.proto-fab { position: fixed; right: 4px; bottom: 4px; width: 28px; height: 28px; border-radius: 50%; border: none; padding: 0;
  background: #fff; cursor: pointer; z-index: 99998; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 1px 5px rgba(0,0,0,.25), 0 2px 2px rgba(0,0,0,.12); opacity: .85; }
.proto-fab:hover { opacity: 1; background: #f5f5f5; }
.proto-fab.is-on { opacity: 1; box-shadow: 0 0 0 2px #9e9e9e, 0 1px 5px rgba(0,0,0,.25); }`;

  let panelEl = null;
  let fabEl = null;
  // mdi "tune": a neutral settings glyph, Evocon grey.
  const TUNE = '<svg width="18" height="18" viewBox="0 0 24 24" fill="#616161"><path d="M3 17V19H9V17H3M3 5V7H13V5H3M13 21V19H21V17H13V15H11V21H13M7 9V11H3V13H7V15H9V9H7M21 13V11H11V13H21M15 9H17V7H21V5H17V3H15V9Z"/></svg>';

  function sync() {
    if (!panelEl) return;
    panelEl.querySelectorAll('input[data-key]').forEach(inp => {
      const opt = OPTIONS.find(o => o.key === inp.dataset.key);
      if (opt) inp.checked = isOn(opt);
    });
  }

  function buildPanel() {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    const panel = document.createElement('div');
    panel.className = 'proto-panel';
    panel.hidden = true;
    panel.innerHTML = `
      <div class="proto-panel__title">Prototype settings</div>
      <div class="proto-panel__hint">Press <kbd>H</kbd> to toggle</div>
      ${OPTIONS.map(opt => `
        <label class="proto-panel__check">
          <input type="checkbox" data-key="${opt.key}" ${isOn(opt) ? 'checked' : ''}>
          <span>${opt.label}</span>
        </label>`).join('')}
      <button type="button" class="proto-panel__reset" id="protoReset">Reset prototype data</button>`;
    panel.addEventListener('click', e => e.stopPropagation());
    panel.addEventListener('change', e => {
      const opt = OPTIONS.find(o => o.key === e.target.dataset?.key);
      if (opt) set(opt, e.target.checked);
    });
    panel.querySelector('#protoReset').addEventListener('click', () => {
      store()?.reset();
      OPTIONS.forEach(o => { if (!o.read) { try { localStorage.removeItem(o.key); } catch (e) { /* ignore */ } } });
      location.reload();
    });
    return panel;
  }

  function toggle(force) {
    if (!panelEl) return;
    panelEl.hidden = force != null ? !force : !panelEl.hidden;
    fabEl?.classList.toggle('is-on', !panelEl.hidden);
    if (!panelEl.hidden) sync();
  }

  function onKey(e) {
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (e.key === 'h' || e.key === 'H') toggle();
    else if (e.key === 'Escape' && panelEl && !panelEl.hidden) toggle(false);
  }

  function init() {
    if (document.querySelector('.proto-panel')) return;
    panelEl = buildPanel();
    document.body.appendChild(panelEl);
    fabEl = document.createElement('button');
    fabEl.type = 'button';
    fabEl.className = 'proto-fab';
    fabEl.title = 'Prototype settings';
    fabEl.innerHTML = TUNE;
    fabEl.addEventListener('click', (e) => { e.stopPropagation(); toggle(); });
    document.body.appendChild(fabEl);
    document.addEventListener('keydown', onKey);
    window.addEventListener('tags:changed', sync);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.ProtoPanel = {
    isOn: (key) => { const o = OPTIONS.find(x => x.key === key); return o ? isOn(o) : undefined; },
    set: (key, on) => { const o = OPTIONS.find(x => x.key === key); if (o) set(o, !!on); },
    toggle,
  };
})();
