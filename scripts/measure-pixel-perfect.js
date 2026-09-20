#!/usr/bin/env node
/**
 * Pixel-Perfect Homepage Measurement Script
 * Measures Figma vs Playwright screenshots using pixelmatch
 *
 * Usage: node scripts/measure-pixel-perfect.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const screenshotsDir = path.join(projectRoot, 'screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Define sections to measure
const SECTIONS = [
  { name: 'Nav', nodeId: '3:721', selector: 'nav', viewport: { width: 1440, height: 60 } },
  { name: 'Hero', nodeId: '3:3', selector: 'section:nth-of-type(1)', viewport: { width: 1440, height: 500 } },
  { name: 'Pourquoi Springr', nodeId: '3:128', selector: 'section:nth-of-type(2)', viewport: { width: 1440, height: 400 } },
  { name: 'Fonctionnalités', nodeId: '3:166', selector: '#fonctionnalites', viewport: { width: 1440, height: 500 } },
  { name: 'Dernières opportunités', nodeId: '3:395', selector: 'section:has(h2:contains("Dernières"))', viewport: { width: 1440, height: 450 } },
  { name: 'Mentorat', nodeId: '3:556', selector: 'section:has(h2:contains("Mentorat"))', viewport: { width: 1440, height: 300 } },
  { name: 'Tarifs', nodeId: '3:622', selector: 'section:has(h2:contains("Tarifs"))', viewport: { width: 1440, height: 550 } },
  { name: 'Newsletter', nodeId: '3:704', selector: 'section:has(h2:contains("Newsletter"))', viewport: { width: 1440, height: 300 } },
  { name: 'Footer', nodeId: '3:480', selector: 'footer', viewport: { width: 1440, height: 200 } },
];

// Results storage
const results = [];

/**
 * Load PNG image from file
 */
function loadPNG(filePath) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(new PNG())
      .on('parsed', function () {
        resolve(this);
      })
      .on('error', reject);
  });
}

/**
 * Get file size in KB
 */
function getFileSize(filePath) {
  if (!fs.existsSync(filePath)) return 0;
  return (fs.statSync(filePath).size / 1024).toFixed(2);
}

/**
 * Measure difference between two PNG files
 */
async function measureDifference(figmaPath, playwrightPath) {
  try {
    const figma = await loadPNG(figmaPath);
    const playwright = await loadPNG(playwrightPath);

    // Check dimensions match
    if (figma.width !== playwright.width || figma.height !== playwright.height) {
      console.warn(`⚠️  Dimension mismatch: Figma ${figma.width}x${figma.height} vs Playwright ${playwright.width}x${playwright.height}`);
    }

    // Calculate difference
    const width = Math.min(figma.width, playwright.width);
    const height = Math.min(figma.height, playwright.height);
    const diff = new PNG({ width, height });

    const mismatchPixels = pixelmatch(
      figma.data,
      playwright.data,
      diff.data,
      width,
      height,
      { threshold: 0.1 }
    );

    const totalPixels = width * height;
    const percentage = ((mismatchPixels / totalPixels) * 100).toFixed(2);

    return {
      mismatchPixels,
      totalPixels,
      percentage: parseFloat(percentage),
      width,
      height,
    };
  } catch (error) {
    console.error(`Error measuring ${figmaPath}:`, error.message);
    return null;
  }
}

/**
 * Capture screenshot using Playwright
 */
async function captureScreenshot(page, selector, filePath, viewport) {
  try {
    // Scroll element into view
    await page.locator(selector).scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {});

    // Get element bounding box
    const element = await page.locator(selector).first();
    const box = await element.boundingBox();

    if (!box) {
      console.warn(`⚠️  Could not find element for selector: ${selector}`);
      return null;
    }

    // Capture screenshot of just this element
    const screenshot = await element.screenshot({ path: filePath });
    return screenshot;
  } catch (error) {
    console.error(`Error capturing screenshot for ${selector}:`, error.message);
    return null;
  }
}

/**
 * Main measurement function
 */
async function measureAllSections() {
  console.log('🚀 Starting pixel-perfect measurements...\n');

  // Start browser
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to homepage
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('✅ Connected to homepage\n');

    // Measure each section
    for (const section of SECTIONS) {
      console.log(`📏 Measuring ${section.name} (${section.nodeId})...`);

      const figmaPath = path.join(screenshotsDir, `figma-${section.name.toLowerCase().replace(/ /g, '-')}.png`);
      const playwrightPath = path.join(screenshotsDir, `playwright-${section.name.toLowerCase().replace(/ /g, '-')}.png`);

      // Capture Playwright screenshot
      const captureResult = await captureScreenshot(page, section.selector, playwrightPath, section.viewport);

      if (!captureResult) {
        console.log(`⚠️  Skipped ${section.name}\n`);
        continue;
      }

      // Check if Figma screenshot exists
      if (!fs.existsSync(figmaPath)) {
        console.log(`⚠️  Figma screenshot not found: ${figmaPath}`);
        console.log(`   Please capture Figma screenshot first using get_screenshot(${section.nodeId})\n`);
        continue;
      }

      // Measure difference
      const measurement = await measureDifference(figmaPath, playwrightPath);

      if (measurement) {
        const status = measurement.percentage <= 3 ? '✅' : '🔴';
        console.log(`   ${status} Difference: ${measurement.percentage}%`);
        console.log(`   Mismatch pixels: ${measurement.mismatchPixels} / ${measurement.totalPixels}`);
        console.log(`   Dimensions: ${measurement.width}x${measurement.height}\n`);

        results.push({
          section: section.name,
          nodeId: section.nodeId,
          beforePercent: measurement.percentage,
          afterPercent: null,
          status: measurement.percentage <= 3 ? 'PASS' : 'NEEDS_FIX',
          figmaSize: getFileSize(figmaPath),
          playwrightSize: getFileSize(playwrightPath),
        });
      }
    }

    await browser.close();

    // Generate report
    console.log('\n📊 MEASUREMENT REPORT\n');
    console.log('| Section | AVANT % | APRÈS % | Status |');
    console.log('|---------|---------|---------|--------|');

    for (const result of results) {
      const before = result.beforePercent.toFixed(2);
      const after = result.afterPercent ? result.afterPercent.toFixed(2) : '-';
      const statusEmoji = result.status === 'PASS' ? '✅' : '⚠️';
      console.log(`| ${result.section} | ${before} | ${after} | ${statusEmoji} ${result.status} |`);
    }

    // Save results to JSON
    const resultsPath = path.join(screenshotsDir, 'measurements.json');
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Results saved to ${resultsPath}`);

    // Summary
    const passCount = results.filter(r => r.status === 'PASS').length;
    const failCount = results.filter(r => r.status === 'NEEDS_FIX').length;
    console.log(`\n📈 Summary: ${passCount} passed, ${failCount} need fixes`);

  } catch (error) {
    console.error('Fatal error:', error);
    await browser.close();
    process.exit(1);
  }
}

// Run measurements
measureAllSections().catch(console.error);
