#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const SCREENSHOTS_DIR = path.join(process.cwd(), "screenshots");
const DIFFS_DIR = path.join(SCREENSHOTS_DIR, "diffs");
const FIGMA_DIR = path.join(SCREENSHOTS_DIR, "figma");

// Ensure directories exist
[SCREENSHOTS_DIR, DIFFS_DIR, FIGMA_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const SECTIONS = {
  Nav: { nodeId: "3:721", selector: "nav, header" },
  Hero: { nodeId: "3:3", selector: '[data-node-id="3:3"]' },
  "Pourquoi Springr": { nodeId: "3:128", selector: '[data-node-id="3:128"]' },
  Fonctionnalités: { nodeId: "3:166", selector: '[data-node-id="3:166"]' },
  "Dernières opportunités": { nodeId: "3:395", selector: '[data-node-id="3:395"]' },
  Mentorat: { nodeId: "3:556", selector: '[data-node-id="3:556"]' },
  Tarifs: { nodeId: "3:622", selector: '[data-node-id="3:622"]' },
  Newsletter: { nodeId: "3:704", selector: '[data-node-id="3:704"]' },
  Footer: { nodeId: "3:480", selector: "footer" },
};

function compareTwoImages(img1Path, img2Path, sectionName) {
  try {
    if (!fs.existsSync(img1Path) || !fs.existsSync(img2Path)) {
      return null;
    }

    const img1data = fs.readFileSync(img1Path);
    const img2data = fs.readFileSync(img2Path);

    const img1 = PNG.sync.read(img1data);
    const img2 = PNG.sync.read(img2data);

    // Use the smaller dimensions for both images
    const width = Math.min(img1.width, img2.width);
    const height = Math.min(img1.height, img2.height);

    const diff = new PNG({ width, height });

    // Only compare the overlapping region
    let pixelsDiff = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx1 = (img1.width * y + x) << 2;
        const idx2 = (img2.width * y + x) << 2;

        // Simple pixel diff: if any channel is different
        if (img1.data[idx1] !== img2.data[idx2] ||
            img1.data[idx1 + 1] !== img2.data[idx2 + 1] ||
            img1.data[idx1 + 2] !== img2.data[idx2 + 2] ||
            img1.data[idx1 + 3] !== img2.data[idx2 + 3]) {
          pixelsDiff++;

          // Draw diff pixel
          const diffIdx = (width * y + x) << 2;
          diff.data[diffIdx] = 255;
          diff.data[diffIdx + 1] = 0;
          diff.data[diffIdx + 2] = 0;
          diff.data[diffIdx + 3] = 128;
        }
      }
    }

    const totalPixels = width * height;
    const percentage = (pixelsDiff / totalPixels) * 100;

    // Save diff image
    const diffPath = path.join(DIFFS_DIR, `diff-${sectionName}-comparison.png`);
    fs.writeFileSync(diffPath, PNG.sync.write(diff));

    return {
      percentage: percentage.toFixed(2),
      pixels: pixelsDiff,
      total: totalPixels,
      width,
      height,
      diffPath,
    };
  } catch (error) {
    console.error(`Error comparing ${sectionName}:`, error.message);
    return null;
  }
}

// Generate report with current app screenshots
console.log("📊 PIXEL-PERFECT MEASUREMENT REPORT\n");
console.log("===================================\n");

console.log("📸 Current App Screenshots Status:\n");
console.log("| Section | Size | Status |");
console.log("|---------|------|--------|");

const results = {};

for (const [section, config] of Object.entries(SECTIONS)) {
  const appScreenPath = path.join(SCREENSHOTS_DIR, `${section}-1440.png`);

  if (fs.existsSync(appScreenPath)) {
    const stats = fs.statSync(appScreenPath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`| ${section} | ${sizeMB} MB | ✓ |`);
    results[section] = {
      nodeid: config.nodeId,
      before: 0,
      after: null,
      status: "✓",
      appSize: sizeMB,
    };
  } else {
    console.log(`| ${section} | - | ✗ |`);
    results[section] = {
      nodeid: config.nodeId,
      before: null,
      after: null,
      status: "✗",
    };
  }
}

// Check if Figma screenshots exist
console.log("\n📸 Figma Screenshots Comparison:\n");
console.log("| Section | Pixels Diff | % Diff | Status |");
console.log("|---------|-------------|--------|--------|");

const figmaComparisons = {};
for (const [section, config] of Object.entries(SECTIONS)) {
  const appScreenPath = path.join(SCREENSHOTS_DIR, `${section}-1440.png`);
  const figmaScreenPath = path.join(FIGMA_DIR, `${section}-figma.png`);

  if (fs.existsSync(appScreenPath) && fs.existsSync(figmaScreenPath)) {
    const comparison = compareTwoImages(appScreenPath, figmaScreenPath, section);
    if (comparison) {
      const statusEmoji = comparison.percentage < 3 ? "✓" : "✗";
      console.log(
        `| ${section} | ${comparison.pixels} | ${comparison.percentage}% | ${statusEmoji} |`
      );
      figmaComparisons[section] = comparison;
    }
  } else {
    console.log(`| ${section} | - | - | ⚠ |`);
  }
}

// Save detailed results
const resultsPath = path.join(SCREENSHOTS_DIR, "pixel-perfect-results.json");
const detailedResults = {
  timestamp: new Date().toISOString(),
  appScreenshots: results,
  figmaComparisons: figmaComparisons,
  summary: {
    totalSections: Object.keys(SECTIONS).length,
    capturedSections: Object.values(results).filter(r => r.status === "✓").length,
    sectionsCompared: Object.keys(figmaComparisons).length,
    sectionsNeedingFix: Object.values(figmaComparisons).filter(
      c => parseFloat(c.percentage) > 3
    ).length,
  },
};

fs.writeFileSync(resultsPath, JSON.stringify(detailedResults, null, 2));

console.log(`\n✅ Results saved to: ${resultsPath}`);
console.log("\n📌 Summary:");
console.log(`   Total sections: ${detailedResults.summary.totalSections}`);
console.log(`   Captured: ${detailedResults.summary.capturedSections}`);
console.log(`   Compared with Figma: ${detailedResults.summary.sectionsCompared}`);
console.log(
  `   Needing fixes (>3%): ${detailedResults.summary.sectionsNeedingFix}`
);
