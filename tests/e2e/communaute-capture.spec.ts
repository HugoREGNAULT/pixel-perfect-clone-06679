import { test, expect } from '@playwright/test';

test('Communauté page 1440px', async ({ page }) => {
  await page.goto('http://localhost:8080/communaute', { waitUntil: 'networkidle' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500); // Wait for client-side hydration and data loading

  // Take full page screenshot
  const screenshot = await page.screenshot({
    path: 'screenshots/page-communaute-1440.png',
    fullPage: true
  });
  expect(screenshot).toBeTruthy();
});

test('Communauté page 375px mobile', async ({ page }) => {
  await page.goto('http://localhost:8080/communaute', { waitUntil: 'networkidle' });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500); // Wait for client-side hydration and data loading

  // Take full page screenshot
  const screenshot = await page.screenshot({
    path: 'screenshots/page-communaute-375.png',
    fullPage: true
  });
  expect(screenshot).toBeTruthy();
});
