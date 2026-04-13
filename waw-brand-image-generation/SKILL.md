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

- Screenshots, mockups, or browser-based visual work
- Non-visual tasks

Note: this skill DOES support editing existing images via the `--base-image` flag (see step 4b — image-to-image editing). Use it when the user approves a layout but wants a specific element (typically Milo or a character) fixed — do not regenerate from scratch.

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

### 1b. MANDATORY: Use reference images for brand-critical content

**This is non-negotiable.** The moment a request involves any of the following, you MUST pass reference images to Gemini (either via `--groups`, `--extra-refs`, or `--base-image`):

- **Milo** — any appearance, any pose, any scene. Text descriptions drift off-model every single time. Always pass at least `milo-winking.png` (the canonical headset version) plus `milo-wedding-planner.png` and `milo-photographer.png` (for body shape, W mark, and character design).
- **Wedding professionals or wedding couples** — NEVER invent a new character. You MUST ALWAYS use one of the existing landing-page professionals from `resources/references/professionals/` as the `--base-image` and keep their pose, face, outfit, and character design pixel-for-pixel identical. See section 1c for the full rule.
- **The WaW logo or any branded UI** — always include the `brand` group so the logo and lockup are available.

Text-only descriptions of these subjects DO NOT WORK reliably. Gemini will hallucinate a generic robot, a stock wedding couple, or a made-up logo. It has happened repeatedly — do not assume "this time it'll be fine." If in doubt, pass MORE reference images, not fewer.

### 1c. MANDATORY: Always use existing professionals — NEVER invent new ones

**This is a hard rule.** The WaW landing page has a canonical cast of wedding professionals. Every image that contains a wedding/event professional MUST reuse one of these characters. Never generate a new face, new outfit, or a made-up vendor.

The canonical professionals live in `resources/references/professionals/` and map 1:1 to the landing page carousel:

| Role | Reference file |
|------|----------------|
| Photographer | `professional-photographer.png` |
| DJ | `professional-dj.png` |
| Caterer | `professional-caterer.png` |
| Videographer | `professional-videographer.png` |
| Musician | `professional-musician.png` |
| Officiant | `professional-officiant.png` |
| Florist | `professional-florist.png` |
| Wedding planner | `professional-planner.png` |
| Makeup artist | `professional-makeup-artist.png` |
| Entertainer | `professional-entertainer.png` |
| Baker | `professional-baker.png` |
| Hairstylist | `professional-hairstylist.png` |
| Photobooth | `professional-photobooth.png` |

Absolute path pattern: `/Users/stoffeldevidts/Documents/claude-skills/waw-brand-image-generation/resources/references/professionals/professional-<role>.png`

**How to use them:**
1. Pick the professional whose role matches the request. If the user says "a professional" without specifying, default to `professional-photographer.png`.
2. Pass that file as `--base-image` (NOT as `--groups professionals`). The base-image flag locks the character's pose, outfit, face, hair, and body shape.
3. Write the prompt as an EDIT instruction: "keep the professional's pose, outfit, face, hair, and character design pixel-for-pixel identical to the base image; only change the background / framing / lighting."
4. If you need extra likeness lock or want to show multiple professionals in one scene, also pass additional professional files via `--extra-refs`.

Only fall back to `--groups professionals` for purely stylistic guidance when the character itself doesn't matter (extremely rare). The default is always `--base-image`.

### 1d. The WaW Studio — canonical default environment

WaW has a canonical studio environment: a rich deep teal draped fabric curtain backdrop with a glowing mint-green neon WaW logo sign mounted on the back wall, cinematic studio lighting, shallow depth of field. This is the default scene for EVERY generated image unless the user explicitly requests a different setting (e.g. outdoor venue, wedding reception, real location).

The canonical studio reference lives at:
`/Users/stoffeldevidts/Documents/claude-skills/waw-brand-image-generation/resources/references/brand/waw-studio.png`

