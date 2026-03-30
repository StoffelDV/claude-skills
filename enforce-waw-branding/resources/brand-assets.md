# Brand Assets

**Single responsibility:** Are we using branded components instead of generic primitives?

**Rule: ALWAYS prefer custom branded components over generic UI primitives in the internal app.**

---

## Component catalog

### 1. AnimatedCheckbox

**Replaces:** `<Checkbox>` from `@/components/ui/checkbox`

**Import:**
```tsx
import AnimatedCheckbox from "@/components/shared/AnimatedCheckbox";
```

**Props:**
```tsx
interface AnimatedCheckboxProps {
  checked: boolean;
  onCheckedChange: () => void;
  disabled?: boolean;
  className?: string;
}
```

**What it does:**
- Circular checkbox with smooth SVG checkmark stroke animation
- Unchecked: gray border, transparent fill
- Hover: accent border tint + subtle glow ring
- Checked: solid accent green (#3ecf88) fill, white animated checkmark
- Disabled: 50% opacity

**Use for:** ALL checkboxes in the internal app — task completion, form toggles, selection lists, multi-select, boolean settings. There is no case where the generic square `<Checkbox>` should be used instead.

**Migration pattern:**
```tsx
// Before (generic)
import { Checkbox } from "@/components/ui/checkbox";
<Checkbox checked={value} onCheckedChange={toggle} />

// After (branded)
import AnimatedCheckbox from "@/components/shared/AnimatedCheckbox";
<AnimatedCheckbox checked={value} onCheckedChange={toggle} />
```

**Note:** The generic `<Checkbox>` uses `onCheckedChange(checked: boolean)` while `AnimatedCheckbox` uses `onCheckedChange()` (no argument — it toggles). Callers that depend on the boolean argument need a wrapper: `onCheckedChange={() => toggle(!value)}`.

---

### 2. SegmentedDateInput

**Replaces:** `<input type="date">`, date picker buttons, calendar-only popovers

**Import:**
```tsx
import { SegmentedDateInput } from "@/components/shared/SegmentedDateInput";
```

**Props:**
```tsx
interface SegmentedDateInputProps {
  /** Date in yyyy-MM-dd format */
  value: string;
  /** Called with yyyy-MM-dd when a valid date is committed */
  onChange: (isoDate: string) => void;
  className?: string;
  style?: React.CSSProperties;
}
```

**What it does:**
- Three segments: DD / MM / YYYY with always-visible structure (`--/--/----` when empty)
- Click or arrow keys to navigate between segments
- Active segment highlighted with primary color
- Type digits to fill a segment — auto-advances when complete
- Up/Down arrows increment/decrement the active segment
- Tab moves between segments, then to next field
- Slash/dot/dash keys advance to next segment
- Backspace clears the active segment
- On blur with incomplete data, reverts to last valid date

**Use for:** ALL date inputs in the internal app where the user enters a dd/MM/yyyy date. Pair with a calendar popover icon for visual picking when useful.

**Migration pattern:**
```tsx
// Before (native)
<Input type="date" value={dateValue} onChange={handleChange} />

// After (branded)
<SegmentedDateInput value={dateValue} onChange={(iso) => setDate(iso)} />
```

**Note:** Value format is `yyyy-MM-dd` (ISO), same as native `<input type="date">`. Drop-in replacement for the value/onChange contract.

---

### 3. AddressAutocomplete

**Replaces:** Manual address inputs, free-text address fields, any single `address` text column

**Import:**
```tsx
import AddressAutocomplete from "@/components/shared/AddressAutocomplete";
```

**What it does:**
- Google Places autocomplete with structured field output
- Uses `google-places-proxy` edge function (debounced, 300ms)
- Backend hook: `useAddressAutocomplete` (`src/hooks/useAddressAutocomplete.ts`)

**Two modes:**

| Mode | UI | Data |
|------|-----|------|
| **Compact (default)** | Single text input showing the Google Places display name. User types, picks from suggestions, sees one clean field. No visible address_line2, city, postal_code fields. | Silently stores full structured address in backend columns. |
| **Expanded (opt-in)** | Full address fields visible for manual editing. All 6 fields shown: street, line2, postal code, city, region, country. | Same structured storage. |

**Use compact mode** for: event forms, contact cards, quick entry — anywhere a single clean field is better UX.

**Use expanded mode** for: invoicing, contact detail editing, any form where the user may need to manually correct individual address fields.

**Backend requirement:** Any table storing an address MUST include complementary columns to match the Google Places output:
- `address_line1` (text)
- `address_line2` (text, nullable)
- `city` (text)
- `region` (text, nullable)
- `postal_code` (text)
- `country_code` (text, 2-char ISO)

**Never** store addresses as a single `address` text column.

---

## Scope

- **Internal app UI:** Branded component is mandatory.
- **Public-facing widgets** (booking, quotes): Native inputs allowed for browser/mobile compatibility.

## Adding new brand assets

When a new branded component is created:
1. Add it to the catalog section above with import, props, description, and migration pattern
2. Add its detection pattern to the audit checklist table below
3. Update the known locations list
4. Update CLAUDE.md brand assets rule if the category is new

## Audit checklist

| Pattern to find | Branded replacement | Grep pattern |
|---|---|---|
| `<Checkbox` from ui/checkbox | `AnimatedCheckbox` | `from "@/components/ui/checkbox"` |
| `type="date"` native inputs | `SegmentedDateInput` | `type="date"` or `type={'date'}` |
| Button-only date pickers (no typing) | `SegmentedDateInput` + calendar popover | Manual inspection |
| Free-text address field or single `address` column | `AddressAutocomplete` | `address` column without complementary fields |

### Audit process

1. **Search** for the grep patterns listed above in the target file(s)
2. **For each match**, determine if it's in the internal app (replace) or public-facing (may keep)
3. **Report** findings with file:line references
4. **Replace** generic components with branded equivalents
5. **Verify** the component still works (type-check + visual)

### Known locations with generic components (as of 2026-03-28)

**Generic `<Checkbox>` (12 files):**
- `src/components/common/FormModeSelector.tsx`
- `src/components/settings/QuoteTemplateTab.tsx`
- `src/components/invoicing/wizard/Step4NameActivate.tsx`
- `src/components/credit-notes/CreditNoteLineSelector.tsx`
- `src/pages/StreamCallPage.tsx`
- `src/components/booking-admin/CustomFieldsEditor.tsx`
- `src/components/contacts/import/ContactImportValidation.tsx`
- `src/components/gmail/MiloFollowUpPanel.tsx`
- `src/components/dashboard/UpcomingTasks.tsx`
- `src/pages/ThemePreview.tsx`
- `src/components/events/InvoiceWizard.tsx`
- `src/components/songs/SongList.tsx`

**Generic `type="date"` (6 files):**
- `src/components/public-booking/ClientDetailsForm.tsx` (public — may keep)
- `src/components/timeline/TimelineItemSidePanel.tsx`
- `src/components/timeline/TimelineItemEditDialog.tsx`
- `src/components/timeline/TimelineItem.tsx`
- `src/components/timeline/AddTimelineItem.tsx`
- `src/components/invoicing/wizard/PreviewCard.tsx`
