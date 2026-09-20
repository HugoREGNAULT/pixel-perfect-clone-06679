import { test, expect } from '@playwright/test';

test.describe('Features Tab Section', () => {
  test('should display features section with tabs at 1440px', async ({ page }) => {
    await page.goto('http://localhost:8080/');

    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');

    // Scroll to features section
    await page.locator('#fonctionnalites').scrollIntoViewIfNeeded();

    // Take screenshot
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.screenshot({
      path: 'screenshots/features-tab-1440.png',
      fullPage: false,
    });

    // Verify section exists
    const section = page.locator('section#fonctionnalites');
    await expect(section).toBeVisible();

    // Verify h2 title
    const title = section.locator('h2');
    await expect(title).toContainText('Fonctionnalités');

    // Verify tabs exist
    const tabs = section.locator('button');
    await expect(tabs).toHaveCount(4);

    // Verify tab names
    await expect(tabs.nth(0)).toContainText('Offres');
    await expect(tabs.nth(1)).toContainText('Mentorat');
    await expect(tabs.nth(2)).toContainText('Bons Plans');
    await expect(tabs.nth(3)).toContainText('Communauté');

    // Click on different tabs and verify content changes
    const content = section.locator('div').filter({ has: section.locator('p') }).last();

    // Click tab 2 (Mentorat)
    await tabs.nth(1).click();
    await expect(content).toContainText('Trouvez votre mentor');

    // Click tab 3 (Bons Plans)
    await tabs.nth(2).click();
    await expect(content).toContainText('Exclusivités étudiantes');

    // Click tab 4 (Communauté)
    await tabs.nth(3).click();
    await expect(content).toContainText('Connectez-vous');

    // Go back to first tab
    await tabs.nth(0).click();
    await expect(content).toContainText('Matching intelligent');
  });

  test('should display features section with tabs at 375px (mobile)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:8080/');

    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');

    // Scroll to features section
    await page.locator('#fonctionnalites').scrollIntoViewIfNeeded();

    // Take screenshot
    await page.screenshot({
      path: 'screenshots/features-tab-375.png',
      fullPage: false,
    });

    // Verify section exists
    const section = page.locator('section#fonctionnalites');
    await expect(section).toBeVisible();

    // Verify tabs are visible on mobile
    const tabs = section.locator('button');
    await expect(tabs).toHaveCount(4);
  });
});