**How to use the studio:**
- For professional portraits and character scenes: pass the professional as `--base-image` and `waw-studio.png` via `--extra-refs`. In the prompt, say "replace the background with the studio from reference image 2 — the deep teal curtain and glowing mint-green neon WaW logo sign."
- For Milo scenes: pass Milo references via `--base-image`/`--extra-refs` and include the studio in `--extra-refs`. The studio is the room Milo lives in.
- For brand/marketing visuals without characters: describe the studio explicitly in the prompt AND pass `waw-studio.png` via `--extra-refs`.
- Always keep the neon WaW logo sign softly visible (out of focus in the background is fine — in focus for brand shots). The sign is a key brand anchor.
- Always apply shallow depth of field so the subject is sharp and the curtain+neon are soft bokeh.

The only valid reasons to skip the studio: the user asks for an outdoor scene, a specific real-world venue, a flat graphic/logo composition, or a non-environmental illustration.

**When group-based references are not enough** (e.g. the user rejected a previous attempt because Milo/a character looks wrong):
- Switch to image-to-image editing mode: use `--base-image <path>` pointing to the most recent approved layout, plus `--extra-refs <path1,path2,path3>` listing the best character references by absolute path.
- Write the prompt as an EDIT instruction ("keep everything in the base image identical, only replace the robot in the right tile with the exact Milo from reference images 2, 3, 4"), not as a from-scratch description.
- This is how you fix "Milo doesn't look like Milo" problems without losing the rest of the composition.

### 2. Choose output settings

| Setting | Default | When to change |
|---------|---------|----------------|
| Aspect ratio | `1:1` | User specifies landscape (`16:9`), portrait (`9:16`), social media (`4:5`), etc. |
| Size | `2K` | Only use `4K` if user explicitly asks for it. Use `1K` or `512` for quick drafts. |

### 3. Enhance the prompt

Never pass the user's raw prompt directly to the script. Always enhance it with brand context.

**ESSENTIAL RULE 1 — Minimalism above all:** Every image must contain ONLY the elements that are essential to communicate the concept. Nothing decorative, nothing "nice to have." No floating icons, no sparkles, no extra props, no background clutter, no unnecessary environmental details. If an element does not directly serve the core message of the image, leave it out. When in doubt, remove it. A clean, focused image with 2-3 key elements is always better than a busy scene with 10.

Before finalizing any prompt, review it and strip out:
- Floating UI elements, icons, cards, or sparkle effects
- Decorative plants, shelves, books, or background objects
- Extra props that don't serve the core concept
- Atmospheric filler ("surrounded by", "with various", "featuring multiple")

**ESSENTIAL RULE 2 — Brand colors in every pixel:** Every image must immediately feel like WaW. The brand color palette MUST dominate the entire image, including backgrounds. Never use random beige, cream, grey, or off-white backgrounds. The image should breathe our brand identity at first glance.

WaW brand palette (use these throughout):
- Deep teal: `#034b56` (primary, backgrounds, strong accents)
- Mint green: `#3ecf88` (accents, highlights)
- Light mint: `#a5f0c5` (soft accents, gradients)
- Amber/gold: `#fbae17` (warm accent, sparingly)
- White: `#ffffff` (cards, contrast elements only)

Background rules:
- **Default environment: the WaW Studio** — the canonical scene described in section 1d. A rich deep teal draped fabric curtain backdrop with a glowing mint-green neon WaW logo sign on the back wall, cinematic studio lighting, shallow depth of field. This is the default for ALL images unless there is a strong reason not to use it (e.g. the scene specifically requires an outdoor environment, a real venue, or a flat graphic). Pass `waw-studio.png` via `--extra-refs` whenever the studio appears.
- If a scene requires a surface (desk, table), keep the studio curtain and neon sign as the backdrop behind it.
- The overall color impression of every generated image should be teal/green, matching our app and website.
- NEVER use plain beige, cream, grey, or light mint as a full background. The WaW Studio is the standard.
- **Depth of field:** Always apply a shallow depth of field / bokeh effect. The subject in the foreground must be sharp and in focus, the curtain and neon sign in the background must be soft and blurry. This creates a professional, cinematic look.

Color nuance:
- The brand palette sets the OVERALL tone of the image, not every single pixel. Characters, objects, and props can use natural colors (black mouths, brown wood, white paper, etc.) where it makes sense. The brand colors dominate the background, accents, and general atmosphere — not the anatomy of characters.

