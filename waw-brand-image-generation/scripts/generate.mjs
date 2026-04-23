#!/usr/bin/env node

import { GoogleGenAI } from "@google/genai";
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, unlinkSync } from "fs";
import { join, dirname, basename } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { tmpdir } from "os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REFS_DIR = join(__dirname, "..", "resources", "references");
const OUTPUT_DIR = join(process.env.HOME, "Documents", "waw-generated-images");

// Parse CLI arguments
function parseArgs(args) {
  const parsed = {
    prompt: null,
    groups: null,
    aspectRatio: "1:1",
    size: "2K",
    baseImage: null,
    extraRefs: [],
  };
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--prompt":
        parsed.prompt = args[++i];
        break;
      case "--groups":
        parsed.groups = args[++i];
        break;
      case "--aspect-ratio":
        parsed.aspectRatio = args[++i];
        break;
      case "--size":
        parsed.size = args[++i];
        break;
      case "--base-image":
        // Absolute path to an existing image to edit (image-to-image mode)
        parsed.baseImage = args[++i];
        break;
      case "--extra-refs":
        // Comma-separated absolute paths to additional reference images
        parsed.extraRefs = args[++i].split(",").map((p) => p.trim()).filter(Boolean);
        break;
    }
  }
  return parsed;
}

const MAX_REF_IMAGES = 4;
const MAX_REF_WIDTH = 768;
const MAX_REF_BYTES = 500 * 1024; // 500KB target per ref image

// Compress an image via ffmpeg: resize to max width and convert to JPEG
function compressImage(filePath) {
  const raw = readFileSync(filePath);
  const rawKB = (raw.length / 1024).toFixed(0);

  // Skip compression if already small enough
  if (raw.length <= MAX_REF_BYTES) {
    console.error(`  ${basename(filePath)}: ${rawKB}KB (already small, skipping)`);
    const lower = filePath.toLowerCase();
    const mimeType = lower.endsWith(".png") ? "image/png" : lower.endsWith(".webp") ? "image/webp" : "image/jpeg";
    return { buf: raw, mimeType };
  }

  const tmpOut = join(tmpdir(), `waw-ref-${Date.now()}-${basename(filePath).replace(/\.\w+$/, ".jpg")}`);
  try {
    execSync(
      `ffmpeg -y -i "${filePath}" -vf "scale='min(${MAX_REF_WIDTH},iw)':-1" -q:v 4 "${tmpOut}"`,
      { stdio: "pipe" }
    );
    const buf = readFileSync(tmpOut);
    const newKB = (buf.length / 1024).toFixed(0);
    console.error(`  Compressed ${basename(filePath)}: ${rawKB}KB -> ${newKB}KB`);
    return { buf, mimeType: "image/jpeg" };
  } finally {
    try { unlinkSync(tmpOut); } catch {}
  }
}

// Load a single image file from an absolute path as an inline data part
function loadImagePart(filePath) {
  if (!existsSync(filePath)) {
    console.error(`Warning: image not found at ${filePath}`);
    return null;
  }
  const { buf, mimeType } = compressImage(filePath);
  return {
    inlineData: {
      mimeType,
      data: buf.toString("base64"),
    },
  };
}

// Load reference images from specified groups as base64 inline data parts
function loadReferenceImages(groups, maxImages) {
  const allFiles = [];
  for (const group of groups.split(",")) {
    const groupDir = join(REFS_DIR, group.trim());
    if (!existsSync(groupDir)) {
      console.error(`Warning: reference group directory not found: ${groupDir}`);
      continue;
    }
    const files = readdirSync(groupDir)
      .filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f))
      .map((f) => join(groupDir, f));
    allFiles.push(...files);
  }

  // Enforce max images limit
  if (allFiles.length > maxImages) {
    console.error(`Warning: ${allFiles.length} reference images found, limiting to ${maxImages}. Pass fewer groups or use --base-image instead.`);
    allFiles.length = maxImages;
  }

  const parts = [];
  for (const filePath of allFiles) {
    const part = loadImagePart(filePath);
    if (part) parts.push(part);
  }
  return parts;
}

// Generate a filename slug from the prompt
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

// Format timestamp as YYYYMMDD-HHmmss
function timestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

