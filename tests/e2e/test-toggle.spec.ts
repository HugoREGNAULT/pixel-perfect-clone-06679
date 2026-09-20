import { test, expect } from '@playwright/test';

test('pricing toggle changes prices from monthly to annual', async ({ page }) => {
  await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
  
  // Scroll to pricing section
  await page.locator('section#tarifs').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  
  // Check initial state - should show monthly prices
  const pricingSection = await page.locator('section#tarifs');
  
  // Verify "Mensuel" button is active initially
  let mensuelBtn = pricingSection.locator('button').filter({ hasText: /^Mensuel$/ });
  let annuelBtn = pricingSection.locator('button').filter({ hasText: /^Annuel$/ });
  
  // Get the price elements (looking for 4.99 for monthly)
  let priceText = await pricingSection.locator('text=4.99€').first();
  await expect(priceText).toBeVisible();
  
  // Click Annuel button
  await annuelBtn.click();
  await page.waitForTimeout(500);
  
  // Verify annual price is shown (49.9 instead of 4.99)
  priceText = await pricingSection.locator('text=49.9€').first();
  await expect(priceText).toBeVisible();
  
  // Click Mensuel button again
  await mensuelBtn.click();
  await page.waitForTimeout(500);
  
  // Verify monthly price is back
  priceText = await pricingSection.locator('text=4.99€').first();
  await expect(priceText).toBeVisible();
  
  console.log('Toggle test passed!');
});
