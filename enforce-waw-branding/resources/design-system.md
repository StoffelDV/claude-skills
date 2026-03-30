# Design System

**Single responsibility:** Are the correct design tokens being used? Is the visual system consistent?

---

## 1. Background hierarchy

The app uses a **three-layer background system**:

| Layer | Color | CSS | Usage |
|-------|-------|-----|-------|
| Chrome | Deep Teal `#034b56` | `bg-primary` | Header bar |
| Content | Deep Teal `#034b56` | `bg-content-bg` | Main scrollable area (`<main>`) |
| Surface | White `#ffffff` | `bg-card` / `bg-background` | Cards, dialogs, popovers, form containers |

**Rule**: ALL readable content must be either:
- **On teal** with white/light text (`text-white`, `text-white/70`, `text-accent`)
- **Inside a white surface** (Card, Dialog, Popover) with dark text (`text-foreground`, `text-card-foreground`)

**Never**: dark text on teal. **Never**: teal text on teal.

The CSS in `index.css` automatically handles this via scoped CSS custom properties:
- `.bg-content-bg` sets `--foreground` to white, `--muted-foreground` to 75% white
- `.bg-card`, `.bg-background`, `.bg-popover`, `[role="dialog"]` inside `.bg-content-bg` reset `--foreground` back to charcoal

## 2. Text colors on teal background

When content sits directly on `bg-content-bg` (deep teal):

| Element | Class | Example |
|---------|-------|---------|
| Headings | `text-white` | Page titles, section headers |
| Body text | `text-white/90` or `text-white` | Descriptions, metadata |
| Muted/secondary | `text-white/60` | Timestamps, help text |
| Links | `text-accent` (mint green) | Navigation links |
| Icons | `text-white/50` or `text-white/70` | Metadata icons |
| Borders | `border-white/15` | Dividers, containers on teal |

## 3. Text colors inside white surfaces (Cards, Dialogs)

| Element | Class |
|---------|-------|
| Headings | `text-foreground` (charcoal) |
| Body text | `text-foreground` |
| Muted/secondary | `text-muted-foreground` |
| Links | `text-primary` (deep teal) |
| Borders | `border-border` or `border-black/[0.04]` |

## 4. Buttons

| Variant | Background | Text | Usage |
|---------|-----------|------|-------|
| `default` | Mint green `bg-accent` | `text-white` | Primary CTA |
| `secondary` | Deep teal `bg-primary` | `text-primary-foreground` (white) | Secondary actions |
| `outline` | Transparent `bg-background` | `text-foreground` | Tertiary actions |
| `ghost` | Transparent | `text-foreground` | Inline/subtle actions |
| `destructive` | Red `bg-destructive` | `text-white` | Delete/dangerous actions |
| `link` | None | `text-primary` | Text links |

**Shape**: `rounded-lg` (12px). **Never** `rounded-full` on buttons (except circular icon buttons like avatars).
**Hover**: `hover:bg-{color}/90`. No `hover:scale-105`, no `hover:-translate-y`, no `hover:shadow-md`.
**Active**: `active:scale-[0.97]` (subtle press feedback).
**Shadow**: `shadow-sm` on default/secondary/destructive only. Never `shadow-lg` or `shadow-xl`.
**Font**: `font-semibold` (not `font-bold`).

## 5. Cards

- Border radius: `rounded-2xl` (16px)
- Border: `border-black/[0.04]` (very subtle)
- Shadow: `shadow-[0_2px_8px_rgba(0,0,0,0.06)]` (matches mobile)
- Background: `bg-card` (white)
- **No** `hover:shadow-md` or `hover:shadow-lg`
- **No** `backdrop-blur-sm` (except BottomDock and video call overlays)
- Transition: `transition-colors duration-200`

## 6. Hover states (interactive feedback)

All interactive hover effects use **mint green (accent)** for a lighthearted, consistent feel. **Never** use `hover:scale-*`, `hover:-translate-y-*`, `hover:shadow-xl`, or `hover:shadow-lg` on any interactive element (buttons or cards).

