---
name: Sync WaW Web and Mobile
description: Use when porting a feature from the Without a Worry web app (pulse-crm) to the mobile app. Analyzes the web implementation and creates a migration plan.
---

# Sync WaW Web and Mobile

## Overview

This skill helps you port features from the **Without a Worry web app** to the **mobile app** while maintaining consistency in implementation patterns, Supabase integrations, and third-party service usage.

## Context

- **Web app location:** `~/Documents/pulse-crm`
- **Mobile app location:** `~/Documents/waw-mobile-1`
- Both apps share the same Supabase backend
- Goal: Reuse as much logic as possible, adapting only for React Native specifics

## When to use

- When you need to implement a feature in mobile that already exists in the web app
- When you want to understand how a web feature integrates with Supabase
- When you need to ensure mobile and web share the same business logic

## When NOT to use

- For mobile-only features with no web equivalent
- For UI-only changes that don't involve backend logic
- For Supabase schema changes (use migrations directly)

## Inputs you need

The user must provide:
1. A reference to the specific feature or code from the web app (file path, component name, or feature description)

## Process

### Step 1: Analyze the web implementation

1. Navigate to `~/Documents/pulse-crm`
2. Locate the referenced feature/code
3. Read and understand:
   - Component structure and state management
   - Supabase queries (tables, columns, RLS policies involved)
   - Third-party integrations (Stream Chat, Stripe, etc.)
   - API calls and edge functions used
   - Business logic and validation rules

### Step 2: Document the integration points

Create a summary explaining:

**Supabase Integration:**
- Tables and columns accessed
- Query patterns (select, insert, update, delete)
- Real-time subscriptions (if any)
- RLS policies that apply
- Edge functions called

**Third-party Services:**
- Which services are used (Stream, Stripe, SendGrid, etc.)
- How they're initialized and configured
- API calls made

**Business Logic:**
- Validation rules
- State transformations
- Error handling patterns

### Step 3: Analyze and redesign for mobile

> **Wedding Pro Mindset** — Apply as a lens throughout this step. Run the full Wedding Pro Checklist: user value (which JTBD?), workflow fit (where in the lead > booked > paid flow?), friction audit (how many taps?), failure cases (Saturday 23:30, 4G, 2% battery), output quality (does it look professional?), scope sanity (worth it at 25 EUR/month?). Mobile is where wedding pros live — extra strictness on speed, thumb-friendliness, and offline resilience.

Before jumping to code, analyze the web feature through a mobile lens:

