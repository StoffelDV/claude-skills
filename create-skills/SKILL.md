---
name: Claude Code Skill Builder
description: Create well-structured custom Skills for Claude Code: metadata, folder layout, resources, scripts, packaging, testing, and best practices.
dependencies: python>=3.8
---

# Claude Code Skill Builder

This Skill teaches you how to **create custom Skills for Claude Code** that are easy to trigger, easy to maintain, and safe to run.

Use this Skill when you want to:
- add repeatable workflows to Claude Code (checklists, standards, playbooks)
- package reference docs + templates + scripts into a reusable "mini toolkit"
- make Claude reliably invoke the right Skill at the right moment

---

## What a Skill is

A Skill is a **folder** that contains at minimum a `Skill.md` file.
Claude uses:
1) the **YAML metadata** at the top to decide *when to load it*
2) the **Markdown body** for instructions, examples, and links to extra files
3) optional **scripts/resources** for more advanced workflows

Keep Skills focused: one workflow per Skill.

---

## Required: `Skill.md` structure

Every `Skill.md` must start with YAML frontmatter:

```yaml
---
name: <Human-friendly name, max 64 chars>
description: <When to use it, max 200 chars. This is the trigger brain.>
dependencies: <optional, e.g. python>=3.8, pandas>=1.5.0>
---
```

### The 2 most important fields

* **name**: short and clear
* **description**: ultra-specific about *when to use it*
  If Claude doesn't trigger your Skill reliably, fix the description first.

---

## Recommended folder layout

```text
my-skill/
  Skill.md
  resources/
    (pdfs, images, brand assets, sample files)
  REFERENCE.md            (optional: extra info Claude can consult)
  templates/
    (starter templates, snippets)
  scripts/
    (python/js scripts Claude can run)
```

Notes:

* Put "big info" in `REFERENCE.md` instead of bloating `Skill.md`.
* Put reusable content in `templates/`.
* Put executable helpers in `scripts/`.

---

## Step-by-step: create a new Skill (fast, reliable)

### 1) Pick a narrow job

Good: "Generate release notes in our format"
Bad: "Help with everything in marketing"

Aim for something:

* repeatable
* check-listy
* has consistent inputs/outputs

### 2) Write the metadata first

Start with a description that answers:

**"When should Claude use this?"**

Bad description:

* "Help with docs"

Good description:

* "Write customer-facing release notes for WaW using our headings, tone, and changelog categories."

### 3) Add an overview + rules

In the body, include:

* what the Skill does
* when to apply it
* what NOT to do
* success criteria

### 4) Add examples (high leverage)

Include at least:

* one good input prompt
* one expected output shape

Examples make Claude behave like it has rails.

### 5) Add resources + references

If you mention a file, make sure it exists and the path is correct.

### 6) Add scripts only when needed

Start Markdown-only. Add scripts later if:

* you need transformation (CSV -> report)
* you need validation (linting, checking)
* you need automation (generate files, apply formatting)

---

## Copy/paste template for a new Skill.md

```markdown
---
name: <Skill Name>
description: <Use this when you need to...>
dependencies: <optional>
---

# <Skill Name>

## Overview
Explain the goal in 2–4 lines.

## When to use
- Bullet list of situations that should trigger this Skill.

## When NOT to use
- Bullet list of situations where this Skill is not appropriate.

## Inputs you need
- What Claude should ask for if missing (files, links, decisions, constraints).

## Process
1. Step-by-step instructions Claude should follow.
2. Keep steps short and unambiguous.
3. Include checks and acceptance criteria.

## Output format
Describe exact structure, headings, fields, etc.

## Examples
### Example prompt
> ...

### Example output (shape)
- Heading A
- Heading B
- etc.

## Resources
- `REFERENCE.md` (what it contains)
- `templates/...`
- `resources/...`
- `scripts/...`
```

---

## Adding resources (REFERENCE.md pattern)

Use `REFERENCE.md` for:

* long guidelines
* policies
* edge cases
* "only sometimes needed" info

In `Skill.md`, tell Claude when it should open `REFERENCE.md`, e.g.:

* "If the request is about invoices, consult REFERENCE.md section 'Invoicing rules'."

---

## Adding scripts (safe pattern)

Put scripts under `scripts/` and describe:

* what the script does
* inputs/outputs
* expected command
* failure handling

Example snippet you can adapt:

```markdown
## Scripts

### scripts/clean_csv.py
Use when you receive a CSV export with inconsistent columns.

**Input:** path to CSV  
**Output:** cleaned CSV + summary stats

**Command idea:** `python scripts/clean_csv.py input.csv --out cleaned.csv`
```

Security rule: **never hardcode secrets** (API keys, passwords). Use environment variables or secure connections.

---

## Packaging your Skill (zip rules)

When you zip, the **Skill folder must be the root of the ZIP**.

Correct:

```text
my-skill.zip
  my-skill/
    Skill.md
    resources/
```

Incorrect:

```text
my-skill.zip
  Skill.md
  resources/
```

Also: folder name should match the Skill name (keep it close, consistent).

---

## Testing checklist (before and after)

### Before uploading

* `description` clearly says *when to invoke*
* all referenced files exist
* examples are present
* instructions are not contradictory

### After enabling in Claude Code

Test with prompts in three buckets:

1. prompts that SHOULD trigger the Skill
2. prompts that should NOT trigger it
3. borderline prompts (to see what the description really does)

If it doesn't trigger:

* rewrite the description to be more specific
* add trigger phrases you actually use
* reduce ambiguity ("when writing X", "when converting Y", "when generating Z")

---

## Best practices (what actually works)

* **One workflow per Skill.** Small Skills compose better than one giant blob.
* **Descriptions are everything.** Treat them like a "router rule".
* **Prefer checklists + examples over essays.**
* **Progressive disclosure:** keep `Skill.md` short, move bulk to `REFERENCE.md`.
* **Iterate in small steps:** edit, test, adjust description, repeat.
* **Be explicit about output formats** (headings, JSON schema, tables, filenames).

---

## Common pitfalls (and fixes)

### Pitfall: Skill never triggers

Fix:

* make `description` concrete and scoped
* include "when you need to …" language
* avoid generic terms like "help", "assist", "support"

### Pitfall: Skill triggers too often

Fix:

* narrow the description
* add disqualifiers ("only for customer-facing", "only for iOS builds")

### Pitfall: Too much in one Skill

Fix:

* split into multiple Skills:

  * "Release Notes Writer"
  * "Changelog Classifier"
  * "QA Checklist Runner"

### Pitfall: Scripts feel risky

Fix:

* document exactly what gets executed
* validate inputs
* default to dry-run behavior
* never bake in secrets

---

## Quick "Skill quality score" (self-check)

Score each 0–2:

* Description is specific (0–2)
* Steps are unambiguous (0–2)
* Has examples (0–2)
* Has clear output format (0–2)
* Has safe boundaries + not-to-use (0–2)

10/10: ship it.
6–8/10: add examples + tighten description.
<6/10: scope is probably too broad.

---
