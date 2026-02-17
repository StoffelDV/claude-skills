---
name: Positive Psychology
description: Use as a design lens when building features that involve completion moments, milestones, progress visualization, success states, or onboarding accomplishments in WaW. Applies variable-reward celebration tiers, encouraging copy (EN + NL), and branded confetti/animation presets.
---

# Positive Psychology

## Overview

This skill is a **design lens** that applies positive psychology principles to every WaW feature involving user accomplishment. Admin work should feel rewarding. Every completed checklist step, received payment, and confirmed booking is an opportunity to make the user feel good about the effort they put in.

The goal: calm, confident delight — never hype.

## When to use

- Building or modifying checklist step completion logic
- Creating success/confirmation states after actions (invoice sent, quote accepted, payment received)
- Implementing progress visualizations (rings, bars, step indicators)
- Adding onboarding completion moments
- Any feature where the user finishes a multi-step process
- Designing empty states that could acknowledge past progress
- Writing success toast or confirmation copy

## When NOT to use

- Pure data display with no completion/achievement context
- Error states (those follow CLAUDE.md section 9)
- Backend-only tasks with no user-facing moment
- Delete/destructive action confirmations

## Core principles

### 1. Variable reward
Never use the same celebration twice in a row. Map significance to intensity using the tier system below. A single checklist toggle should not feel the same as receiving full payment.

### 2. Progress visualization
Always make progress visible. Use the existing `EventProgressRing` pattern (SVG gradient arc from teal to mint). Never show raw numbers without visual context.

### 3. Micro-celebrations
Small delightful moments that don't interrupt flow. Subtle icon animation, encouraging toast, gentle color change. The user should feel acknowledged without being slowed down.

### 4. Milestone recognition
Bigger celebrations for significant achievements. Branded confetti burst, warm personalized message, a brief moment of delight before returning to flow.

### 5. Encouraging language
Copy must use the Caretaker tone (CLAUDE.md section 2). Never hype. Always calm confidence. Acknowledge the user's effort without overreacting.

### 6. Accessibility
Always use `disableForReducedMotion: true` on confetti calls. Provide text alternatives for every visual celebration. Never rely on animation alone to convey state.

---

## Celebration tier system

| Tier | Name | When | Confetti | Toast | Animation |
|------|------|------|----------|-------|-----------|
| 1 | Micro | Single checklist step, task completed, minor edit saved | None | Sonner success, 2s auto-dismiss | Icon scale-in (Framer `animate={{ scale: [0, 1.1, 1] }}`) |
| 2 | Standard | Deposit received, quote sent, invoice sent, timeline created, files uploaded | Brand confetti (15 particles, mint/aqua) | Sonner success, 3s, with description | CheckCircle2 icon + fade-in message |
| 3 | Milestone | Full checklist complete, new booking confirmed, invoice paid, onboarding finished | Full confetti burst (100 particles, all brand colors) | Sonner success, 5s, with description | Framer motion entrance + success icon |

### Confetti presets

**Tier 2 — Standard** (based on existing PackingListCard pattern):
```typescript
confetti({
  particleCount: 15,
  spread: 30,
  origin: { x, y }, // relative to trigger element
  colors: ["#3ecf88", "#a5f0c5"],
  gravity: 2,
  scalar: 0.6,
  ticks: 50,
  startVelocity: 15,
  disableForReducedMotion: true,
});
```

**Tier 3 — Milestone** (based on existing AIOfferConfirmationDialog pattern):
```typescript
confetti({
  particleCount: 100,
  spread: 70,
  origin: { y: 0.3 },
  colors: ["#034b56", "#3ecf88", "#a5f0c5", "#fbae17"],
  disableForReducedMotion: true,
});
```

---

## Copy guidelines

Rules:
- No exclamation marks in toast text
- No emojis in toast text
- Sentence case always
- Speak directly to the user ("you")
- Focus on what is now resolved, not on the action itself
- Short, plain sentences
- Always provide both EN and NL

### Sample copy by moment

| Moment | EN | NL |
|--------|----|----|
| Contact linked | "Contact linked." | "Contact gekoppeld." |
| Event confirmed | "This one's official." | "Deze is officieel." |
| Deposit received | "Deposit received. One less thing to think about." | "Voorschot ontvangen. Weer een zorg minder." |
| Timeline ready | "Timeline's set. The day will run smoothly." | "Tijdlijn staat. De dag zal vlot verlopen." |
| Quote sent | "Quote sent. Your client will receive it shortly." | "Offerte verstuurd. Je klant ontvangt het binnenkort." |
| Invoice sent | "Invoice sent. You'll be notified when it's paid." | "Factuur verstuurd. Je krijgt bericht zodra die betaald is." |
| Invoice paid | "Payment received. You're all set." | "Betaling ontvangen. Alles is geregeld." |
| All steps complete | "Everything's in place. You're ready." | "Alles staat klaar. Je bent er helemaal klaar voor." |
| New booking | "New booking confirmed. Let's get started." | "Nieuwe boeking bevestigd. Laten we beginnen." |
| Onboarding complete | "You're all set up. Time to focus on what you love." | "Je bent helemaal klaar. Tijd om te focussen op wat je graag doet." |
| Task completed | "Done." | "Gedaan." |
| Files uploaded | "Files uploaded. Everything's in one place." | "Bestanden ge-upload. Alles op een plek." |

---

## Integration points catalog

