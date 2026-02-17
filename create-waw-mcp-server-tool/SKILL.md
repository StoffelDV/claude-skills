---
name: Create WaW MCP Server Tool
description: Use when the user wants to add a new tool to the WaW Pulse MCP server. Researches Supabase tables, RPC functions, and the pulse-crm codebase, then proposes a well-designed MCP tool following project conventions and MCP best practices.
---

# Create WaW MCP Server Tool

## Overview

This skill guides you through a structured process to **research, design, and propose** a new MCP server tool for the WaW Pulse Supabase MCP server. It ensures every new tool is grounded in real database schema, follows existing codebase patterns, and adheres to MCP best practices.

## When to use

- User asks to add a new tool/feature to the MCP server
- User asks "what tools could we add?" or "what data can we expose?"
- User wants to expose a pulse-crm feature through the MCP server
- User asks to create an MCP tool for a specific domain (contacts, events, songs, equipment, etc.)

## When NOT to use

- Bug fixes or refactoring of existing MCP tools
- Changes to the Supabase Edge Function (`supabase/functions/mcp-chat/`)
- Non-MCP features or frontend work

## Inputs you need

Before starting, ask the user for:
- **Feature domain**: What area? (e.g., "songs", "equipment", "meetings", "financial agreements")
- **Operation type**: Read, create, update, delete, or a combination?
- **Any specific requirements**: Filters, search, bulk operations, etc.

If the user is vague (e.g., "add something for songs"), proceed with the full research phase to discover what's possible.

---

## Process

### Phase 1: Research the Database

Search the Supabase schema and pulse-crm codebase to understand the data model for the requested domain.

**Step 1 — Find the database types:**
Read `~/Documents/pulse-crm/src/integrations/supabase/types.ts` and search for table definitions related to the domain. This file contains the complete auto-generated Supabase schema with all tables, columns, and types.

Look for:
- Table names and their Row/Insert/Update types
- Column names, types, and nullability
- Foreign key relationships (fields ending in `_id`)
- Enum-like fields (status columns, type columns)

**Step 2 — Find how the feature is used in pulse-crm:**
Search across `~/Documents/pulse-crm/src/` for Supabase queries related to the domain:

```
# Find direct table queries
grep -r "supabase.from(\"<table_name>\")" ~/Documents/pulse-crm/src/
grep -r ".from(\"<table_name>\")" ~/Documents/pulse-crm/src/

# Find RPC calls
grep -r "supabase.rpc(" ~/Documents/pulse-crm/src/

# Find React Query hooks (these reveal the most common read patterns)
grep -r "useQuery.*<table_name>" ~/Documents/pulse-crm/src/
```

**Step 3 — Check for existing RPC functions:**
Search the Supabase migrations for relevant PostgreSQL functions that could be reused:

```
grep -r "CREATE.*FUNCTION" ~/Documents/pulse-crm/supabase/migrations/ | grep -i "<domain>"
```

Also check `~/Documents/pulse-crm/src/integrations/supabase/types.ts` for the `Functions` section to find all available RPC functions.

**Step 4 — Check for RLS policies:**
Search migrations for RLS policies on the target tables to understand access patterns:

```
grep -r "CREATE POLICY\|ALTER TABLE.*ENABLE ROW LEVEL" ~/Documents/pulse-crm/supabase/migrations/ | grep -i "<table_name>"
```

### Phase 2: Analyze Existing MCP Server Patterns

Read the current MCP server implementation to understand conventions:

**File:** `~/Documents/pulse-supabase-mcp-server/src/index.ts`

Document the following patterns from existing tools:
- Tool naming convention (the project uses a mix; prefer `snake_case` for new tools)
- How `inputSchema` is defined (Zod schemas with `.describe()`)
- How responses are structured (`structuredContent` + `content` array)
- How errors are returned (`isError: true` pattern)
- How RLS guards work (check event/entity exists before operating)
- Parameter normalization patterns (trim strings, bound numbers, default values)

### Phase 3: Input Dependency Analysis

Before designing the tool, map every required input to its source. This prevents tools that are impossible to call without prior context.

**Step 1 — List all required inputs:**
For the proposed tool, enumerate every parameter that a caller must provide. For each one, determine:
- Is it a **user-provided value** (e.g., a title, a date, free text)?
- Is it a **system ID** that must be looked up first (e.g., `contact_id`, `event_id`, `quote_id`)?

