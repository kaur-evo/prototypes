# Operators & Teams — UX Research Synthesis

Generated 8 May 2026 · Sources: Notion exports "Separate fields in Operator team / Manpower KPIs" + "Assigning operators to teams" + Viktorija's research planning + Potter & Moore ticket · Data spans Apr 2022 — May 2026

---

## Why?

Evocon knows *who* worked a shift but not *what role they played*, *how many people were on the line*, or *which team they belong to*. Factory managers track shift leaders, headcount, and team/brigade assignments on paper forms, in Excel, or by hacking the operator name field — because Evocon's operator model has no concept of role, team size, or group. Without this, customers can't answer three questions their production meetings ask every day: "whose shift was this?", "was our staffing cost-effective?", and "which crew is performing best?"

---

## Research Overview

**23 customer names** appear across multiple Notion tickets over 4+ years. The first ticket ("Separate fields / Manpower KPIs") spans Feb 2023 — May 2026 with 17 names. The second ticket ("Assigning operators to teams") spans Apr 2022 — Nov 2025 with 3 names. Viktorija's research planning adds Supercerame and Thermory. Potter & Moore came via partner ticket in Apr 2026. Hilding Poland is flagged as adjacent (line leaders in Shift View modal). Requests come from Greece (via partners Spiros & John Lelis), Scandinavia (JW, Tikkurila, Thermory), UK (THG Labs, Podpak, Potter & Moore), Poland (Onduline, hplush, ~~Hilding Poland~~), Morocco (briqueterie chaouia, Supercerame), Uruguay (Adium), and Australia (Mars GEM).

**Requesting customers:**
Eurochartiki · HalcorM · Hellenica · JW (Jeld-Wen) · Nikas · Onduline · Papoutsanis · Podpak · Sarantis · Syngenta · THG Labs · Tastsian · Tikkurila (PPG) · Vianex · Yiotis · briqueterie chaouia · ION SA · Mars GEM · Matrixpack · hplush · Potter & Moore · Supercerame · Thermory · ~~Hilding Poland~~ (adjacent)

**Evocon team contributing:** Kerli Kuusk (support/product), Martin Lääts (product), Johanna Tammsalu (product), Viktorija Trubačiūtė (UX research), Meeri (design/product), Brent (support), Erki (engineering/custom reports), Spiros & John Lelis (Greek partner)

---

## JTBD Research Mapping

### JTBD #1 — "I need to know who was in charge of this shift and who was just helping — so I can evaluate the right person's performance"

When I look at a shift's OEE, I see a flat list of 5 operator names and can't tell which one was running the line and which ones were packing boxes. The responsible person's name is buried among the helpers. I need that distinction — in the data entry and in the report — so I can attribute the shift's result to the leader, compare leaders against each other, and have the right conversation when performance is low.

**Signal: 14 unique customers** · Papoutsanis · Syngenta · Eurochartiki · Tikkurila · Yiotis · briqueterie chaouia · Sarantis · Hellenica · Vianex · ION SA · Nikas · OSCAR SA · Campari · Thermory