| Integration point | File | Tier | Trigger |
|-------------------|------|------|---------|
| Checklist step toggle | `src/components/shared/ChecklistPopover.tsx` | 1 (micro), or 3 if last step | `onToggleStep` when step becomes completed |
| Auto-check step completion | Consumer of `src/lib/checklist/auto-checks.ts` | 1, or 3 if last step | When step transitions from false to true |
| Event confirmation dialog | `src/components/events/AIOfferConfirmationDialog.tsx` | 3 (milestone) | Already implemented |
| Packing list item complete | `src/components/events/PackingListCard.tsx` | 2 (standard) | Already implemented |
| Onboarding final step | `src/hooks/useFeatureGuideAutoProgress.ts` | 3 (milestone) | Already implemented |
| Invoice sent | Invoice wizard completion step | 2 (standard) | After successful send |
| Invoice paid | Payment confirmation callback | 3 (milestone) | After payment confirmation |
| Quote sent | Quote wizard completion step | 2 (standard) | After successful send |
| Quote accepted | Quote status update | 3 (milestone) | When status changes to accepted |
| Task completion | `src/pages/Todos.tsx` | 1 (micro) | When task is marked done |
| Next step banner all-done | `src/components/events/EventNextStepBanner.tsx` | 3 (milestone) | When `isComplete` becomes true |
| Progress ring 100% | `src/components/shared/EventProgressRing.tsx` | Visual only | When `fraction === 1` |

---

## Process (checklist for developers)

When implementing a feature that involves a completion or success moment:

1. **Identify the moment:** What did the user just accomplish?
2. **Classify the tier:** Is this micro (1), standard (2), or milestone (3)?
3. **Check existing implementation:** Is there already a celebration here? Align it with the tier system.
4. **Apply the confetti preset** for that tier (no confetti for tier 1).
5. **Write copy** in EN and NL following the Caretaker guidelines. Add keys to both locale files under `celebrations.*`.
6. **Add `disableForReducedMotion: true`** to any confetti call.
7. **Use Framer Motion** for entrance animations (follow `EventNextStepBanner` pattern: `initial={{ opacity: 0, y: -8 }}`, `animate={{ opacity: 1, y: 0 }}`).
8. **Set toast duration** by tier: 2s (micro), 3s (standard), 5s (milestone).
9. **Test with `prefers-reduced-motion: reduce`** to confirm graceful degradation.

---

## Output format

When this skill is applied to a feature request, include a "Celebration design" section:

```markdown
### Celebration design
- **Tier**: [1/2/3] — [Micro/Standard/Milestone]
- **Trigger**: [What user action triggers the celebration]
- **Confetti**: [None / Standard preset / Milestone preset]
- **Toast copy (EN)**: "..."
- **Toast copy (NL)**: "..."
- **Animation**: [Description of Framer Motion animation]
- **Accessibility**: [How it degrades with reduced motion]
- **i18n keys**: [Proposed key paths]
```

## Examples

### Example prompt
> "Add a success state when the user finishes all checklist steps for an event"

### Example output (shape)

```markdown
### Celebration design
- **Tier**: 3 — Milestone
- **Trigger**: Last checklist step toggled to complete (all steps now done)
- **Confetti**: Milestone preset (100 particles, spread 70, all brand colors)
- **Toast copy (EN)**: "Everything's in place. You're ready."
- **Toast copy (NL)**: "Alles staat klaar. Je bent er helemaal klaar voor."
- **Animation**: EventProgressRing fills to 100% with gradient, then confetti fires from center. Toast appears with Framer `initial={{ opacity: 0, y: -8 }}`.
- **Accessibility**: Confetti disabled with `disableForReducedMotion: true`. Toast message still appears. Progress ring still fills (no animation dependency).
- **i18n keys**: `celebrations.milestone.allStepsComplete`
```

---

## Composability with other skills

### + wedding-pro-mindset
When both are active, **Wedding Pro Mindset** provides the "who" and "why" (which JTBD, which persona, what stress this relieves), while **Positive Psychology** provides the "how" (which tier, what confetti preset, what copy, what animation).

Apply the persona test: would the Busy Photographer feel the celebration is appropriate at 23:30 after a long shoot? Would the Caterer find the "deposit received" message reassuring? Never let celebration override professionalism. The goal is calm confidence, not a party.

### + frontend-design
When building celebration UI, **Positive Psychology** defines the *what* (confetti preset, tier, copy), while **frontend-design** defines the *look* (component structure, spacing, responsive behavior). Celebrations must never break the "professional calm" aesthetic of the WaW brand.

### + create-waw-mcp-server-tool
When an MCP tool completes a create/update action (create_meeting, send_quote), note which celebration tier applies so the AI chatbot (Milo) can describe the outcome in encouraging language matching the Caretaker tone and the tier system.

### + sync-waw-web-and-mobile
When porting celebration patterns to mobile:
- `canvas-confetti` does not work in React Native; use `react-native-confetti-cannon` or Lottie animations instead.
- Haptic feedback supplements visual confetti: light impact (tier 1), medium (tier 2), heavy (tier 3). Use `expo-haptics`.
- All copy and tier logic port directly without changes.
- Respect the device's reduced-motion setting via `AccessibilityInfo.isReduceMotionEnabled()`.

---

## Resources

- `REFERENCE.md` — Complete copy bank (EN + NL) with i18n keys, technical snippets (`useCelebration` hook, confetti helpers, animation variants), decision matrix
- CLAUDE.md section 2 (Caretaker tone) and section 11 (Positive psychology rules)
- Existing confetti patterns: `src/components/events/PackingListCard.tsx`, `src/components/events/AIOfferConfirmationDialog.tsx`