Every prompt MUST include this color+environment directive at the end (before the "Matching..." line):
> "The entire color palette must use the WaW brand colors: deep teal (#034b56), mint green (#3ecf88), light mint (#a5f0c5), and amber (#fbae17). The background must be the WaW Studio — a rich deep teal draped fabric curtain backdrop with a glowing mint-green neon WaW logo sign on the back wall, soft cinematic studio lighting, shallow depth of field. Never beige, cream, or grey."

**For professional portraits** (any wedding/event professional):

ALWAYS use image-to-image editing. Pass the landing-page professional as `--base-image` and the studio as `--extra-refs`. See section 1c for the file list.

> "I am providing a BASE IMAGE (reference image 1) showing a [role] from the WaW landing page, and a REFERENCE IMAGE (reference image 2) showing the WaW Studio — a deep teal draped curtain backdrop with a glowing mint-green neon WaW logo sign. Keep the professional's pose, outfit, face, hair, skin tone, body shape, and character design pixel-for-pixel identical to the base image. Do not redraw them, do not restyle them, do not change their proportions. The ONLY change: [user's change — e.g. replace the background with the studio, crop as a profile picture, add specific lighting]. The subject should be sharply in focus in the foreground; the studio background softly out of focus with cinematic shallow depth of field bokeh. The neon WaW logo sign should cast a subtle mint-green rim light on the subject to integrate them with the environment. The entire color palette must use the WaW brand colors: deep teal (#034b56), mint green (#3ecf88), light mint (#a5f0c5), and amber (#fbae17). Matching the visual style of the reference images."

Only use the `professionals` group (without a base image) for purely stylistic guidance when the specific character does not matter — extremely rare. Default is always `--base-image <professional-file>`.

**For `milo` requests** (mascot variations):

Milo has two visual modes — choose the right one:

| Mode | When to use | Headset? |
|------|-------------|----------|
| **Assistant mode** | Milo acting as the WaW AI assistant (helping, chatting, guiding) | Yes — green headset with microphone |
| **Costume/situation mode** | Milo dressed up as a profession, in a funny scene, or any non-assistant context | No headset — remove it entirely |

**Assistant mode** (Milo as AI helper):
> "Stylized 3D-rendered illustration of the character shown in the reference images — a friendly teal robot mascot with a round body, big expressive eyes, green headset with microphone, and the WaW logo on its chest. Smooth soft-matte material finish. [user's description]. Only the essential elements, nothing decorative or extra. Clean minimal composition, no floating icons, no sparkles, no unnecessary background objects. The entire color palette must use the WaW brand colors: deep teal (#034b56), mint green (#3ecf88), light mint (#a5f0c5), and amber (#fbae17). The background must be the WaW Studio — a rich deep teal draped fabric curtain backdrop with a glowing mint-green neon WaW logo sign on the back wall, soft cinematic studio lighting, shallow depth of field. Never beige, cream, or grey. Matching the exact character design, proportions, and material style of the reference images"

**Costume/situation mode** (Milo in costumes, scenes, or roles):
> "Stylized 3D-rendered illustration of the character shown in the reference images — a friendly teal robot mascot with a round body, big expressive eyes, and the WaW logo on its chest. No headset, no microphone — the character is NOT wearing any headset or headphones. Smooth soft-matte material finish. [user's description]. Only the essential elements, nothing decorative or extra. Clean minimal composition, no floating icons, no sparkles, no unnecessary background objects. The entire color palette must use the WaW brand colors: deep teal (#034b56), mint green (#3ecf88), light mint (#a5f0c5), and amber (#fbae17). The background must be the WaW Studio — a rich deep teal draped fabric curtain backdrop with a glowing mint-green neon WaW logo sign on the back wall, soft cinematic studio lighting, shallow depth of field. Never beige, cream, or grey. Matching the exact character design, proportions, and material style of the reference images"

Milo scenes should also pass `waw-studio.png` via `--extra-refs` so the environment stays on-model.