### White cards on teal (e.g. contact cards, dashboard widgets, note cards)

Use `card.interactive` from `style-tokens.ts`. The hover uses the solid `bg-card-hover` color (CSS var `--card-hover`) — NOT `bg-accent/5` which is transparent and lets teal bleed through.

```
hover:bg-card-hover hover:border-accent/30 transition-colors duration-200
```

**Group hover rule**: When a card has overlaid controls (edit buttons, action menus) that sit outside the card's link area, use `card.interactiveGroup` instead of `card.interactive`. This uses `group-hover/card:` so the mint background stays when the mouse moves to the overlaid control. Requires a parent wrapper with `className="group/card"`.

**Button visibility inside cards**: Distinguish between **overlay buttons** and **content buttons**:

| Type | Example | At rest | On card hover |
|------|---------|---------|---------------|
| Overlay | Edit button (absolute-positioned) | `opacity-0` (hidden) | `group-hover/card:opacity-80 hover:!opacity-100` |
| Content | Footer actions (mail, call, text, whatsapp) | `opacity-60` (visible but subtle) | `group-hover/card:opacity-100` |

Content buttons are part of the card's visible layout — they must **always** be visible. Use `opacity-60` at rest so they're understated, then full opacity on card hover. Overlay buttons float above the card and can be hidden at rest.

All action buttons inside cards use `variant="outline"` with `bg-card` and `shadow.sm` for a clean, raised look.

### Items/rows on teal background (e.g. Gmail thread rows, calendar cells)

```
hover:bg-white/[0.08] transition-colors duration-200
```

White channel for dark backgrounds — do **not** use `hover:bg-accent` on teal.

### Rows inside white surfaces (table rows, list items, checklist items)

```
hover:bg-accent/5 transition-colors
```

Replace `hover:bg-muted/50` and `hover:bg-muted` with `hover:bg-accent/5` everywhere inside white surfaces.

### Selection cards (radio-style choices inside dialogs)

```
hover:border-accent/40 hover:bg-accent/5 transition-colors
```

Used for mode selectors, product selectors, payment method cards, invoice flow cards.

### Dashed action/upload cards (add-note, CSV import, logo upload)

```
hover:border-accent/50 hover:bg-accent/5 transition-colors
```

### Popover/dropdown items (inside white surfaces)

```
hover:bg-accent/5 transition-colors
```

Replace `hover:bg-accent/50`, `hover:bg-accent/30`, `hover:bg-accent/10` with `hover:bg-accent/5`.

### Banned hover patterns

| Banned | Replacement |
|--------|------------|
| `hover:bg-muted/50` | `hover:bg-accent/5` |
| `hover:bg-muted/30` | `hover:bg-accent/5` |
| `hover:bg-muted` | `hover:bg-accent/5` |
| `hover:bg-accent/50` | `hover:bg-accent/5` |
| `hover:bg-accent/30` | `hover:bg-accent/5` |
| `hover:bg-accent` (full) | `hover:bg-accent/5` (inside white) |
| `hover:scale-105` | Remove entirely |
| `hover:-translate-y-*` | Remove entirely |
| `hover:shadow-xl` | Remove entirely |
| `hover:shadow-lg` | Remove entirely |
| `hover:border-primary/50` | `hover:border-accent/40` (on selection cards) |
| `hover:border-teal-500/50` | `hover:border-accent/40` |
| `hover:border-blue-200` | `hover:border-accent/30` |
| `hover:text-primary` (on teal) | `link.onTeal` token (uses `hover:text-accent`) |

## 7. Badges / Chips / Tags

- Shape: `rounded-md` (6px). **Never** `rounded-full` on badges.
- Default: `bg-[rgba(3,75,86,0.07)] text-primary` (subtle teal overlay)
- Success: `bg-[rgba(62,207,136,0.1)] text-primary`
- Warning: `bg-[rgba(251,174,23,0.1)] text-primary`
- Destructive: `bg-destructive/10 text-destructive`
- Outline: `border border-border text-foreground`
- Font: `font-medium text-xs`