| Quote | Source |
|-------|--------|
| "How can I get the performance of each main operator? Today I cannot separate them." | Papoutsanis (Mavroeidis Vasileios), 13.03.2023 |
| "My suggestion is to have **two separate fields**. one for main operators and one for the rest stuff" | Papoutsanis (Mavroeidis), 13.03.2023 |
| "they cannot evaluate performance/shift leader, as his name is lost among other names" | Spiros re: Eurochartiki, 19.06.2023 |
| "Inside shiftview, operator will choose the main operator (= Shiftleader), and will add also the rest team in a separate group (helpers). So for every shift, you know the leader, the helpers, and the total manpower" | John Lelis, 12.06.2023 |
| "For each line, there is always one responsible operator, and several workers for manual picking, packaging etc. Who is the responsible operator (for quality, performance etc) and how many workers are working (for costing, productivity etc.)" | John Lelis re: OSCAR SA & ION SA, 16.10.2023 |
| "There are 2 types of clients: These that need the main operator + the manpower used, how many people (most clients). These that need main operator + all the names of the helpers used (fewer clients)." | John Lelis, 12.06.2023 |
| "They have one Shift Leader who oversees several lines, and another 3 workers dedicated to this line." | Spiros re: Yiotis, 22.05.2025 |
| "They want to see how their supervisors are hitting their OEE targets by shift. Today they print out a page and fill it in by hand." | Tikkurila factory visit (JT), 14.02.2025 |
| "Currently, we can only input first and last name... As a workaround, we input the role in the first name field and the actual name in the last name field, which is not ideal." | briqueterie chaouia (Hicham Soubhi), 13.05.2025 |
| "in pharma industry they need to check responsibilities as well" | Spiros re: Vianex, 18.11.2024 |
| Marking other members near the station. They want to separate 'other people' from operators. | Thermory (via Viktorija's planning) |

[img-01] Papoutsanis: Current report mixes all operators — can't isolate main operator performance
[img-02] John's mockup: Operator (leader) vs. Helpers as separate fields in Shift View
[img-03] John's mockup: Adding a "manpower" number next to each person
[img-04] John's mockup: Full team entry with roles and equivalent manpower
[img-12] Yiotis: Paper form showing shift leader field prominent at top
[img-13] Yiotis: Legacy paper report (since 2016) — shift leader name + number of workers + manhours
[img-11] briqueterie chaouia: Current workaround — role entered in first name field, actual name in last name

---

### JTBD #2 — "I need to see how many people worked the shift — so I can tell if the OEE was actually good or just expensive"

When someone shows me 40% OEE, my first question is always: "with how many people?" Running 40% with 1 operator is a deliberate cost-saving choice. Running 40% with 4 operators is a problem. But Evocon doesn't capture headcount, so I can't make that call — and we keep having the same argument in every production meeting. I need the number of people right next to the OEE so I can judge the result in context, and ideally divide output by manhours to see real productivity.

**Signal: 10 unique customers** · JW · Onduline · Eurochartiki · THG Labs · Podpak · Syngenta · Potter & Moore · Adium · Papoutsanis · Yiotis

| Quote | Source |
|-------|--------|
| "Will we be able to choose and see on the overview, if a production line run with 1 or 2 operators. The reason i ask that is because, we often get into an argument of the OEE number, is it good or bad? Based on the number of operators." | JW (Jonas Hermansen), 30.06.2023 |
| "We often have a situation, where we only run with 40% OEE on a line, but that's because we are only 1 operator, that is a leadership choice based on effective calculations and salary." | JW (Jonas Hermansen), 30.06.2023 |
| "OEE is related to manpower used. Monday you measure OEE 50% with 10 workers, Tuesday 48% but with 4 workers. You lost 2% in terms of OEE, but saved 6 workers. When did you perform better overall for the company?" | John Lelis (Syngenta context), 12.06.2023 |
| "most of the companies, are measuring KPI's relative to produced qty, eg 1000pcs/1worker" | John Lelis, 12.06.2023 |
| "Produced pieces/consumed manhours. Now it is impossible." | Spiros re: Eurochartiki, 19.06.2023 |
| "It will be necessary to add functionality to enter the number of operators per shift and working hours." | Onduline (Pawel Herchel), 27.03.2026 |
| "DL = 8 employees x 24 hours / total square meters produced in a given day." | Onduline (Pawel Herchel), 27.03.2026 |
| "Tracking productivity based on the number of staff. Eesmärk oleks jõuda selleni, et mis on ideaalne operaatorite arv liinil." | Podpak (Marten), 11.02.2025 |
| "Regarding point 1 – labour tracking, it is crucial for us to be able to extract that data. **I fear that our finance director might not approve this system unless we can get labour variance data.**" | THG Labs (Rafal Cebula), 06.06.2024 |
| "the customer has also said that it would be really helpful for the operators if you could add a column where the box is showing the count of operators in each entry." | Partner re: Potter & Moore, Apr 2026 |

[img-05] John's mockup: Raw data — shift leader, helpers, and manpower number per shift
[img-16] Eurochartiki: Productivity per number of people — what is the most cost-effective team size?
[img-09] John Lelis's mockup: Completed manpower report — shift leader, helpers, manpower count, pieces/worker

---

### JTBD #3 — "I need the OEE target to adjust when I run with fewer people, so we stop blaming the operator for a management decision"

When I choose to run a line with 1 operator instead of 3 to save cost, the OEE target should reflect that. Today the target stays at 75% regardless, so the operator always looks bad on the dashboard even though they're doing the right thing. I need headcount-aware targets so the system reflects reality.

**Signal: 2 customers** · JW · Tikkurila

| Quote | Source |
|-------|--------|
| "You should just be able to set target for OEE % based on how many operators that run the line." | JW (Jonas Hermansen), 30.06.2023 |
| "Responsive OEE target taking into account the number of operators on the line. Example: When three operators are running the line, the OEE target is 75%, but when just one person takes care of the shift, a 10% smaller OEE number is accepted." | JW (Jonas Hermansen via Johanna), 08.12.2023 |

---

### JTBD #4 — "When someone moves to another line mid-shift, I shouldn't have to re-enter the entire team from scratch"

When 1 of 5 operators is reassigned to a different station during the shift, the only way today is to end the whole team entry and re-select the remaining 4 operators one by one. This is so painful that some factories refuse to expand Evocon to more lines because of it. I need to add/remove one person without destroying the rest.

**Signal: 4 customers** · Hellenica · Campari · Yiotis · Potter & Moore

| Quote | Source |
|-------|--------|
| "if one of five people is moved to another line, they have to end the whole team and then to enter 4 operators again" | Spiros re: Hellenica, 18.10.2024 |
| "we have a discussion to expand Evocon in another 4 lines, but they don't proceed as they find today's way of entering operators' teams when you have to move operators from line to line, too complicated and non-productive. The same with HELLENICA" | Spiros re: Campari, 25.10.2024 |
| "At the moment, if you want to remove a person from the list of operators from shift view (e.g. an operator is transferring to a different station midway through the shift), you must create a new entry and re-select all of the remaining operators from a list as per attached video." | Partner re: Potter & Moore, Apr 2026 |
| "Potter and Moore have requested that a Duplicate button is added that can duplicate the previous line, with the operators already selected, so that they can adjust the time." | Partner re: Potter & Moore, Apr 2026 |

⚠️ **Revenue signal:** Campari won't expand to 4 new lines because team editing is too painful. Potter & Moore independently confirms the same friction with a concrete solution proposal (duplicate button).

**Potter & Moore follow-up Q&A:**
- Q: "The operator list is duplicated fully, then they could just remove the one(s) that left?" — A: "Yes exactly"
- Q: "The time slots in the duplicated row should cover the leftover available time slot?" — A: "Yes, that mimics the existing behavior."
- Q: "You can only create one duplicate at a time?" — A: "Yes 1 at a time."
- ML (27.04.26): "Also makes sense. Let's discuss."
- Discussion (27.04.2026): "Väga lihtne lahendus. Kauri op tiimide teema osaks." (= Very simple solution. Kauri as part of operator teams topic.)

---

### JTBD #5 — "I need to tag operators by their role or department so I can filter and report on different types of people"

When I have 10+ people on a shift — operators, quality inspectors, supervisors, warehouse staff — and I need to pull metrics for just the supervisors or just the quality team, I can't. Evocon only knows first name + last name. Some of us hack the name field ("Quality - Mr Evocon"), but that breaks everything else. I need a way to categorize people so I can slice data by role.

**Signal: 5 customers** · Vianex · briqueterie chaouia · RAFARM · Supercerame · Sarantis

| Quote | Source |
|-------|--------|
| "There are businesses, where the names are critical, like pharma companies. If you see in the attachment from RAFARM, they monitor all names in big detail, even during the break! It's a matter of responsibility/traceability." | Spiros, 17.10.2023 |
| "Having a dedicated field for the role would bring clarity and improve how we manage operator data." | briqueterie chaouia, 13.05.2025 |
| 10+ people working on a shift, different departments jumping from station to station. They separated their operators into 'groups' by changing the name (Employee code / Full Name / Department → 12345 / Mr Evocon / Quality (Q)) | Supercerame (Mohamed) — via Viktorija's planning |
| Extract any type of metrics for the indirect personnel per shift (shift supervisors, team leaders, engineers, warehouse operators, etc), unless you keep an external record of the days and hours they worked. | Sarantis (Katerina) — operator groups for indirect personnel |

[img-10] RAFARM (pharma): Detailed operator tracking by name including break periods — compliance requirement

---

### JTBD #6 — "I need to find which leader + helper combination produces the best result, so I can build the optimal team"

When operator A leads with helpers X and Y, OEE is 60%. When A leads with Z instead of Y, OEE drops to 50%. This tells me something about team chemistry and skills, but I can't see it in Evocon because everyone is in a flat list. I need to correlate team composition with output to make better staffing decisions.

**Signal: 3 customers** · Syngenta · Eurochartiki · Papoutsanis

| Quote | Source |
|-------|--------|
| "you (as a main operator) achieved OEE 50% with me as a helper, but, you achieved also an OEE 60% with someone else as a helper and not me. We have to find out that as well in a report." | John Lelis, 12.06.2023 |

---

### JTBD #7 — "I need to compare Team A vs Team B vs Team C — because that's how we award bonuses and make staffing decisions"

When we run 24/7 with 4 rotating brigades, I don't care which individual operator was better — I need to know which *crew* hit targets and which didn't, because bonuses are for the whole brigade. Today I download Evocon data, match it with a manual attendance Excel by date and hour, and build pivot tables. It takes hours every month. I need Evocon to know which team was on shift so I can just run a report.

**Signal: 5 customers** · Mars GEM · Matrixpack · hplush · Supercerame · Matrixpack (originally via Spiros, 2022)

| Quote | Source |
|-------|--------|
| "We'd like to compare the OEE of the four operator teams for making corrective actions if it is necessary (on terms of team instead of each operator separately)." | Matrixpack (Vasilis Yfantis), Apr 2022 |
| "if we could have an extra key to filter operators per team, (or crew) we could have an idea of each team's performance." | Spiros re: Matrixpack, 2022 |
| "Managers would like to see performance by brigade since they award bonuses based on their work. However, we currently do not know how to easily obtain this information, as this variable is missing in Evocon." | hplush (Łukasz Biłas), 05.11.2024 |
| "Brigades has around 5-25 people depends on location and daysoff etc. Operators in shift are normally working in designed processes/stations." | hplush (Łukasz Biłas), Nov 2024 |
| "Yes bonuses are for whole brigades." | hplush, Nov 2024 |
| "We are checking in paper/xls shift reports based on operators declaration of how much he produced during shift. This is being calculated in excel to know how each brigade fulfill targets." | hplush, Nov 2024 |
| "Predefined teams. The team is the only thing measured (quality checks). They do not care who is on the team. They want everyone to be in the team. At the Melton site, they use teams, no operators." | Mars GEM (JT notes), 12.11.2024 |
| "team-level OEE analysis is crucial not only for our factory, but also for most factories worldwide that operate with rotating teams." | Matrixpack (Vasilis), 26.11.2025 |
| "Teams sit between Shifts and Operators and directly affect OEE." | Matrixpack (Vasilis), 26.11.2025 |
| "We want Evocon to be able to record the progress of a team can make depending on its operators so that we can see which operators give us the best OEE by making various changes (operators) between teams." | Matrixpack (Andreas, Production Manager), 14.11.2025 |
| "It takes considerable time to download all the data into Excel and build pivot tables to organize it in a format suitable for presentation to foremen and operators." | Matrixpack (Andreas), 14.11.2025 |

[img-22] Matrixpack: Operator list in Evocon — current state, no team grouping
[img-23] Matrixpack: Team rotation schedule showing 4 teams across shifts
[img-24] Matrixpack: Current OEE analysis limited to shifts — teams invisible
[img-25] Matrixpack: Proposed OEE analysis with teams layer — the missing dimension

**Key design data from customer Q&A:**

| Question | Mars GEM | hplush | Matrixpack |
|----------|----------|--------|------------|
| Can operator belong to multiple teams? | No, never | No, but can do overtime in another brigade | No, one team only |
| How often do operators switch teams? | Not often, admin-managed | Seldom (once/month at most) | Only for absences, approved by management |
| Who manages team assignments? | Administrators only | Administrator or shift leader | Permission needed from management |
| How is performance attributed when teams mix? | Station production → operator's team. Only 1 operator per station | "Good question. I do not know" | Replacement operator counts as part of the host team for that day |
| What KPIs for teams? | Quality checks, quantities | Qty produced (pcs/m³/pallets), availability KPI, checklists | OEE, quantities, product changes, faults |
| Current workaround? | Separate crewing software | Match Evocon data with manual Excel by date/hour | Download data to Excel, build pivot tables |

**Internal Evocon history:**
- Apr 2022: Matrixpack first requested. KK & ML discussed. Decision: "Praegu see kindlasti tegemisse ei lähe" (not happening now). Suggested workaround: use team names as operator names.
- Aug 2022: "Spiros ei ole ka tõstatanud teemat pikka aega. Won't do kuni uuesti päevakorda tuleb kuskilt." (Won't do until raised again)
- Nov 2024: hplush raised it independently → ML moved to "In Discovery", ran structured Q&A with both hplush and Mars GEM simultaneously
- Nov 2024: Merged to "Separate fields / Manpower KPIs" ticket (28.11.2024)
- Nov 2025: Matrixpack followed up with detailed diagrams. ML: "We'll most probably look into this area next year."
- Nov 2025: Spiros piled on: "This is a request from 2022! In the meantime, several clients have similar needs — to monitor crews' performance, to calculate bonus, to separate main operators from simple workers."

---

## Pattern Frequency Summary

| # | Pattern | Count | Strongest signal |
|---|---------|-------|------------------|
| 1 | Leader accountability + leader/helper distinction | **14** | Papoutsanis direct quote, Yiotis paper forms, Tikkurila factory visit, John Lelis mockups, Thermory helpers |
| 2 | Headcount context + manpower productivity KPI | **10** | JW "argument" quote, THG Labs revenue risk, Onduline formula, Eurochartiki "impossible", Potter & Moore |
| 3 | Dynamic OEE targets by headcount | **2** | JW detailed formula |
| 4 | Edit team mid-shift without restart | **4** | Campari revenue blocker, Potter & Moore concrete solution (duplicate button) |
| 5 | Operator roles/groups for filtering & compliance | **5** | RAFARM pharma, briqueterie chaouia workaround, Supercerame dept hack, Sarantis indirect personnel |
| 6 | Team composition analysis | **3** | All via John Lelis (1 partner voice) |
| 7 | **Group operators into persistent teams/brigades** | **5** | Matrixpack diagrams, Mars GEM "teams not individuals", hplush bonuses, +Supercerame dept hack |

---

## Key Insight

**The requests cluster into two distinct worlds:**

**World A — "Who is in charge of this shift?"** (JTBD #1, #2)
Greek food/cosmetics/pharma factories with manual picking lines. One shift leader, several helpers. Need to attribute OEE to the responsible person AND judge the result by headcount. ~14 customers.

**World B — "Which crew is performing best?"** (JTBD #7)
24/7 rotating factories (Poland, Australia, Greece, Morocco). Brigades of 5-25 people rotate across shifts. Performance is measured at team level for bonuses. Don't care about leader vs. helper — care about Team A vs. Team B. ~5 customers with deep engagement. Supercerame already hacked operator names to encode department.

**World C — "What kind of person is this?"** (JTBD #5)
Cross-cutting: customers want to tag operators by role/department/type for filtering (Supercerame: departments, Sarantis: indirect personnel types, briqueterie chaouia: roles, RAFARM: compliance traceability). This is about metadata on the operator, not about the shift relationship.

**Shared foundation:** All three worlds need the same building block — a way to add metadata to operators (role, group, type) and surface it in Shift View and Reports. The 25.11 meeting (Meeri, Martin, Johanna) landed on a 3-level model: Team → Supervisor → Helpers/count, which maps cleanly to all three worlds.

---

## MVP Approaches — Mapped to Evocon Views

### MVP-B — "Star the leader" (recommended starting point)

**JTBDs addressed:** #1 (leader accountability + distinction), #2 (headcount context + productivity, via API)

| Evocon View | What changes | What it solves |
|-------------|-------------|----------------|
| **Settings → Stations → Advanced** | New toggle: **"Enable shift leader selection"**. Off by default. Same pattern as existing "Require operator selection" toggle. | Opt-in per station. Zero change for customers who don't need it. |
| **Settings → Operators → Edit** | Add **"Default role"** radio (Operator / Shift Leader) below assigned stations. | Pre-selects the star in Shift View. Not a permanent assignment — convenience default. Same person can be leader on one shift, helper on another. |
| **Shift View → Operator modal** (footer) | Each selected operator gets a **★ star toggle**. One star per time window = Shift Leader. Auto-starred if only one operator. **Team size** number auto-calculated from selected operators, manual override available. | JTBD #1: who is the leader. JTBD #2: how many people. |
| **Shift View → Timeline footer** | Leader name appears **first and bold** in operator badge. "+2" suffix = 2 more team members. | Quick glance: whose shift is this? How big is the team? |
| **Reports → +FILTER (any report)** | Add **"Shift Leaders only"** toggle inside existing Operators filter. | Existing OEE report + Split By Operators + "Shift Leaders only" = OEE per shift leader. No new report type. |
| **API → shift_report** | Expose is_leader: true/false per operator + team_size count. | Customers calculate Good Qty ÷ (team_size × hours) in Excel/PowerBI. |

### MVP-B+ — "Operator groups" (extends MVP-B for World B)

**JTBDs addressed:** #7 (teams/brigades), #6 (team composition analysis)

| Evocon View | What changes | What it solves |
|-------------|-------------|----------------|
| **Settings → Operators** | Add **"Group"** field to each operator (free text or predefined list, e.g. "Team A", "Brigade C"). Same concept as stop reason groups. | Matrixpack, hplush, Mars GEM — persistent team assignment. Admin-managed. |
| **Shift View → Operator modal** | When operators are selected, their group badge is shown next to their name. No selection needed — auto-inherited from Settings. | Operators don't need to re-enter team every shift. "that's what I would imagine" — hplush |
| **Reports → Split By / Filter** | Add **"Operator Group"** as a Split By dimension and filter option. | "We'd like to compare the OEE of the four operator teams" — Matrixpack. Replaces their Excel pivot table workflow. |
| **Reports → existing operator reports** | When Split By = Operator Group, aggregate all operators in that group. | Mars GEM: "The team is the only thing measured. They do not care who is on the team." |

### Quick win — "Duplicate operator entry" (for JTBD #4)

**JTBDs addressed:** #6 (mid-shift editing)

| Evocon View | What changes | What it solves |
|-------------|-------------|----------------|
| **Shift View → Operator panel** | Add **"Duplicate"** button on each operator time entry row. Creates a new entry with same operators, covering the remaining time slot. User deletes the operator who left. | Potter & Moore concrete request. "Väga lihtne lahendus" — ML discussion. "Kauri op tiimide teema osaks." |

---

### P2 — Design later (validate first)

| Evocon View | What changes | What it solves | Why P2? |
|-------------|-------------|----------------|---------|
| **Dashboard → new Manpower widget** | Good Count ÷ (Headcount × Hours) over time | JTBD #2 — in-app productivity KPI | Most customers compute from exported data. |
| **Settings → Stations → OEE Target** | Multiple OEE targets tied to headcount | JTBD #3 — dynamic targets | Only 2 customers. Touches ideal cycle time logic. |
| **Reports → new Manpower Report** | Team composition vs. OEE, leader-helper combos | JTBD #6 — team analysis | Needs months of role-tagged shift data first. |
| **Settings → Operators → Custom roles** | Customer-defined roles beyond Leader/Helper | JTBD #5 — compliance roles | Leader/Helper covers 90%. Custom roles add edge-case complexity. |

---

## Key Design Decisions to Resolve

| # | Decision | Evidence | Proposed answer |
|---|----------|----------|-----------------|
| 1 | Static role (in Settings) vs. dynamic role (per shift)? | "Yes, that is why you assign it during the shift, inside the shiftview. If not, we have to get crazy and think all the different combinations and add them inside settings" — John Lelis | Dynamic per-shift, with a default in Settings to speed up entry. |
| 2 | Headcount number vs. named helpers? | "There are 2 types of clients: Those that need the main operator + the manpower used (most clients). Those that need main operator + all the names of the helpers used (fewer clients)." — John Lelis | Support both. Names auto-calculate count. Manual override for unnamed helpers. |
| 3 | Optional feature toggle? | "whatever you do, must be optional" — Spiros. "Stations working with 1 people, will continue to add only one name" — John Lelis | Yes. Off by default. Per station in Settings → Stations → Advanced. |
| 4 | Same person = leader on one shift, helper on another? | "Can one person be a supervisor in one shift and a regular operator in another shift? — Yes" — John Lelis | Role lives on the shift assignment, not the person. Default role is convenience only. |
| 5 | Does the shift leader "own" all OEE data? | "see breakdown by supervisors whereas all data for shift is assigned to him/her" — John Lelis | Yes. For "Split By Leader" view, all shift data attributes to the leader. |
| 6 | **Operator group = static (Settings) or dynamic (per shift)?** | Mars: "Not often, admin-managed." hplush: "by administrator or shift leader." Matrixpack: "Each operator is assigned to one specific team only." All 3 say: rarely changes, admin-managed. | **Static in Settings.** Operator belongs to one group. Can be changed by admin when needed. Auto-attached to every shift the operator works. |
| 7 | **What happens when operator from Group A covers in Group B's shift?** | Matrixpack: "for that day he will work with and be considered part of the team he is assisting." hplush: "good question. I do not know." | Default: use operator's assigned group. Allow override in Shift View for edge cases (same pattern as "default role" override). |
| 8 | **Team-level or operator-level performance attribution when multiple teams on same station?** | Mars: "only 1 operator per station." Matrixpack: "Station production → operator's team." | In most factories, 1 operator per station. When multiple operators from different groups: split equally or attribute to primary (per-station setting). |

---

## Competitor Reference

[img-17] Vorne XL: "Teams and Labor" report — competitor already offers this
[img-18] Vorne: Team management & labor tracking features
[img-19] Vorne: Version history showing labor tracking evolution

---

## Design Surfaces Map

**MVP-B (recommended) — Design these screens:**
- Settings → Stations → Advanced — "Enable shift leader selection" toggle
- Settings → Operators → Edit — "Default role" radio
- Shift View → Operator modal (footer) — ★ star toggle + team size
- Shift View → Timeline footer — leader name first+bold, "+N" suffix
- Reports → +FILTER → Operators — "Shift Leaders only" toggle
- API → shift_report — is_leader + team_size fields

**MVP-B+ (extends for teams) — Additional screens:**
- Settings → Operators → Edit — "Group" field (Team A, Brigade C, etc.)
- Shift View → Operator modal — group badge auto-shown per operator
- Reports → Split By — "Operator Group" dimension
- Reports → +FILTER — "Operator Group" filter

**Quick win (can ship independently):**
- Shift View → Operator panel — "Duplicate" button on time entry rows

**P2 — Design later:**
- Dashboard → new Manpower/Productivity widget
- Settings → Stations → OEE target per headcount
- Reports → new Manpower Report type
- Settings → Operators → custom role taxonomy
- Dashboard → Operator filter on OEE widget

---

## Image Reference

| # | Filename | Description |
|---|----------|-------------|
| img-01 | papoutsanis-mixed-operators-report | Papoutsanis: current report mixes all operators |
| img-02 | john-mockup-leader-vs-helpers | John's mockup: leader vs helpers fields |
| img-03 | john-mockup-manpower-number | John's mockup: manpower number per person |
| img-04 | john-mockup-full-team-entry | John's mockup: full team entry with roles |
| img-05 | john-mockup-raw-data-table | John's mockup: raw data table |
| img-06 | john-mockup-report-per-leader | John's mockup: report per leader (small) |
| img-07 | john-mockup-report-per-leader-chart | John's mockup: report per leader chart |
| img-08 | john-mockup-leader-plus-helpers | John's mockup: leader + helpers |
| img-09 | john-mockup-completed-manpower-report | John's mockup: completed manpower report |
| img-10 | rafarm-pharma-compliance-tracking | RAFARM: pharma compliance operator tracking |
| img-11 | chaouia-role-in-firstname-workaround | briqueterie chaouia: role-in-firstname hack |
| img-12 | yiotis-paper-form-shift-leader | Yiotis: paper form with shift leader |
| img-13 | yiotis-legacy-report-2016 | Yiotis: legacy paper report since 2016 |
| img-14 | yiotis-paper-form-2025-line1 | Yiotis: 2025 paper form line 1 |
| img-15 | yiotis-paper-form-2025-line2 | Yiotis: 2025 paper form line 2 |
| img-16 | eurochartiki-productivity-per-headcount | Eurochartiki: productivity per headcount |
| img-17 | vorne-teams-labor-report | Vorne XL: teams & labor report (competitor) |
| img-18 | vorne-labor-tracking-features | Vorne: labor tracking features |
| img-19 | vorne-version-history | Vorne: version history |
| img-20 | jw-no-operators-defined | JW: no operators defined yet |
| img-21 | jw-oee-report | JW: OEE report |
| img-22 | matrixpack-operator-list | Matrixpack: current operator list, no grouping |
| img-23 | matrixpack-team-rotation-schedule | Matrixpack: 4-team rotation schedule |
| img-24 | matrixpack-oee-limited-to-shifts | Matrixpack: OEE analysis limited to shifts |
| img-25 | matrixpack-oee-with-teams-layer | Matrixpack: OEE with teams — the missing layer |

---

## Internal Research Questions (from Viktorija's planning & 25.11 meeting)

These questions were drafted internally but most remain unanswered at scale. They frame what a discovery round should validate.

**Lead-operator patterns observed across customers:**
- Master operator + team that changes all the time
- Lead-operator can be: always master OR changing roles (sometimes leader, sometimes helper)
- Cost per product and human factor analysis: OEE per lead-operator, OEE per helper's team
- Tag operators by their position?

**Supervisor management questions (unresolved):**
1. Would supervisors and other operator types be defined in Settings? Any limitations (e.g. one supervisor max X stations)?
2. What is the likelihood of needing additional "types" beyond supervisor/operator?
3. Would supervisors and operators be managed as predefined "teams" in Settings? How often would compositions change? How often are compositions always the same, accounting for seasonality and sick leave?
4. Could groups (similar to station groups) solve this? E.g. one group for operators, one for supervisors.
5. Would this be a feature for all customers or select? Would clients pay extra?

**Shift View UX questions (unresolved):**
1. Would operators select from predefined teams?
2. Would operators first select the supervisor, then team members?
3. Can there be a shift with no supervisor?
4. Can there be multiple supervisors in one shift?
5. Would operator-required work for both supervisors and "other" operators? Is there a need for supervisor-required?
6. Can one person be supervisor in one shift and operator in another? → John Lelis answered: Yes.

**Reporting & analysis questions (partially answered):**
1. How should data be calculated when 1 supervisor + 4 operators?
   - Aggregated as one instance for all? (as today, each combination unique)
   - Aggregated for 1 supervisor? (breakdown by supervisors, all shift data assigned to them) → John Lelis answered: yes, this one.
   - Aggregated and divided by all selected?
2. How should data be handled when team composition changes week to week?
3. How should data be handled when operator is supervisor one week, regular the next?
4. If teams (Team A, B) do team-based analysis, and compositions change — which team does an operator's data "belong" to?

**Meeting notes 25.11 (Meeri, Martin, Johanna) — 3-level framework:**

- Level 1: Team (Team A, Team B, etc.)
- Level 2: Supervisor (names)
- Level 3: Number of helpers / names of helpers (just number or operator names)

Action items from meeting:
- Do a drawing session with clients — draw up their today's shift
- Discuss with Mouni first
- Core question: "What is the problem we are solving here? Number of people at work?"

---

*Sources: Notion exports "Separate fields in Operator team / Manpower KPIs" + "Assigning operators to teams" + Potter & Moore partner ticket*
