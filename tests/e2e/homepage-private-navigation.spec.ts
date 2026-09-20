import { test, expect } from '@playwright/test';

test.describe('Homepage — Private Navigation (Unauthenticated)', () => {
  test('should load homepage without 401 errors and display offers', async ({ page, context }) => {
    // Clear all cookies and storage to ensure unauthenticated state
    await context.clearCookies();

    // Collect all console messages
    const consoleMessages: string[] = [];
    page.on('console', (msg) => {
      consoleMessages.push(msg.text());
    });

    // Collect all API responses to check for 401 errors
    const apiResponses: { url: string; status: number }[] = [];
    page.on('response', (response) => {
      apiResponses.push({
        url: response.url(),
        status: response.status(),
      });
    });

    // Navigate to homepage
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000); // Wait for client-side hydration

    // Verify the page loaded successfully
    const pageTitle = await page.title();
    expect(pageTitle).toBeTruthy();

    // Check that there are no 401 errors in console
    const consoleErrors = consoleMessages.filter((msg) => msg.includes('401'));
    expect(consoleErrors).toHaveLength(0);

    // Check that there are no 401 responses in API calls
    const status401Responses = apiResponses.filter((resp) => resp.status === 401);
    expect(status401Responses).toHaveLength(0);

    // Verify the section exists
    const opportunitiesSection = page.locator('#dernieres-opportunites');
    await expect(opportunitiesSection).toBeVisible();

    // Verify section title is visible
    const sectionTitle = opportunitiesSection.locator('h2');
    await expect(sectionTitle).toContainText('Dernières opportunités');

    // Verify section subtitle is visible
    const sectionSubtitle = opportunitiesSection.locator('p').first();
    await expect(sectionSubtitle).toContainText('Des centaines de nouvelles offres ajoutées chaque jour');

    // Verify offers are displayed
    // Wait a bit longer for the API call to complete
    await page.waitForTimeout(2000);

    // Check that we have job cards displayed (looking for h3 elements which are job titles)
    const jobTitles = opportunitiesSection.locator('h3');
    const cardCount = await jobTitles.count();
    expect(cardCount).toBeGreaterThan(0);

    // Verify at least one offer has a visible title
    const firstJobTitle = jobTitles.first();
    const titleText = await firstJobTitle.textContent();
    expect(titleText).toBeTruthy();
    expect(titleText?.length).toBeGreaterThan(5);

    // Verify the "Voir toutes les offres" link exists and is visible
    const seeAllLink = opportunitiesSection.locator('a').filter({
      hasText: 'Voir toutes les offres',
    });
    await expect(seeAllLink).toBeVisible();

    // Log results for debugging
    console.log(`[Test Results]`);
    console.log(`✓ Page loaded successfully`);
    console.log(`✓ No 401 errors found (${consoleErrors.length} console errors)`);
    console.log(`✓ No 401 API responses (checked ${apiResponses.length} API calls)`);
    console.log(`✓ ${cardCount} offer(s) displayed`);
    console.log(`✓ Section title and subtitle visible`);
  });

  test('should verify API response status is 200 (not 401)', async ({ page, context }) => {
    // Clear all cookies and storage to ensure unauthenticated state
    await context.clearCookies();

    let jobSearchResponseStatus: number | null = null;
    let jobSearchResponseReceived = false;

    // Listen for the job search API response
    page.on('response', (response) => {
      if (response.url().includes('job-search') || response.url().includes('searchJobs')) {
        jobSearchResponseStatus = response.status();
        jobSearchResponseReceived = true;
      }
    });

    // Navigate to homepage
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');

    // Wait for API response
    await page.waitForTimeout(3000);

    // If we received an API response, verify it's not 401
    if (jobSearchResponseReceived) {
      expect(jobSearchResponseStatus).not.toBe(401);
      expect(jobSearchResponseStatus).toBe(200);
    } else {
      // If no specific API response was caught, verify via section visibility
      const opportunitiesSection = page.locator('#dernieres-opportunites');
      await expect(opportunitiesSection).toBeVisible();
    }
  });

  test('should handle unauthenticated navigation with correct viewport', async ({ page, context }) => {
    // Clear all cookies and storage
    await context.clearCookies();

    // Set desktop viewport
    await page.setViewportSize({ width: 1440, height: 900 });

    // Navigate to homepage
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Verify section is displayed at desktop size
    const opportunitiesSection = page.locator('#dernieres-opportunites');
    await expect(opportunitiesSection).toBeVisible();

    // Verify offers are displayed via job titles
    const jobTitles = opportunitiesSection.locator('h3');
    const offers = await jobTitles.count();
    expect(offers).toBeGreaterThan(0);

    // Take screenshot for visual verification
    await page.screenshot({
      path: 'screenshots/homepage-private-navigation-1440.png',
      fullPage: false,
    });
  });

  test('should handle unauthenticated navigation on mobile', async ({ page, context }) => {
    // Clear all cookies and storage
    await context.clearCookies();

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to homepage
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Verify section is displayed on mobile
    const opportunitiesSection = page.locator('#dernieres-opportunites');
    await expect(opportunitiesSection).toBeVisible();

    // Verify offers are displayed on mobile via job titles
    const jobTitles = opportunitiesSection.locator('h3');
    const offers = await jobTitles.count();
    expect(offers).toBeGreaterThan(0);

    // Scroll to offers section and take screenshot
    await opportunitiesSection.scrollIntoViewIfNeeded();
    await page.screenshot({
      path: 'screenshots/homepage-private-navigation-375.png',
      fullPage: false,
    });
  });
});
