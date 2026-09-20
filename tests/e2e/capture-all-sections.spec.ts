import { test } from "@playwright/test";
import fs from "fs";
import path from "path";

const SECTIONS = {
  Nav: 'nav, header',
  Hero: '[data-node-id="3:3"]',
  "Pourquoi Springr": '[data-node-id="3:128"]',
  Fonctionnalités: '[data-node-id="3:166"]',
  "Dernières opportunités": '[data-node-id="3:395"]',
  Mentorat: '[data-node-id="3:556"]',
  Tarifs: '[data-node-id="3:622"]',
  Newsletter: '[data-node-id="3:704"]',
  Footer: 'footer',
};

const SCREENSHOTS_DIR = path.join(process.cwd(), "screenshots");

test.describe("Pixel-Perfect Screenshots", () => {
  test("capture all homepage sections at 1440px", async ({ page }) => {
    // Ensure screenshots directory exists
    if (!fs.existsSync(SCREENSHOTS_DIR)) {
      fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
    }

    await page.goto("http://localhost:8080", { waitUntil: "networkidle" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(2000);

    for (const [sectionName, selector] of Object.entries(SECTIONS)) {
      try {
        const element = await page.$(selector);
        if (element) {
          const screenshotPath = path.join(
            SCREENSHOTS_DIR,
            `${sectionName}-1440.png`
          );
          await element.screenshot({ path: screenshotPath });
          console.log(`✓ Captured ${sectionName}`);
        } else {
          console.log(`✗ Selector not found: ${sectionName} (${selector})`);
        }
      } catch (e) {
        console.error(`✗ Error capturing ${sectionName}:`, (e as Error).message);
      }
    }
  });
});
