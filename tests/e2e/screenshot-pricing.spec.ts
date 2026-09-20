import { test } from '@playwright/test';

test('capture pricing section at 1440px', async ({ page }) => {
  await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
  
  // Scroll to pricing section
  await page.locator('section#tarifs').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500); // Wait for rendering
  
  // Take screenshot of the pricing section
  const pricingSection = await page.locator('section#tarifs');
  await pricingSection.screenshot({ path: 'screenshots/pricing-1440.png' });
  
  console.log('Screenshot captured: pricing-1440.png');
});

test('capture pricing section at 375px (mobile)', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
  
  // Scroll to pricing section
  await page.locator('section#tarifs').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  
  // Take screenshot
  const pricingSection = await page.locator('section#tarifs');
  await pricingSection.screenshot({ path: 'screenshots/pricing-375.png' });
  
  console.log('Screenshot captured: pricing-375.png');
});
