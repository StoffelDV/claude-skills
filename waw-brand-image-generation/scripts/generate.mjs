#!/usr/bin/env node

import { GoogleGenAI } from "@google/genai";
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "fs";
import { join, dirname, basename } from "path";
import { fileURLToPath } from "url";

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

// Load a single image file from an absolute path as an inline data part
function loadImagePart(filePath) {
  if (!existsSync(filePath)) {
    console.error(`Warning: image not found at ${filePath}`);
    return null;
  }
  const data = readFileSync(filePath);
  const lower = filePath.toLowerCase();
  const mimeType = lower.endsWith(".png")
    ? "image/png"
    : lower.endsWith(".webp")
      ? "image/webp"
      : "image/jpeg";
  return {
    inlineData: {
      mimeType,
      data: data.toString("base64"),
    },
  };
}

// Load reference images from specified groups as base64 inline data parts
function loadReferenceImages(groups) {
  const parts = [];
  for (const group of groups.split(",")) {
    const groupDir = join(REFS_DIR, group.trim());
    if (!existsSync(groupDir)) {
      console.error(`Warning: reference group directory not found: ${groupDir}`);
      continue;
    }
    const files = readdirSync(groupDir).filter((f) =>
      /\.(png|jpg|jpeg|webp)$/i.test(f)
    );
    for (const file of files) {
      const filePath = join(groupDir, file);
      const data = readFileSync(filePath);
      const mimeType = file.endsWith(".png") ? "image/png" : "image/jpeg";
      parts.push({
        inlineData: {
          mimeType,
          data: data.toString("base64"),
        },
      });
    }
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

  // Load reference images from groups (if any)
  const groupRefParts = args.groups ? loadReferenceImages(args.groups) : [];
  if (args.groups && groupRefParts.length === 0) {
    console.error("Error: no reference images found for the specified groups");
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

  // Load extra reference images from absolute paths (if any)
  const extraRefParts = args.extraRefs
    .map((p) => loadImagePart(p))
    .filter(Boolean);

  const totalRefs = (basePart ? 1 : 0) + groupRefParts.length + extraRefParts.length;
  console.error(
    `Loaded ${totalRefs} image(s): ${basePart ? "1 base image, " : ""}${groupRefParts.length} from groups${args.groups ? ` (${args.groups})` : ""}, ${extraRefParts.length} extra refs`
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
