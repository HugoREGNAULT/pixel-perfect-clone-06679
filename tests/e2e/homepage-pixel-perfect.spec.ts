import { test, expect } from '@playwright/test';

test('Capture all homepage sections', async ({ page }) => {
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  const sections = [
    {
      name: 'nav',
      selector: 'nav',
      description: 'Navigation header'
    },
    {
      name: 'hero',
      selector: 'div > section:nth-of-type(1)',
      description: 'Hero section'
    },
    {
      name: 'pourquoi',
      selector: 'div > section:nth-of-type(2)',
      description: 'Pourquoi Springr section'
    },
    {
      name: 'fonctionnalites',
      selector: 'div > section:nth-of-type(3)',
      description: 'Features section'
    },
    {
      name: 'dernieres-opportunites',
      selector: 'div > section:nth-of-type(4)',
      description: 'Latest opportunities'
    },
    {
      name: 'mentorat',
      selector: 'div > section:nth-of-type(5)',
      description: 'Mentorship section'
    },
    {
      name: 'tarifs',
      selector: 'div > section:nth-of-type(6)',
      description: 'Pricing section'
    },
    {
      name: 'newsletter',
      selector: 'div > section:nth-of-type(7)',
      description: 'Newsletter CTA'
    },
    {
      name: 'footer',
      selector: 'footer',
      description: 'Footer'
    }
  ];

  for (const section of sections) {
    console.log(`📸 Capturing ${section.description}...`);

    try {
      const element = page.locator(section.selector).first();

      // Scroll into view
      await element.scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});

      // Wait a bit for any animations
      await page.waitForTimeout(500);

      // Get bounding box
      const box = await element.boundingBox();
      if (!box) {
        console.log(`  ⚠️  Could not find ${section.name}`);
        continue;
      }

      // Take screenshot
      const screenshotPath = `screenshots/playwright-${section.name}.png`;
      await element.screenshot({ path: screenshotPath, scale: 'css' });

      console.log(`  ✅ Saved to ${screenshotPath}`);
      console.log(`     Dimensions: ${Math.round(box.width)}x${Math.round(box.height)}`);
    } catch (error) {
      console.log(`  ❌ Failed to capture ${section.name}:`, error.message);
    }
  }

  expect(true).toBe(true); // Always pass, this test is just for capturing
});

test('Homepage full page 1440px', async ({ page }) => {
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  const fullPageScreenshot = await page.screenshot({ fullPage: true });
  const screenshotPath = 'screenshots/playwright-fullpage-1440.png';

  // Save manually since we need the path
  const fs = await import('fs');
  fs.writeFileSync(screenshotPath, fullPageScreenshot);

  console.log(`✅ Full page screenshot saved to ${screenshotPath}`);
  expect(true).toBe(true);
});

test('Homepage mobile 375px', async ({ page }) => {
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle', timeout: 30000 });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  const fullPageScreenshot = await page.screenshot({ fullPage: true });
  const screenshotPath = 'screenshots/playwright-fullpage-375.png';

  const fs = await import('fs');
  fs.writeFileSync(screenshotPath, fullPageScreenshot);

  console.log(`✅ Mobile screenshot saved to ${screenshotPath}`);
  expect(true).toBe(true);
});
