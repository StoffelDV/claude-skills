---
name: waw-brand-image-generation
description: Use when the user asks to generate, create, or make an image, illustration, graphic, or visual for WaW. Calls Google Gemini with brand reference images to produce on-brand visuals.
---

# WaW Brand Image Generation

Generate brand-consistent images for Without a Worry using Google's `gemini-3-pro-image-preview` model with reference images for style consistency.

## When to use

- User asks to generate/create/make an image, illustration, or graphic
- User asks for a new Milo pose or variation
- User asks for marketing visuals, social media assets, or UI illustrations
- User asks for a brand-consistent visual of any kind

## When NOT to use

- Editing or modifying an existing image (this skill generates new images only)
- Screenshots, mockups, or browser-based visual work
- Non-visual tasks

## Process

### 1. Classify the request

Determine which reference image group(s) match the request:

| Group | Use when the request involves... |
|-------|----------------------------------|
| `brand` | Logos, branded visuals, marketing materials, social media graphics, anything needing the WaW logo or brand identity |
| `professionals` | Illustrations of people — wedding photographers, DJs, caterers, officiants, musicians, event planners, any wedding/event professional |
| `milo` | Milo the mascot in any context — new poses, expressions, scenes, variations |

Multiple groups can be combined (comma-separated). For example, "Milo holding the WaW logo" → `milo,brand`.

If the request doesn't clearly fit any group, default to `professionals` for people/scenes or `brand` for abstract/marketing visuals.

### 2. Choose output settings

| Setting | Default | When to change |
|---------|---------|----------------|
| Aspect ratio | `1:1` | User specifies landscape (`16:9`), portrait (`9:16`), social media (`4:5`), etc. |
| Size | `2K` | Only use `4K` if user explicitly asks for it. Use `1K` or `512` for quick drafts. |

### 3. Enhance the prompt

Never pass the user's raw prompt directly to the script. Always enhance it with brand context.

**For `professionals` requests** (people/scenes):
> "3D Pixar-style illustration of [user's description], warm golden hour lighting, soft depth of field, friendly and approachable character design, rounded expressive features, teal and green color accents where appropriate, matching the visual style of the reference images"

**For `milo` requests** (mascot variations):
> "3D rendered illustration of the character shown in the reference images — a friendly teal robot mascot with a round body, big expressive eyes, green headset with microphone, and the WaW logo on its chest. [user's description]. Matching the exact character design, proportions, and material style of the reference images"

**For `brand` requests** (logos/marketing):
> "Clean, professional brand visual: [user's description]. Deep teal (#034b56) and green (#3ecf88, #a5f0c5) color palette, calm and confident aesthetic, matching the visual style of the reference images"

### 4. Run the script

```bash
node /Users/stoffeldevidts/Documents/claude-skills/waw-brand-image-generation/scripts/generate.mjs \
  --prompt "<enhanced prompt>" \
  --groups "<group1,group2>" \
  --aspect-ratio "<ratio>" \
  --size "<size>"
```

### 5. Present the result

The script prints the absolute file path to stdout. Present it as a clickable download link:

> Image saved to: [filename.png](/Users/stoffeldevidts/Documents/waw-generated-images/filename.png)

### 6. Handle errors

If the script fails:
- Show the error message
- Suggest adjustments: simpler prompt, different aspect ratio, or fewer reference groups
- If `GEMINI_API_KEY` is missing, tell the user to set it: `export GEMINI_API_KEY="your-key"` (get one at https://aistudio.google.com/apikey)

## Environment requirements

- `GEMINI_API_KEY` environment variable must be set
- Node.js must be available
- Dependencies installed: `cd scripts && npm install`
