/**
 * operators.js — Operators Panel component for Shift View
 * Manages operator/helper entries during a shift.
 * Depends on: mock-data.js (MOCK_OPERATORS, MOCK_TEAMS, MOCK_TAGS)
 */
/**
 * Additional-workforce icon (Figma, 16x16). Not in the MDI set Vuetify ships,
 * so it is inlined and spliced into the template literal below. #707070 to
 * match the shift-leader flag on the saved card's name row. Takes a class so
 * the saved card and the picker row can size and space it themselves.
 */
const awIcon = (cls) => `<svg class="${cls}" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M10.3334 6.00008C10.3334 6.61892 10.0874 7.21221 9.64975 7.64981C9.21215 8.08741 8.61889 8.33341 8.00002 8.33341C7.38115 8.33341 6.78789 8.08741 6.35028 7.64981C5.91269 7.21221 5.66669 6.61892 5.66669 6.00008H10.3334ZM8.00002 3.66675C8.61889 3.66675 9.21215 3.91275 9.64975 4.35034C9.92622 4.6268 10.126 4.96542 10.2357 5.33341H5.76434C5.87409 4.96542 6.07382 4.6268 6.35028 4.35034C6.78789 3.91275 7.38115 3.66675 8.00002 3.66675Z" fill="#707070"/><path d="M2.9668 10.3998C2.57347 10.8531 2.33333 11.4801 2.33333 12.1667V13.3334H0V12.3334C0 11.4067 1.26013 10.6265 2.9668 10.3998ZM8 9.66675C10.3933 9.66675 12.3333 10.7867 12.3333 12.1667V13.3334H3.66667V12.1667C3.66667 10.7867 5.60667 9.66675 8 9.66675ZM13.0332 10.3998C14.7399 10.6265 16 11.4067 16 12.3334V13.3334H13.6667V12.1667C13.6667 11.4801 13.4265 10.8531 13.0332 10.3998ZM4.58789 7.33341C4.62947 7.43961 4.67397 7.54461 4.72526 7.64655C4.72983 7.65568 4.73429 7.66481 4.73893 7.67388C4.75951 7.71395 4.78067 7.75375 4.80273 7.79308C4.81065 7.80721 4.81872 7.82128 4.82682 7.83535C4.84227 7.86208 4.85822 7.88848 4.87435 7.91481C4.89547 7.94941 4.91718 7.98368 4.93945 8.01768C4.94635 8.02808 4.95329 8.03855 4.96029 8.04888C5.00693 8.11848 5.05534 8.18695 5.10677 8.25335C4.77344 8.89335 4.10667 9.33342 3.33333 9.33342C2.8029 9.33342 2.29435 9.12255 1.91927 8.74748C1.5442 8.37242 1.33333 7.86381 1.33333 7.33341H4.58789ZM11.4238 7.33341H14.6667C14.6667 7.86381 14.4558 8.37242 14.0807 8.74748C13.7057 9.12255 13.1971 9.33342 12.6667 9.33342C11.8933 9.33342 11.2265 8.89335 10.8932 8.25335C10.9446 8.18708 10.9925 8.11835 11.0391 8.04888C11.0461 8.03855 11.053 8.02808 11.0599 8.01768C11.0823 7.98361 11.1045 7.94955 11.1257 7.91481C11.1417 7.88855 11.1571 7.86195 11.1725 7.83535C11.1806 7.82128 11.1887 7.80721 11.1966 7.79308C11.2187 7.75375 11.2399 7.71402 11.2604 7.67388C11.2651 7.66481 11.2695 7.65568 11.2741 7.64655C11.3301 7.53535 11.3774 7.42028 11.4219 7.30415L11.4238 7.33341ZM10.1966 6.78655C10.1583 6.89368 10.1122 6.99788 10.0586 7.09841C10.0228 7.16548 9.98373 7.23088 9.9414 7.29435C9.8568 7.42128 9.7592 7.54035 9.64973 7.64981C9.54027 7.75928 9.4212 7.85688 9.29427 7.94148C9.2308 7.98381 9.1654 8.02288 9.09833 8.05868C8.76333 8.23741 8.3866 8.33342 8 8.33342C7.6134 8.33342 7.23667 8.23741 6.90167 8.05868C6.8346 8.02288 6.7692 7.98381 6.70573 7.94148C6.6106 7.87808 6.51985 7.80741 6.43425 7.72988C6.40563 7.70401 6.37768 7.67721 6.35026 7.64981C6.32284 7.62241 6.29609 7.59442 6.27018 7.56581C6.19269 7.48022 6.12201 7.38948 6.05859 7.29435C6.01627 7.23088 5.9772 7.16548 5.94141 7.09841C5.88781 6.99788 5.84174 6.89368 5.80339 6.78655C5.78922 6.74701 5.77634 6.70701 5.76432 6.66675H10.2357C10.2237 6.70701 10.2108 6.74701 10.1966 6.78655ZM12.668 5.33341C13.1979 5.33376 13.7059 5.54459 14.0807 5.91935C14.2934 6.13205 14.4509 6.38854 14.5495 6.66675H12.7279L12.668 5.33341ZM3.33333 6.66675H1.45052C1.54909 6.38854 1.70657 6.13205 1.91927 5.91935C2.29435 5.54428 2.8029 5.33341 3.33333 5.33341V6.66675ZM8 3.66675C8.19347 3.66675 8.38447 3.69066 8.569 3.73706C8.6426 3.75559 8.71513 3.77792 8.78647 3.80347C8.8936 3.84182 8.9978 3.88789 9.09833 3.94149C9.1654 3.97728 9.2308 4.01635 9.29427 4.05867C9.3894 4.12209 9.48013 4.19277 9.56573 4.27026C9.59433 4.29617 9.62233 4.32292 9.64973 4.35034L9.7298 4.43433C9.8246 4.53901 9.9088 4.65163 9.9824 4.77026C10.0629 4.90003 10.1301 5.03724 10.1836 5.17977C10.2026 5.23033 10.2195 5.2816 10.235 5.33341H5.76497C5.78041 5.28167 5.79679 5.23026 5.81575 5.17977C5.86927 5.03727 5.93647 4.90001 6.01693 4.77026C6.09057 4.65152 6.17534 4.53909 6.27018 4.43433L6.35026 4.35034C6.37768 4.32292 6.40563 4.29617 6.43425 4.27026C6.51985 4.19277 6.6106 4.12209 6.70573 4.05867C6.7692 4.01635 6.8346 3.97728 6.90167 3.94149C7.0022 3.88789 7.1064 3.84182 7.21353 3.80347C7.28487 3.77792 7.3574 3.75559 7.431 3.73706C7.61553 3.69066 7.80653 3.66675 8 3.66675Z" fill="#707070"/><path d="M3.60028 3.33325C3.76546 3.33337 3.86655 3.45022 3.86655 3.61125V3.81112C3.53161 4.19355 3.33335 4.71237 3.33335 5.33325V6.66658H0.666687C0.666687 6.05806 1.05614 5.97403 1.06643 5.97193C1.06653 4.36654 2.26695 3.88859 2.26695 3.88859V5.27791H2.80015V3.61125C2.80015 3.45023 2.90657 3.33338 3.06643 3.33325H3.60028ZM12.9336 3.33325C13.0988 3.33337 13.1999 3.45022 13.1999 3.61125V5.27791H13.7331V3.88859C13.7331 3.88859 14.9335 4.36654 14.9336 5.97193C14.9434 5.97408 15.307 6.05827 15.3334 6.66658H12.7279L12.6654 5.27336C12.6389 4.6848 12.4459 4.19482 12.1335 3.82739V3.61125C12.1335 3.45023 12.2399 3.33338 12.3998 3.33325H12.9336Z" fill="#707070"/><path d="M7.33335 1.66659C7.33335 1.47325 7.46669 1.33325 7.66669 1.33325H8.33335C8.54002 1.33325 8.66669 1.47325 8.66669 1.66659V3.66659H9.33335V1.99992C9.33335 1.99992 10.8334 2.57325 10.8334 4.49992C10.8334 4.49992 11.3 4.59325 11.3334 5.33325H4.66669C4.66669 4.59325 5.16669 4.49992 5.16669 4.49992C5.16669 2.57325 6.66669 1.99992 6.66669 1.99992V3.66659H7.33335V1.66659Z" fill="#707070"/></svg>`;
const AW_ICON = awIcon('op-card-alt-awicn');

