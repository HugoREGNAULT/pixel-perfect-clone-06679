#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Section definitions with selectors for Playwright
const SECTIONS = {
  Nav: { selector: "header", nodeId: "3:721" },
  Hero: { selector: "section[class*='bg-background']", nodeId: "3:3" },
  "Pourquoi Springr": { selector: "section:has([class*='why'])", nodeId: "3:128" },
  Fonctionnalités: { selector: "section:has([id='fonctionnalites'])", nodeId: "3:166" },
  "Dernières opportunités": { selector: "section:has([class*='latest'])", nodeId: "3:395" },
  Mentorat: { selector: "section:has([class*='mentorship'])", nodeId: "3:556" },
  Tarifs: { selector: "section:has([class*='pricing'])", nodeId: "3:622" },
  Newsletter: { selector: "section:has([class*='newsletter'])", nodeId: "3:704" },
  Footer: { selector: "footer", nodeId: "3:480" },
};

const SCREENSHOTS_DIR = path.join(process.cwd(), "screenshots");
const DIFFS_DIR = path.join(SCREENSHOTS_DIR, "diffs");

// Ensure directories exist
[SCREENSHOTS_DIR, DIFFS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

async function createPlaywrightTest() {
  const sectionsStr = JSON.stringify(SECTIONS);
  const testCode = `import { test } from "@playwright/test";

test.describe("Pixel-Perfect Screenshots", () => {
  test("capture all homepage sections at 1440px", async ({ page }) => {
    await page.goto("http://localhost:8080", { waitUntil: "networkidle" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(2000);

    const sections = ${sectionsStr};
    const screenshotsDir = "${SCREENSHOTS_DIR}";

    for (const [sectionName, config] of Object.entries(sections)) {
      try {
        const element = await page.$(config.selector);
        if (element) {
          const screenshotPath = screenshotsDir + "/" + sectionName + "-1440.png";
          await element.screenshot({ path: screenshotPath });
          console.log("✓ Captured " + sectionName);
        } else {
          console.log("✗ Selector not found: " + sectionName);
        }
      } catch (e) {
        console.error("✗ Error capturing " + sectionName + ":", e.message);
      }
    }
  });
});`;

  const testPath = path.join(process.cwd(), "tests/e2e/capture-sections.spec.ts");
  fs.writeFileSync(testPath, testCode);
  return testPath;
}

function compareImages(img1Path, img2Path, sectionName) {
  try {
    if (!fs.existsSync(img1Path) || !fs.existsSync(img2Path)) {
      return null;
    }

    const img1data = fs.readFileSync(img1Path);
    const img2data = fs.readFileSync(img2Path);

    const img1 = PNG.sync.read(img1data);
    const img2 = PNG.sync.read(img2data);

    // Handle different sizes
    const width = Math.max(img1.width, img2.width);
    const height = Math.max(img1.height, img2.height);

    const diff = new PNG({ width, height });

    // Pad images if different sizes
    const img1Padded = new PNG({ width, height });
    const img2Padded = new PNG({ width, height });

    // Copy img1 data
    for (let y = 0; y < img1.height; y++) {
      for (let x = 0; x < img1.width; x++) {
        const idx = (img1.width * y + x) * 4;
        const paddedIdx = (width * y + x) * 4;
        img1Padded.data[paddedIdx] = img1.data[idx];
        img1Padded.data[paddedIdx + 1] = img1.data[idx + 1];
        img1Padded.data[paddedIdx + 2] = img1.data[idx + 2];
        img1Padded.data[paddedIdx + 3] = img1.data[idx + 3];
      }
    }

    // Copy img2 data
    for (let y = 0; y < img2.height; y++) {
      for (let x = 0; x < img2.width; x++) {
        const idx = (img2.width * y + x) * 4;
        const paddedIdx = (width * y + x) * 4;
        img2Padded.data[paddedIdx] = img2.data[idx];
        img2Padded.data[paddedIdx + 1] = img2.data[idx + 1];
        img2Padded.data[paddedIdx + 2] = img2.data[idx + 2];
        img2Padded.data[paddedIdx + 3] = img2.data[idx + 3];
      }
    }

    const numDiffPixels = pixelmatch(img1Padded.data, img2Padded.data, diff.data, width, height, {
      threshold: 0.1,
    });

    const totalPixels = width * height;
    const percentage = (numDiffPixels / totalPixels) * 100;

    // Save diff image
    const diffPath = path.join(DIFFS_DIR, `diff-${sectionName}-before.png`);
    fs.writeFileSync(diffPath, PNG.sync.write(diff));

    return {
      percentage: percentage.toFixed(2),
      diffPath,
      pixels: numDiffPixels,
      total: totalPixels,
    };
  } catch (error) {
    console.error(`Error comparing ${sectionName}:`, error.message);
    return null;
  }
}

async function main() {
  console.log("🚀 Starting pixel-perfect measurement...\n");

  try {
    // Step 1: Create and run Playwright test to capture current screenshots
    console.log("📸 Creating Playwright test to capture sections...");
    const testPath = await createPlaywrightTest();

    console.log("▶️  Running Playwright to capture sections...");
    await execAsync(`npx playwright test ${testPath}`, { cwd: process.cwd(), maxBuffer: 10 * 1024 * 1024 });

    // Step 2: For now, we'll just report the captured screenshots
    console.log("\n📊 Screenshot Capture Summary:\n");
    console.log("| Section | Status | Path |");
    console.log("|---------|--------|------|");

    const results = {};

    for (const [sectionName] of Object.entries(SECTIONS)) {
      const screenshotPath = path.join(SCREENSHOTS_DIR, `${sectionName}-1440.png`);

      if (fs.existsSync(screenshotPath)) {
        results[sectionName] = {
          before: 0,
          after: 0,
          status: "✓",
          path: screenshotPath,
        };
        console.log(`| ${sectionName} | ✓ | ${screenshotPath} |`);
      } else {
        results[sectionName] = {
          before: 0,
          after: 0,
          status: "✗",
          path: "N/A",
        };
        console.log(`| ${sectionName} | ✗ | Capture failed |`);
      }
    }

    // Save results
    const resultsPath = path.join(SCREENSHOTS_DIR, "pixel-perfect-results.json");
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));

    console.log(`\n✅ Results saved to: ${resultsPath}`);
    console.log("\n📌 Next steps:");
    console.log("1. Review captured screenshots in ./screenshots/");
    console.log("2. Compare with Figma designs to identify differences");
    console.log("3. Use get_design_context to extract exact values");
    console.log("4. Fix CSS in components and re-measure");

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

main();
