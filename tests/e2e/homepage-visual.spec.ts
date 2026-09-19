import { test, expect } from '@playwright/test';

test('Homepage 1440px visual regression', async ({ page }) => {
  await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000); // Wait for client-side hydration

  const screenshot = await page.screenshot({ path: 'screenshots/homepage-1440.png' });
  expect(screenshot).toMatchSnapshot('homepage-1440.png');
});

test('Homepage 375px mobile visual regression', async ({ page }) => {
  await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000); // Wait for client-side hydration

  const screenshot = await page.screenshot({ path: 'screenshots/homepage-375.png' });
  expect(screenshot).toMatchSnapshot('homepage-375.png');
});