**Step 2 — Map IDs to existing tools:**
For every system ID, identify which existing MCP tool can provide it:

| Required Input | Source Tool | How to get it |
|----------------|------------|---------------|
| `event_id` | `listallevents` | Search by date range or list upcoming events |
| `contact_id` | `getcontacts` | Search by name/email or list all contacts |
| `quote_id` | `getquotes` | Filter by event_id or list all quotes |
| `invoice_id` | `getinvoices` | Filter by event_id or list all invoices |
| `note_id` | `list_event_notes` | List notes for a specific event |

If no existing tool can provide a required ID, flag this as a gap — a new lookup tool may need to be created alongside the proposed tool.

**Step 3 — Define the prerequisite chain:**
Write out the exact sequence of tool calls needed to go from a user's natural language request to a successful tool invocation:

```
Example: User says "Create a meeting with John next Tuesday"

1. getcontacts(query: "John") → returns contact_id
2. create_meeting(contact_id: "...", date: "2025-02-04", ...)
```

This chain MUST be documented in the tool's description (see Phase 4).

---

### Phase 4: Design the Tool

> **Wedding Pro Mindset** — Apply as a lens throughout this phase. Every tool must map to a real JTBD (win bookings, stay organized, avoid mistakes, get paid, communicate clearly, look professional). The prerequisite chain should mirror how wedding pros think: events > status > next action. Tool descriptions must use plain language a solo vendor would understand — no jargon, no abstract object names.

> **Positive Psychology** — When the tool performs a create or update action that maps to a celebration moment (booking confirmed, quote sent, invoice created, payment recorded), document the appropriate celebration tier in the tool's description. This allows the AI chatbot (Milo) to respond with encouraging, Caretaker-toned language that matches the tier: micro ("Done."), standard ("Quote sent. Your client will receive it shortly."), or milestone ("Payment received. You're all set."). See the positive-psychology skill for the full copy bank and tier system.

Design the new tool following these MCP best practices:

#### Naming
- Use `snake_case` (e.g., `list_songs`, `get_equipment`, `create_meeting`)
- Use verb prefixes: `list_`, `get_`, `create_`, `update_`, `delete_`, `search_`
- Be specific: `list_event_songs` not `get_data`

#### Description
Write a clear description that answers:
1. **What** does it do?
2. **How** does it work? (direct query vs. RPC, fuzzy search vs. exact match)
3. **What** are the defaults and limits?
4. **What** security model applies? (mention RLS)
5. **How** to gather required inputs — which tools to call first and in what order

The description must include a **"Prerequisite data"** section that tells the AI chatbot exactly how to resolve required inputs from a user's natural language request. This is critical — without it, the AI won't know which tools to call before invoking this one.

Example:
```
"Creates a meeting linked to an event, adds participants, and triggers email invitations.

Prerequisite data — gather before calling this tool:
- event_id: Call listallevents to find the event, or create_event to make a new one.
- contact_ids: Call getcontacts(query: \"<name>\") for each participant to resolve their IDs.

Use this tool when:
- The user wants to schedule a meeting for an event
- The user wants to invite contacts to a meeting

Uses direct table insert with RLS enforcement. Requires authenticated user."
```

#### Input Schema
- Use `z.string().uuid()` for ID parameters
- Use `z.string().optional().describe("...")` for search/filter params
- Use `z.number().int().positive().max(500).optional()` for limits
- Use `z.enum([...]).optional()` for constrained values
- Set sensible defaults (limit: 100, offset: 0)
- Always add `.describe()` with usage guidance for the LLM

#### Output Format
Always return both:
```typescript
return {
  structuredContent: { /* typed data */ },
  content: [
    { type: "text", text: JSON.stringify(payload, null, 2) },
    { type: "text", text: "Summary: found X items..." }
  ]
};
```

#### Error Handling
```typescript
// Input validation → return isError with clear message
// RLS guard → check entity exists before operating
// Query error → return isError with error.message
// Catch-all → try/catch wrapping the handler
```

