# Positive Psychology

**Single responsibility:** Are completion and success moments celebrated at the right tier with the right tone?

---

## Overview

Admin work should feel rewarding. Every completed checklist step, received payment, and confirmed booking is an opportunity to make the user feel good about the effort they put in.

The goal: calm, confident delight — never hype.

---

## Core principles

1. **Variable reward** — Never use the same celebration twice in a row. Map significance to intensity using the tier system below. A single checklist toggle should not feel the same as receiving full payment.
2. **Progress visualization** — Always make progress visible. Use the existing `EventProgressRing` pattern (SVG gradient arc from teal to mint). Never show raw numbers without visual context.
3. **Micro-celebrations** — Small delightful moments that don't interrupt flow. Subtle icon animation, encouraging toast, gentle color change. The user should feel acknowledged without being slowed down.
4. **Milestone recognition** — Bigger celebrations for significant achievements. Branded confetti burst, warm personalized message, a brief moment of delight before returning to flow.
5. **Encouraging language** — Copy must use the Caretaker tone (CLAUDE.md section 2). Never hype. Always calm confidence. Acknowledge the user's effort without overreacting.
6. **Accessibility** — Always use `disableForReducedMotion: true` on confetti calls. Provide text alternatives for every visual celebration. Never rely on animation alone to convey state.

---

## Celebration tier system

| Tier | Name | When | Confetti | Toast | Animation |
|------|------|------|----------|-------|-----------|
| 1 | Micro | Single checklist step, task completed, minor edit saved | None | Sonner success, 2s auto-dismiss | Icon scale-in (Framer `animate={{ scale: [0, 1.1, 1] }}`) |
| 2 | Standard | Deposit received, quote sent, invoice sent, timeline created, files uploaded | Brand confetti (15 particles, mint/aqua) | Sonner success, 3s, with description | CheckCircle2 icon + fade-in message |
| 3 | Milestone | Full checklist complete, new booking confirmed, invoice paid, onboarding finished | Full confetti burst (100 particles, all brand colors) | Sonner success, 5s, with description | Framer motion entrance + success icon |

### Confetti presets

**Tier 2 — Standard:**
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

**Tier 3 — Milestone:**
```typescript
confetti({
  particleCount: 100,
  spread: 70,
  origin: { y: 0.3 },
  colors: ["#034b56", "#3ecf88", "#a5f0c5", "#fbae17"],
  disableForReducedMotion: true,
});
```

### Framer Motion animation variants

```typescript
// Tier 1: Micro — icon scale-in
export const microScaleIn = {
  initial: { scale: 0 },
  animate: { scale: [0, 1.1, 1] },
  transition: { duration: 0.3, ease: "easeOut" },
};

// Tier 2: Standard — fade in with slight slide
export const standardFadeIn = {
  initial: { opacity: 0, y: -4 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: "easeOut" },
};

// Tier 3: Milestone — entrance with spring
export const milestoneEntrance = {
  initial: { opacity: 0, y: -8, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.5, type: "spring", stiffness: 200, damping: 20 },
};
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

---

## Complete copy bank

### Tier 1 — Micro

| Key | EN | NL |
|-----|----|----|
| `celebrations.micro.stepComplete` | "Step complete." | "Stap voltooid." |
| `celebrations.micro.taskDone` | "Done." | "Gedaan." |
| `celebrations.micro.saved` | "Saved." | "Opgeslagen." |
| `celebrations.micro.contactLinked` | "Contact linked." | "Contact gekoppeld." |

### Tier 2 — Standard

| Key | EN | NL |
|-----|----|----|
| `celebrations.standard.depositReceived` | "Deposit received. One less thing to think about." | "Voorschot ontvangen. Weer een zorg minder." |
| `celebrations.standard.quoteSent` | "Quote sent. Your client will receive it shortly." | "Offerte verstuurd. Je klant ontvangt het binnenkort." |
| `celebrations.standard.invoiceSent` | "Invoice sent. You'll be notified when it's paid." | "Factuur verstuurd. Je krijgt bericht zodra die betaald is." |
| `celebrations.standard.timelineReady` | "Timeline's set. The day will run smoothly." | "Tijdlijn staat. De dag zal vlot verlopen." |
| `celebrations.standard.filesUploaded` | "Files uploaded. Everything's in one place." | "Bestanden ge-upload. Alles op een plek." |
| `celebrations.standard.eventConfirmed` | "This one's official." | "Deze is officieel." |
| `celebrations.standard.packingComplete` | "All packed. Ready to go." | "Alles ingepakt. Klaar om te vertrekken." |

### Tier 3 — Milestone

| Key | EN | NL |
|-----|----|----|
| `celebrations.milestone.allStepsComplete` | "Everything's in place. You're ready." | "Alles staat klaar. Je bent er helemaal klaar voor." |
| `celebrations.milestone.bookingConfirmed` | "New booking confirmed. Let's get started." | "Nieuwe boeking bevestigd. Laten we beginnen." |
| `celebrations.milestone.invoicePaid` | "Payment received. You're all set." | "Betaling ontvangen. Alles is geregeld." |
| `celebrations.milestone.onboardingComplete` | "You're all set up. Time to focus on what you love." | "Je bent helemaal klaar. Tijd om te focussen op wat je graag doet." |
| `celebrations.milestone.firstEvent` | "Your first event. Here's to many more." | "Je eerste evenement. Op naar de volgende." |
| `celebrations.milestone.quoteAccepted` | "Quote accepted. Time to make it a great day." | "Offerte geaccepteerd. Tijd om er een topdag van te maken." |

---

## Decision matrix

Quick lookup — find the user action, apply the row.

| User action | Tier | Confetti | Toast duration | Toast key | Animation |
|-------------|------|----------|----------------|-----------|-----------|
| Toggle single checklist step | 1 | No | 2s | `celebrations.micro.stepComplete` | Icon scale-in |
| Complete last checklist step | 3 | Milestone | 5s | `celebrations.milestone.allStepsComplete` | Full entrance + confetti |
| Link contact to event | 1 | No | 2s | `celebrations.micro.contactLinked` | Icon scale-in |
| Confirm event status | 2 | Standard | 3s | `celebrations.standard.eventConfirmed` | CheckCircle fade-in |
| Receive deposit | 2 | Standard | 3s | `celebrations.standard.depositReceived` | CheckCircle fade-in |
| Create and set timeline | 2 | Standard | 3s | `celebrations.standard.timelineReady` | CheckCircle fade-in |
| Send quote | 2 | Standard | 3s | `celebrations.standard.quoteSent` | CheckCircle fade-in |
| Quote accepted by client | 3 | Milestone | 5s | `celebrations.milestone.quoteAccepted` | Full entrance + confetti |
| Send invoice | 2 | Standard | 3s | `celebrations.standard.invoiceSent` | CheckCircle fade-in |
| Receive full payment | 3 | Milestone | 5s | `celebrations.milestone.invoicePaid` | Full entrance + confetti |
| New booking confirmed | 3 | Milestone | 5s | `celebrations.milestone.bookingConfirmed` | Full entrance + confetti |
| Complete task | 1 | No | 2s | `celebrations.micro.taskDone` | Strikethrough + fade |
| Upload files | 2 | Standard | 3s | `celebrations.standard.filesUploaded` | CheckCircle fade-in |
| Complete all packing items | 2 | Standard (origin) | 3s | `celebrations.standard.packingComplete` | CheckCircle scale-in |
| Complete onboarding step (not last) | 1 | No | 2s | `celebrations.micro.stepComplete` | Icon scale-in |
| Complete final onboarding step | 3 | Milestone | 5s | `celebrations.milestone.onboardingComplete` | Full entrance + confetti |
| First event created | 3 | Milestone | 5s | `celebrations.milestone.firstEvent` | Full entrance + confetti |
| Save settings/preferences | 1 | No | 2s | `celebrations.micro.saved` | None |

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

## Technical reference

### `useCelebration` hook

Place in `src/hooks/useCelebration.ts`:

```typescript
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

