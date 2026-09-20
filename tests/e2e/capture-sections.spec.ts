import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

const SECTIONS = [
  { name: "nav", selector: "header, nav", viewport: { width: 1440, height: 900 } },
  { name: "hero", selector: "section", viewport: { width: 1440, height: 900 } },
  { name: "pourquoi", selector: "section", viewport: { width: 1440, height: 900 } },
  { name: "fonctionnalites", selector: "section", viewport: { width: 1440, height: 900 } },
  { name: "dernieres-opp", selector: "section", viewport: { width: 1440, height: 900 } },
  { name: "mentorat", selector: "section", viewport: { width: 1440, height: 900 } },
  { name: "tarifs", selector: "section", viewport: { width: 1440, height: 900 } },
  { name: "newsletter", selector: "section", viewport: { width: 1440, height: 900 } },
  { name: "footer", selector: "footer", viewport: { width: 1440, height: 900 } },
];

const SCREENSHOTS_DIR = path.join(process.cwd(), "screenshots");

// Helper to scroll element into view and capture
async function captureSection(
  page: any,
  sectionName: string,
  index: number,
  viewport: { width: number; height: number },
  vhIndex: number
) {
  // Get all sections and scroll to the specific one
  const allSections = await page.$$("section");
  let element: any = null;

  if (sectionName === "nav") {
    element = await page.$("header, nav");
  } else if (sectionName === "footer") {
    element = await page.$("footer");
  } else {
    // For other sections, use the section elements
    if (index < allSections.length) {
      element = allSections[index];
    }
  }

  if (!element) {
    console.log(`✗ Section not found: ${sectionName}`);
    return false;
  }

  // Scroll element into view
  await element.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  // Get element bounds to calculate proper viewport height
  const boundingBox = await element.boundingBox();
  if (!boundingBox) {
    console.log(`✗ Unable to get bounding box for ${sectionName}`);
    return false;
  }

  const screenshotPath = path.join(SCREENSHOTS_DIR, `section-${sectionName}-${viewport.width}.png`);

  try {
    await element.screenshot({ path: screenshotPath });
    console.log(`✓ Captured ${sectionName} at ${viewport.width}px`);
    return true;
  } catch (e) {
    console.error(`✗ Error capturing ${sectionName}:`, (e as Error).message);
    return false;
  }
}

test.describe("Homepage Sections Capture", () => {
  test.beforeAll(async () => {
    // Ensure screenshots directory exists
    if (!fs.existsSync(SCREENSHOTS_DIR)) {
      fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
    }
  });

  test("capture all homepage sections at 1440px", async ({ page, context }) => {
    // Use incognito/private context for unauthenticated state
    const newContext = await page.context().browser()?.newContext();
    const newPage = await newContext!.newPage();

    try {
      await newPage.goto("http://localhost:8080", { waitUntil: "networkidle" });
      await newPage.setViewportSize({ width: 1440, height: 900 });
      await newPage.waitForLoadState("domcontentloaded");
      await newPage.waitForTimeout(2000);

      const viewport = { width: 1440, height: 900 };

      // Capture nav
      await captureSection(newPage, "nav", 0, viewport, 0);

      // Get all sections for iteration
      const allSections = await newPage.$$("section");
      for (let i = 0; i < allSections.length; i++) {
        const section = allSections[i];
        await section.scrollIntoViewIfNeeded();
        await newPage.waitForTimeout(300);

        const sectionNames = ["hero", "pourquoi", "fonctionnalites", "dernieres-opp", "mentorat", "tarifs", "newsletter"];
        if (i < sectionNames.length) {
          const screenshotPath = path.join(SCREENSHOTS_DIR, `section-${sectionNames[i]}-1440.png`);
          try {
            await section.screenshot({ path: screenshotPath });
            console.log(`✓ Captured ${sectionNames[i]} at 1440px`);
          } catch (e) {
            console.error(`✗ Error capturing section ${i}:`, (e as Error).message);
          }
        }
      }

      // Capture footer
      const footer = await newPage.$("footer");
      if (footer) {
        await footer.scrollIntoViewIfNeeded();
        await newPage.waitForTimeout(300);
        const screenshotPath = path.join(SCREENSHOTS_DIR, "section-footer-1440.png");
        try {
          await footer.screenshot({ path: screenshotPath });
          console.log(`✓ Captured footer at 1440px`);
        } catch (e) {
          console.error(`✗ Error capturing footer:`, (e as Error).message);
        }
      }
    } finally {
      await newContext?.close();
    }
  });

  test("capture all homepage sections at 375px", async ({ page, context }) => {
    // Use incognito/private context for unauthenticated state
    const newContext = await page.context().browser()?.newContext();
    const newPage = await newContext!.newPage();

    try {
      await newPage.goto("http://localhost:8080", { waitUntil: "networkidle" });
      await newPage.setViewportSize({ width: 375, height: 812 });
      await newPage.waitForLoadState("domcontentloaded");
      await newPage.waitForTimeout(2000);

      const viewport = { width: 375, height: 812 };

      // Capture nav
      const nav = await newPage.$("header, nav");
      if (nav) {
        await nav.scrollIntoViewIfNeeded();
        await newPage.waitForTimeout(300);
        const screenshotPath = path.join(SCREENSHOTS_DIR, "section-nav-375.png");
        try {
          await nav.screenshot({ path: screenshotPath });
          console.log(`✓ Captured nav at 375px`);
        } catch (e) {
          console.error(`✗ Error capturing nav:`, (e as Error).message);
        }
      }

      // Get all sections for iteration
      const allSections = await newPage.$$("section");
      for (let i = 0; i < allSections.length; i++) {
        const section = allSections[i];
        await section.scrollIntoViewIfNeeded();
        await newPage.waitForTimeout(300);

        const sectionNames = ["hero", "pourquoi", "fonctionnalites", "dernieres-opp", "mentorat", "tarifs", "newsletter"];
        if (i < sectionNames.length) {
          const screenshotPath = path.join(SCREENSHOTS_DIR, `section-${sectionNames[i]}-375.png`);
          try {
            await section.screenshot({ path: screenshotPath });
            console.log(`✓ Captured ${sectionNames[i]} at 375px`);
          } catch (e) {
            console.error(`✗ Error capturing section ${i}:`, (e as Error).message);
          }
        }
      }

      // Capture footer
      const footer = await newPage.$("footer");
      if (footer) {
        await footer.scrollIntoViewIfNeeded();
        await newPage.waitForTimeout(300);
        const screenshotPath = path.join(SCREENSHOTS_DIR, "section-footer-375.png");
        try {
          await footer.screenshot({ path: screenshotPath });
          console.log(`✓ Captured footer at 375px`);
        } catch (e) {
          console.error(`✗ Error capturing footer:`, (e as Error).message);
        }
      }
    } finally {
      await newContext?.close();
    }
  });
});