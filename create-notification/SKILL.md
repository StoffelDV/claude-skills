---
name: Create WaW Notification
description: Use when adding a new notification type to WaW. Covers the full stack — backend creation, push delivery, mobile navigation, copy rules, and settings UI — so nothing is missed.
---

# Create WaW Notification

## Overview

This skill is the reference for creating, modifying, or reviewing notifications in Without a Worry (WaW). It covers the entire notification lifecycle:

1. **Backend**: Insert a row into the `notifications` table
2. **Push delivery**: Automatic via DB trigger + `process-notification-delivery` edge function
3. **Mobile navigation**: Tap → correct screen → specific item
4. **Settings UI**: User can toggle push/email per notification type
5. **Copy & tone**: Caretaker voice, tasteful emoji, no hype

## When to use

- Adding a new notification type
- Changing notification copy or data payloads
- Debugging why a notification isn't arriving on mobile
- Reviewing notification-related PRs
- Understanding the notification delivery pipeline

## When NOT to use

- Stream Chat's own push notifications (FCM-based, separate system)
- Email-only transactional messages (use Resend directly)
- In-app toasts/banners that don't persist

---

## Architecture

```
Insert into notifications table
        │
        ▼
DB trigger: on_notification_deliver
        │
        ▼
Edge function: process-notification-delivery
        │
        ├── Check user preferences (notification_preferences table)
        │
        ├── Push enabled? → Look up push_tokens → Expo Push API
        │
        └── Email enabled? → Resend API (unless emailManagedExternally)
```

The `notifications` table is the single source of truth. Every notification — regardless of origin — is an INSERT into this table. The DB trigger handles delivery automatically.

---

## Notification type registry

All notification types are defined in `src/lib/notification-types.ts`. Each entry specifies:

| Field | Purpose |
|---|---|
| `type` | Unique string identifier (e.g., `task_assigned`) |
| `labelKey` | i18n key for the settings UI label |
| `descriptionKey` | i18n key for the settings UI description |
| `category` | Grouping in settings: `tasks`, `financial`, `collaboration`, `meetings`, `other` |
| `defaultPush` | Whether push is enabled by default (before user changes preferences) |
| `defaultEmail` | Whether email is enabled by default |
| `emailManagedExternally` | Set `true` if another edge function already sends the email |
| `emailLocked` | Set `true` to hide the email toggle (email always sent) |

### Current types

| Type | Title | Category | Created by |
|---|---|---|---|
| `task_assigned` | New task for you | tasks | Web app (`tasks-service.ts`) |
| `task_due_today` | Due today | tasks | Edge fn (`cron-check-tasks-due`) |
| `quote_approved` | Quote approved | financial | Edge fn (`send-vendor-notification`) |
| `quote_declined` | Quote declined | financial | Edge fn (`send-vendor-notification`) |
| `invoice_paid` | Invoice paid | financial | Edge fn (TBD) |
| `collaboration_invitation` | You're invited to collaborate | collaboration | DB trigger (`handle_collaboration_invitation_notification`) |
| `collaboration_response` | Collaboration response | collaboration | Web app |
| `meeting_invitation` | Meeting invite | meetings | Edge fn (`send-meeting-invitation`) |
| `meeting_rsvp` | {name} is in / can't make it / is tentative | meetings | Edge fn (`sync-meeting-rsvp`, `cron-sync-meeting-rsvps`) |
| `milo_notes_ready` | Notes ready | meetings | Edge fn (`fly-agent-webhook`) |
| `chat_message` | {sender} / {sender} in {channel} | other | Edge fn (`stream-chat-webhook`) |
| `chat_mention` | You were mentioned | other | Edge fn (`stream-chat-webhook`) |

---

## How to create a notification

### Step 1: Insert into the notifications table

**Web app code** (client-side, RLS applies):
```typescript
await supabase.from("notifications").insert({
  user_id: targetUserId,        // UUID of the recipient
  title: "📋 New task for you",  // Short title with one emoji
  message: '"Design mood board" was just assigned to you.',
  type: "task_assigned",         // Must match a registered type
  data: {                        // JSON payload for deep linking
    task_id: "uuid-here",
    event_id: "uuid-here",
  },
  read: false,
});
```

**Edge function code** (service role, no RLS):
```typescript
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

await supabase.from('notifications').insert({
  user_id: targetUserId,
  title: '🎉 Quote approved',
  message: `${clientName} said yes to your quote for ${eventName}. One step closer to confirmed.`,
  type: 'quote_approved',
  data: {
    quote_id: quoteId,
    event_id: eventId,
    client_name: clientName,
  },
  read: false,
});
```

### Step 2: Register the type

Add an entry to `src/lib/notification-types.ts`:

```typescript
{
  type: "your_new_type",
  labelKey: "settings.notifications.types.yourNewType",
  descriptionKey: "settings.notifications.types.yourNewTypeDesc",
  category: "tasks",  // or financial, collaboration, meetings, other
  defaultPush: true,
  defaultEmail: false,
},
```

### Step 3: Add locale strings

In both `src/locales/en.json` and `src/locales/nl.json`, add under `settings.notifications.types`:

