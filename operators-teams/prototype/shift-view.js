/**
 * shift-view.js — Static Shift View shell (dark theme, Evocon-style).
 * Just visual chrome around the OperatorsPanel — no real navigation, no diary.
 */
const ShiftView = {
  props: {
    operatorSummary: Object,
  },
  emits: ['open-operators'],
  template: `
    <div class="sv-container">
      <!-- ── 3-Column Layout ── -->
      <div class="sv-main-grid">
        <!-- Column 1: Logo + Station, Quantity + Batch, Upcoming -->
        <div class="sv-col-1">
          <div class="sv-col1-header">
            <a href="setup-proto.html" class="sv-logo-btn" title="Open Settings">
              <img src="img/logo.png" alt="Evocon" />
            </a>
            <nav class="sv-topbar-block sv-station-block">
              <div class="sv-nav-arrows">
                <button class="sv-nav-btn" disabled><v-icon size="24" color="#616161">mdi-chevron-left</v-icon></button>
                <button class="sv-nav-btn" disabled><v-icon size="24" color="#616161">mdi-chevron-right</v-icon></button>
              </div>
              <span class="sv-block-label">Filling Line 1</span>
            </nav>
          </div>
          <div class="sv-shift-batch-row">
            <div class="sv-quantity-box">
              <div class="sv-qty-label">SHIFT QUANTITY</div>
              <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;min-height:0;">
                <div class="sv-qty-value">29 700</div>
                <div class="sv-qty-target">42 000 pcs <span class="sv-qty-target-info"><v-icon size="16" color="#ccc">mdi-information-outline</v-icon></span></div>
              </div>
            </div>
            <div class="sv-batch-box">
              <div class="sv-batch-label">CURRENT BATCH</div>
              <div class="sv-batch-row"><span class="sv-batch-dim">ORDER:</span> 500ML</div>
              <div class="sv-batch-row"><span class="sv-batch-dim">PRODUCT:</span> 659541 Evocon device</div>
              <div class="sv-batch-progress">
                <span class="sv-batch-nums"><span class="green">10 200</span> <span class="orange">(100)</span></span>
                <div class="sv-batch-bar"><div class="sv-batch-bar-fill" style="width: 51%"></div></div>
                <span class="sv-batch-nums">20 000 pcs</span>
              </div>
              <div class="sv-batch-eta"><span class="sv-batch-dim">ESTIMATED TIME:</span> 4h 23m <v-icon size="16" color="#ccc">mdi-information-outline</v-icon></div>
            </div>
          </div>
          <div class="sv-upcoming-box">
            <div class="sv-upcoming-header">
              <button><v-icon size="20" color="#ccc">mdi-chevron-left</v-icon></button>
              <span>UPCOMING BATCHES</span>
              <button><v-icon size="20" color="#ccc">mdi-chevron-right</v-icon></button>
              <span style="flex:1"></span>
              <button><v-icon size="20" color="#ccc">mdi-arrow-expand</v-icon></button>
            </div>
            <div class="sv-upcoming-row">
              <span>500ML 659541 Evocon device</span>
              <span style="color:#ccc">12 000 pcs</span>
            </div>
          </div>
        </div>

        <!-- Column 2: Shift label + Chart -->
        <div class="sv-col-2">
          <div class="sv-col2-header">
            <nav class="sv-topbar-block sv-shift-block">
              <div class="sv-nav-arrows">
                <button class="sv-nav-btn"><v-icon size="24" color="white">mdi-chevron-left</v-icon></button>
                <button class="sv-nav-btn dimmed"><v-icon size="24" color="white">mdi-chevron-right</v-icon></button>
                <button class="sv-nav-btn dimmed"><v-icon size="24" color="white">mdi-page-last</v-icon></button>
              </div>
              <span class="sv-block-label">Saturday 02.08 - Day</span>
              <span class="sv-live-dot"></span>
            </nav>
          </div>
          <div class="sv-graph-panel">
            <div class="sv-graph-tabs-row">
              <div class="sv-graph-tabs">
                <span class="sv-graph-tab active">pcs/min ▾</span>
                <span class="sv-graph-tab">OEE</span>
                <span class="sv-graph-tab">CO2 &amp; Billes</span>
              </div>
              <button class="sv-icon-btn" style="flex-shrink:0;"><v-icon size="24" color="white">mdi-plus</v-icon></button>
            </div>
            <div class="sv-graph-area">
              <div class="sv-graph-y">
                <span>200</span><span>150</span><span>100</span><span>50</span><span>0</span>
              </div>
              <div class="sv-graph-bars"></div>
            </div>
          </div>
        </div>

        <!-- Column 3: Time + Settings, OEE -->
        <div class="sv-col-3">
          <div class="sv-col3-header">
            <div class="sv-topbar-block sv-time-block">
              <span class="sv-clock-hm">{{ clockHM }}</span><span class="sv-clock-sec">{{ clockSec }}</span>
            </div>
            <div class="sv-topbar-block sv-settings-block">
              <button class="sv-icon-btn"><v-icon size="24" color="white">mdi-cog</v-icon></button>
            </div>
          </div>
          <div class="sv-oee-panel">
            <div class="sv-oee-content">
              <div class="sv-oee-label">OEE (60%)</div>
              <div class="sv-oee-body">
                <div class="sv-oee-mascot">
                  <img src="img/mrevocon.png" alt="Mr Evocon" />
                </div>
                <div class="sv-oee-metrics">
                  <div class="sv-oee-pct">69%</div>
                  <div class="sv-oee-apq">
                    <div class="sv-oee-apq-row a-row"><span>A</span><span>76%</span></div>
                    <div class="sv-oee-apq-row p-row"><span>P</span><span>94%</span></div>
                    <div class="sv-oee-apq-row q-row"><span>Q</span><span>97%</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Timeline ── -->
      <div class="sv-timeline-wrapper">
        <div class="sv-minutes-header">
          <div class="sv-hour-col"></div>
          <div class="sv-minutes-track">
            <span class="sv-min-mark" style="left:25%">:15</span>
            <span class="sv-min-mark" style="left:50%">:30</span>
            <span class="sv-min-mark" style="left:75%">:45</span>
          </div>
          <div class="sv-prod-col" style="justify-content:center;">
            <v-icon size="20" color="#616161">mdi-information-outline</v-icon>
          </div>
        </div>
        <div class="sv-timeline-scroll" style="position:relative;">
          <div class="sv-timeline-grid">
            <div class="sv-grid-line" style="left:0%"></div>
            <div class="sv-grid-line" style="left:8.333%"></div>
            <div class="sv-grid-line" style="left:16.667%"></div>
            <div class="sv-grid-line" style="left:25%"></div>
            <div class="sv-grid-line" style="left:33.333%"></div>
            <div class="sv-grid-line" style="left:41.667%"></div>
            <div class="sv-grid-line" style="left:50%"></div>
            <div class="sv-grid-line" style="left:58.333%"></div>
            <div class="sv-grid-line" style="left:66.667%"></div>
            <div class="sv-grid-line" style="left:75%"></div>
            <div class="sv-grid-line" style="left:83.333%"></div>
            <div class="sv-grid-line" style="left:91.667%"></div>
          </div>
          <div class="sv-timeline-row" v-for="row in timelineRows" :key="row.hour">
            <div class="sv-hour-col">{{ row.hour }}</div>
            <div class="sv-segments-col">
              <div class="sv-segment" v-for="(seg, si) in row.segments" :key="si"
                   :style="{ width: seg.w + '%', background: seg.c }"></div>
            </div>
            <div class="sv-prod-col" :class="{ green: row.onTarget, red: !row.onTarget }">
              <span class="prod-actual">{{ row.actual }}</span><span v-if="row.target">&nbsp;/{{ row.target }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Bottom bar ── -->
      <div class="sv-bottombar">
        <div class="sv-bottombar-icon"><v-icon size="24" color="white">mdi-dots-vertical</v-icon></div>
        <div class="sv-legend-item" @click="$emit('open-operators')"
             @mouseenter="showChipTooltip($event)"
             @mouseleave="hideChipTooltip">
          <v-icon size="24" color="white">mdi-account-hard-hat</v-icon>
          <template v-if="operatorSummary && operatorSummary.hasEntries">
            <span class="sv-op-summary">
              <span class="sv-leader-name">{{ operatorSummary.footerName }}</span>
              <span v-if="operatorSummary.footerExtras > 0">&nbsp;+ {{ operatorSummary.footerExtras }}</span>
            </span>
          </template>
          <template v-else>
            <span>Operators</span>
          </template>
        </div>
        <div class="sv-legend-item"><v-icon size="24" color="white">mdi-autorenew</v-icon><span>Product changeover</span><span class="sv-counter red">2</span></div>
        <div class="sv-legend-item"><v-icon size="24" color="white">mdi-help-circle-outline</v-icon><span>Downtime</span><span class="sv-counter red">2</span></div>
        <div class="sv-legend-item"><v-icon size="24" color="white">mdi-speedometer-slow</v-icon><span>Speed loss</span><span class="sv-counter yellow">800</span></div>
        <div class="sv-legend-item"><v-icon size="24" color="white">mdi-minus-circle-outline</v-icon><span>Scrap</span></div>
        <div class="sv-legend-item"><v-icon size="24" color="white">mdi-playlist-check</v-icon><span>Checklists</span></div>
        <div class="sv-bottombar-icon"><v-icon size="24" color="white">mdi-email-outline</v-icon></div>
      </div>
    </div>
  `,
  setup(props) {
    const { ref, onMounted, onUnmounted } = Vue;

    // ── Evocon-style tooltip for the operator chip ──
    let _tipEl = null;
    function showChipTooltip(event) {
      hideChipTooltip();
      const summary = props.operatorSummary;
      if (!summary || !summary.hasEntries || !summary.fullTooltip) return;
      const el = document.createElement('div');
      el.className = 'evo-tooltip';
      el.textContent = summary.fullTooltip;
      document.body.appendChild(el);
      _tipEl = el;
      const r = event.currentTarget.getBoundingClientRect();
      el.style.left = Math.max(8, r.left + r.width / 2 - el.offsetWidth / 2) + 'px';
      el.style.top  = (r.top - el.offsetHeight - 8) + 'px';
    }
    function hideChipTooltip() {
      if (_tipEl) { _tipEl.remove(); _tipEl = null; }
    }
    onUnmounted(hideChipTooltip);

    const pad2 = (n) => String(n).padStart(2, '0');

    // ── Live clock ──
    const clockHM = ref('');
    const clockSec = ref('');
    let clockInterval;
    function updateClock() {
      const now = new Date();
      clockHM.value = pad2(now.getHours()) + ':' + pad2(now.getMinutes());
      clockSec.value = ':' + pad2(now.getSeconds());
    }
    onMounted(() => { updateClock(); clockInterval = setInterval(updateClock, 1000); });
    onUnmounted(() => clearInterval(clockInterval));

    // ── Static timeline data (Day shift 06:00–13:59) ──
    const PATTERN = [
      [{w:5,c:'#f44336'},{w:12,c:'#4caf50'},{w:3,c:'#ffc107'},{w:30,c:'#4caf50'},{w:8,c:'#b71c1c'},{w:25,c:'#4caf50'},{w:7,c:'#ffc107'},{w:10,c:'#4caf50'}],
      [{w:15,c:'#4caf50'},{w:2,c:'#ffc107'},{w:18,c:'#4caf50'},{w:15,c:'#b71c1c'},{w:25,c:'#4caf50'},{w:10,c:'#4caf50'},{w:5,c:'#ffc107'},{w:10,c:'#4caf50'}],
      [{w:20,c:'#4caf50'},{w:3,c:'#ffc107'},{w:35,c:'#4caf50'},{w:2,c:'#f44336'},{w:5,c:'#ffc107'},{w:20,c:'#4caf50'},{w:15,c:'#4caf50'}],
      [{w:8,c:'#4caf50'},{w:25,c:'#b71c1c'},{w:20,c:'#4caf50'},{w:5,c:'#ffc107'},{w:42,c:'#4caf50'}],
      [{w:10,c:'#4caf50'},{w:5,c:'#ffc107'},{w:40,c:'#4caf50'},{w:8,c:'#f44336'},{w:12,c:'#4caf50'},{w:10,c:'#ffc107'},{w:15,c:'#4caf50'}],
      [{w:25,c:'#4caf50'},{w:15,c:'#b71c1c'},{w:35,c:'#4caf50'},{w:5,c:'#ffc107'},{w:20,c:'#4caf50'}],
      [{w:5,c:'#ffc107'},{w:35,c:'#4caf50'},{w:3,c:'#f44336'},{w:22,c:'#4caf50'},{w:20,c:'#b71c1c'},{w:15,c:'#4caf50'}],
      [{w:40,c:'#4caf50'},{w:2,c:'#ffc107'},{w:30,c:'#4caf50'},{w:8,c:'#ffc107'},{w:20,c:'#4caf50'}],
    ];
    const HOURS = ['06','07','08','09','10','11','12','13'];
    const TARGETS = [6000,6000,6000,6000,3000,6000,6000,5400];
    const ACTUALS = [3111.67, 2690.33, 5308, 4690, 2073.33, 2806.97, 5733.03, 4986.67];

    const timelineRows = HOURS.map((h, i) => ({
      hour: h,
      segments: PATTERN[i],
      actual: formatNum(ACTUALS[i]),
      target: formatNum(TARGETS[i]),
      onTarget: ACTUALS[i] >= TARGETS[i] * 0.8,
    }));

    return { clockHM, clockSec, timelineRows, showChipTooltip, hideChipTooltip };
  }
};

function formatNum(n) {
  const parts = n.toString().split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return parts[1] ? intPart + ',' + parts[1] : intPart;
}
