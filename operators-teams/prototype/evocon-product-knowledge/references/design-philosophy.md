# Design Philosophy

> This file is always loaded as project knowledge. It provides the design values, process, and principles that guide all product decisions.

## Vision, Mission & Design Philosophy

**Vision (Why):** We built Evocon to inspire teams to unlock their true potential, through transparency and understanding. We imagine a world where people have a strong sense of purpose in what they do.

**Mission (What):** Transform production data into business outcomes that increase productivity and eliminate waste. People, visualization, and ease of use are at the center of every product and feature.

**Design Philosophy (How):** Rooted in ease of use and visualization. Know users deeply to create a product that meets their needs, while incorporating fun to engage users in their improvement journey.

## Core Design Values (Priority Order)

### 1. Ease of Use (Simplicity)

The highest-priority value. Achieved through four pillars:

**Intuition**
- Limit options when possible; use known UI patterns.
- Declutter the interface so users perform tasks efficiently and without frustration.
- Example: Shift View presents dense information in a single screen yet remains scannable — operators get a full shift overview at a glance.

**Optimal Clicks**
- Minimize unnecessary interactions (e.g., duplication features, hotkeys for common actions).
- Example: A running shift can be finished with 3 clicks. Most-used stop reasons appear at the top for fast selection.

**Error Prevention**
- Design interactions that prevent mistakes; when errors occur, provide inline guidance so they aren't repeated.
- Example: Shift time editing shows duration and prevents overlap with adjacent shifts; invalid entries show immediate error indicators.

**Consistency**
- Use as few words as possible but as many as necessary. Reuse phrases rather than creating variations.
- 25+ languages demand clear, concise, translation-aware writing.
- Use a standard set of reusable components throughout the UI — users learn the component once and know what to expect everywhere.
- Example: "Save", "Delete", "Cancel" buttons are identical across all modules.

### 2. Visualization

- **Color as information:** The traffic-light color system (green/yellow/red/grey) is the primary informative dimension. Same colors mean the same things everywhere in the app.
- **Aesthetics without complexity:** Simple, pleasing UI using modern frameworks. Visualize interactions so users know what to expect (e.g., OEE doughnut, widget type previews).
- **Animations for critical areas only:** Loading states, chart transitions. Never add animation that adds clicks or compromises intuitiveness.
- **Key tension: beauty never at the expense of usability.** If a visual enhancement adds clicks, compromises intuitiveness, or increases complexity, it is rejected.
- **Visual explanations:** Complex concepts (like loss types and OEE calculation) are explained with diagrams and visual breakdowns.
- **Distance-readable feedback:** Colors and layout are designed to be interpreted from across a shop floor on large screens.

### 3. Knowing Users Deeply

Understanding the needs, wants, and behaviors of users to address their needs effectively and minimize design rework.

**Research Methods (ordered by directness):**

| Method | Description |
|--------|------------|
| **Factory visits** | Most direct, valuable, and impactful. Tag along with installation teams or arrange live feedback on the shop floor. |
| **User testing** | Test fat-marker sketches on teammates first. Then test higher-fidelity mockups with real users (found via support or outreach). Test UX writing for comprehension. Have a teammate run tests to avoid designer defensiveness. |
| **Interviews & feedback calls** | Best way to understand user POV. Check with colleagues first (FreeScout, Notion). Record calls when possible. Ask: What's the actual problem? Can you show me? What's your workaround? |
| **Stakeholder interviews** | Internal subject-matter experts who understand deep product context. |
| **Listening in to other calls** | Sales calls, training calls — passive discovery of user needs and confusion points. |
| **Support (FreeScout)** | Source of most helpful customers. Monitor issue frequency. Search for threads related to specific problems. |
| **Surveys (TypeForm / AppCues)** | TypeForm for email surveys. AppCues for short in-app surveys (1–3 questions, not for Shift View users). |
| **App analytics (PostHog)** | Usage patterns, feature adoption, behavioral data. |
| **Sales data (Pipedrive)** | Purchasing behavior, deal patterns. |
| **App usage data** | Compare tenant behavior — empty shifts, popular stop reasons, OEE distributions, anomalies. |
| **Capterra reviews** | Public perception and competitive positioning. |

