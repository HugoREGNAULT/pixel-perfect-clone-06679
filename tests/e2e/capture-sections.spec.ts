import { test } from "@playwright/test";

test.describe("Pixel-Perfect Screenshots", () => {
  test("capture all homepage sections at 1440px", async ({ page }) => {
    await page.goto("http://localhost:8080", { waitUntil: "networkidle" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(2000);

    const sections = {"Nav":{"selector":"header","nodeId":"3:721"},"Hero":{"selector":"section[class*='bg-background']","nodeId":"3:3"},"Pourquoi Springr":{"selector":"section:has([class*='why'])","nodeId":"3:128"},"Fonctionnalités":{"selector":"section:has([id='fonctionnalites'])","nodeId":"3:166"},"Dernières opportunités":{"selector":"section:has([class*='latest'])","nodeId":"3:395"},"Mentorat":{"selector":"section:has([class*='mentorship'])","nodeId":"3:556"},"Tarifs":{"selector":"section:has([class*='pricing'])","nodeId":"3:622"},"Newsletter":{"selector":"section:has([class*='newsletter'])","nodeId":"3:704"},"Footer":{"selector":"footer","nodeId":"3:480"}};
    const screenshotsDir = "/Users/hugo/Springr/screenshots";

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
});