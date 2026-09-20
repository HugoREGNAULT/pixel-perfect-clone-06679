import { test, expect } from '@playwright/test';

test('Mentorship section 1440px visual', async ({ page }) => {
  await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000); // Wait for client-side hydration

  // Scroll to the Mentorship section
  await page.locator('section#mentorat').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500); // Wait for scroll animation

  const screenshot = await page.screenshot({ path: 'screenshots/mentorship-1440.png' });
  expect(screenshot).toBeDefined();
});

test('Mentorship section 375px mobile visual', async ({ page }) => {
  await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000); // Wait for client-side hydration

  // Scroll to the Mentorship section
  await page.locator('section#mentorat').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500); // Wait for scroll animation

  const screenshot = await page.screenshot({ path: 'screenshots/mentorship-375.png' });
  expect(screenshot).toBeDefined();
});
