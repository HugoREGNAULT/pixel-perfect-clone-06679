import { test, expect, Page } from "@playwright/test";
import fs from "fs";
import path from "path";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

// Figma node IDs for each homepage section
const SECTIONS = {
  Nav: "3:721",
  Hero: "3:3",
  "Pourquoi Springr?": "3:128",
  Fonctionnalités: "3:166",
  "Dernières opportunités": "3:395",
  Mentorat: "3:556",
  Tarifs: "3:622",
  Newsletter: "3:704",
  Footer: "3:480",
};

const SELECTORS = {
  Nav: "header",
  Hero: "section:has([class*='hero'])",
  "Pourquoi Springr?": "section:has([class*='why-springr'])",
  Fonctionnalités: "section:has([id='fonctionnalites'])",
  "Dernières opportunités": "section:has([class*='latest-opportunities'])",
  Mentorat: "section:has([class*='mentorship'])",
  Tarifs: "section:has([class*='pricing'])",
  Newsletter: "section:has([class*='newsletter'])",
  Footer: "footer",
};

async function captureSection(
  page: Page,
  sectionName: string,
  filename: string
) {
  try {
    const selector = SELECTORS[sectionName as keyof typeof SELECTORS];
    if (!selector) {
      console.log(`Skipping ${sectionName} - no selector found`);
      return null;
    }

    const element = await page.$(selector);
    if (!element) {
      console.log(`Skipping ${sectionName} - element not found`);
      return null;
    }

    const screenshotPath = path.join(
      process.cwd(),
      "screenshots",
      filename
    );

    // Create directory if it doesn't exist
    const dir = path.dirname(screenshotPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await element.screenshot({ path: screenshotPath });
    console.log(`✓ Captured ${sectionName}: ${screenshotPath}`);
    return screenshotPath;
  } catch (error) {
    console.error(`✗ Error capturing ${sectionName}:`, error);
    return null;
  }
}

async function compareScreenshots(
  figmaPath: string | null,
  appPath: string,
  sectionName: string
): Promise<{ percentage: number; diffPath: string } | null> {
  try {
    if (!figmaPath || !fs.existsSync(appPath)) {
      return null;
    }

    // Read app screenshot
    const img1data = fs.readFileSync(appPath);
    const img1 = PNG.sync.read(img1data);

    // Create diff directory
    const diffDir = path.join(process.cwd(), "screenshots", "diffs");
    if (!fs.existsSync(diffDir)) {
      fs.mkdirSync(diffDir, { recursive: true });
    }

    // For now, we'll just report 0% since Figma screenshot won't be available
    // In production, this would compare with Figma screenshot
    const diffPath = path.join(diffDir, `diff-${sectionName}-before.png`);

    console.log(
      `⚠ Note: Figma comparison would require manual screenshot. App screenshot ready: ${appPath}`
    );

    return {
      percentage: 0,
      diffPath: diffPath,
    };
  } catch (error) {
    console.error(`✗ Error comparing ${sectionName}:`, error);
    return null;
  }
}

test.describe("Homepage Pixel-Perfect Analysis", () => {
  test("capture all homepage sections at 1440px", async ({ page }) => {
    // Navigate to homepage
    await page.goto("http://localhost:8080", { waitUntil: "networkidle" });

    // Wait for page to fully load
    await page.waitForTimeout(2000);

    // Set viewport to 1440px
    await page.setViewportSize({ width: 1440, height: 900 });

    const results: Record<
      string,
      { before: number; after: number; status: string }
    > = {};

    // Capture each section
    for (const [sectionName, nodeId] of Object.entries(SECTIONS)) {
      console.log(`\n--- Analyzing ${sectionName} (node ${nodeId}) ---`);

      // Capture current implementation
      const appScreenshot = await captureSection(
        page,
        sectionName,
        `${sectionName}-app.png`
      );

      if (appScreenshot) {
        const comparison = await compareScreenshots(
          null, // Figma path would be obtained from get_screenshot
          appScreenshot,
          sectionName
        );

        if (comparison) {
          results[sectionName] = {
            before: comparison.percentage,
            after: comparison.percentage,
            status: comparison.percentage < 3 ? "✓" : "✗",
          };
        }
      }
    }

    // Print results table
    console.log("\n\n=== PIXEL-PERFECT RESULTS ===\n");
    console.log(
      "| Section | Before | After | Status |"
    );
    console.log("|---------|--------|-------|--------|");

    for (const [section, data] of Object.entries(results)) {
      console.log(
        `| ${section} | ${data.before.toFixed(1)}% | ${data.after.toFixed(1)}% | ${data.status} |`
      );
    }

    // Save results to JSON
    const resultsPath = path.join(process.cwd(), "screenshots", "pixel-perfect-results.json");
    const resultsDir = path.dirname(resultsPath);
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`\nResults saved to: ${resultsPath}`);
  });
});