#### Security
- All queries go through the authenticated Supabase client (RLS enforced)
- Validate and trim string inputs
- Bound numeric inputs (min 1, max 500)
- Guard write operations with existence checks
- Never expose raw database error details
- **CRITICAL — INSERT operations and `user_id`:** Most tables have RLS INSERT policies like `WITH CHECK (auth.uid() = user_id)`. Supabase does NOT auto-populate `user_id` — you must explicitly set it. Before any INSERT, resolve the user's ID via `this.supabase.auth.getUser()` and include `user_id: user.id` in the row. Without this, the insert will fail with "new row violates row-level security policy".

### Phase 5: Propose the Implementation

Present the proposal to the user in this format:

---

## Output Format

```markdown
# MCP Tool Proposal: `<tool_name>`

## Summary
One-line description of what this tool does.

## JTBD served
Which wedding-pro job(s) does this tool support? (win bookings / stay organized / avoid mistakes / get paid / communicate clearly / look professional)

## Database Research

### Tables involved
| Table | Key columns | Relationship |
|-------|------------|--------------|
| ... | ... | ... |

### Existing RPC functions
- `function_name(params)` — what it does

### RLS policies
- What access model applies

## Input Dependency Analysis

### Required inputs and their sources
| Input | Type | Source | How to resolve |
|-------|------|--------|---------------|
| event_id | UUID | `listallevents` | Search by date or list upcoming events |
| contact_id | UUID | `getcontacts` | Search by name: `getcontacts(query: "John")` |
| ... | ... | ... | ... |

### Prerequisite tool chain
Example workflow from user request to tool execution:
1. User says: "..."
2. Call `<tool_a>` to get `<id>` → returns `<id>`
3. Call `<tool_b>` with `<id>` to get `<other_id>` → returns `<other_id>`
4. Call `<proposed_tool>` with all resolved inputs

### Gaps identified
- List any required data that no existing tool can provide
- Propose companion tools if needed

## Tool Specification

### Name
`<tool_name>`

### Description
Full description text (for the tool registration).
MUST include "Prerequisite data" section explaining how to gather required inputs.

### Input Schema
```typescript
{
  param_name: z.type().optional().describe("..."),
  ...
}
```

### Response Shape
```json
{
  "items": [...],
  "meta": { "count": 0 }
}
```

### Error Cases
- What can go wrong and how each case is handled

## Implementation

Full TypeScript code for the `this.server.registerTool(...)` call,
ready to paste into `src/index.ts`.
```

---

## Example

### Example prompt
> "Add a tool to list songs with search and filtering"

### Example output (shape)

```markdown
# MCP Tool Proposal: `list_songs`

## Summary
Search and list songs from the user's repertoire with optional title/artist search and tag filtering.

## Database Research

### Tables involved
| Table | Key columns | Relationship |
|-------|------------|--------------|
| songs | id, title, artist, key, bpm, duration, tags, practice_status, spotify_link, user_id | Primary |
| song_notes | id, song_id, content, created_at | Child of songs |
| event_songs | event_id, song_id, sequence_index, comments | Junction to events |

### Existing RPC functions
- None specific to songs; use direct table query

### RLS policies
- songs: users can only access their own rows (user_id = auth.uid())

## Tool Specification

### Name
`list_songs`

### Description
"Search and list songs from the authenticated user's repertoire.
Supports optional free-text search on title and artist, filtering by
practice_status or tags, and sorting by title or artist. Results respect
RLS. Default limit: 100, max: 500."

### Input Schema
  query: z.string().optional().describe("Free text search on title and artist"),
  practice_status: z.enum(["not_started","learning","performance_ready"]).optional(),
  tag: z.string().optional().describe("Filter by tag (exact match)"),
  limit: z.number().int().positive().max(500).optional().describe("Default 100"),
  sort_by: z.enum(["title","artist","created_at"]).optional().describe("Default: title")

### Error Cases
- No songs found → return empty array with message
- Invalid practice_status → Zod validation rejects

## Implementation
[Full registerTool code block]
```

---

## Resources

- **MCP server source:** `~/Documents/pulse-supabase-mcp-server/src/index.ts`
- **Supabase types:** `~/Documents/pulse-crm/src/integrations/supabase/types.ts`
- **Supabase migrations:** `~/Documents/pulse-crm/supabase/migrations/`
- **pulse-crm source:** `~/Documents/pulse-crm/src/`
- **MCP specification:** https://modelcontextprotocol.io/specification/2025-11-25
- **MCP best practices:** https://mcp-best-practice.github.io/mcp-best-practice/
