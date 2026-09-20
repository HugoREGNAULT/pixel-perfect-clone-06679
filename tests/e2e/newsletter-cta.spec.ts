import { test } from '@playwright/test';

test('capture newsletter cta section at 1440px', async ({ page }) => {
  await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });

  // Scroll to newsletter-cta section
  await page.locator('section#newsletter-cta').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500); // Wait for rendering

  // Take screenshot of the newsletter-cta section
  const newsletterSection = await page.locator('section#newsletter-cta');
  await newsletterSection.screenshot({ path: 'screenshots/newsletter-cta-1440.png' });

  console.log('Screenshot captured: newsletter-cta-1440.png');
});

test('capture newsletter cta section at 375px (mobile)', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });

  // Scroll to newsletter-cta section
  await page.locator('section#newsletter-cta').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  // Take screenshot
  const newsletterSection = await page.locator('section#newsletter-cta');
  await newsletterSection.screenshot({ path: 'screenshots/newsletter-cta-375.png' });

  console.log('Screenshot captured: newsletter-cta-375.png');
});

test('test newsletter form interaction', async ({ page }) => {
  await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });

  // Scroll to newsletter-cta section
  await page.locator('section#newsletter-cta').scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  // Find the email input and button
  const emailInput = page.locator('section#newsletter-cta input[type="email"]');
  const submitButton = page.locator('section#newsletter-cta button[type="submit"]');

  // Type email
  await emailInput.fill('test@example.com');

  // Take screenshot with filled email
  const newsletterSection = await page.locator('section#newsletter-cta');
  await newsletterSection.screenshot({ path: 'screenshots/newsletter-cta-filled.png' });

  console.log('Screenshot captured: newsletter-cta-filled.png');
});