**For `brand` requests** (logos/marketing):
> "Clean, professional brand visual: [user's description]. Only the essential elements, nothing decorative or extra. The entire color palette must use the WaW brand colors: deep teal (#034b56), mint green (#3ecf88), light mint (#a5f0c5), and amber (#fbae17). The background must be the WaW Studio — a rich deep teal draped fabric curtain backdrop with a glowing mint-green neon WaW logo sign on the back wall, soft cinematic studio lighting, shallow depth of field. Never beige, cream, or grey. Calm and confident aesthetic, minimal composition. Matching the visual style of the reference images"

### 4. Run the script

**Important:** The `GEMINI_API_KEY` is defined in `~/.zshrc` but Claude Code's Bash tool does not source shell profiles automatically. Always prefix the command with `source ~/.zshrc 2>/dev/null;` to load the key.

```bash
source ~/.zshrc 2>/dev/null; node /Users/stoffeldevidts/Documents/claude-skills/waw-brand-image-generation/scripts/generate.mjs \
  --prompt "<enhanced prompt>" \
  --groups "<group1,group2>" \
  --aspect-ratio "<ratio>" \
  --size "<size>"
```

**CLI flags:**

| Flag | Required | Description |
|------|----------|-------------|
| `--prompt` | Yes | The enhanced prompt (always include brand/color directives) |
| `--groups` | Yes* | Comma-separated reference groups: `brand`, `professionals`, `milo` |
| `--aspect-ratio` | No | `1:1` (default), `16:9`, `9:16`, `4:3`, `4:5` etc. |
| `--size` | No | `512`, `1K`, `2K` (default), `4K` |
| `--base-image` | No | Absolute path to an existing image to EDIT (image-to-image mode). When set, `--groups` becomes optional. |
| `--extra-refs` | No | Comma-separated absolute paths to additional reference images beyond the groups. Use this to pass extra Milo/character references inline. |

\* Either `--groups` OR `--base-image` must be provided.

### 4b. Image-to-image editing (for fixing a single element)

Use this when the user approves the overall composition but rejects a specific element (most commonly: "Milo doesn't look like Milo" or "that character looks wrong"). Do NOT regenerate from scratch — you'll lose the rest of the layout.

```bash
source ~/.zshrc 2>/dev/null; node /Users/stoffeldevidts/Documents/claude-skills/waw-brand-image-generation/scripts/generate.mjs \
  --prompt "I am providing a BASE IMAGE and REFERENCE IMAGES. Keep everything in the base image identical — layout, composition, background, other characters, lighting. The ONLY change: in [specific region of the base image], replace [what's wrong] with the exact character shown in reference images 2, 3, 4. Match the reference images pixel-for-pixel — do not invent new proportions or features." \
  --base-image "/Users/stoffeldevidts/Documents/waw-generated-images/<previous-approved-layout>.png" \
  --extra-refs "/path/to/ref1.png,/path/to/ref2.png,/path/to/ref3.png" \
  --aspect-ratio "4:3" \
  --size "2K"
```

Rules for image-to-image editing:
- Put the base image FIRST (the script handles this automatically when `--base-image` is set).
- Pass 2-4 direct character references via `--extra-refs` — more references = better likeness lock.
- Write the prompt as an EDIT instruction, not a from-scratch description. Say "keep everything identical, only change X" explicitly.
- Reference the images by number in the prompt ("reference images 2, 3, 4") so Gemini knows which inputs are which.
- For Milo: always include `milo-winking.png` (for the headset) + `milo-wedding-planner.png` + `milo-photographer.png` (for canonical body/face/W mark).

### 5. Present the result and ask for approval

The script prints the absolute file path to stdout. Present it as a clickable download link and **always ask for approval before proceeding**:

> Image saved to: [filename.png](/Users/stoffeldevidts/Documents/waw-generated-images/filename.png)
>
> Are you happy with this result, or would you like me to regenerate?

**Do not proceed to step 6 until the user explicitly approves the image.** If rejected, adjust the prompt based on feedback and go back to step 4.

### 6. Upload approved image to Canva

Once the user approves the image, **always** upload it to Canva. This is non-optional unless the user explicitly says not to.

**Default Canva folder:** `WaW Generated Images` (folder ID: `FAHFtiGD4SM`)
Use a different folder only if the user explicitly specifies one.

#### Key constraints (learned from testing)