const OperatorsPanel = {
  props: {
    visible: Boolean,
  },
  emits: ['close', 'update:summary'],
  template: `
    <div v-if="visible" class="op-overlay" @click.self="handleOverlayClick">
      <div class="op-modal" :class="{ 'op-modal-tall': currentView === 'add-operators' }">

        <!-- ═══════════ OVERVIEW ═══════════ -->
        <template v-if="currentView === 'overview'">
          <!-- Header matches the saved card (Figma 32124:11673): centered
               operator-hat icon + "Operators", 20px SemiBold #212121. -->
          <div class="op-header op-header--centered">
            <v-icon size="24" color="#212121">mdi-account-hard-hat</v-icon>
            <span class="op-header-title">Operators</span>
          </div>

          <div class="op-body">
            <!-- No empty state: when nothing is assigned the panel opens
                 straight into the operator choice view (matches live). -->

            <!-- ── CLASSIC CARD ── single-row card (badges + flat name list) -->
            <template v-if="cardLayout !== 'twoRow'">
            <div v-for="entry in entries" :key="entry.id" class="op-card">
              <div class="op-card-top">
                <div class="op-card-left">
                  <span v-if="entry.helperCount > 0"
                        class="op-card-badge"
                        @mouseenter="showTooltip($event, 'Additional workforce')"
                        @mouseleave="hideTooltip">
                    <v-icon size="18" color="#757575">mdi-account-group</v-icon> {{ entry.helperCount }}
                  </span>
                  <span v-if="entry.operatorIds.length > 0"
                        class="op-card-badge"
                        @mouseenter="showTooltip($event, 'Operators: ' + getOperatorFirstNames(entry))"
                        @mouseleave="hideTooltip">
                    <v-icon size="18" color="#757575">mdi-account-hard-hat</v-icon> {{ entry.operatorIds.length }}
                  </span>
                  <span class="op-card-names"
                        @mouseenter="showTooltip($event, entry.operatorIds.length > 0 ? getOperatorNames(entry) : 'Additional workforce')"
                        @mouseleave="hideTooltip">{{ entry.operatorIds.length > 0 ? getEntryFlatNames(entry) : 'Additional workforce: ' + entry.helperCount }}</span>
                </div>
                <div class="op-card-icons">
                  <button class="op-icon-btn" @click="deleteEntry(entry.id)" title="Delete"><v-icon size="24" color="#757575">mdi-delete</v-icon></button>
                  <button class="op-icon-btn" @click="duplicateEntry(entry.id)" title="Duplicate"><v-icon size="24" color="#757575">mdi-content-copy</v-icon></button>
                  <button class="op-icon-btn" @click="editEntry(entry.id)" title="Edit"><v-icon size="24" color="#757575">mdi-pencil</v-icon></button>
                </div>
              </div>
              <div class="op-card-bottom">
                <v-icon size="16" color="#212121">mdi-clock-outline</v-icon>
                <span>{{ entry.startTime }} - {{ entry.endTime }}</span>
              </div>
            </div>
            </template>

            <!-- ── ALTERNATIVE CARD ── (Figma 32084:89233). Layout:
                 Row 1: single bold name line — supervisors first (with a star
                        icon inline after each supervisor's name), then the
                        rest, separated by commas.
                 Row 2: helper chip only (if any). No operators chip.
                 Row 3: clock + time range (12px caption).
                 Right side: kebab menu only. Whole card is clickable. -->
            <template v-else>
            <div v-for="entry in entries" :key="entry.id" class="op-card op-card--alt"
                 @click="editEntry(entry.id)">
              <div class="op-card-alt-content">
                <!-- Row 1: label. With operators → their names (leader first w/
                     flag, then the rest). Additional-workforce-only entry → the
                     label reads "Additional workforce". -->
                <div v-if="entry.operatorIds.length > 0" class="op-card-alt-row">
                  <span class="op-card-alt-names"
                        @mouseenter="showTooltip($event, getEntryNamesTooltip(entry))"
                        @mouseleave="hideTooltip">
                    <template v-for="(part, i) in getEntryNameParts(entry)" :key="i">
                      <template v-if="i > 0">, </template><!--
                      --><v-icon v-if="part.supervisor" class="op-card-alt-star" size="18" color="#707070">mdi-flag</v-icon><!--
                      --><span>{{ part.name }}</span>
                    </template><!--
                    Additional workforce listed as the last item when present.
                    --><template v-if="entry.helperCount > 0">, ${AW_ICON}<span>Additional workforce ({{ entry.helperCount }})</span></template>
                  </span>
                </div>
                <div v-else-if="entry.helperCount > 0" class="op-card-alt-row">
                  <span class="op-card-alt-names">${AW_ICON}<span>Additional workforce ({{ entry.helperCount }})</span></span>
                </div>

                <!-- Labels row (Figma 32124:11673): inline caption icon-labels —
                     clock + time, and hat + total people (operators + additional
                     workforce). Not a chip; both sit on one 12px caption row. -->
                <div class="op-card-alt-labels">
                  <span class="op-card-alt-label">
                    <v-icon size="16" color="#212121">mdi-clock-outline</v-icon>
                    <span>{{ entry.startTime }} - {{ entry.endTime }}</span>
                  </span>
                  <span v-if="entry.operatorIds.length > 0 || entry.helperCount > 0"
                        class="op-card-alt-label"
                        @mouseenter="showTooltip($event, getEntryPeopleTooltip(entry))"
                        @mouseleave="hideTooltip">
                    <span class="op-card-alt-label-key">Total</span>
                    <span>{{ entry.operatorIds.length + (entry.helperCount || 0) }}</span>
                  </span>
                </div>
              </div>
              <!-- Kebab menu — Edit / Duplicate / Delete. stopPropagation so
                   opening the menu doesn't also fire the card-level edit. -->
              <div class="op-card-alt-actions" @click.stop>
                <button class="op-icon-btn" :class="{ 'is-open': kebabEntryId === entry.id }"
                        @click.stop="toggleKebab(entry.id, $event)" title="More">
                  <v-icon size="24" color="#757575">mdi-dots-vertical</v-icon>
                </button>
                <teleport to="body">
                  <div v-if="kebabEntryId === entry.id" class="op-kebab-menu"
                       :style="{ top: kebabPos.top + 'px', left: kebabPos.left + 'px' }"
                       @click.stop>
                    <button class="op-kebab-item" @click="closeKebab(); editEntry(entry.id)">
                      <v-icon size="24" color="#757575">mdi-pencil</v-icon>
                      Edit
                    </button>
                    <button class="op-kebab-item" @click="closeKebab(); duplicateEntry(entry.id)">
                      <v-icon size="24" color="#757575">mdi-content-copy</v-icon>
                      Duplicate
                    </button>
                    <button class="op-kebab-item" @click="closeKebab(); deleteEntry(entry.id)">
                      <v-icon size="24" color="#757575">mdi-delete</v-icon>
                      Delete
                    </button>
                  </div>
                </teleport>
              </div>
            </div>
            </template>
          </div>

          <div class="op-footer">
            <div class="op-footer-left">
              <button class="op-btn op-btn-green" @click="openAddOperators">
                <v-icon size="24" color="#2ecc71">mdi-plus</v-icon>
                <span>OPERATORS</span>
              </button>
            </div>
            <button class="op-btn op-btn-text" @click="$emit('close')">CLOSE</button>
          </div>
        </template>

        <!-- ═══════════ ADD OPERATORS ═══════════ -->
        <!-- ═══════════ ADD/EDIT OPERATORS — Figma 32083:88708 ═══════════
             700px modal. Header has profile icon + "Operators" title (no
             "Add:"/"Edit:" prefix). Search input. Group sections with one
             collapsible level: group checkbox + name + caret. Operators are
             14px rows with a left checkbox + name (and a 12px caption line
             showing the operator's role when toggle is OFF, or a role chip
             on the right when the toggle is ON). Helpers row matches the
             same checkbox shape with an inline count chip. Footer holds
             a toggle "Adjust operator roles" + Start/End time inputs. -->
        <template v-if="currentView === 'add-operators'">
          <!-- Header matches the saved card (Figma 32124:11673): centered
               operator-hat icon + "Operators". -->
          <div class="op-header op-header--centered">
            <v-icon size="24" color="#212121">mdi-account-hard-hat</v-icon>
            <span class="op-header-title">Operators</span>
          </div>

          <div class="op-body op-body-scroll">
            <!-- Search -->
            <div class="op-search">
              <v-icon size="24" color="#9e9e9e">mdi-magnify</v-icon>
              <input type="text" v-model="searchQuery" placeholder="Search" class="op-search-input" />
            </div>

            <!-- Group + operator + helpers checkbox list -->
            <div class="op-team-list">
              <template v-if="opList === 'grouped'">
              <div v-for="team in filteredTeams" :key="team.id" class="op-team-group">
                <!-- Group header row (48px tall, full-width) -->
                <label class="op-check-row op-team-row" @click="toggleTeamCollapse(team.id)">
                  <span class="op-check-box" :class="{ checked: isTeamFullySelected(team.id), partial: isTeamPartiallySelected(team.id) }" @click.stop="toggleTeam(team.id)">
                    <v-icon v-if="isTeamFullySelected(team.id)" size="18" color="white">mdi-check</v-icon>
                    <v-icon v-else-if="isTeamPartiallySelected(team.id)" size="18" color="white">mdi-minus</v-icon>
                  </span>
                  <span class="op-team-label">{{ team.name }}</span>
                  <span class="op-team-count">({{ getFilteredTeamOperators(team.id).length }})</span>
                  <span style="margin-left:auto;display:flex;align-items:center;">
                    <v-icon size="24" color="#757575" :style="{ transform: collapsedTeams.has(team.id) ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }">mdi-chevron-down</v-icon>
                  </span>
                </label>

                <!-- Operator rows: 32px tall, 14px label, left-indented 16px -->
                <div v-if="!collapsedTeams.has(team.id)" v-for="op in getFilteredTeamOperators(team.id)" :key="op.id" class="op-check-row op-op-row">
                  <label class="op-check-row-inner">
                    <span class="op-check-box" :class="{ checked: formSelectedOps.includes(op.id) }" @click.prevent="toggleOperator(op.id)">
                      <v-icon v-if="formSelectedOps.includes(op.id)" size="18" color="white">mdi-check</v-icon>
                    </span>
                    <span class="op-op-text">
                      <span class="op-op-name-line">
                        <span class="op-op-name">{{ op.firstName }} {{ op.lastName }}</span>
                        <!-- Star marks Supervisor inline AFTER the name — single
                             mode only. Multi uses the chip; leader has no pre-
                             assigned star in the picker list. -->
                        <img v-if="rolesMode === 'single' && op.role === 'Supervisor'" src="icn/save-report.svg" alt="" width="18" height="18" class="op-op-star">
                      </span>
                      <!-- Role caption on the 2nd line — single mode, toggle OFF only.
                           Multi uses the chip; leader uses the Shift leader select. -->
                      <span v-if="rolesMode === 'single' && !adjustRolesOn && op.role" class="op-op-role-desc">{{ op.role }}</span>
                    </span>
                  </label>
                  <!-- Leader chip (chip style only): a flag toggle on each
                       leading operator's row. Green/filled when this op is the
                       chosen shift leader. -->
                  <button v-if="leaderStyle === 'chip' && canSetLeader(op)" type="button"
                          class="op-leaderchip" :class="{ 'is-leader': isLeader(op.id) }"
                          @click.stop="toggleRowLeader(op)"
                          :aria-pressed="isLeader(op.id)"
                          :title="isLeader(op.id) ? 'Shift leader' : 'Set as shift leader'">
                    <v-icon size="18" :color="isLeader(op.id) ? '#2ecc71' : '#757575'">mdi-flag</v-icon>
                    <span>Leader</span>
                  </button>
                  <!-- Dropdown style: a role chip per row (flag + selection +
                       chevron) opening a single-select menu. Extensible to more
                       roles later (currently Shift leader / -). -->
                  <div v-if="leaderStyle === 'dropdown' && canSetLeader(op)" class="op-tag-area" @click.stop>
                    <button class="op-leaderddchip" :class="{ 'is-leader': isLeader(op.id) }" @click="openLeaderDD(op.id, $event)">
                      <v-icon size="18" :color="isLeader(op.id) ? '#2ecc71' : '#757575'">mdi-flag</v-icon>
                      <span>{{ isLeader(op.id) ? 'Shift leader' : '-' }}</span>
                      <v-icon size="18" color="#757575">mdi-menu-down</v-icon>
                    </button>
                    <teleport to="body">
                      <div v-if="leaderDDOpId === op.id" class="op-tag-dropdown op-role-dropdown"
                           :style="{ top: leaderDDPos.top + 'px', left: leaderDDPos.left + 'px' }" @click.stop>
                        <div class="op-role-row" :class="{ 'is-selected': isLeader(op.id) }" @click="pickLeaderRole(op, true)">
                          <v-icon v-if="isLeader(op.id)" class="op-role-marker" size="24" color="#2ecc71">mdi-check-circle</v-icon>
                          <span v-else class="op-role-marker"></span>
                          <span class="op-role-label">Shift leader</span>
                        </div>
                        <div class="op-role-row" :class="{ 'is-selected': !isLeader(op.id) }" @click="pickLeaderRole(op, false)">
                          <v-icon v-if="!isLeader(op.id)" class="op-role-marker" size="24" color="#2ecc71">mdi-check-circle</v-icon>
                          <span v-else class="op-role-marker"></span>
                          <span class="op-role-label">-</span>
                        </div>
                      </div>
                    </teleport>
                  </div>
                  <!-- Role chip on the right. Single mode: shown only when the
                       "Adjust operator roles" toggle is ON. Multi mode: always
                       shown for any operator that has ≥1 allowed role. -->
                  <div v-if="showRoleChip(op)" class="op-tag-area" @click.stop>
                    <!-- Chip always shows the operator icon (the star lives only
                         in the dropdown + on the saved card). -->
                    <button class="op-rolechip" :class="{ 'is-selected': effectiveRoles(op).length > 0 }" @click="openTagDropdown(op.id, $event)">
                      <img src="icn/operators%20%28account-hard-hat%29.svg" alt="" width="18" height="18" class="op-rolechip-icn">
                      <span>{{ effectiveRoles(op)[0] || '-' }}</span>
                      <v-icon size="18" color="#757575">mdi-menu-down</v-icon>
                    </button>
                    <!-- Picker dropdown — single-select, matches the Settings
                         single-select role list (Figma 32091:15259): radio
                         marker + role icon (star for Supervisor, operator icon
                         otherwise, dimmed when unselected) + 16px label.
                         A "No role" row at the top clears the selection (MUI
                         <MenuItem value=""><em>None</em></MenuItem> pattern). -->
                    <teleport to="body">
                      <div v-if="tagDropdownOpId === op.id"
                           class="op-tag-dropdown op-role-dropdown"
                           :style="{ top: tagDropdownPos.top + 'px', left: tagDropdownPos.left + 'px' }"
                           @click.stop>
                        <div v-for="role in roleOptionsFor(op)" :key="role.name"
                             class="op-role-row" :class="{ 'is-selected': effectiveRoles(op).includes(role.name) }"
                             @click="pickOperatorRole(op, role, $event)">
                          <v-icon v-if="effectiveRoles(op).includes(role.name)" class="op-role-marker" size="24" color="#2ecc71">mdi-check-circle</v-icon>
                          <span v-else class="op-role-marker"></span>
                          <!-- Role icon hidden for now — bring back later.
                          <img v-if="role.name === 'Supervisor'" src="icn/save-report.svg" alt="" width="24" height="24" class="op-role-icn">
                          <img v-else src="icn/operators%20%28account-hard-hat%29.svg" alt="" width="24" height="24" class="op-role-icn">
                          -->
                          <span class="op-role-label">{{ role.name }}</span>
                        </div>
                        <div class="op-role-row op-role-row--none" :class="{ 'is-selected': effectiveRoles(op).length === 0 }"
                             @click="clearOperatorRole(op, $event)">
                          <v-icon v-if="effectiveRoles(op).length === 0" class="op-role-marker" size="24" color="#2ecc71">mdi-check-circle</v-icon>
                          <span v-else class="op-role-marker"></span>
                          <!-- Icon spacer hidden along with role icons — bring back later.
                          <span class="op-role-icn"></span>
                          -->
                          <span class="op-role-label">-</span>
                        </div>
                      </div>
                    </teleport>
                  </div>
                </div>
              </div>
              </template>

              <!-- Flat list (proto: opList === 'flat') — all operators, no group
                   separation. Mirrors the live Evocon picker. Same row markup
                   as the grouped block so role chips / leader behaviour match. -->
              <template v-else>
                <div v-for="op in flatOperators" :key="op.id" class="op-check-row op-op-row op-op-row--flat">
                  <label class="op-check-row-inner">
                    <span class="op-check-box" :class="{ checked: formSelectedOps.includes(op.id) }" @click.prevent="toggleOperator(op.id)">
                      <v-icon v-if="formSelectedOps.includes(op.id)" size="18" color="white">mdi-check</v-icon>
                    </span>
                    <span class="op-op-text">
                      <span class="op-op-name-line">
                        <span class="op-op-name">{{ op.firstName }} {{ op.lastName }}</span>
                        <img v-if="rolesMode === 'single' && op.role === 'Supervisor'" src="icn/save-report.svg" alt="" width="18" height="18" class="op-op-star">
                      </span>
                      <span v-if="rolesMode === 'single' && !adjustRolesOn && op.role" class="op-op-role-desc">{{ op.role }}</span>
                    </span>
                  </label>
                  <button v-if="leaderStyle === 'chip' && canSetLeader(op)" type="button"
                          class="op-leaderchip" :class="{ 'is-leader': isLeader(op.id) }"
                          @click.stop="toggleRowLeader(op)"
                          :aria-pressed="isLeader(op.id)"
                          :title="isLeader(op.id) ? 'Shift leader' : 'Set as shift leader'">
                    <v-icon size="18" :color="isLeader(op.id) ? '#2ecc71' : '#757575'">mdi-flag</v-icon>
                    <span>Leader</span>
                  </button>
                  <div v-if="leaderStyle === 'dropdown' && canSetLeader(op)" class="op-tag-area" @click.stop>
                    <button class="op-leaderddchip" :class="{ 'is-leader': isLeader(op.id) }" @click="openLeaderDD(op.id, $event)">
                      <v-icon size="18" :color="isLeader(op.id) ? '#2ecc71' : '#757575'">mdi-flag</v-icon>
                      <span>{{ isLeader(op.id) ? 'Shift leader' : '-' }}</span>
                      <v-icon size="18" color="#757575">mdi-menu-down</v-icon>
                    </button>
                    <teleport to="body">
                      <div v-if="leaderDDOpId === op.id" class="op-tag-dropdown op-role-dropdown"
                           :style="{ top: leaderDDPos.top + 'px', left: leaderDDPos.left + 'px' }" @click.stop>
                        <div class="op-role-row" :class="{ 'is-selected': isLeader(op.id) }" @click="pickLeaderRole(op, true)">
                          <v-icon v-if="isLeader(op.id)" class="op-role-marker" size="24" color="#2ecc71">mdi-check-circle</v-icon>
                          <span v-else class="op-role-marker"></span>
                          <span class="op-role-label">Shift leader</span>
                        </div>
                        <div class="op-role-row" :class="{ 'is-selected': !isLeader(op.id) }" @click="pickLeaderRole(op, false)">
                          <v-icon v-if="!isLeader(op.id)" class="op-role-marker" size="24" color="#2ecc71">mdi-check-circle</v-icon>
                          <span v-else class="op-role-marker"></span>
                          <span class="op-role-label">-</span>
                        </div>
                      </div>
                    </teleport>
                  </div>
                  <div v-if="showRoleChip(op)" class="op-tag-area" @click.stop>
                    <button class="op-rolechip" :class="{ 'is-selected': effectiveRoles(op).length > 0 }" @click="openTagDropdown(op.id, $event)">
                      <img src="icn/operators%20%28account-hard-hat%29.svg" alt="" width="18" height="18" class="op-rolechip-icn">
                      <span>{{ effectiveRoles(op)[0] || '-' }}</span>
                      <v-icon size="18" color="#757575">mdi-menu-down</v-icon>
                    </button>
                    <teleport to="body">
                      <div v-if="tagDropdownOpId === op.id"
                           class="op-tag-dropdown op-role-dropdown"
                           :style="{ top: tagDropdownPos.top + 'px', left: tagDropdownPos.left + 'px' }"
                           @click.stop>
                        <div v-for="role in roleOptionsFor(op)" :key="role.name"
                             class="op-role-row" :class="{ 'is-selected': effectiveRoles(op).includes(role.name) }"
                             @click="pickOperatorRole(op, role, $event)">
                          <v-icon v-if="effectiveRoles(op).includes(role.name)" class="op-role-marker" size="24" color="#2ecc71">mdi-check-circle</v-icon>
                          <span v-else class="op-role-marker"></span>
                          <span class="op-role-label">{{ role.name }}</span>
                        </div>
                      </div>
                    </teleport>
                  </div>
                </div>
              </template>

              <!-- Helpers row: checkbox + "Helpers" label + inline number chip.
                   Chip sits right next to the label (not pushed to the right
                   like the operator role chip). Active state: green tinted bg
                   + green border once the user enters a number. Only present
                   when the station allows additional workforce on shift. -->
              <div v-if="allowAW" class="op-check-row op-op-row"
                   :class="{ 'op-op-row-helpers': opList === 'grouped', 'op-op-row--flat': opList === 'flat' }">
                <label class="op-check-row-inner">
                  <span class="op-check-box" :class="{ checked: helpersOn }" @click.prevent.stop="toggleHelpersOn">
                    <v-icon v-if="helpersOn" size="18" color="white">mdi-check</v-icon>
                  </span>
                  <span class="op-op-text">
                    <span class="op-op-name-line">
                      <!-- Workforce icon before the label, per Figma 32106:13541. -->
                      ${awIcon('op-helpers-icn')}
                      <span class="op-op-name">Additional workforce</span>
                      <span class="op-helpers-chip" :class="{ 'is-active': helpersOn }" @click.prevent.stop>
                        <input type="number" min="1"
                               v-model.number="formHelperCount"
                               @focus="helpersOn = true; if (!formHelperCount) formHelperCount = 1"
                               class="op-helpers-chip-input" />
                      </span>
                    </span>
                  </span>
                </label>
              </div>
            </div>

            <!-- 'Adjust operator roles' toggle (Figma standard switch).
                 Single mode only — multi uses always-on chips, leader uses the
                 Shift leader select below. -->
            <div v-if="rolesMode === 'single'" class="op-toggle-row">
              <span class="op-toggle-label">Adjust operator roles</span>
              <button class="op-switch" :class="{ 'is-on': adjustRolesOn }"
                      @click="adjustRolesOn = !adjustRolesOn"
                      aria-label="Adjust operator roles">
                <span class="op-switch-knob"></span>
              </button>
            </div>

            <!-- Leader mode: "Shift leader" select below the operators list. The
                 dropdown lists operators who can lead AND are checked into the
                 shift — so the operator list populates what's pickable. Disabled
                 (0.5 opacity) with a hover tooltip until ≥1 eligible is selected. -->
            <div v-if="rolesMode === 'leader' && anyCanLead && leaderStyle === 'field'" class="op-leader-field" :class="{ 'is-disabled': !leaderEnabled }"
                 @mouseenter="!leaderEnabled && showTooltip($event, 'No leading operators selected')"
                 @mouseleave="hideTooltip">
              <button type="button" class="op-leader-select" :disabled="!leaderEnabled" @click.stop="toggleLeaderDropdown">
                <v-icon class="op-leader-icn" size="24" color="#707070">mdi-flag</v-icon>
                <span class="op-leader-value" :class="{ 'is-placeholder': !leaderName }">{{ leaderName || leaderFieldLabel }}</span>
                <v-icon size="24" color="#757575">mdi-menu-down</v-icon>
              </button>
              <span class="op-leader-caption">{{ leaderCaption }}</span>
              <teleport to="body">
                <div v-if="leaderDropdownOpen" class="op-tag-dropdown op-role-dropdown"
                     :style="{ top: leaderDropdownPos.top + 'px', left: leaderDropdownPos.left + 'px', width: leaderDropdownPos.width + 'px' }"
                     @click.stop>
                  <div v-for="op in leaderOptions" :key="op.id"
                       class="op-role-row" :class="{ 'is-selected': isLeader(op.id) }"
                       @click="pickLeader(op)">
                    <!-- Multi: a tickbox per row (same checkbox style as the
                         operator list / setup). Single: a check-circle marker. -->
                    <span v-if="multiLeader" class="op-check-box op-role-marker" :class="{ checked: isLeader(op.id) }">
                      <v-icon v-if="isLeader(op.id)" size="18" color="white">mdi-check</v-icon>
                    </span>
                    <template v-else>
                      <v-icon v-if="isLeader(op.id)" class="op-role-marker" size="24" color="#2ecc71">mdi-check-circle</v-icon>
                      <span v-else class="op-role-marker"></span>
                    </template>
                    <span class="op-role-label">{{ op.firstName }} {{ op.lastName }}</span>
                  </div>
                </div>
              </teleport>
            </div>

            <!-- Time inputs (start / end side by side) -->
            <div class="op-time-row">
              <div class="op-time-field">
                <input type="time" v-model="formStartTime" class="op-time-input" />
                <span class="op-time-label">Start time</span>
              </div>
              <div class="op-time-field">
                <input type="time" v-model="formEndTime" class="op-time-input" />
                <span class="op-time-label">End time</span>
              </div>
            </div>
          </div>

          <div class="op-footer op-footer-right-only">
            <button class="op-btn op-btn-text" @click="cancelForm">CANCEL</button>
            <button class="op-btn op-btn-save" :disabled="formSelectedOps.length === 0 && !helpersOn" @click="saveOperators">SAVE</button>
          </div>
        </template>

        <!-- ═══════════ ADD HELPERS ═══════════ -->
        <template v-if="currentView === 'add-helpers'">
          <div class="op-header">
            <v-icon size="24" color="#212121">mdi-account-group</v-icon>
            <span class="op-header-title">Additional workforce</span>
          </div>

          <div class="op-body">
            <div class="op-helper-field">
              <input type="number" v-model.number="formHelperCount" min="1" placeholder="Number of people" class="op-number-input" />
              <span class="op-helper-hint">How many additional people are working during this shift?</span>
            </div>
            <div class="op-time-row">
              <div class="op-time-field">
                <input type="time" v-model="formStartTime" class="op-time-input" />
                <span class="op-time-label">Start time</span>
              </div>
              <div class="op-time-field">
                <input type="time" v-model="formEndTime" class="op-time-input" />
                <span class="op-time-label">End time</span>
              </div>
            </div>
          </div>

          <div class="op-footer op-footer-right-only">
            <button class="op-btn op-btn-text" @click="cancelForm">CANCEL</button>
            <button class="op-btn op-btn-save" :disabled="!formHelperCount || formHelperCount < 1" @click="saveHelpers">SAVE</button>
          </div>
        </template>

      </div>
    </div>
  `,
  setup(props, { emit }) {
    const { ref, computed, watch, onMounted } = Vue;

    // ── Core state ──
    // entries: a single unified array of shift assignments. Each entry has
    //   { id, operatorIds: number[], roles: { [opId]: tag|null },
    //     helperCount: number, startTime, endTime }
    // A helper-only entry has operatorIds = []. There is never more than one
    // entry covering any given moment in time — overlaps merge on save.
    // Per-entry roles let the same person carry different roles on
    // non-overlapping entries (e.g. Supervisor 12-15, plain operator 15-18).
    const currentView = ref('overview');
    let _nextId = 10;

    const entries = ref([]);

    // ── Prototype: operator-card layout switch (toggled via H-key panel). ──
    const cardLayout = ref(window.__protoCardLayout || 'twoRow');
    window.addEventListener('proto:cardLayout', (e) => { cardLayout.value = e.detail; });

    // Roles mode: 'single' (legacy — Settings role caption + "Adjust operator
    // Leader mode is now the committed design (Single/Multi were prototype A/B
    // variants that have been dropped). Kept as a ref so the template branches
    // still resolve cleanly, but it's effectively a constant.
    const rolesMode = ref('leader');

    // Plan tier — 'pro' or 'enterprise'. On Pro the Enterprise-locked roles
    // (Quality, Maintenance) are hidden in the picker entirely, leaving just
    // Supervisor; on Enterprise they're listed but disabled + tooltip.
    const tier = ref(window.__protoTier || 'pro');
    window.addEventListener('proto:tier', (e) => { tier.value = e.detail; });

    // SV operator list mode: 'grouped' (by operator group, current proto) or
    // 'flat' (all ops in one flat list — like Evocon today). Set via H-key.
    const opList = ref(window.__protoOpList || 'flat');
    window.addEventListener('proto:opList', (e) => { opList.value = e.detail; });

    // Shift-leader assignment style: 'field' (dropdown below the list) or
    // 'chip' (a flag chip on each leading operator's row). Proto-settings toggle.
    const leaderStyle = ref(window.__protoLeaderStyle || 'chip');
    window.addEventListener('proto:leaderStyle', (e) => { leaderStyle.value = e.detail; });
    // Station setting "Allow additional workforce on shift" — gates the
    // Additional workforce row in the picker (proto-panel stands in for the
    // real Stations screen).
    // Variant B: overlapping additional-workforce counts add up instead of the
    // later one stating the reality for that stretch. Off by default.
    const awMerge = ref(window.__protoAWMerge === 'on');
    window.addEventListener('proto:awMerge', (e) => { awMerge.value = e.detail === 'on'; });

    const allowAW = ref(window.__protoAllowAW !== 'off');
    window.addEventListener('proto:allowAW', (e) => {
      allowAW.value = e.detail !== 'off';
      if (!allowAW.value) helpersOn.value = false;
    });

    // ── Kebab menu (alternative card): one open at a time. ──
    // Teleported to <body> + position: fixed so the menu escapes the modal's
    // overflow:auto scroll container.
    const kebabEntryId = ref(null);
    const kebabPos = ref({ top: 0, left: 0 });
    function toggleKebab(id, event) {
      if (kebabEntryId.value === id) { kebabEntryId.value = null; return; }
      kebabEntryId.value = id;
      if (event && event.currentTarget) {
        const r = event.currentTarget.getBoundingClientRect();
        // Anchor below + right-aligned to the kebab button. Flip up if it would
        // overflow the viewport bottom.
        const menuW = 180;
        const menuH = 156;
        let top = r.bottom + 4;
        let left = r.right - menuW;
        if (top + menuH > window.innerHeight - 8) top = r.top - menuH - 4;
        if (left < 8) left = 8;
        kebabPos.value = { top, left };
      }
    }
    function closeKebab() { kebabEntryId.value = null; }

    // "Adjust operator roles" toggle in the picker. OFF (default): role is
    // shown as a 12px caption under each operator's name; chips are hidden.
    // ON: role chip appears on the right of every operator row and is
    // clickable to change the role for this entry.
    const adjustRolesOn = ref(false);
    // Helpers checkbox/chip state — replaces the old standalone helper count
    // input. When OFF, the chip is greyed and helperCount is ignored on save.
    const helpersOn = ref(false);
    function toggleHelpersOn() {
      helpersOn.value = !helpersOn.value;
      if (helpersOn.value && (!formHelperCount.value || formHelperCount.value < 1)) {
        formHelperCount.value = 1;
      }
    }

    // ── Form state ──
    const searchQuery = ref('');
    const formSelectedOps = ref([]);
    // formOperatorRoles: per-operator role *for this form session*. Initialized
    // from the operator's defaultTag when checked, cleared when unchecked.
    // Persisted onto the entry as `roles` when the form saves.
    const formOperatorRoles = Vue.reactive({});
    const formStartTime = ref('06:00');
    const formEndTime = ref('14:00');
    const formHelperCount = ref(null);
    const editingEntryId = ref(null);

    // ── Data refs (from shared localStorage) ──
    const allOperators = Vue.reactive(SharedData.getOperators());
    const allTeams = SharedData.getTeams();
    const allTags = MOCK_TAGS;

    // ── Collapsible teams (collapsed by default) ──
    // Groups are expanded by default in the Shift View picker so operators
    // are immediately visible without an extra click.
    const collapsedTeams = Vue.reactive(new Set());
    function toggleTeamCollapse(teamId) {
      collapsedTeams.has(teamId) ? collapsedTeams.delete(teamId) : collapsedTeams.add(teamId);
    }

    // ── Tag editing state ──
    const hoveredOpId = ref(null);
    const tagDropdownOpId = ref(null);
    // Fixed-position coords for the open tag dropdown — recomputed from the
    // trigger's bounding rect so the dropdown escapes the scroll container.
    const tagDropdownPos = ref({ top: 0, left: 0 });
    let _tagAnchorEl = null;

    function handleRowMouseleave(opId) {
      if (tagDropdownOpId.value !== opId) hoveredOpId.value = null;
    }

    function positionTagDropdown(triggerEl) {
      if (!triggerEl) return;
      const r = triggerEl.getBoundingClientRect();
      const menuW = 240;
      const menuH = 200;
      // Default: open below + right-aligned to the trigger.
      let top  = r.bottom + 4;
      let left = r.right - menuW;
      // Flip up if it would overflow the viewport.
      if (top + menuH > window.innerHeight - 8) top = r.top - menuH - 4;
      if (left < 8) left = 8;
      tagDropdownPos.value = { top, left };
    }

    function openTagDropdown(opId, event) {
      event.stopPropagation();
      if (tagDropdownOpId.value === opId) {
        tagDropdownOpId.value = null;
        _tagAnchorEl = null;
      } else {
        tagDropdownOpId.value = opId;
        _tagAnchorEl = event.currentTarget;
        positionTagDropdown(_tagAnchorEl);
      }
    }

    function repositionTagDropdown() {
      if (tagDropdownOpId.value != null) positionTagDropdown(_tagAnchorEl);
    }

    // Pick / unpick a role for THIS form's entry. SINGLE-select against the
    // operator's available tags. Clicking the active tag again clears it.
    // Closing on pick keeps the interaction snappy. Picking a tag does NOT
    // change the operator's checked state — those are independent.
    function pickOperatorRole(op, role, event) {
      event.stopPropagation();
      // Accept either a plain role name (legacy callers) or a { name, disabled }
      // row from roleOptionsFor. Disabled (Enterprise-locked) rows are ignored
      // and keep the dropdown open so the tooltip stays readable.
      const name = typeof role === 'string' ? role : role.name;
      if (role && typeof role === 'object' && role.disabled) return;
      const current = effectiveRoles(op);
      const isActive = current.length === 1 && current[0] === name;
      formOperatorRoles[op.id] = isActive ? [] : [name];
      tagDropdownOpId.value = null;
    }

    // Explicit "No role" clear (MUI None pattern) — empties the picked role for
    // this operator regardless of what was selected.
    function clearOperatorRole(op, event) {
      event.stopPropagation();
      formOperatorRoles[op.id] = [];
      tagDropdownOpId.value = null;
    }

    function closeTagDropdown() { tagDropdownOpId.value = null; }

    // The roles currently in effect for this operator in the picker. Priority:
    //   1. Roles the user has picked in this form session (formOperatorRoles).
    //   2. The operator's Settings `role` (single role per the new data model)
    //      when nothing has been picked yet — shown even before the operator
    //      is checked.
    // Both the chip and the dropdown checkboxes read from here, so the
    // Settings role appears ticked in the dropdown by default.
    function effectiveRoles(op) {
      if (op.id in formOperatorRoles) {
        const v = formOperatorRoles[op.id];
        return Array.isArray(v) ? v : (v ? [v] : []);
      }
      // Back-compat: old data carried op.defaultTag; the new model uses op.role.
      const def = op.role || op.defaultTag || null;
      return def ? [def] : [];
    }

    // Convenience helpers used by templates that still expect a single string
    // (chip label) or array (multi-check dropdown).
    function effectiveRole(op) {
      const roles = effectiveRoles(op);
      return roles.length === 0 ? '' : roles.join(', ');
    }

    function getTagLabel(op) {
      return effectiveRole(op) || '';
    }

    // Whether to show the role chip for this operator row.
    //  • leader → never (leader mode uses a single "Shift leader" select, not
    //             per-operator chips)
    //  • multi  → any operator that carries ≥1 allowed role (always on, no toggle)
    //  • single → only when the "Adjust operator roles" toggle is ON
    function showRoleChip(op) {
      if (rolesMode.value === 'leader') return false;
      if (rolesMode.value === 'multi') {
        return Array.isArray(op.allowedRoles) && op.allowedRoles.length > 0;
      }
      return adjustRolesOn.value;
    }

    // ── Leader mode ("Shift leader" select / chips) ──
    // Source of truth is a SET of leader ids (formLeaderIds) to support the
    // "multiple leaders" proto-setting. Single-leader consumers (saved card,
    // bottom-bar summary, reports) read `formLeaderId` = the first leader, kept
    // as a computed shim so nothing downstream had to change.
    const formLeaderIds = ref([]);                       // ordered; [0] = primary
    const formLeaderId  = computed(() => formLeaderIds.value[0] ?? null);
    // Spec: a team must have a shift leader (when leader-capable operators
    // exist). Saving without one flips this on → error state on all available
    // leader chips / the leader field. Cleared the moment a leader is picked.
    const leaderDropdownOpen = ref(false);
    const leaderDropdownPos = ref({ top: 0, left: 0 });
    let _leaderAnchorEl = null;

    // Proto-settings: auto-prefill the first eligible leader, and allow many.
    const leaderPrefill = ref(window.__protoLeaderPrefill === 'on');
    window.addEventListener('proto:leaderPrefill', (e) => { leaderPrefill.value = e.detail === 'on'; });
    const multiLeader = ref(window.__protoMultiLeader === 'on');
    window.addEventListener('proto:multiLeader', (e) => { multiLeader.value = e.detail === 'on'; maybePrefillLeader(); });

    const leaderOptions = computed(() =>
      allOperators.filter(o => o.canLead && formSelectedOps.value.includes(o.id))
    );
    // No operator in the org can lead → hide the field entirely.
    const anyCanLead = computed(() => allOperators.some(o => o.canLead));
    // Eligible leaders present on the shift → field enabled.
    const leaderEnabled = computed(() => leaderOptions.value.length > 0);
    // Plural-aware copy: when multiple leaders are allowed, say "Shift leaders"
    // / "Leading operators…". Singular otherwise.
    const leaderFieldLabel = computed(() => multiLeader.value ? 'Shift leaders' : 'Shift leader');
    const leaderCaption = computed(() => multiLeader.value
      ? 'Leading operators who lead the shift'
      : 'Leading operator who leads the shift');
    // Field-style label: primary name, "+N" when several are selected.
    const leaderName = computed(() => {
      const ids = formLeaderIds.value;
      if (!ids.length) return '';
      const first = allOperators.find(o => o.id === ids[0]);
      const base = first ? `${first.firstName} ${first.lastName}`.trim() : '';
      return ids.length > 1 ? `${base} +${ids.length - 1}` : base;
    });
    const isLeader = (id) => formLeaderIds.value.includes(id);

    // Auto-prefill: when enabled and no leader is set yet, make the first
    // eligible (checked-in, can-lead) operator the leader. Single-leader only
    // picks one; multi leaves the rest for the user to add.
    function maybePrefillLeader() {
      if (!leaderPrefill.value) return;
      if (formLeaderIds.value.length) return;
      const first = leaderOptions.value[0];
      if (first) formLeaderIds.value = [first.id];
    }

    function positionLeaderDropdown(triggerEl) {
      if (!triggerEl) return;
      const r = triggerEl.getBoundingClientRect();
      const menuH = 240;
      let top = r.bottom + 4;
      if (top + menuH > window.innerHeight - 8) top = Math.max(8, r.top - menuH - 4);
      leaderDropdownPos.value = { top, left: r.left, width: r.width };
    }
    function toggleLeaderDropdown(event) {
      if (!leaderEnabled.value) return;
      if (leaderDropdownOpen.value) { leaderDropdownOpen.value = false; return; }
      leaderDropdownOpen.value = true;
      _leaderAnchorEl = event && event.currentTarget;
      positionLeaderDropdown(_leaderAnchorEl);
    }
    function closeLeaderDropdown() { leaderDropdownOpen.value = false; }
    // Field dropdown row click. Multi → toggle within the set (dropdown stays
    // open). Single → set the one leader (or clear on re-pick) and close.
    function pickLeader(op) {
      if (multiLeader.value) {
        formLeaderIds.value = isLeader(op.id)
          ? formLeaderIds.value.filter(id => id !== op.id)
          : [...formLeaderIds.value, op.id];
      } else {
        formLeaderIds.value = isLeader(op.id) ? [] : [op.id];
        leaderDropdownOpen.value = false;
      }
    }
    // Chip style: a leader flag chip shows on EVERY canLead operator's row.
    // Tapping toggles their leader state and checks them into the shift. Multi
    // off → picking one replaces any other; multi on → independent toggles.
    function canSetLeader(op) {
      return rolesMode.value === 'leader' && op.canLead;
    }
    function toggleRowLeader(op) {
      if (isLeader(op.id)) {
        formLeaderIds.value = formLeaderIds.value.filter(id => id !== op.id);
        return;
      }
      formLeaderIds.value = multiLeader.value ? [...formLeaderIds.value, op.id] : [op.id];
      // You can't lead a shift you're not on — check them in.
      if (!formSelectedOps.value.includes(op.id)) formSelectedOps.value.push(op.id);
    }

    // ── Dropdown style: a per-row role chip opening a single-select menu
    // (Shift leader / -), extensible to more roles later. ──
    const leaderDDOpId = ref(null);
    const leaderDDPos  = ref({ top: 0, left: 0 });
    let _leaderDDAnchor = null;
    function positionLeaderDD(triggerEl) {
      if (!triggerEl) return;
      const r = triggerEl.getBoundingClientRect();
      const menuW = 240, menuH = 120;
      let top = r.bottom + 4, left = r.right - menuW;
      if (top + menuH > window.innerHeight - 8) top = r.top - menuH - 4;
      if (left < 8) left = 8;
      leaderDDPos.value = { top, left };
    }
    function openLeaderDD(opId, event) {
      event.stopPropagation();
      if (leaderDDOpId.value === opId) { leaderDDOpId.value = null; _leaderDDAnchor = null; return; }
      leaderDDOpId.value = opId;
      _leaderDDAnchor = event.currentTarget;
      positionLeaderDD(_leaderDDAnchor);
    }
    function closeLeaderDD() { leaderDDOpId.value = null; }
    // Pick a role from the row dropdown. `asLeader` true → set leader (+ check
    // in), false → clear this operator's leader role. Respects multi-leader.
    function pickLeaderRole(op, asLeader) {
      if (asLeader) {
        if (!isLeader(op.id)) {
          formLeaderIds.value = multiLeader.value ? [...formLeaderIds.value, op.id] : [op.id];
          if (!formSelectedOps.value.includes(op.id)) formSelectedOps.value.push(op.id);
        }
      } else {
        formLeaderIds.value = formLeaderIds.value.filter(id => id !== op.id);
      }
      leaderDDOpId.value = null;
    }
    // Keep leaders in sync with the shift roster: drop any leader who gets
    // unchecked, then (if enabled) prefill a leader when none remains.
    watch(formSelectedOps, (ids) => {
      const kept = formLeaderIds.value.filter(id => ids.includes(id));
      if (kept.length !== formLeaderIds.value.length) formLeaderIds.value = kept;
      maybePrefillLeader();
    });

    // Role catalog (mirrors setup-proto's OPERATOR_ROLES). Order matters for
    // the dropdown. `enterprise: true` rows are gated by the plan tier.
    const ROLE_CATALOG = [
      { name: 'Supervisor',  enterprise: false },
      { name: 'Quality',     enterprise: true  },
      { name: 'Maintenance', enterprise: true  },
    ];
    function isEnterpriseRole(name) {
      const r = ROLE_CATALOG.find(x => x.name === name);
      return !!(r && r.enterprise);
    }

    // The role rows listed in the dropdown for this operator, as objects
    // { name, disabled }. Tier-gated:
    //  • multi  → the operator's allowedRoles ("possible roles")
    //  • single → all roles (the Settings default is just a starting point)
    // On Pro, Enterprise-locked roles are dropped entirely; on Enterprise they
    // are plain, pickable rows (no badge, no disabled state). So `disabled` is
    // always false here — the gate is purely "show or hide".
    function roleOptionsFor(op) {
      let names;
      if (rolesMode.value === 'multi') {
        names = Array.isArray(op.allowedRoles) ? op.allowedRoles : [];
      } else {
        names = ROLE_CATALOG.map(r => r.name);
      }
      const rows = [];
      names.forEach(name => {
        if (isEnterpriseRole(name) && tier.value !== 'enterprise') return; // Pro: hide locked roles
        rows.push({ name, disabled: false });
      });
      return rows;
    }

    // ── Filtered teams for search ──
    const filteredTeams = computed(() => {
      const q = searchQuery.value.toLowerCase().trim();
      // Only show groups that have at least one operator assigned. Empty
      // groups still exist in Settings but don't clutter the Shift View picker.
      const teamsWithMembers = allTeams.filter(team =>
        allOperators.some(o => o.teamId === team.id)
      );
      if (!q) return teamsWithMembers;
      return teamsWithMembers.filter(team => {
        if (team.name.toLowerCase().includes(q)) return true;
        return allOperators.some(o =>
          o.teamId === team.id &&
          (o.firstName.toLowerCase().includes(q) || o.lastName.toLowerCase().includes(q))
        );
      });
    });

    function getFilteredTeamOperators(teamId) {
      const q = searchQuery.value.toLowerCase().trim();
      let ops = allOperators.filter(o => o.teamId === teamId);
      if (q) {
        // If full team matches by name, show all ops; otherwise filter ops
        const team = allTeams.find(t => t.id === teamId);
        if (team && team.name.toLowerCase().includes(q)) return ops;
        ops = ops.filter(o =>
          o.firstName.toLowerCase().includes(q) || o.lastName.toLowerCase().includes(q)
        );
      }
      return ops;
    }

    // Operators with no team — shown as a flat list under the team groups.
    const noTeamOperators = computed(() => {
      const q = searchQuery.value.toLowerCase().trim();
      let ops = allOperators.filter(o => !o.teamId);
      if (q) {
        ops = ops.filter(o =>
          o.firstName.toLowerCase().includes(q) || o.lastName.toLowerCase().includes(q)
        );
      }
      return ops;
    });

    // Flat list of ALL operators (proto: "Flat" opList mode) — search-filtered,
    // no group separation. Mirrors the live Evocon experience today.
    const flatOperators = computed(() => {
      const q = searchQuery.value.toLowerCase().trim();
      let ops = [...allOperators];
      if (q) {
        ops = ops.filter(o =>
          o.firstName.toLowerCase().includes(q) || o.lastName.toLowerCase().includes(q)
        );
      }
      return ops;
    });

    function isTeamFullySelected(teamId) {
      const ops = allOperators.filter(o => o.teamId === teamId);
      return ops.length > 0 && ops.every(o => formSelectedOps.value.includes(o.id));
    }

    function isTeamPartiallySelected(teamId) {
      const ops = allOperators.filter(o => o.teamId === teamId);
      const count = ops.filter(o => formSelectedOps.value.includes(o.id)).length;
      return count > 0 && count < ops.length;
    }

    function toggleTeam(teamId) {
      const ops = allOperators.filter(o => o.teamId === teamId);
      if (isTeamFullySelected(teamId)) {
        const removeIds = new Set(ops.map(o => o.id));
        formSelectedOps.value = formSelectedOps.value.filter(id => !removeIds.has(id));
        removeIds.forEach(id => { delete formOperatorRoles[id]; });
      } else {
        const addIds = ops.map(o => o.id).filter(id => !formSelectedOps.value.includes(id));
        formSelectedOps.value = [...formSelectedOps.value, ...addIds];
        addIds.forEach(id => seedRoleForOp(id));
        collapsedTeams.delete(teamId);
      }
    }

    function toggleOperator(opId) {
      if (formSelectedOps.value.includes(opId)) {
        formSelectedOps.value = formSelectedOps.value.filter(id => id !== opId);
        delete formOperatorRoles[opId];
      } else {
        formSelectedOps.value = [...formSelectedOps.value, opId];
        seedRoleForOp(opId);
        // Prefill: the FIRST leading operator the user checks in becomes the
        // shift leader (only when prefill is on and none is set yet).
        const op = allOperators.find(o => o.id === opId);
        if (leaderPrefill.value && rolesMode.value === 'leader' &&
            op && op.canLead && formLeaderIds.value.length === 0) {
          formLeaderIds.value = [opId];
        }
      }
    }

    // Initialize this operator's role-in-this-form to their Settings role.
    // Only runs if the user hasn't already picked a role for this operator —
    // we don't want to overwrite a manual choice when they later check the box.
    function seedRoleForOp(opId) {
      if (opId in formOperatorRoles) return;
      const op = allOperators.find(o => o.id === opId);
      if (!op) return;
      // New model uses op.role (single string). Fall back to op.defaultTag for
      // legacy data that hasn't migrated.
      const def = op.role || op.defaultTag || null;
      if (def) {
        formOperatorRoles[opId] = [def];
      } else {
        formOperatorRoles[opId] = [];
      }
    }

    function getEntryTeamColors(entry) {
      const seen = new Set();
      const colors = [];
      entry.operatorIds.forEach(id => {
        const op = allOperators.find(o => o.id === id);
        const team = op && op.teamId ? allTeams.find(t => t.id === op.teamId) : null;
        if (team && team.color && !seen.has(team.id)) {
          seen.add(team.id);
          colors.push(team.color);
        }
      });
      return colors;
    }

    // Render a single operator's full name + entry-level roles. Tooltips
    // always carry the full data so users can identify people unambiguously.
    // E.g. "Vasilis Mavroeidis (Supervisor)" or "Pawel Herchel (Quality, Maintenance)".
    function nameWithRole(op, entry) {
      const r = entry && entry.roles ? entry.roles[op.id] : null;
      const list = Array.isArray(r) ? r : (r ? [r] : []);
      const name = `${op.firstName} ${op.lastName}`.trim();
      return list.length ? `${name} (${list.join(', ')})` : name;
    }

    // For the alternative card (Figma 32042:7348): one row per tag present
    // in the entry, naming the FIRST operator carrying that tag. Multi-tag
    // operators surface on every applicable row. Order follows MOCK_TAGS.
    function getEntryTagRows(entry) {
      const rows = [];
      const roles = entry.roles || {};
      MOCK_TAGS.forEach(tag => {
        const ids = entry.operatorIds.filter(id => {
          const r = roles[id];
          const list = Array.isArray(r) ? r : (r ? [r] : []);
          return list.includes(tag);
        });
        if (ids.length === 0) return;
        const ops = ids
          .map(id => allOperators.find(o => o.id === id))
          .filter(Boolean);
        if (ops.length === 0) return;
        const names = ops.map(op => `${op.firstName} ${op.lastName}`.trim());
        rows.push({
          tag,
          name: names[0],
          // Surface remaining same-tag people via "+N" suffix if more than one.
          extras: ops.length - 1,
          allNames: names.join(', '),
        });
      });
      return rows;
    }

    // For the alternative card: the bolded line of all operator names.
    // Supervisors first, full names, no role parens (those are on tag rows).
    function getEntryAllNames(entry) {
      const ops = entry.operatorIds
        .map(id => allOperators.find(o => o.id === id))
        .filter(Boolean);
      const sups = ops.filter(op => entryHasRole(entry, op.id, 'Supervisor'));
      const rest = ops.filter(op => !entryHasRole(entry, op.id, 'Supervisor'));
      return [...sups, ...rest]
        .map(op => `${op.firstName} ${op.lastName}`.trim())
        .join(', ');
    }

    // Returns the operators that DON'T have any tag — they belong on the
    // generic "operators" row (tagged people surface in their own tag rows).
    function getEntryUntaggedOps(entry) {
      const roles = entry.roles || {};
      const isTagged = (id) => {
        const r = roles[id];
        const list = Array.isArray(r) ? r : (r ? [r] : []);
        return list.length > 0;
      };
      return entry.operatorIds
        .map(id => allOperators.find(o => o.id === id))
        .filter(op => op && !isTagged(op.id));
    }
    function getEntryUntaggedNames(entry) {
      return getEntryUntaggedOps(entry)
        .map(op => `${op.firstName} ${op.lastName}`.trim())
        .join(', ');
    }
    function getEntryUntaggedCount(entry) {
      return getEntryUntaggedOps(entry).length;
    }
    function getEntryTotal(entry) {
      return entry.operatorIds.length + (entry.helperCount || 0);
    }

    function entryHasRole(entry, opId, role) {
      const r = entry && entry.roles ? entry.roles[opId] : null;
      const list = Array.isArray(r) ? r : (r ? [r] : []);
      return list.includes(role);
    }

    // Flat name list with supervisors first, then everyone else (entry order
    // preserved within each group). Used on the operator-modal card —
    // full names only, no role parentheses (those live in the tooltip).
    function getEntryFlatNames(entry) {
      const ops = entry.operatorIds
        .map(id => allOperators.find(o => o.id === id))
        .filter(Boolean);
      const sups = ops.filter(op => entryHasRole(entry, op.id, 'Supervisor'));
      const rest = ops.filter(op => !entryHasRole(entry, op.id, 'Supervisor'));
      return [...sups, ...rest]
        .map(op => `${op.firstName} ${op.lastName}`.trim())
        .join(', ');
    }

    // Same as getEntryFlatNames but returns parts so the template can render
    // a star icon inline after each supervisor name (Figma 32084:89233).
    function getEntryNameParts(entry) {
      const ops = entry.operatorIds
        .map(id => allOperators.find(o => o.id === id))
        .filter(Boolean);
      // The star marks the ACTIVE shift leader(s) for this entry. Supports
      // multiple leaders (entry.leaderIds); falls back to the single leaderId.
      const leaderSet = Array.isArray(entry.leaderIds) && entry.leaderIds.length
        ? new Set(entry.leaderIds)
        : new Set(entry.leaderId != null ? [entry.leaderId] : []);
      const isLeader = (op) => leaderSet.has(op.id);
      const leader = ops.filter(isLeader);
      const rest   = ops.filter(op => !isLeader(op));
      return [
        ...leader.map(op => ({ name: `${op.firstName} ${op.lastName}`.trim(), supervisor: true  })),
        ...rest.map(  op => ({ name: `${op.firstName} ${op.lastName}`.trim(), supervisor: false })),
      ];
    }

    // Saved-card people-chip hover tooltip — "Operators: 8, Additional workforce: 23".
    function getEntryPeopleTooltip(entry) {
      const ops = entry.operatorIds.length;
      const aw  = entry.helperCount || 0;
      const parts = [];
      if (ops > 0) parts.push(`Operators: ${ops}`);
      if (aw  > 0) parts.push(`Additional workforce: ${aw}`);
      return parts.join(', ');
    }

    // Saved-card names-row hover tooltip — plain comma list of operator names.
    // The assigned shift leader(s) for THIS entry get "(Shift leader)" appended.
    // No group references, no "Operators:" prefix.
    function getEntryNamesTooltip(entry) {
      const names = getEntryNameParts(entry)
        .map(p => p.supervisor ? `${p.name} (Shift leader)` : p.name);
      if (entry.helperCount > 0) names.push(`Additional workforce: ${entry.helperCount}`);
      return names.join(', ');
    }

    // Saved-card name list: everyone who has ANY role comes first (entry order
    // preserved), then the people without a role. Full names, comma-joined.
    // No star — a set role is not treated as visually special here.
    function getEntryRoleFirstNames(entry) {
      const ops = entry.operatorIds
        .map(id => allOperators.find(o => o.id === id))
        .filter(Boolean);
      const hasRole = (op) => {
        const r = entry && entry.roles ? entry.roles[op.id] : null;
        const list = Array.isArray(r) ? r : (r ? [r] : []);
        return list.length > 0;
      };
      const withRole = ops.filter(hasRole);
      const without  = ops.filter(op => !hasRole(op));
      return [...withRole, ...without]
        .map(op => `${op.firstName} ${op.lastName}`.trim())
        .join(', ');
    }

    function getOperatorFirstNames(entry) {
      return entry.operatorIds
        .map(id => allOperators.find(o => o.id === id))
        .filter(Boolean)
        .map(op => nameWithRole(op, entry))
        .join(', ');
    }

    function getOperatorNames(entry) {
      const ops = entry.operatorIds
        .map(id => allOperators.find(o => o.id === id))
        .filter(Boolean);
      // Group by team
      const grouped = new Map();
      ops.forEach(op => {
        const team = op.teamId ? allTeams.find(t => t.id === op.teamId) : null;
        const key = team ? team.id : 0;
        if (!grouped.has(key)) grouped.set(key, { teamName: team ? team.name : null, names: [] });
        grouped.get(key).names.push(nameWithRole(op, entry));
      });
      const parts = [];
      grouped.forEach(g => {
        if (g.teamName) {
          parts.push(g.teamName + ': ' + g.names.join(', '));
        } else {
          parts.push(g.names.join(', '));
        }
      });
      return parts.join(', ');
    }

    // ── Navigation ──
    function openAddOperators() {
      formSelectedOps.value = [];
      Object.keys(formOperatorRoles).forEach(k => delete formOperatorRoles[k]);
      formStartTime.value = '06:00';
      formEndTime.value = '14:00';
      formHelperCount.value = null;
      helpersOn.value = false;
      adjustRolesOn.value = false;
      formLeaderIds.value = [];
      leaderDropdownOpen.value = false;
      searchQuery.value = '';
      editingEntryId.value = null;
      currentView.value = 'add-operators';
    }

    function openAddHelpers() {
      formHelperCount.value = null;
      formStartTime.value = '06:00';
      formEndTime.value = '14:00';
      editingEntryId.value = null;
      currentView.value = 'add-helpers';
    }

    function cancelForm() {
      editingEntryId.value = null;
      // Nothing assigned → close the panel. There is no overview to fall back
      // to (the watcher opened the choice view for exactly that reason), and
      // re-entering the view the user is already looking at makes CANCEL read
      // as a dead button.
      if (entries.value.length === 0) { emit('close'); return; }
      currentView.value = 'overview';
    }

    // ── Save ──
    function timeToMinutes(t) {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    }

    function rangesOverlap(aStart, aEnd, bStart, bEnd) {
      // Any overlap — touching ends don't count (back-to-back shifts are distinct).
      const as = timeToMinutes(aStart), ae = timeToMinutes(aEnd);
      const bs = timeToMinutes(bStart), be = timeToMinutes(bEnd);
      return as < be && bs < ae;
    }

    function minTime(a, b) {
      return timeToMinutes(a) <= timeToMinutes(b) ? a : b;
    }
    function maxTime(a, b) {
      return timeToMinutes(a) >= timeToMinutes(b) ? a : b;
    }

    function minutesToTime(mins) {
      const m = ((mins % 1440) + 1440) % 1440; // wrap overnight
      return String(Math.floor(m / 60)).padStart(2, '0') + ':' +
             String(m % 60).padStart(2, '0');
    }

    // Normalised [start, end) in minutes. An end at or before the start means
    // the range crosses midnight, so push the end into the next day.
    function entrySpan(e) {
      const s = timeToMinutes(e.startTime);
      let x = timeToMinutes(e.endTime);
      if (x <= s) x += 1440;
      return [s, x];
    }

    /**
     * Rebuild `existing` + `incoming` into a non-overlapping, time-ordered set.
     *
     * Every entry is treated as a layer over the timeline. We cut at every
     * start/end boundary and, for each resulting section, union the layers
     * covering it. Sections nobody covers are dropped; adjacent sections with
     * identical contents are coalesced so a non-overlapping add doesn't
     * needlessly fragment the list.
     *
     * Later layers win on conflict: `incoming` is applied last, so its role
     * picks and its shift leader override the ones already there — but only
     * within the section it actually covers. Outside that section the earlier
     * leader stays untouched.
     *
     * Additional workforce is a single quantity per section, not a set of
     * identities, so the last layer that states it wins, exactly like the
     * shift leader. An operator registers what is actually on the floor for
     * that stretch of time rather than a delta on top of what came before,
     * which also makes saving the same entry twice a no-op.
     */
    function splitEntries(existing, incoming) {
      const layers = [...existing, incoming].filter(l =>
        (l.operatorIds && l.operatorIds.length) || (l.helperCount || 0) > 0
      );
      if (layers.length === 0) return [];

      const spans = layers.map(entrySpan);

      // Cut points = every boundary, deduped and ordered.
      const cuts = [...new Set(spans.flat())].sort((a, b) => a - b);

      const sections = [];
      for (let i = 0; i < cuts.length - 1; i++) {
        const from = cuts[i], to = cuts[i + 1];
        // Layers covering this whole section (boundaries are exclusive at the end).
        const covering = layers.filter((_, idx) =>
          spans[idx][0] <= from && spans[idx][1] >= to
        );
        if (covering.length === 0) continue; // gap — nobody assigned

        const opIds = [];
        const roles = {};
        let helperCount = 0;
        let leaderIds = [];

        for (const l of covering) {
          (l.operatorIds || []).forEach(id => {
            if (!opIds.includes(id)) opIds.push(id);
          });
          // Later layer's role picks replace earlier ones for the same operator.
          Object.entries(l.roles || {}).forEach(([id, r]) => {
            roles[id] = Array.isArray(r) ? [...r] : (r ? [r] : []);
          });
          // Additional workforce is one quantity per slot, not a set of
          // people, so a later layer restates it rather than adding to it.
          // Layers that make no claim (null) leave the current value alone.
          // Under the merge variant the stated counts add up instead.
          if (l.helperCount != null) {
            helperCount = awMerge.value ? helperCount + l.helperCount : l.helperCount;
          }
          // Single leader per section: the last covering layer that names one wins.
          const ids = Array.isArray(l.leaderIds) && l.leaderIds.length
            ? l.leaderIds
            : (l.leaderId != null ? [l.leaderId] : []);
          if (ids.length) leaderIds = [...ids];
        }

        // A leader who isn't on shift in this section can't lead it.
        leaderIds = leaderIds.filter(id => opIds.includes(id));

        sections.push({
          operatorIds: opIds,
          roles,
          leaderIds,
          leaderId: leaderIds[0] ?? null,
          helperCount,
          _from: from,
          _to: to,
        });
      }

      // Coalesce neighbours that describe the same team, so adding a
      // non-overlapping block doesn't split an untouched entry in two.
      const sameTeam = (a, b) =>
        a.helperCount === b.helperCount &&
        a.leaderId === b.leaderId &&
        a.operatorIds.length === b.operatorIds.length &&
        a.operatorIds.every(id => b.operatorIds.includes(id)) &&
        a.operatorIds.every(id =>
          JSON.stringify([...(a.roles[id] || [])].sort()) ===
          JSON.stringify([...(b.roles[id] || [])].sort()));

      const merged = [];
      for (const s of sections) {
        const prev = merged[merged.length - 1];
        if (prev && prev._to === s._from && sameTeam(prev, s)) {
          prev._to = s._to;
        } else {
          merged.push(s);
        }
      }

      // Reuse existing entry ids where the time range is unchanged, so Vue
      // keys stay stable and untouched cards don't visually re-mount.
      const freeIds = existing.map(e => ({ id: e.id, span: entrySpan(e) }));
      return merged.map(s => {
        const hit = freeIds.findIndex(f => f.span[0] === s._from && f.span[1] === s._to);
        const id = hit >= 0 ? freeIds.splice(hit, 1)[0].id : _nextId++;
        return {
          id,
          operatorIds: s.operatorIds,
          roles: s.roles,
          leaderIds: s.leaderIds,
          leaderId: s.leaderId,
          helperCount: s.helperCount,
          startTime: minutesToTime(s._from),
          endTime: minutesToTime(s._to),
        };
      });
    }

    function saveOperators() {
      const hasOps = formSelectedOps.value.length > 0;
      // Only honour helperCount when the helpers checkbox is on. This makes
      // the chip's "people" number a no-op until the user opts in.
      const hasHelpers = helpersOn.value && formHelperCount.value && formHelperCount.value > 0;
      if (!hasOps && !hasHelpers) return;

      // Shift leader is OPTIONAL (testing feedback, 2026-08): a slot may be
      // saved with no leader. At most one leader per slot is still enforced —
      // by the picker itself, which replaces rather than appends.

      // Snapshot the form-level role map for the operators being saved.
      // Each entry.roles[id] is always a string[] (may be empty).
      const newRoles = {};
      formSelectedOps.value.forEach(id => {
        const v = formOperatorRoles[id];
        newRoles[id] = Array.isArray(v) ? [...v] : (v ? [v] : []);
      });

      const submission = {
        operatorIds: [...formSelectedOps.value],
        roles: newRoles,
        leaderIds: [...formLeaderIds.value],
        leaderId: formLeaderId.value, // back-compat: primary leader
        // null means "this entry makes no claim about additional workforce",
        // which is different from claiming zero. An operator-only entry must
        // not wipe the AW already recorded for the time it covers.
        helperCount: helpersOn.value ? (formHelperCount.value || 0) : null,
        startTime: formStartTime.value,
        endTime: formEndTime.value,
      };

      // Editing: drop the old version and re-apply the edited one as a layer.
      // Widening an entry's time range can push it over a neighbour, so edits
      // go through the same splitting path as new entries rather than writing
      // in place — otherwise the edit could recreate an overlap.
      if (editingEntryId.value) {
        const others = entries.value.filter(e => e.id !== editingEntryId.value);
        entries.value = splitEntries(others, submission);
        editingEntryId.value = null;
        currentView.value = 'overview';
        emitSummary();
        return;
      }

      // New entry — split the timeline at every boundary instead of merging.
      // Adding C 13:00–14:00 on top of A+B 12:00–16:00 yields three sections:
      // 12–13 (A,B) · 13–14 (A,B,C) · 14–16 (A,B). The new submission is just
      // one more layer; `splitEntries` rebuilds the whole non-overlapping set.
      entries.value = splitEntries(entries.value, submission);

      editingEntryId.value = null;
      currentView.value = 'overview';
      emitSummary();
    }

    function saveHelpers() {
      // Helpers-only view delegates to the unified save path so we apply the
      // same overlap-merge logic. formSelectedOps is empty when this is called.
      if (!formHelperCount.value || formHelperCount.value < 1) return;
      saveOperators();
    }

    // ── CRUD (all operate on the unified entries array) ──
    function deleteEntry(id) {
      entries.value = entries.value.filter(e => e.id !== id);
      emitSummary();
      // Deleting the last entry leaves nothing to show — drop straight back
      // into the choice view (no empty overview, like live).
      if (entries.value.length === 0) openAddOperators();
    }

    // When the panel opens with nothing assigned, go straight to the operator
    // choice view instead of showing an empty overview (matches live Shift View).
    watch(() => props.visible, (isOpen) => {
      if (isOpen && entries.value.length === 0) openAddOperators();
    }, { immediate: true });

    function loadFormFromEntry(entry, opts) {
      formSelectedOps.value = [...entry.operatorIds];
      formStartTime.value = entry.startTime;
      formEndTime.value = entry.endTime;
      formHelperCount.value = entry.helperCount || null;
      // Helper toggle reflects whether the entry actually had helpers attached.
      helpersOn.value = !!entry.helperCount;
      // Role-adjust toggle defaults to OFF when editing; user can flip it.
      adjustRolesOn.value = false;
      // Leader mode: restore the picked shift leader(s). Prefer the array;
      // fall back to the legacy single leaderId on older entries.
      formLeaderIds.value = Array.isArray(entry.leaderIds)
        ? [...entry.leaderIds]
        : (entry.leaderId != null ? [entry.leaderId] : []);
      leaderDropdownOpen.value = false;
      // Wipe + restore per-operator roles as string[] (multi-tag model).
      Object.keys(formOperatorRoles).forEach(k => delete formOperatorRoles[k]);
      Object.entries(entry.roles || {}).forEach(([id, r]) => {
        formOperatorRoles[Number(id)] = Array.isArray(r) ? [...r] : (r ? [r] : []);
      });
      // For any selected op missing from roles, seed with their defaultTag.
      entry.operatorIds.forEach(id => {
        if (!(id in formOperatorRoles)) seedRoleForOp(id);
      });
      searchQuery.value = '';
      editingEntryId.value = opts && opts.editing ? entry.id : null;
      currentView.value = 'add-operators';
    }

    function duplicateEntry(id) {
      const entry = entries.value.find(e => e.id === id);
      if (entry) loadFormFromEntry(entry, { editing: false });
    }

    function editEntry(id) {
      // Always open the full add-operators modal — works for operator-only,
      // helper-only, and mixed entries. A helper-only entry's edit lets the
      // user attach operators/teams to it too.
      const entry = entries.value.find(e => e.id === id);
      if (entry) loadFormFromEntry(entry, { editing: true });
    }

    function handleOverlayClick() {
      if (currentView.value === 'overview') { emit('close'); return; }
      // Otherwise the click is swallowed, so a stray one cannot discard a
      // half-finished selection. The exception is the choice view opened onto
      // an empty shift with nothing picked yet: nothing to lose, and no
      // overview behind it to return to.
      if (entries.value.length === 0
          && formSelectedOps.value.length === 0
          && !helpersOn.value) emit('close');
    }

    // ── Tooltip ──
    let _tooltipEl = null;
    function showTooltip(event, text) {
      hideTooltip();
      const el = document.createElement('div');
      el.className = 'op-tooltip';
      el.textContent = text;
      document.body.appendChild(el);
      _tooltipEl = el;
      const rect = event.currentTarget.getBoundingClientRect();
      el.style.left = rect.left + 'px';
      el.style.top = (rect.top - el.offsetHeight - 6) + 'px';
    }
    function hideTooltip() {
      if (_tooltipEl) { _tooltipEl.remove(); _tooltipEl = null; }
    }

    // ── Summary calculation for bottom bar ──
    function timeToHours(start, end) {
      const [sh, sm] = start.split(':').map(Number);
      const [eh, em] = end.split(':').map(Number);
      let h = (eh - sh) + (em - sm) / 60;
      if (h < 0) h += 24; // overnight shift
      return h;
    }

    function emitSummary() {
      const totalOps = entries.value.reduce((s, e) => s + e.operatorIds.length, 0);
      const totalHelpers = entries.value.reduce((s, e) => s + (e.helperCount || 0), 0);
      const totalPeople = totalOps + totalHelpers;

      const fullName = (op) => op ? `${op.firstName} ${op.lastName}`.trim() : '';

      // Footer name = the assigned shift leader if one is set on any entry;
      // otherwise just the first operator on the shift. Then "+ N" = everyone
      // else (operators + additional workforce). No team name, no color.
      const leaderIds = new Set();
      const leaderNames = [];
      for (const entry of entries.value) {
        // All leaders on the entry (multi-leader), falling back to the single id.
        const ids = Array.isArray(entry.leaderIds) && entry.leaderIds.length
          ? entry.leaderIds
          : (entry.leaderId != null ? [entry.leaderId] : []);
        for (const lid of ids) {
          if (leaderIds.has(lid)) continue;
          const op = allOperators.find(o => o.id === lid);
          if (op) { leaderIds.add(lid); leaderNames.push(fullName(op)); }
        }
      }

      let footerName = '';
      let footerExtras = 0;
      if (leaderNames.length > 0) {
        footerName = leaderNames.join(', ');
        footerExtras = Math.max(0, totalPeople - leaderIds.size);
      } else {
        const firstWithOps = entries.value.find(e => e.operatorIds.length > 0);
        const firstOp = firstWithOps ? allOperators.find(o => o.id === firstWithOps.operatorIds[0]) : null;
        footerName = firstOp ? fullName(firstOp) : '';
        footerExtras = Math.max(0, totalPeople - (firstOp ? 1 : 0));
      }

      // Full team-grouped operator+helper list (for chip hover tooltip).
      // Aggregates across all entries so the user sees the entire shift.
      // Bottom-bar chip tooltip — same shape as the saved-card names tooltip:
      // leader(s) first with "(Shift leader)", then the rest of the operators,
      // then "Additional workforce: N" as the last item.
      const fullTooltip = (() => {
        const leaderIdSet = new Set();
        entries.value.forEach(e => {
          const ids = Array.isArray(e.leaderIds) && e.leaderIds.length
            ? e.leaderIds : (e.leaderId != null ? [e.leaderId] : []);
          ids.forEach(id => leaderIdSet.add(id));
        });
        const fullName = (op) => `${op.firstName} ${op.lastName}`.trim();
        const leaders = [], rest = [];
        const seen = new Set();
        entries.value.forEach(e => e.operatorIds.forEach(id => {
          if (seen.has(id)) return;
          seen.add(id);
          const op = allOperators.find(o => o.id === id);
          if (!op) return;
          if (leaderIdSet.has(id)) leaders.push(`${fullName(op)} (Shift leader)`);
          else rest.push(fullName(op));
        }));
        const parts = [...leaders, ...rest];
        if (totalHelpers > 0) parts.push(`Additional workforce: ${totalHelpers}`);
        return parts.join(', ');
      })();

      emit('update:summary', {
        footerName,
        footerExtras,
        totalPeople,
        fullTooltip,
        hasEntries: totalPeople > 0,
      });
    }

    onMounted(() => {
      emitSummary();
      document.addEventListener('click', closeTagDropdown);
      document.addEventListener('click', closeKebab);
      document.addEventListener('click', closeLeaderDropdown);
      document.addEventListener('click', closeLeaderDD);
      // Scroll capture catches the inner scroll containers (.op-body-scroll)
      // so the dropdown follows the anchor on scroll.
      window.addEventListener('scroll', repositionTagDropdown, true);
      window.addEventListener('scroll', closeLeaderDropdown, true);
      window.addEventListener('scroll', closeLeaderDD, true);
      window.addEventListener('resize', closeTagDropdown);
      window.addEventListener('resize', closeLeaderDropdown);
      window.addEventListener('resize', closeLeaderDD);
    });

    const { onUnmounted } = Vue;
    onUnmounted(() => {
      document.removeEventListener('click', closeTagDropdown);
      document.removeEventListener('click', closeLeaderDropdown);
      document.removeEventListener('click', closeLeaderDD);
      window.removeEventListener('scroll', repositionTagDropdown, true);
      window.removeEventListener('scroll', closeLeaderDropdown, true);
      window.removeEventListener('scroll', closeLeaderDD, true);
      window.removeEventListener('resize', closeTagDropdown);
      window.removeEventListener('resize', closeLeaderDropdown);
      window.removeEventListener('resize', closeLeaderDD);
    });

    return {
      currentView,
      editingEntryId,
      cardLayout,
      rolesMode,
      tier,
      showRoleChip,
      roleOptionsFor,
      formLeaderId,
      formLeaderIds,
      isLeader,
      multiLeader,
      leaderDropdownOpen,
      leaderDropdownPos,
      leaderOptions,
      anyCanLead,
      leaderEnabled,
      leaderName,
      leaderFieldLabel,
      leaderCaption,
      leaderStyle,
      allowAW,
      canSetLeader,
      toggleRowLeader,
      leaderDDOpId,
      leaderDDPos,
      openLeaderDD,
      pickLeaderRole,
      toggleLeaderDropdown,
      pickLeader,
      getEntryTagRows,
      getEntryAllNames,
      getEntryUntaggedNames,
      getEntryUntaggedCount,
      getEntryTotal,
      kebabEntryId,
      kebabPos,
      toggleKebab,
      closeKebab,
      entries,
      searchQuery,
      formSelectedOps,
      formStartTime,
      formEndTime,
      formHelperCount,
      adjustRolesOn,
      helpersOn,
      toggleHelpersOn,
      filteredTeams,
      getFilteredTeamOperators,
      noTeamOperators,
      opList,
      flatOperators,
      isTeamFullySelected,
      isTeamPartiallySelected,
      toggleTeam,
      toggleOperator,
      getEntryTeamColors,
      getOperatorNames,
      getOperatorFirstNames,
      getEntryFlatNames,
      getEntryNameParts,
      getEntryRoleFirstNames,
      getEntryPeopleTooltip,
      getEntryNamesTooltip,
      openAddOperators,
      openAddHelpers,
      cancelForm,
      saveOperators,
      saveHelpers,
      deleteEntry,
      duplicateEntry,
      editEntry,
      handleOverlayClick,
      showTooltip,
      hideTooltip,
      getTagLabel,
      collapsedTeams,
      toggleTeamCollapse,
      hoveredOpId,
      tagDropdownOpId,
      tagDropdownPos,
      handleRowMouseleave,
      openTagDropdown,
      pickOperatorRole,
      clearOperatorRole,
      effectiveRole,
      effectiveRoles,
      formOperatorRoles,
      allTags,
    };
  }
};
