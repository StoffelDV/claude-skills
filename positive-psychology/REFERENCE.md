# Positive Psychology — Reference

## 1. Complete copy bank

All celebration messages in EN and NL with proposed i18n keys. Add these to `src/locales/en.json` and `src/locales/nl.json`.

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

## 2. i18n JSON structure

### English (`src/locales/en.json`)

```json
{
  "celebrations": {
    "micro": {
      "stepComplete": "Step complete.",
      "taskDone": "Done.",
      "saved": "Saved.",
      "contactLinked": "Contact linked."
    },
    "standard": {
      "depositReceived": "Deposit received. One less thing to think about.",
      "quoteSent": "Quote sent. Your client will receive it shortly.",
      "invoiceSent": "Invoice sent. You'll be notified when it's paid.",
      "timelineReady": "Timeline's set. The day will run smoothly.",
      "filesUploaded": "Files uploaded. Everything's in one place.",
      "eventConfirmed": "This one's official.",
      "packingComplete": "All packed. Ready to go."
    },
    "milestone": {
      "allStepsComplete": "Everything's in place. You're ready.",
      "bookingConfirmed": "New booking confirmed. Let's get started.",
      "invoicePaid": "Payment received. You're all set.",
      "onboardingComplete": "You're all set up. Time to focus on what you love.",
      "firstEvent": "Your first event. Here's to many more.",
      "quoteAccepted": "Quote accepted. Time to make it a great day."
    }
  }
}
```

### Dutch (`src/locales/nl.json`)

```json
{
  "celebrations": {
    "micro": {
      "stepComplete": "Stap voltooid.",
      "taskDone": "Gedaan.",
      "saved": "Opgeslagen.",
      "contactLinked": "Contact gekoppeld."
    },
    "standard": {
      "depositReceived": "Voorschot ontvangen. Weer een zorg minder.",
      "quoteSent": "Offerte verstuurd. Je klant ontvangt het binnenkort.",
      "invoiceSent": "Factuur verstuurd. Je krijgt bericht zodra die betaald is.",
      "timelineReady": "Tijdlijn staat. De dag zal vlot verlopen.",
      "filesUploaded": "Bestanden ge-upload. Alles op een plek.",
      "eventConfirmed": "Deze is officieel.",
      "packingComplete": "Alles ingepakt. Klaar om te vertrekken."
    },
    "milestone": {
      "allStepsComplete": "Alles staat klaar. Je bent er helemaal klaar voor.",
      "bookingConfirmed": "Nieuwe boeking bevestigd. Laten we beginnen.",
      "invoicePaid": "Betaling ontvangen. Alles is geregeld.",
      "onboardingComplete": "Je bent helemaal klaar. Tijd om te focussen op wat je graag doet.",
      "firstEvent": "Je eerste evenement. Op naar de volgende.",
      "quoteAccepted": "Offerte geaccepteerd. Tijd om er een topdag van te maken."
    }
  }
}
```

---

## 3. Technical snippets

### `useCelebration` hook

A reusable hook that encapsulates the tier logic. Place in `src/hooks/useCelebration.ts`.

```typescript
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

type CelebrationTier = "micro" | "standard" | "milestone";

interface CelebrationOptions {
  /** For tier 2: position confetti relative to the trigger element */
  origin?: { x: number; y: number };
}

export function useCelebration() {
  const { t } = useTranslation();

  const celebrate = (
    tier: CelebrationTier,
    messageKey: string,
    options?: CelebrationOptions
  ) => {
    // 1. Fire confetti (tier 2+)
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

    // 2. Show toast with tier-appropriate duration
    const duration =
      tier === "micro" ? 2000 : tier === "standard" ? 3000 : 5000;
    toast.success(t(messageKey), { duration });
  };

  return { celebrate };
}
```

### Confetti preset functions

Standalone functions for use outside React components:

```typescript
import confetti from "canvas-confetti";

/** Tier 2: Subtle, positioned confetti with brand mint colors */
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

/** Tier 3: Full celebration burst with all brand colors */
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

### Framer Motion animation variants

Reusable animation variants for celebration UI:

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

## 4. Decision matrix

Quick lookup for developers — find the user action, apply the row.

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

## 5. Brand colors reference

For quick access when configuring confetti or celebration UI:

| Color | Hex | Usage in celebrations |
|-------|-----|----------------------|
| Deep Teal | `#034b56` | Milestone confetti, progress ring start |
| Mint Green | `#3ecf88` | Standard + milestone confetti, success icons, progress ring end |
| Soft Aqua | `#a5f0c5` | Standard + milestone confetti, success backgrounds |
| Vibrant Yellow | `#fbae17` | Milestone confetti only (sparingly) |
| Charcoal | `#4d4d4d` | Toast text color |
| White | `#ffffff` | Toast background |
