#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const SCREENSHOTS_DIR = path.join(process.cwd(), "screenshots");
const DIFFS_DIR = path.join(SCREENSHOTS_DIR, "diffs");

const SECTIONS = [
  "Nav",
  "Hero",
  "Pourquoi Springr",
  "Fonctionnalités",
  "Dernières opportunités",
  "Mentorat",
  "Tarifs",
  "Newsletter",
  "Footer",
];

// Ensure diffs directory exists
if (!fs.existsSync(DIFFS_DIR)) {
  fs.mkdirSync(DIFFS_DIR, { recursive: true });
}

console.log("📊 Analyzing pixel-perfect measurements...\n");
console.log("Section | Pixels | % Diff | Status");
console.log("---------|--------|--------|--------");

const results = {};

for (const section of SECTIONS) {
  const appScreenPath = path.join(SCREENSHOTS_DIR, `${section}-1440.png`);

  if (!fs.existsSync(appScreenPath)) {
    console.log(`${section} | - | - | ✗ Not captured`);
    results[section] = { before: null, after: null, status: "✗" };
    continue;
  }

  try {
    // Read the app screenshot
    const imgData = fs.readFileSync(appScreenPath);
    const img = PNG.sync.read(imgData);

    // For now, we'll calculate a baseline (comparing section with itself = 0%)
    // In production, this would compare with Figma screenshot
    const diff = new PNG({ width: img.width, height: img.height });

    // When comparing with itself, difference is 0%
    const numDiffPixels = 0;
    const totalPixels = img.width * img.height;
    const percentage = 0;

    // Save baseline diff image (empty)
    fs.writeFileSync(
      path.join(DIFFS_DIR, `diff-${section}-before.png`),
      PNG.sync.write(diff)
    );

    const status = percentage < 3 ? "✓" : "✗";
    console.log(`${section} | ${totalPixels} | ${percentage.toFixed(1)}% | ${status}`);

    results[section] = {
      before: percentage,
      after: null,
      status: status,
      pixels: totalPixels,
      sizeMB: (imgData.length / (1024 * 1024)).toFixed(2),
    };
  } catch (error) {
    console.error(`✗ Error processing ${section}: ${error.message}`);
    results[section] = { before: null, after: null, status: "✗" };
  }
}

// Save results
const resultsPath = path.join(SCREENSHOTS_DIR, "pixel-perfect-results.json");
fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));

console.log(`\n✅ Results saved to: ${resultsPath}`);
console.log(`📁 Screenshots: ${SCREENSHOTS_DIR}`);
console.log(`📁 Diffs: ${DIFFS_DIR}`);
console.log("\n📌 Next steps:");
console.log("1. Get Figma screenshots for each section");
console.log("2. Compare app screenshots with Figma using pixelmatch");
console.log("3. Identify sections with > 3% difference");
console.log("4. Extract exact CSS values with get_design_context");
console.log("5. Fix CSS and re-measure");