```json
"yourNewType": "Your notification label",
"yourNewTypeDesc": "When this thing happens"
```

### Step 4: Add Android channel mapping

In `supabase/functions/process-notification-delivery/index.ts`, add your type to the appropriate channel array in `getChannelId()`:

```typescript
const taskTypes = ["task_assigned", "task_due_today"];
const eventTypes = ["collaboration_invitation", ...];
const messageTypes = ["chat_mention", "chat_message"];
// Add your new type to the right array
```

### Step 5: Mobile deep linking

In `waw-mobile-1/hooks/useNotifications.ts`:

1. Add to `NOTIFICATION_SCREEN_MAP`:
```typescript
const NOTIFICATION_SCREEN_MAP: Record<string, string> = {
  // ... existing entries
  your_new_type: 'tasks',  // target screen tab
};
```

2. Make sure your `data` payload includes the right ID key. The `extractFocusId` function checks these keys in order:
   - `task_id` → TasksScreen
   - `quote_id` → QuotesScreen
   - `invoice_id` → InvoicesScreen
   - `meeting_id` → CalendarScreen
   - `event_id` → EventsScreen

3. If your notification has `channel_id` in the data, it will navigate directly to that chat channel (handled separately from the screen map).

### Step 6: Deploy

If you modified an edge function:
```bash
npx supabase functions deploy <function-name> --no-verify-jwt
```

Always deploy `process-notification-delivery` if you changed the channel mapping.

---

## Required data payload keys

Each notification type should include specific IDs in its `data` field so the mobile app can deep-link to the right item:

| Type | Required data keys |
|---|---|
| `task_assigned` | `task_id`, `event_id` (optional) |
| `task_due_today` | `task_id`, `event_id` (optional) |
| `quote_approved` | `quote_id`, `event_id` |
| `quote_declined` | `quote_id`, `event_id` |
| `invoice_paid` | `invoice_id`, `event_id` |
| `collaboration_invitation` | `invitation_id`, `event_id` |
| `collaboration_response` | `event_id` |
| `meeting_invitation` | `meeting_id` |
| `meeting_rsvp` | `meeting_id` |
| `milo_notes_ready` | `meeting_id` |
| `chat_message` | `channel_id` |
| `chat_mention` | `channel_id` |

---

## Copy rules

### Tone
Follow the **Caretaker** voice: calm, kind, confident. Like a trusted assistant who quietly keeps things under control.

### Title format
- One tasteful emoji at the start (or none for negative events like declines)
- Short — aim for 3-5 words
- Sentence case, no exclamation marks
- Can include a name when it adds clarity (e.g., "Sarah is in")

### Message format
- One sentence, max two
- Include the specific item name in quotes: `"Design mood board"`
- Include relevant person names
- Never use exclamation marks or hype language
- Supportive, never robotic

### Examples

| Good | Bad |
|---|---|
| `📋 New task for you` | `New Task Assigned!` |
| `"Design mood board" was just assigned to you.` | `You have been assigned a new task.` |
| `🎉 Quote approved` | `Quote Approved!!!` |
| `Sarah said yes to your quote for "Johnson Wedding".` | `Your quote has been approved by the client.` |
| `Quote declined` | `❌ Quote Declined!` |
| `Mark passed on your quote for "Summer Gala".` | `Unfortunately, your quote was not accepted.` |

### What NOT to do
- No generic messages ("Something happened")
- No exclamation marks
- No corporate speak ("We are pleased to inform you")
- No excessive emojis (one per title max, zero in the message)
- No motivational platitudes in negative notifications

---

## Checklist for adding a new notification type

- [ ] Notification INSERT code written (web app or edge function)
- [ ] `data` payload includes the right ID keys for deep linking
- [ ] Type added to `src/lib/notification-types.ts`
- [ ] Locale strings added to both `en.json` and `nl.json`
- [ ] Android channel mapping updated in `process-notification-delivery`
- [ ] Mobile screen map updated in `useNotifications.ts` (if applicable)
- [ ] Focus prop handled in the target mobile screen (if new screen)
- [ ] Copy follows Caretaker tone (no hype, no exclamation marks)
- [ ] Title has at most one emoji
- [ ] Edge function deployed (if applicable)
- [ ] `process-notification-delivery` deployed (if channel mapping changed)

---

## Debugging

### Notification not arriving on mobile?

1. **Check the `notifications` table** — is the row there?
2. **Check `push_tokens`** — does the user have a valid token?
3. **Check `notification_preferences`** — is push enabled for this type?
4. **Check Supabase edge function logs** — look for `process-notification-delivery` errors
5. **Token handoff issue?** — If user switches accounts on the same device, the `upsert_push_token` RPC handles reassignment. Check if the token is associated with the correct user.

### Notification arrives but doesn't navigate?

1. Check the `data` payload — does it have the right ID keys?
2. Check `NOTIFICATION_SCREEN_MAP` — is the type mapped?
3. Check `extractFocusId` — does it check for your ID key?
4. Check the target screen — does it have a `focusXxxId` prop and the corresponding `useEffect`?