**Exception**: `rounded-full` is allowed ONLY for:
- Avatar circles
- Online/offline status dots
- Notification count dots

## 8. Inputs / Textareas / Selects

- Border radius: `rounded-lg`
- Border: `border-border/60` (soft)
- Background: `bg-background` (white)
- Focus: `focus-visible:ring-2 focus-visible:ring-primary/30`
- **No** `shadow-inner`
- Placeholder: `text-muted-foreground`

## 9. Shadows

Only these shadow values are allowed:

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | Tailwind default | Buttons |
| `shadow-[0_2px_8px_rgba(0,0,0,0.06)]` | Mobile `shadows.md` | Cards |
| `shadow-[0_4px_12px_rgba(0,0,0,0.08)]` | Mobile `shadows.lg` | Popovers, dropdowns |

**Never**: `shadow-md`, `shadow-lg`, `shadow-xl`, `shadow-2xl`, `shadow-inner` on standard UI.
**Never**: `hover:shadow-md` or `hover:shadow-lg` on cards.

## 10. Colors — use semantic tokens, not hardcoded hex

| Instead of | Use |
|-----------|-----|
| `bg-[#034b56]` | `bg-primary` |
| `bg-[#3ecf88]` | `bg-accent` |
| `text-[#034b56]` | `text-primary` |
| `text-[#3ecf88]` | `text-accent` |
| `border-[#034b56]` | `border-primary` |
| `border-[#3ecf88]` | `border-accent` |
| `bg-blue-600` | `bg-primary` or `bg-accent` |
| `bg-green-600` | `bg-accent` |
| `bg-orange-600` | `bg-vibrant-yellow` |

## 11. Backdrop blur

- **Allowed only on**: BottomDock (`dock-two.tsx`), video call overlays (`CallControlBar.tsx`, `CallTopBar.tsx`)
- **Remove from**: all other components (cards, badges, buttons, form containers, modals)

## 12. Gradients

- **No gradients on buttons** (solid colors only)
- Gradients allowed on: BottomDock border, Milo card header, landing page decorations
- `bg-gradient-to-r from-primary to-primary/80` is **banned** on buttons

## 13. Items on teal that need special treatment

When building list items / cards that sit ON the teal content background (not inside a white card):

```
rounded-xl bg-white/10 border border-white/15 hover:bg-white/[0.18] transition-colors p-3
```

- Text: `text-white` for primary, `text-white/60` for secondary
- Icons: `text-white/50`
- Badges inside: `rounded-md bg-white/10 text-white/70` or `bg-white/25 text-white`

## 14. Page-level layouts

- **NEVER** set `bg-background` or `bg-white` on page-level containers — the teal from `bg-content-bg` on `<main>` must show through
- Content sections that need white backgrounds: use `bg-card rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-black/[0.04]`
- Split-pane layouts: panes sitting on teal should be transparent; content panes (e.g. email detail) use `bg-card rounded-2xl`
- Separators between panels on teal: `border-white/10` (not `border-border`)
- **Page header icons** (icon badges next to page titles): `bg-white/10` with `text-white/70` icon — **NEVER** `bg-primary/10 text-primary` (invisible on teal)
- Page title text: `text-white` (not `text-foreground` unless CSS scoping is guaranteed)

## 15. Filter rows, toolbars, and page top bars

