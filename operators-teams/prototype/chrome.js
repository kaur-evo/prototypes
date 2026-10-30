// Evocon Chrome — shared dark top bar + dark 1st-level sidebar + light 2nd-level sidebar.
// Uses real Evocon icons from /icn/. Each .icn span is a mask-image of the SVG,
// painted by background-color (default #707070).
//
// API:
//   Chrome.render({ sb1Active, sb2Active, title, mountSelector })
//   Chrome.icon(name, { size?: 16|18|20|24, tint?: 'green'|'white'|'red'|'current', cls?: '' })

(function () {
  // id → filename inside /icn/  (no extension)
  const ICON_FILE = {
    logo:               'logo',
    'shift-view':       'shift view (text-long)',
    'factory-overview': 'factory overview (radiobox-marked)',
    dashboards:         'dashboards (view-dashboard)',
    reports:            'reports (file-chart)',
    settings:           'settings (cog)',
    grid:               'grid view (view_module)',
    help:               'tooltip-question-outline 1',
    flag:               "what's new (flag)",
    power:              'status (power)',
    'menu-open':        'menu-open',
    'menu-close':       'menu-close',
    account:            'profile',
    users:              'users',
    operators:          'operators (account-hard-hat)',
    'stop-reasons':     'stop reasons (help-circle-outline)',
    'speed-loss':       'speed loss reasons (speedometer-slow)',
    'scrap-reasons':    'scrap reasons (minus-circle-outline)',
    stations:           'stations (monitor)',
    locations:          'machine locations (download-network-outline)',
    products:           'products (circle-multiple-outline)',
    shifts:             'shifts (calendar-clock)',
    alerts:             'alerts (bell-ring)',
    checklists:         'checklists (playlist-check)',
    devices:            'devices (router-network)',
    'api-keys':         'API keys (key)',
    'activity-logs':    'logs (file-search)',

    // Used inside content surfaces (page header, modals, dropdowns)
    'arrow-left':       'arrow-left',
    'arrow-right':      'arrow-right',
    'menu-down':        'arrow down (menu-down)',
    'menu-up':          'arrow up (menu-up)',
    'add':              'add (plus)',
    'search':           'search (magnify)',
    'tags':             'tags (tag-text)',
    'factory':          'factory (domain)',
    'check-circle':     'check-circle',
    'checkbox-blank':   'checkbox-blank-outline',
    'checkbox-marked':  'checkbox-marked',
    'edit':             'edit (pencil)',
    'delete':           'delete',
    'drag-vertical':    'drag-vertical',
    'information':      'information-outline',
    'key':              'API keys (key)',
    'group':            'group (format-list-group)',
    'list':             'list, templates (format-list-bulleted)',
    'open-in-new':      'notes new window (open_in_new)',
    'star':             'save-report',
    'star-outline':     'star-outline',
  };

  /**
   * Build an icon element string.
   * Renders as plain <img src="icn/...svg"> so the SVG's embedded #707070 fill
   * is honored by default. Tints (green / white / red) use a CSS filter pass
   * defined in .icn--{tint} rules in evocon-ui.css.
   * @param {string} name — id from ICON_FILE
   * @param {object} [opts] — { size, tint, cls }
   */
  function icon(name, opts) {
    opts = opts || {};
    const file = ICON_FILE[name];
    if (!file) {
      console.warn('Chrome.icon: unknown name', name);
      return '';
    }
    // URL-encode only spaces + parens; quoted attribute handles the rest.
    const url = 'icn/' + file.replace(/ /g, '%20').replace(/\(/g, '%28').replace(/\)/g, '%29') + '.svg';
    const size = opts.size || 24;
    const sizeCls = size !== 24 ? `icn--${size}` : '';
    const tintCls = opts.tint && opts.tint !== 'null' ? `icn--${opts.tint}` : '';
    const extra   = opts.cls || '';
    return `<img class="icn ${sizeCls} ${tintCls} ${extra}" src="${url}" width="${size}" height="${size}" alt="" aria-hidden="true">`;
  }

  // Order matches Figma frames 32002:10465 (1st) and 32002:10448 (2nd)
  const SB1_ITEMS_TOP = [
    { id: 'shift-view',       href: 'index.html' },
    { id: 'factory-overview' },
    { id: 'dashboards' },
    { id: 'reports',          href: '../wf-reports/index.html' },
  ];
  const SB1_ITEMS_BOTTOM = [
    { id: 'settings',         href: 'setup-proto.html' },
    { id: 'grid' },
    { id: 'help' },
    { id: 'flag' },
    { id: 'power' },
  ];

  const SB2 = [
    { id: 'account' },
    { id: 'users' },
    { id: 'operators',        href: 'setup-proto.html' },
    { sep: true },
    { id: 'stop-reasons' },
    { id: 'speed-loss' },
    { id: 'scrap-reasons' },
    { sep: true },
    { id: 'stations' },
    { id: 'locations' },
    { id: 'products' },
    { id: 'shifts' },
    { sep: true },
    { id: 'alerts' },
    { id: 'checklists' },
    { id: 'devices' },
    { id: 'api-keys' },
    { id: 'activity-logs' },
  ];

  function sb1Item(item, active) {
    const isActive = item.id === active;
    // In the dark sidebar we want icons white by default, green when active.
    const tint = isActive ? 'green' : 'white';
    const inner = `
      <div class="sb1__item ${isActive ? 'is-active' : ''}" data-id="${item.id}"
           ${isActive ? 'aria-current="page"' : ''}>
        ${icon(item.id, { tint })}
      </div>`;
    return item.href ? `<a href="${item.href}" style="text-decoration:none;color:inherit">${inner}</a>` : inner;
  }

  function sb2Item(item, active) {
    if (item.sep) return `<div class="sb2__sep"><div></div></div>`;
    const isActive = item.id === active;
    const tint = isActive ? 'green' : null; // default mask color is #707070
    const inner = `
      <div class="sb2__item ${isActive ? 'is-active' : ''}" data-id="${item.id}"
           ${isActive ? 'aria-current="page"' : ''}>
        ${icon(item.id, tint ? { tint } : {})}
      </div>`;
    return item.href ? `<a href="${item.href}" style="text-decoration:none;color:inherit">${inner}</a>` : inner;
  }

  function renderSidebar1(active) {
    return `
      <aside class="sb1">
        <div class="sb1__top">
          <div class="sb1__logo">${icon('logo', { tint: 'green' })}</div>
        </div>
        <div class="sb1__items">
          <div class="sb1__group">${SB1_ITEMS_TOP.map(i => sb1Item(i, active)).join('')}</div>
          <div class="sb1__group">${SB1_ITEMS_BOTTOM.map(i => sb1Item(i, active)).join('')}</div>
        </div>
        <div class="sb1__profile">
          <div class="sb1__avatar">
            <img src="avatar.png" alt="Mr Evocon" />
          </div>
        </div>
      </aside>`;
  }

  function renderSidebar2(active) {
    const items = SB2.map(i => sb2Item(i, active)).join('');
    return `
      <aside class="sb2">
        <div class="sb2__menu">
          <button class="sb2__menu-btn" aria-label="Collapse menu">${icon('menu-open')}</button>
        </div>
        <div class="sb2__content">${items}</div>
      </aside>`;
  }

  function renderTopbar(title) {
    return `
      <header class="topbar">
        <div class="topbar__spacer"></div>
        <div class="topbar__title">
          <button class="icon-btn" style="color:#fff" aria-label="Back">
            ${icon('arrow-left', { tint: 'white' })}
          </button>
          <div class="topbar__title-text">${title || ''}</div>
        </div>
      </header>`;
  }

  function render(opts) {
    const {
      sb1Active = 'settings',
      sb2Active = null,
      title = '',
      mountSelector = '#app-root',
    } = opts || {};

    const mount = document.querySelector(mountSelector);
    if (!mount) return;

    // Pull existing main-content children aside.
    const main = document.createElement('main');
    main.className = 'app-frame__main';
    while (mount.firstChild) main.appendChild(mount.firstChild);

    mount.innerHTML = '';
    mount.insertAdjacentHTML('beforeend', renderSidebar1(sb1Active));

    const frame = document.createElement('div');
    frame.className = 'app-frame__content';
    frame.style.marginLeft = 'var(--sidebar-1-w)';
    frame.insertAdjacentHTML('beforeend', renderTopbar(title));

    const row = document.createElement('div');
    row.style.cssText = 'display:flex; flex:1; min-height:0;';
    row.insertAdjacentHTML('beforeend', renderSidebar2(sb2Active));
    row.appendChild(main);
    frame.appendChild(row);
    mount.appendChild(frame);
  }

  window.Chrome = { render, icon };
})();