### 4. Fun

Work shouldn't be boring. Fun creates engagement with production data.

- **Mr. Evocon:** An emoticon character whose mood reflects OEE. Standard and seasonal/holiday variants (Halloween, Christmas). Users can toggle "Standard" vs. "Standard + Fun" in View Settings.
- **UX writing:** Neutral tone — not corporate, not casual. Warm but professional.
- **Empty states:** Designed with surprising fun visuals rather than blank screens. Each empty state has a unique illustration with character.
- **Nudging with visuals:** Fun visuals facilitate positive engagement (e.g., batch target completion icon, progress bars).

### 5. Performance (Acknowledged but design-peripheral)

The app must be fast and always available. "Real-time" claims require real-time loading. Design contributes through efficient data loading patterns and minimal unnecessary rendering, though this is primarily an engineering concern.

## Design Process

The design process follows five phases but is **non-linear** — teams move back and forth between phases as needed:

1. **Research** — Understand the problem through user research methods above. Gather data, interview users, analyze support tickets.
2. **Ideation** — Generate solutions through sketching and brainstorming. Fat-marker sketches first, iterated multiple times.
3. **Validation** — Test ideas with teammates and users. Verify that the solution actually solves the problem.
4. **Design** — Create detailed designs in Figma. Follow design philosophy and component standards.
5. **Handover** — Deliver specifications to developers. Collaborate during implementation.

**MVP mindset:** Ship the smallest viable version, learn from real usage, iterate. Not everything needs to be perfect on day one — but the core interaction must be right.

## Prioritization Matrix

New features are evaluated across six dimensions, each with specific criteria:

| Dimension | Key Questions |
|-----------|--------------|
| **Development** | Is it an addition to existing functionality? Small system impact? No architecture changes needed? |
| **Business** | Helps cover max machines per client? Opens extra MRR? Helps sell to enterprise? |
| **Support** | Decreases recurring support time? Easier data configuration (our perspective)? Helps clients manage data (their perspective)? |
| **Client** | Offers new insights to more users/departments? Recurring request (>5 times)? What % of clients get access? |
| **Product** | In line with product direction? Keeps product lightweight? Improves market position? |
| **Design** | Increases user engagement (daily/weekly time spent)? Makes product easier to use? Visualizes data in new ways? |

## UX Writing Guidelines

- **Minimal words:** As few as possible, as many as necessary.
- **Reuse phrases:** Don't create variations — use the same label for the same action everywhere.
- **Translation-aware:** 25+ languages require concise, unambiguous phrasing. Avoid idioms, cultural references, or wordplay.
- **Neutral tone:** Professional but warm. Not corporate-stiff, not casual-chatty.
- **Action-oriented labels:** Buttons say what they do ("Save", "Delete shift", "Add reason").
- **Error messages as guidance:** Tell users what went wrong and how to fix it.

## 2026 Focus Areas

### 1. Shaping & Delivering the Product Roadmap
- Shape critical planned features.
- Research and discover AI use cases by speaking directly to users.
- Improve collaboration between designers and developers during missions.
- Deliver highest-quality features (excellent UX, UI, tested, functional).

### 2. High-Ownership Team with Reliable, User-Centered Results
- Build product knowledge across the team so no single person is a bottleneck.
- Systematically explore and adopt AI tools in the design process.
- Each team member should know how to approach problem-solving guided by shaping processes and the design philosophy, within time and resource constraints.
- Holistic decisions that account for all system areas impacted by new features (import/export, logs, reports, etc.).

### 3. Support the Revenue Team with Product Knowledge
- Identify highest-impact initiatives where design can assist sales.
- Revenue teams develop confident, accurate product knowledge faster.
- Clients feel understood throughout their journey.
- Potentially increase average deal size and MRR per license.

### De-Prioritized in 2026
- No design system enhancements.
- No small tasks that don't serve a broader customer base.
- Fewer tasks shaped into backlog.
- Less focus on internal "push" initiatives.
