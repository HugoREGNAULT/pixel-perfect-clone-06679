import { test, expect } from '@playwright/test';

test('Offres page 1440px desktop visual', async ({ page }) => {
  await page.goto('http://localhost:8080/opportunites', { waitUntil: 'networkidle' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000); // Wait for client-side hydration and API calls

  const screenshot = await page.screenshot({ path: 'screenshots/page-offres-1440.png' });
  expect(screenshot).toBeTruthy();
});

test('Offres page 375px mobile visual', async ({ page }) => {
  await page.goto('http://localhost:8080/opportunites', { waitUntil: 'networkidle' });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000); // Wait for client-side hydration and API calls

  const screenshot = await page.screenshot({ path: 'screenshots/page-offres-375.png' });
  expect(screenshot).toBeTruthy();
});