- Filter rows, tab bars, and page-level toolbars (title + tabs + nav buttons) **always** sit on teal, **NEVER** inside a white card (`bg-card`)
- **NEVER** wrap a toolbar or filter row in `bg-card rounded-2xl shadow-* border border-black/[0.04]` — that makes it a white card
- Sticky top bars should use `bg-content-bg` for opacity (so content doesn't bleed through on scroll), **not** `bg-card`
- Text in toolbars on teal: `text-white` for headings, `text-white/60` for secondary
- Buttons in toolbars on teal: ghost buttons use `hover:bg-white/[0.08]`, outline buttons use `border-white/20 text-white hover:bg-white/[0.08]`
- TabsList on teal: `bg-white/10` (not `bg-accent/5` — that's for inside white surfaces)
- TabsTrigger on teal: `text-white/60` default, active state uses shadcn default active styling
- Active filter pill: `bg-accent text-white shadow-sm`
- Inactive filter pill: `bg-white/10 text-white/60 hover:bg-white/15 hover:text-white/80`
- Shape: `rounded-md` or `rounded-lg`
- Separators in filter rows: `bg-white/15`
- Bottom border on sticky bars: `border-b border-white/10` (not `border-black/[0.04]`)

## 16. Search inputs on teal

When a search input sits on teal (not inside a card):

```
bg-white/10 border-white/10 rounded-xl text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-accent/30
```

Search icon: `text-white/40`

## 17. Interactive links (clickable text)

Links and clickable text elements (table cells, breadcrumbs, navigation text) must remain **readable in every state** — default, hover, focus, and active.

**The golden rule**: `hover:text-primary` is **banned** on teal backgrounds. Deep teal text on a deep teal background = invisible.

### Links on teal (`link.onTeal` token)

```tsx
import { link } from "@/lib/style-tokens";

<button className={`${link.onTeal} text-xs`}>Invoice #123</button>
```

Resolves to: `text-foreground hover:text-accent underline-offset-2 hover:underline transition-colors`
- Default: white (via `--foreground` on teal)
- Hover: mint green (`text-accent`) + underline

### Links inside white surfaces (`link.onSurface` token)

```tsx
<a href="/contact/123" className={link.onSurface}>John Doe</a>
```

Resolves to: `text-foreground hover:text-accent underline-offset-2 hover:underline transition-colors`
- Default: charcoal (via `--foreground` on white)
- Hover: mint green (`text-accent`) + underline

### Banned link patterns

| Banned | Why | Replacement |
|--------|-----|-------------|
| `hover:text-primary` on teal | Invisible (teal on teal) | `link.onTeal` token |
| `hover:text-primary` in tables on teal | Same — tables inherit teal bg | `link.onTeal` token |
| Hardcoded `text-foreground hover:text-primary hover:underline transition-colors` | Not centralized | `link.onTeal` or `link.onSurface` token |

## 18. Rounded corners

- **NEVER** use sharp rectangular corners on interactive elements
- Cards: `rounded-2xl`
- Buttons: `rounded-lg`
- Inputs: `rounded-lg` or `rounded-xl`
- Badges: `rounded-md`
- List items: `rounded-xl`
- Containers/panels: `rounded-2xl`

---

## Centralized style tokens — NEVER hardcode

**RULE**: NEVER hardcode hover states, shadows, or interactive color classes directly in component files. Always import from `src/lib/style-tokens.ts`.

**CRITICAL**: When making a card clickable or interactive, use `card.interactive` (or `card.interactiveGroup` / `card.onTealInteractive`) — NEVER add `card.base` + a hand-rolled hover class like `hover:bg-gray-50/50`. The `card.interactive` token already bundles the correct base styles AND the branded hover state. This is the #1 most common mistake.

```tsx
import { hover, card, shadow, onTeal, link } from "@/lib/style-tokens";

// Interactive card — use the token
<div className={cn(card.interactive, "p-3 cursor-pointer")}>…</div>

// WRONG — hardcoded hover on a base card
<div className={cn(card.base, "hover:bg-gray-50/50 cursor-pointer")}>…</div>

// Table row hover:
<tr className={cn(hover.row)}>…</tr>

// Clickable text in a table on teal:
<button className={`${link.onTeal} text-xs`}>INV-001</button>

// Selection card in dialog:
<div className={cn("border rounded-xl p-4", hover.selection)}>…</div>
```

Available token groups:
- `hover.card` — white card on teal
- `hover.row` — row inside white surface
- `hover.onTeal` — item on teal background
- `hover.selection` — radio/selection card
- `hover.dashed` — upload/action zone
- `hover.popoverItem` — dropdown item
- `card.base` / `card.interactive` — standard card (use `interactive` when clickable)
- `card.interactiveGroup` — interactive card with overlaid controls (needs parent `group/card`)
- `card.onTeal` / `card.onTealInteractive` — translucent on teal
- `shadow.sm` / `shadow.card` / `shadow.popover` — allowed shadows
- `onTeal.*` — text/border colors on teal
- `onSurface.*` — text/border colors inside white
- `link.onTeal` / `link.onSurface` — clickable text (all states)
- `searchOnTeal.*` — search input on teal
- `filterPill.*` — filter pill states on teal

---

## Audit checklist

When reviewing a page, check every element for:

- [ ] No dark text on teal background (must be white/light)
- [ ] No `rounded-full` on badges/chips (use `rounded-md`)
- [ ] No `hover:shadow-md/lg` on cards
- [ ] No `shadow-inner` on inputs
- [ ] No `backdrop-blur` (except BottomDock + video)
- [ ] No hardcoded hex colors (use semantic tokens)
- [ ] No gradient buttons
- [ ] No `hover:scale-105` or `hover:-translate-y` on any element (cards or buttons)
- [ ] No `hover:shadow-xl` or `hover:shadow-lg` on any element
- [ ] No `hover:bg-muted/50` or `hover:bg-muted` (use `hover:bg-accent/5` instead)
- [ ] No `hover:bg-accent/30` or `hover:bg-accent/50` (use `hover:bg-accent/5` instead)
- [ ] Hover states use mint green (`accent`) consistently, not `muted` or `primary`
- [ ] Cards use `bg-card` with proper border/shadow
- [ ] Buttons use proper variant (default=mint, secondary=teal, outline, ghost)
- [ ] All text is readable against its background
- [ ] Tab navigation on teal uses white text + accent active indicator
- [ ] No `bg-background` or `bg-white` on page-level containers (teal must show through)
- [ ] No `bg-primary/10 text-primary` on page header icons (invisible on teal — use `bg-white/10 text-white/70`)
- [ ] Filter rows, tab bars, and toolbars sit on teal — NEVER wrapped in `bg-card`
- [ ] Search inputs on teal use `bg-white/10` styling
- [ ] All containers have rounded corners (no sharp rectangles)
- [ ] Split-pane borders use `border-white/10` on teal
- [ ] No `hover:text-primary` on links sitting on teal (use `link.onTeal` token)
- [ ] All clickable text uses centralized `link.onTeal` or `link.onSurface` tokens
- [ ] Links are readable in ALL states (default, hover, focus) against their background
- [ ] Content buttons inside cards are visible at rest (`opacity-60`), not hidden (`opacity-0`)
- [ ] Only overlay buttons (absolute-positioned, like edit) use `opacity-0` at rest
- [ ] Interactive/clickable cards use `card.interactive` (not `card.base` + hardcoded hover)
- [ ] No hand-rolled hover classes like `hover:bg-gray-50/50` — always use style tokens

---

## Brand colors quick reference

| Name | Hex | CSS variable | Tailwind |
|------|-----|-------------|----------|
| Deep Teal | `#034b56` | `--primary` | `bg-primary` |
| Mint Green | `#3ecf88` | `--accent` | `bg-accent` |
| Soft Aqua | `#a5f0c5` | `--secondary` | `bg-secondary` |
| Vibrant Yellow | `#fbae17` | `--vibrant-yellow` | `bg-vibrant-yellow` |
| Charcoal | `#4d4d4d` | `--foreground` | `text-foreground` |
| White | `#ffffff` | `--card` / `--background` | `bg-card` |
| Error Red | `#ef4444` | `--destructive` | `bg-destructive` |