type CelebrationTier = "micro" | "standard" | "milestone";

interface CelebrationOptions {
  origin?: { x: number; y: number };
}

export function useCelebration() {
  const { t } = useTranslation();

  const celebrate = (
    tier: CelebrationTier,
    messageKey: string,
    options?: CelebrationOptions
  ) => {
    if (tier === "standard" && options?.origin) {
      confetti({
        particleCount: 15,
        spread: 30,
        origin: options.origin,
        colors: ["#3ecf88", "#a5f0c5"],
        gravity: 2,
        scalar: 0.6,
        ticks: 50,
        startVelocity: 15,
        disableForReducedMotion: true,
      });
    } else if (tier === "milestone") {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.3 },
        colors: ["#034b56", "#3ecf88", "#a5f0c5", "#fbae17"],
        disableForReducedMotion: true,
      });
    }

    const duration =
      tier === "micro" ? 2000 : tier === "standard" ? 3000 : 5000;
    toast.success(t(messageKey), { duration });
  };

  return { celebrate };
}
```

### Standalone confetti functions

```typescript
import confetti from "canvas-confetti";

export function standardConfetti(origin: { x: number; y: number }) {
  confetti({
    particleCount: 15,
    spread: 30,
    origin,
    colors: ["#3ecf88", "#a5f0c5"],
    gravity: 2,
    scalar: 0.6,
    ticks: 50,
    startVelocity: 15,
    disableForReducedMotion: true,
  });
}

export function milestoneConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.3 },
    colors: ["#034b56", "#3ecf88", "#a5f0c5", "#fbae17"],
    disableForReducedMotion: true,
  });
}
```

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

When this sub-audit identifies a completion moment, include:

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

---

## Brand colors for celebrations

| Color | Hex | Usage |
|-------|-----|-------|
| Deep Teal | `#034b56` | Milestone confetti, progress ring start |
| Mint Green | `#3ecf88` | Standard + milestone confetti, success icons, progress ring end |
| Soft Aqua | `#a5f0c5` | Standard + milestone confetti, success backgrounds |
| Vibrant Yellow | `#fbae17` | Milestone confetti only (sparingly) |
| Charcoal | `#4d4d4d` | Toast text color |
| White | `#ffffff` | Toast background |

---

## Composability

### + wedding-pro-mindset
**Wedding Pro Mindset** provides the "who" and "why" (which JTBD, which persona, what stress this relieves). **Positive Psychology** provides the "how" (which tier, what confetti preset, what copy, what animation).

Apply the persona test: would the Busy Photographer feel the celebration is appropriate at 23:30 after a long shoot? Would the Caterer find the "deposit received" message reassuring? Never let celebration override professionalism. The goal is calm confidence, not a party.

### + cognitive-load (sibling sub-document)
Celebrations must not add cognitive load. A Tier 1 micro-celebration should be nearly invisible. Even Tier 3 milestones should feel like a brief, warm moment — not a 5-second interruption. If the confetti draws more attention than the next action, it's too much.

### + sync-waw-web-and-mobile
When porting celebration patterns to mobile:
- `canvas-confetti` does not work in React Native; use `react-native-confetti-cannon` or Lottie animations instead.
- Haptic feedback supplements visual confetti: light impact (tier 1), medium (tier 2), heavy (tier 3). Use `expo-haptics`.
- All copy and tier logic port directly without changes.
- Respect the device's reduced-motion setting via `AccessibilityInfo.isReduceMotionEnabled()`.