**1. Identify the core purpose and actions:**
- Core purpose of the screen
- Primary user actions (what 80% of users do)
- Secondary actions (power user features, edge cases)
- Information hierarchy (what's most important to see first)

**2. Propose a mobile-adapted UI that:**
- Works comfortably with one hand
- Prioritizes the most important actions
- Reduces cognitive load
- Hides secondary actions behind menus or sheets if needed

**3. Describe the mobile UI structure:**
- Screen layout (top to bottom)
- Navigation pattern (tabs, bottom bar, sheet, stack, etc.)
- What becomes collapsible, scrollable, or paginated
- What is removed or deferred compared to desktop

**4. Explicitly list features to build:**

For each feature, specify:
- What the user can do
- Which UI component you will use
- Why this component is appropriate on mobile

Example format:
```
- Feature: Event status overview
  Component: Status pill + segmented control
  Reason: Quick scanning and tap-friendly interaction
```

**5. Apply mobile UI/UX best practices:**
- **Thumb zones:** Primary actions within easy thumb reach (bottom third of screen)
- **Safe areas:** Respect device notches and home indicators
- **Touch targets:** Minimum 44pt for tappable elements
- **Spacing:** Generous padding between interactive elements
- **Empty states:** Helpful messaging with clear next actions
- **Loading states:** Skeleton loaders, not blank screens
- **Error prevention:** Confirmation dialogs for destructive actions

### Step 4: Propose the technical implementation plan

Create a detailed plan that:

1. **Identifies reusable code:**
   - Supabase queries that can be copied directly
   - Business logic that can be shared
   - Types/interfaces to reuse

2. **Identifies adaptations needed:**
   - React Native-specific UI components
   - Navigation patterns (Expo Router vs Next.js)
   - Platform-specific APIs (AsyncStorage vs localStorage, etc.)
   - Styling (NativeWind/StyleSheet vs CSS/Tailwind)

3. **Lists files to create/modify:**
   - New components needed
   - Existing components to update
   - Shared types to add

4. **Provides implementation order:**
   - Dependencies between pieces
   - Suggested sequence of work

## Output format

Output ONLY a clear, structured explanation. No code. No assumptions about backend changes. No marketing copy.

Tone: practical, concrete, opinionated where needed, no fluff, no buzzwords.

```markdown
## Feature Analysis: [Feature Name]

### Web Implementation Summary
- **Location:** [file paths in pulse-crm]
- **Key components:** [list]

### Supabase Integration
| Table | Operations | Notes |
|-------|------------|-------|
| ... | ... | ... |

### Third-party Services
- [Service]: [How it's used]

### Business Logic
[Key rules and validations]

---

## Mobile UI Design

### Screen Purpose
- **Core purpose:** [What problem this screen solves]
- **Primary actions:** [What 80% of users will do]
- **Secondary actions:** [Power user features, hidden behind menus/sheets]

### Information Hierarchy
1. [Most important]
2. [Second most important]
3. ...

### Mobile Layout (top to bottom)
- **Header:** [Navigation, title, key action]
- **Body:** [Main content area]
- **Footer/Bottom bar:** [Primary actions, tabs if applicable]

### Navigation Pattern
[tabs / bottom bar / sheet / stack / etc. and why]

### Desktop → Mobile Adaptations
| Desktop Element | Mobile Adaptation | Reason |
|-----------------|-------------------|--------|
| [sidebar] | [bottom tabs] | [thumb-friendly] |
| ... | ... | ... |

### Features to Build

| Feature | Component | Reason |
|---------|-----------|--------|
| [Feature name] | [UI component] | [Why appropriate for mobile] |
| ... | ... | ... |

### Wedding Pro Checklist
- **JTBD:** [Which job(s) does this feature serve?]
- **Workflow fit:** [Where in lead > quote > booked > prep > event day > aftercare?]
- **Friction audit:** [Taps to complete core action, auto-fill opportunities]
- **Failure cases:** [Saturday 23:30 test, incomplete data, wrong timezone]
- **30-second win:** [What does the user get immediately?]

### UI/UX Best Practices Applied
- **Thumb zones:** [How primary actions are positioned]
- **Touch targets:** [Minimum sizes used]
- **Loading states:** [Skeleton approach]
- **Empty states:** [Messaging and CTAs]
- **Error prevention:** [Confirmations used]

---

## Technical Implementation Plan

### Reusable Code
- [What can be copied directly]

### Adaptations Required
- [What needs React Native changes]

### Files to Create/Modify
1. [file] - [purpose]
2. ...

### Implementation Steps
1. [First step]
2. [Second step]
...

### Potential Gotchas
- [Known differences to watch for]
```

## Example

### Example prompt
> Sync the invoice PDF generation feature from the web app to mobile

### Example output shape
```markdown
## Feature Analysis: Invoice PDF Generation

### Web Implementation Summary
- **Location:** `src/components/invoices/InvoicePDF.tsx`, `src/lib/pdf-utils.ts`
- **Key components:** InvoicePDF, generateInvoicePDF()

### Supabase Integration
| Table | Operations | Notes |
|-------|------------|-------|
| invoices | SELECT | Fetch invoice details |
| invoice_items | SELECT | Fetch line items |
| contacts | SELECT | Fetch client info |

### Third-party Services
- react-pdf: Renders PDF in browser
- Supabase Storage: Stores generated PDFs

### Business Logic
- Tax calculation: subtotal * tax_rate
- Total: subtotal + tax - discount
- PDF naming: `INV-{number}-{client}.pdf`

---

## Mobile UI Design

### Screen Purpose
- **Core purpose:** Let users generate and share invoice PDFs
- **Primary actions:** Generate PDF, share/send to client
- **Secondary actions:** Preview, save to device, email options

### Information Hierarchy
1. Invoice summary (number, client, total)
2. Generate/share action
3. Preview option

### Mobile Layout (top to bottom)
- **Header:** Back button, "Invoice #123", overflow menu
- **Body:** Invoice detail card (scrollable)
- **Footer:** Sticky "Generate PDF" button

### Navigation Pattern
Stack navigation from invoice list. PDF preview opens as full-screen modal.

### Desktop → Mobile Adaptations
| Desktop Element | Mobile Adaptation | Reason |
|-----------------|-------------------|--------|
| Side-by-side preview | Full-screen modal | Limited screen width |
| Multiple action buttons | Single primary + overflow | Reduce cognitive load |
| Inline PDF viewer | Share sheet after generation | Native mobile pattern |

### Features to Build

| Feature | Component | Reason |
|---------|-----------|--------|
| Generate PDF | Sticky bottom button | Thumb-friendly, always visible |
| Share PDF | Native share sheet | Familiar iOS/Android pattern |
| Preview PDF | Full-screen modal | Maximizes viewing area |
| Loading state | Button with spinner | Prevents double-tap |

### UI/UX Best Practices Applied
- **Thumb zones:** Generate button at bottom of screen
- **Touch targets:** 44pt minimum for all buttons
- **Loading states:** Button shows spinner during generation
- **Empty states:** N/A (invoice always has data)
- **Error prevention:** Disabled button while generating

---

## Technical Implementation Plan

### Reusable Code
- Tax and total calculations from `pdf-utils.ts`
- Invoice data fetching queries

### Adaptations Required
- Use `expo-print` instead of `react-pdf`
- Use `expo-sharing` for PDF sharing
- Adapt layout for mobile PDF dimensions

### Files to Create/Modify
1. `lib/pdf-utils.ts` - Copy calculation logic
2. `components/InvoicePDFGenerator.tsx` - New component
3. `components/InvoiceDetail.tsx` - Add PDF button

### Implementation Steps
1. Copy shared types and calculation utils
2. Create PDF HTML template for expo-print
3. Implement generate and share functionality
4. Add UI button to invoice detail screen

### Potential Gotchas
- expo-print uses HTML, not React components
- File paths differ (expo-file-system vs browser)
```

## Resources

Reference both codebases:
- Web: `~/Documents/pulse-crm`
- Mobile: `~/Documents/waw-mobile-1`
- Shared: Same Supabase project (check `supabase/` folders in both)
