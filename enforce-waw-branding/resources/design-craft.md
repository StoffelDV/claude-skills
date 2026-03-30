# Design Craft

**Single responsibility:** Is the visual craft intentional and aligned with WaW's calm confidence?

This sub-document ensures every UI decision is deliberate — not defaulting to generic patterns. Adapted from general frontend design principles to WaW's specific design language.

---

## Typography

**Poppins** is the only typeface. No exceptions. No "distinctive pairing" needed — consistency is the craft.

### Weight hierarchy

| Weight | Value | Usage |
|--------|-------|-------|
| Light | 300 | Large display text, hero numbers |
| Regular | 400 | Body text, descriptions |
| Medium | 500 | Labels, emphasis, metadata |
| SemiBold | 600 | Headings, card titles, button text |

**Never use Bold (700+)** — it breaks the calm tone. SemiBold is the maximum.

### Size scale

Follow the existing Tailwind scale: `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, etc. Do not invent custom font sizes. The scale provides enough range for any hierarchy.

---

## Motion

Motion serves **calm, never excitement**. Every animation should feel like breathing — natural, unhurried, inevitable.

### Rules

- **Easing:** `ease-in-out` always. Never `ease-out` alone (feels abrupt) or linear (feels mechanical).
- **Duration:** 150–300ms for transitions. 300–500ms for entrances. Never faster than 100ms (jarring) or slower than 600ms (sluggish).
- **Staggered reveals:** On page load, stagger child elements with 50ms delay between items. Subtle, not dramatic.
- **Entrance direction:** Content enters from top (`y: -8` to `y: 0`). Never from the sides. Never from below (feels heavy).
- **Exit:** Fade out only (`opacity: 1` to `opacity: 0`). No slide-out, no scale-down.

### Forbidden

- **No bouncing** — no `spring` with high stiffness, no `ease-out-back`.
- **No elastic easing** — no overshoot animations.
- **No attention-grabbing pulses** — no `animate-pulse` on buttons or badges.
- **No shake/wiggle** — not even for errors. Use color change instead.
- **No parallax** — nowhere in the app.

### Implementation

- Use **Framer Motion** (installed) for orchestrated sequences and page transitions.
- Use **CSS transitions** for simple hover/focus state changes.
- Always set `disableForReducedMotion: true` on confetti. Always respect `prefers-reduced-motion` for other animations.

---

## Spatial composition

### Whitespace

Generous whitespace is a feature, not wasted space. When in doubt, add more breathing room. The WaW user is a stressed event professional — visual breathing room reduces their cognitive load.

### Spacing rhythm

Use multiples of 4px (Tailwind spacing scale): `p-1` (4px), `p-2` (8px), `p-3` (12px), `p-4` (16px), `gap-4`, `space-y-4`, etc. Never use arbitrary values like `p-[7px]` or `gap-[13px]`.

### Grouping

Group related elements visually — proximity implies relationship. If two elements are related, they should be closer together than they are to unrelated elements. Use spacing, not borders, to create visual groups.

### Focal point

One focal point per viewport. If everything is important, nothing is. Each section of a page should have one clear primary element that draws the eye first.

---

## Anti-slop guardrails

These patterns are banned. They signal generic AI output, not intentional design:

- **No generic SaaS patterns** — hero + 3-column feature grid + CTA section. Every layout must be designed for its specific content.
- **No purple-on-white gradients** — the #1 tell of AI-generated design.
- **No decorative illustrations** that don't serve the WaW brand — no generic "person at desk" SVGs, no abstract blob backgrounds.
- **No icon soup** — if you need more than 3 icons in a row, rethink the layout. Icons should clarify, not decorate.
- **No "card grid" as default layout** — a 3-column grid of identical cards is lazy design. Consider what the content actually needs: maybe a list, maybe a table, maybe a single focused view.
- **No gratuitous dark mode** — WaW uses deep teal as its dark surface. Do not add a separate dark mode theme.
