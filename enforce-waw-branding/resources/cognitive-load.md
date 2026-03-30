# Cognitive Load

**Single responsibility:** Is this screen as calm as it can possibly be for the task the user is trying to accomplish?

---

## Voice

This audit speaks as someone who is physically allergic to visual overload and pathologically devoted to delivering a calming, soothing experience.

It does not politely suggest. It flags violations with conviction. Every unnecessary element is an assault on the user's peace of mind. The WaW user — a wedding photographer at midnight, a caterer juggling 3 events, a DJ checking availability between sets — came here to avoid stress. Every extra button, badge, data column, or competing color you put on screen is failing them.

You are not adding features. You are adding weight. And weight is the enemy.

---

## Core doctrine

1. **Every pixel must earn its place.** If it doesn't help the user complete their current task, it's noise. Remove it.
2. **The default answer to "should we show this?" is NO.** Only promote to visible when there's a clear, immediate need. The burden of proof is on showing, not hiding.
3. **Progressive disclosure is the law.** Show the minimum. Reveal on demand. The user should never see information they don't need yet. Tabs, expandable sections, hover reveals, drill-downs — use them aggressively.
4. **White space is not empty — it's the most powerful UI element you have.** It creates focus, reduces anxiety, and makes the remaining elements more impactful. Never fill space just because it's there.
5. **Calm is a feature.** The feeling of opening WaW should be: "okay, I've got this." Not: "where do I even start?"

---

## Primary audit lenses

### Action overload

**What it catches:** Too many buttons, links, CTAs competing for attention on the same viewport.

**Hard limit:** Max **1 primary action** + **2 secondary actions** visible per viewport. Everything else goes into:
- A `...` overflow menu
- A contextual action that reveals on hover/selection
- A secondary screen/panel

**Common violations:**
- Row of 4+ buttons at the top of a page
- Card footers with 5 icon buttons
- Forms with "Save", "Save & Close", "Save as Draft", "Preview", "Cancel" all visible at once
- Multiple competing CTAs ("Create Quote" + "Create Invoice" + "Send Email" side by side)

**Fix pattern:** Identify the ONE thing the user most likely wants to do. Make that the primary action. Demote everything else.

### Information overload

**What it catches:** Too much data shown at once without hierarchy or progressive disclosure.

**Hard limit:** Max **5–7 visible data points** per card or section. The rest must be behind progressive disclosure (expandable, tabs, drill-down, detail view).

**Common violations:**
- Cards showing 10+ fields (name, email, phone, address, company, status, created date, last contact, source, tags, notes)
- Tables with 8+ columns all visible by default
- Event detail pages showing every piece of information at once
- Dashboard widgets crammed with stats, charts, and lists

**Fix pattern:** Ask "what does the user need to see at a glance to decide their next action?" Show that. Hide everything else behind a click.

### Visual noise

**What it catches:** Competing colors, borders, badges, icons creating a cluttered, anxious feeling.

**Hard limit:**
- Max **2 accent colors** per viewport (primary teal + mint green is fine; adding yellow + red + blue badges is not)
- Max **3 badges/pills** visible at once per card or row
- **No decorative borders** that don't separate meaningful content groups

**Common violations:**
- Status badges in 5 different colors on the same list
- Multiple colored icons (red warning + yellow caution + green success + blue info) in one view
- Borders around every element creating a "grid of boxes" look
- Background color changes on alternating rows while also having borders and badges

**Fix pattern:** Reduce to two visual levels: primary (what matters now) and muted (everything else). Use opacity and weight, not color, to create hierarchy.

---

## Secondary audit lenses

### Decision fatigue

**Principle:** Never ask the user to choose between more than **3 options** without guidance. Offer a default or recommendation.

**Common violations:**
- Dropdown menus with 10+ unranked options
- Settings pages with 8 toggles and no explanation of what matters
- "Choose your template" with 6 equal-looking options

**Fix pattern:** Recommend one. If you can't recommend, group options into 2-3 categories. If you can't group, you have too many options — remove some.

### Context switching

**Principle:** Related information stays together. If the user has to remember something from section A while working in section B, the layout is wrong.

**Common violations:**
- Form fields at the top that depend on data shown at the bottom
- Price totals on a different tab from line items
- Contact info on a different panel from the communication thread

**Fix pattern:** Co-locate information that is used together. If two pieces of data are always read together, they must be visually adjacent.

---

## Output format — 3 tiers for every finding

When this audit finds a violation, it MUST propose all 3 tiers. The user picks which level of change to apply.

### Tier 1 — Ultra hardcore reduction

Strip to absolute essentials. Hide everything that isn't the single most important action or piece of information. Radical simplification — may change the component's structure entirely.

The question: **"What if this screen had only one thing on it?"**

Example: An event card currently shows name, date, venue, status badge, client name, phone, email, 3 action buttons, and a progress ring. Tier 1 reduces it to: event name + date + status dot. Everything else reveals on click.

### Tier 2 — Medium redesign

Restructure the visual hierarchy. Collapse secondary actions into menus. Move supporting data behind progressive disclosure. Reduce visual weight of non-essential elements. The structure changes but the scope stays the same.

Example: Same event card. Tier 2 keeps name, date, status badge, and client name visible. Moves venue and contact details into an expandable section. Replaces 3 buttons with a single "..." menu. Keeps the progress ring but makes it smaller and muted.

### Tier 3 — Quick win

Without changing structure: remove redundant labels, reduce badge count, soften borders, increase whitespace, dim secondary text, consolidate similar actions. Achievable in under 30 minutes.

Example: Same event card. Tier 3 keeps all data but: removes the "Client:" label (the name speaks for itself), softens the border from `border-border` to `border-black/[0.04]`, increases padding from `p-3` to `p-4`, dims the phone/email text to `text-muted-foreground`, and consolidates "Edit" + "View" buttons into one "Open" link.
