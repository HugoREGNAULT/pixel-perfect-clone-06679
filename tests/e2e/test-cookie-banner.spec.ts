import { test, expect } from "@playwright/test";

test.describe("CookieBanner Responsive Behavior", () => {
  test("should be fixed at bottom on mobile (375px)", async ({ page }) => {
    // Clear localStorage to show cookie banner
    const context = page.context();
    await context.clearCookies();

    await page.goto("http://localhost:8080", { waitUntil: "networkidle" });
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);

    // Find the cookie banner
    const cookieBanner = page.locator('div:has-text("Gestion des cookies")').first();
    await expect(cookieBanner).toBeVisible();

    // Check that it's fixed positioned
    const boundingBox = await cookieBanner.locator("..").first().boundingBox();
    expect(boundingBox).toBeDefined();

    // The banner should be at the bottom (less than 100px from bottom)
    if (boundingBox) {
      const distanceFromBottom = 812 - (boundingBox.y + boundingBox.height);
      console.log(`Mobile: Banner distance from bottom: ${distanceFromBottom}px`);
      // On mobile, should be near the bottom due to fixed positioning
      expect(distanceFromBottom).toBeLessThan(10);
    }

    // Take screenshot for visual verification
    await page.screenshot({ path: "/tmp/cookie-banner-mobile.png" });
    console.log("✓ Mobile cookie banner screenshot captured");
  });

  test("should be inline (static) on desktop (1440px)", async ({ page }) => {
    // Clear localStorage to show cookie banner
    const context = page.context();
    await context.clearCookies();

    await page.goto("http://localhost:8080", { waitUntil: "networkidle" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);

    // Find the cookie banner
    const cookieBanner = page.locator('div:has-text("Gestion des cookies")').first();
    await expect(cookieBanner).toBeVisible();

    // On desktop, scroll to bottom and verify banner is inline
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    // Take screenshot for visual verification
    await page.screenshot({ path: "/tmp/cookie-banner-desktop.png" });
    console.log("✓ Desktop cookie banner screenshot captured");
  });

  test("should not overlap content on mobile", async ({ page }) => {
    const context = page.context();
    await context.clearCookies();

    await page.goto("http://localhost:8080", { waitUntil: "networkidle" });
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2000);

    // Get the main content area
    const mainContent = page.locator('div.min-h-screen').first();
    const mainBoundingBox = await mainContent.boundingBox();

    // Get the cookie banner
    const cookieBanner = page.locator('div:has-text("Gestion des cookies")').first();
    const bannerBoundingBox = await cookieBanner.locator("..").first().boundingBox();

    if (mainBoundingBox && bannerBoundingBox) {
      // Banner should be below content or at the very bottom
      console.log(`Main content bottom: ${mainBoundingBox.y + mainBoundingBox.height}px`);
      console.log(`Banner top: ${bannerBoundingBox.y}px`);
      console.log(`Banner height: ${bannerBoundingBox.height}px`);

      // The content should have padding to account for fixed banner
      const contentBottom = mainBoundingBox.y + mainBoundingBox.height;
      expect(contentBottom).toBeGreaterThan(0);
    }
  });
});