- Canva's upload API requires **HTTPS** URLs. Plain `http://localhost` will be rejected.
- `npx localtunnel` provides a free HTTPS tunnel with no install needed, but takes ~3 seconds to start.
- Shell state (PIDs, variables) does NOT persist between Bash tool calls. Capture everything in a single command.
- MCP connections can drop transiently (`MCP error -32000: connection lost`). Always retry once on this error.
- The asset ID needed for `move-item-to-folder` is at `job.asset.id` in the upload response.

#### Upload flow

**Step 6a. Start servers (single Bash call to preserve PIDs):**
```bash
cd /Users/stoffeldevidts/Documents/waw-generated-images && python3 -m http.server 8765 &
echo "HTTP_PID: $!"
```

Then in a second call (localtunnel needs its own process):
```bash
npx localtunnel --port 8765 &
echo "LT_PID: $!"
sleep 3
```
Localtunnel prints `your url is: https://<words>.loca.lt` to stdout. Parse this URL for step 6c.

**Step 6b. Resolve the target folder:**
- Use the known folder ID `FAHFtiGD4SM` directly (this folder already exists)
- Only search/create if the known ID fails or the user specifies a different folder name
- To search: `mcp__claude_ai_Canva__search-folders` with query `WaW Generated Images`
- To create: `mcp__claude_ai_Canva__create-folder` with name `WaW Generated Images`, `parent_folder_id: "root"`

**Step 6c. Upload the asset:**
Use `mcp__claude_ai_Canva__upload-asset-from-url`:
- `url`: `https://<tunnel-subdomain>.loca.lt/<filename>` (the HTTPS tunnel URL + filename from the generate script output)
- `name`: a **descriptive, human-readable name** based on what was generated (e.g., "Milo as photographer", "Wedding DJ - 3D portrait", "WaW social media banner"). Do NOT use the raw filename.
- `user_intent`: brief description of why the upload is happening

**Step 6d. Move to folder:**
Use `mcp__claude_ai_Canva__move-item-to-folder`:
- `item_id`: the asset ID from the upload response (`job.asset.id`, format: `MAxxxxxxx`)
- `to_folder_id`: `FAHFtiGD4SM` (or the resolved folder ID from step 6b)

**Step 6e. Clean up:**
```bash
kill <HTTP_PID> <LT_PID> 2>/dev/null
```
Use the actual PID numbers captured in step 6a (shell variables won't persist).

**Step 6f. Confirm:**
> Uploaded to Canva in the "WaW Generated Images" folder.

#### Batch uploads (multiple images)

When uploading multiple images in one session:
- Upload up to 5 images in parallel (more causes rate limit issues)
- Move all uploaded assets to the folder in a parallel batch after each upload batch completes
- Only start one HTTP server + tunnel for the entire batch (reuse across all uploads)
- Clean up servers only after ALL uploads and moves are done

### 7. Handle errors

**Generation script fails:**
- Show the error message
- Suggest adjustments: simpler prompt, different aspect ratio, or fewer reference groups
- If `GEMINI_API_KEY` is missing, tell the user to set it: `export GEMINI_API_KEY="your-key"` (get one at https://aistudio.google.com/apikey)

**Canva upload fails:**
- `MCP error -32000: connection lost` → retry the exact same call once. This is a transient MCP proxy error.
- `Missing scopes: [asset:write]` → tell the user to disconnect and reconnect the Canva connector in Claude settings to get a fresh access token.
- `'url' provided is not using HTTPS` → the tunnel is not running or the URL is wrong. Check the localtunnel process.
- Port 8765 already in use → `lsof -i :8765` to find the blocker, kill it, or use a different port (8766, 8767, etc.)
- Folder creation fails → upload to root and inform the user.

## Environment requirements

- `GEMINI_API_KEY` is set in `~/.zshrc`. Since Claude Code's Bash tool does not auto-source shell profiles, always run `source ~/.zshrc 2>/dev/null;` before the generate script. Do NOT ask the user to set this key — it is already configured.
- Node.js must be available
- Dependencies installed: `cd scripts && npm install`
- Canva MCP connector must be connected in Claude settings (for upload step)
