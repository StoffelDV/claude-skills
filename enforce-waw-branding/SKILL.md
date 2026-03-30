---
name: enforce-waw-branding
description: Use when creating, modifying, or reviewing any screen, component, or page in the WaW web app. Orchestrates 5 sub-audits covering visual design, brand assets, design craft, cognitive load, and celebration moments. This is the single source of truth for all UI/UX compliance. Proactive — fires on every UI change.
---

# Enforce WaW Branding

## Overview

This skill is the **single UI/UX compliance orchestrator** for the Without a Worry (WaW) web app. It ensures every screen and component meets WaW's design standards across five concerns: visual consistency, branded components, design craft, cognitive load, and celebration moments.

This is company policy. There are no exceptions.

## When to use

- Creating any new screen, component, or page
- Modifying any existing UI code
- Reviewing a screenshot or design for compliance
- Any time text readability, layout density, or interaction design is in question
- Proactively on every UI change (enforced via CLAUDE.md)

**Companion skill:** Always invoke `wedding-pro-mindset` alongside this skill. It handles WHAT to build (product decisions, JTBD, personas). This skill handles HOW it looks and feels.

## When NOT to use

- Public/landing pages that use `force-light` class (they have their own rules)
- Email templates (use `src/lib/email-template.ts`)
- Third-party embedded widgets (Syncfusion, Excalidraw) with separate theme overrides
- Pure backend tasks with no UI impact

---

## Process

When this skill fires:

1. **Read the target** — understand the component/screen being created or modified.
2. **Run all 5 sub-audits** by reading the relevant resource documents:

| Sub-audit | Resource | Question it answers |
|---|---|---|
| Design system | `resources/design-system.md` | Are the correct design tokens being used? Is the visual system consistent? |
| Brand assets | `resources/brand-assets.md` | Are we using branded components instead of generic primitives? |
| Design craft | `resources/design-craft.md` | Is the visual craft intentional and aligned with WaW's calm confidence? |
| Cognitive load | `resources/cognitive-load.md` | Is this screen as calm as it can possibly be? |
| Positive psychology | `resources/positive-psychology.md` | Are completion moments celebrated at the right tier? |

3. **Combine findings** into a unified report.
4. **Output:** Issues found + 3-tier improvement options (from cognitive-load audit).

### Sub-audit relevance

Not every sub-audit applies to every change. Use judgment:

| Change type | Always run | Run if relevant |
|---|---|---|
| New screen/page | All 5 | — |
| New component | Design system, brand assets, design craft, cognitive load | Positive psychology (if completion moment) |
| Styling fix | Design system | Design craft |
| Feature addition | Cognitive load, brand assets | Positive psychology |
| Success/completion state | Positive psychology | Design craft |

---

## File reference

| Resource | Purpose |
|---|---|
| `resources/design-system.md` | Colors, tokens, hierarchy, cards, shadows, hover states, audit checklist |
| `resources/brand-assets.md` | Component replacement catalog (AnimatedCheckbox, SegmentedDateInput, AddressAutocomplete) |
| `resources/design-craft.md` | Typography (Poppins), motion, spatial composition, anti-slop guardrails |
| `resources/cognitive-load.md` | Action/information/visual noise limits, 3-tier audit output |
| `resources/positive-psychology.md` | Celebration tiers, confetti presets, copy bank (EN+NL), integration catalog |

## Code reference

| File | Purpose |
|---|---|
| `src/lib/style-tokens.ts` | Centralized style tokens — single source of truth |
| `src/index.css` | CSS variables, teal-content text color scoping |
| `tailwind.config.ts` | Tailwind color/radius tokens |
| `src/components/shared/AnimatedCheckbox.tsx` | Branded checkbox component |
| `src/components/shared/SegmentedDateInput.tsx` | Branded date input component |
| `src/components/shared/AddressAutocomplete.tsx` | Branded address autocomplete component |
| `src/hooks/useAddressAutocomplete.ts` | Address autocomplete hook (Google Places) |