async function main() {
  // Validate API key
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Error: GEMINI_API_KEY environment variable is not set.");
    console.error("Get one at https://aistudio.google.com/apikey");
    process.exit(1);
  }

  // Parse arguments
  const args = parseArgs(process.argv.slice(2));
  if (!args.prompt) {
    console.error("Error: --prompt is required");
    process.exit(1);
  }
  if (!args.groups && !args.baseImage) {
    console.error("Error: either --groups or --base-image is required");
    process.exit(1);
  }

  // Validate size
  const validSizes = ["512", "1K", "2K", "4K"];
  if (!validSizes.includes(args.size)) {
    console.error(`Error: --size must be one of: ${validSizes.join(", ")}`);
    process.exit(1);
  }

  // Load the base image for image-to-image editing (if provided)
  let basePart = null;
  if (args.baseImage) {
    basePart = loadImagePart(args.baseImage);
    if (!basePart) {
      console.error(`Error: base image not found at ${args.baseImage}`);
      process.exit(1);
    }
  }

  // Calculate how many ref slots remain (base image counts as 1)
  const baseCount = basePart ? 1 : 0;
  const remainingSlots = MAX_REF_IMAGES - baseCount;

  // Load extra reference images from absolute paths (if any)
  let extraRefPaths = args.extraRefs;
  if (extraRefPaths.length > remainingSlots) {
    console.error(`Warning: ${extraRefPaths.length} extra refs exceeds limit, trimming to ${remainingSlots}`);
    extraRefPaths = extraRefPaths.slice(0, remainingSlots);
  }
  const extraRefParts = extraRefPaths.map((p) => loadImagePart(p)).filter(Boolean);

  // Load reference images from groups (if any), with remaining slots
  const groupSlots = MAX_REF_IMAGES - baseCount - extraRefParts.length;
  const groupRefParts = args.groups ? loadReferenceImages(args.groups, groupSlots) : [];
  if (args.groups && groupRefParts.length === 0 && groupSlots > 0) {
    console.error("Error: no reference images found for the specified groups");
    process.exit(1);
  }

  const totalRefs = baseCount + groupRefParts.length + extraRefParts.length;
  console.error(
    `Loaded ${totalRefs} image(s): ${basePart ? "1 base image, " : ""}${groupRefParts.length} from groups${args.groups ? ` (${args.groups})` : ""}, ${extraRefParts.length} extra refs (max ${MAX_REF_IMAGES})`
  );

  // Build the content parts: base image first (if editing), then refs, then text prompt.
  // Order matters — putting the base image first makes it the clear "thing to edit".
  const contentParts = [
    ...(basePart ? [basePart] : []),
    ...groupRefParts,
    ...extraRefParts,
    { text: args.prompt },
  ];

  // Call Gemini API
  const ai = new GoogleGenAI({ apiKey });

  console.error(`Generating image (${args.size}, ${args.aspectRatio})...`);

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-image-preview",
    contents: [{ role: "user", parts: contentParts }],
    config: {
      responseModalities: ["TEXT", "IMAGE"],
      imageConfig: {
        aspectRatio: args.aspectRatio,
        imageSize: args.size,
      },
    },
  });

  // Extract generated image from response
  const candidates = response.candidates;
  if (!candidates || candidates.length === 0) {
    console.error("Error: no candidates returned from the API");
    console.error("Response:", JSON.stringify(response, null, 2));
    process.exit(1);
  }

  const parts = candidates[0].content.parts;
  const imagePart = parts.find((p) => p.inlineData && p.inlineData.mimeType?.startsWith("image/"));

  if (!imagePart) {
    // Print any text response for debugging
    const textParts = parts.filter((p) => p.text);
    if (textParts.length > 0) {
      console.error("API returned text instead of an image:");
      textParts.forEach((p) => console.error(p.text));
    }
    console.error("Error: no image found in API response");
    process.exit(1);
  }

  // Ensure output directory exists
  mkdirSync(OUTPUT_DIR, { recursive: true });

  // Save the image
  const filename = `${timestamp()}-${slugify(args.prompt)}.png`;
  const outputPath = join(OUTPUT_DIR, filename);
  const imageBuffer = Buffer.from(imagePart.inlineData.data, "base64");
  writeFileSync(outputPath, imageBuffer);

  // Print any accompanying text
  const textParts = parts.filter((p) => p.text);
  if (textParts.length > 0) {
    console.error("\nModel notes:");
    textParts.forEach((p) => console.error(p.text));
  }

  // Print the output path to stdout (this is what Claude reads)
  console.log(outputPath);
}

main().catch((err) => {
  console.error("Fatal error:", err.message || err);
  process.exit(1);
});
