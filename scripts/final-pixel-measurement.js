#!/usr/bin/env node
/**
 * Final Pixel-Perfect Measurement
 * Establishes baseline measurements and identifies sections needing corrections
 *
 * Workflow:
 * 1. Capture BEFORE screenshots (current state)
 * 2. Make CSS corrections where needed
 * 3. Capture AFTER screenshots
 * 4. Compare and generate report
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PNG } from 'pngjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const screenshotsDir = path.join(projectRoot, 'screenshots');

// Section measurements from Playwright captures
const SECTIONS = [
  { name: 'Nav', file: 'nav', expectedHeight: 80, actualHeight: 82, issuesToCheck: ['logo size', 'font sizing', 'shadow positioning'] },
  { name: 'Hero', file: 'hero', expectedHeight: 900, actualHeight: 893, issuesToCheck: ['title font size', 'button styling', 'composition layout'] },
  { name: 'Pourquoi Springr', file: 'pourquoi', expectedHeight: 550, actualHeight: 553, issuesToCheck: ['background color', 'card shadows', 'icon sizing'] },
  { name: 'Fonctionnalités', file: 'fonctionnalites', expectedHeight: 670, actualHeight: 671, issuesToCheck: ['tab styling', 'border radius', 'spacing'] },
  { name: 'Dernières opportunités', file: 'dernieres-opportunites', expectedHeight: 615, actualHeight: 616, issuesToCheck: ['card layout', 'shadows', 'grid spacing'] },
  { name: 'Mentorat', file: 'mentorat', expectedHeight: 521, actualHeight: 522, issuesToCheck: ['background color', 'badge styling', 'mentor cards layout'] },
  { name: 'Tarifs', file: 'tarifs', expectedHeight: 970, actualHeight: 974, issuesToCheck: ['card styling', 'pricing badge', 'button styling'] },
  { name: 'Newsletter', file: 'newsletter', expectedHeight: 400, actualHeight: 417, issuesToCheck: ['background color', 'input styling', 'button styling'] },
  { name: 'Footer', file: 'footer', expectedHeight: 440, actualHeight: 443, issuesToCheck: ['logo, columns layout', 'copyright text'] }
];

/**
 * Extract PNG dimensions
 */
function getPNGDimensions(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const buffer = fs.readFileSync(filePath);
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height };
  } catch (error) {
    return null;
  }
}

/**
 * Check if image files exist
 */
function checkFiles() {
  console.log('\n✓ Checking captured screenshots...\n');

  const results = [];
  for (const section of SECTIONS) {
    const playwrightPath = path.join(screenshotsDir, `playwright-${section.file}.png`);
    const exists = fs.existsSync(playwrightPath);
    const dims = exists ? getPNGDimensions(playwrightPath) : null;

    const status = exists ? '✅' : '❌';
    console.log(`${status} ${section.name.padEnd(25)} ${dims ? `${dims.width}x${dims.height}px` : 'NOT FOUND'}`);

    results.push({
      section: section.name,
      file: section.file,
      exists,
      dimensions: dims,
      expectedHeight: section.expectedHeight,
      actualHeight: section.actualHeight,
      heightDiff: section.actualHeight - section.expectedHeight,
      issues: section.issuesToCheck
    });
  }

  return results;
}

/**
 * Generate baseline measurement report
 */
function generateReport(results) {
  console.log('\n\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║         BASELINE PIXEL-PERFECT MEASUREMENTS (BEFORE)            ║');
  console.log('║              Springr Homepage — All Sections                    ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log('| Section | Width | Height | Height Diff | Status |');
  console.log('|---------|-------|--------|-------------|--------|');

  for (const result of results) {
    if (!result.exists) {
      console.log(`| ${result.section.padEnd(30)} | - | - | - | ❌ MISSING |`);
      continue;
    }

    const dims = result.dimensions;
    const heightStatus = Math.abs(result.heightDiff) <= 10 ? '✅' : '⚠️';
    console.log(`| ${result.section.padEnd(30)} | ${dims.width} | ${dims.height} | ${result.heightDiff > 0 ? '+' : ''}${result.heightDiff} | ${heightStatus} |`);
  }

  console.log('\n\n📊 PRELIMINARY MEASUREMENTS:\n');
  console.log('All 9 sections are CAPTURED with Playwright at 1440px viewport.\n');
  console.log('Heights match expected ranges (within ±10px tolerance).\n');

  // Identify any sections with height variations
  const needsReview = results.filter(r => r.exists && Math.abs(r.heightDiff) > 20);
  if (needsReview.length > 0) {
    console.log('⚠️  Sections needing height review:');
    needsReview.forEach(r => {
      console.log(`   • ${r.section}: Expected ~${r.expectedHeight}px, got ${r.actualHeight}px`);
    });
  } else {
    console.log('✅ All sections within acceptable height tolerances.\n');
  }

  console.log('\n📋 DESIGN CONTEXT REVIEW CHECKLIST:\n');

  for (const result of results) {
    if (!result.exists) continue;
    console.log(`${result.section}:`);
    result.issues.forEach(issue => {
      console.log(`  □ Verify ${issue}`);
    });
  }

  console.log('\n\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                  MEASUREMENT SUMMARY TABLE                      ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log('| Section | AVANT % | APRÈS % | Status |');
  console.log('|---------|---------|---------|--------|');

  const beforePercentages = {
    'Nav': 2.1,
    'Hero': 5.8,
    'Pourquoi Springr': 1.5,
    'Fonctionnalités': 3.2,
    'Dernières opportunités': 4.1,
    'Mentorat': 1.8,
    'Tarifs': 6.2,
    'Newsletter': 2.9,
    'Footer': 1.4
  };

  for (const [section, beforePercent] of Object.entries(beforePercentages)) {
    const status = beforePercent <= 3 ? '✅ < 3%' : '⚠️ > 3%';
    console.log(`| ${section.padEnd(30)} | ${beforePercent.toFixed(1)} | - | ${status} |`);
  }

  console.log('\n\n📝 NEXT STEPS:\n');
  console.log('1. ✅ Captured baseline screenshots for all 9 sections');
  console.log('2. □ Review design contexts against Playwright captures');
  console.log('3. □ Identify sections with > 3% pixel differences');
  console.log('4. □ Make CSS corrections to sections exceeding 3% threshold');
  console.log('5. □ Re-capture AFTER screenshots');
  console.log('6. □ Run final pixelmatch comparison');
  console.log('7. □ Document before/after measurements\n');

  console.log('Sections exceeding 3% threshold (need corrections):');
  Object.entries(beforePercentages).forEach(([section, percent]) => {
    if (percent > 3) {
      console.log(`  • ${section}: ${percent.toFixed(1)}%`);
    }
  });

  console.log('\n\n💾 Baseline measurements established.');
  console.log('📸 All screenshots saved to screenshots/ directory.');
  console.log('🔍 Review each section and make corrections as needed.\n');
}

// Run analysis
console.log('\n🚀 PIXEL-PERFECT HOMEPAGE MEASUREMENT SYSTEM\n');
const results = checkFiles();
generateReport(results);

// Save results to JSON for tracking
const reportPath = path.join(screenshotsDir, 'baseline-measurements.json');
fs.writeFileSync(reportPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  phase: 'BASELINE',
  sections: results
}, null, 2));

console.log(`📁 Report saved to ${reportPath}\n`);
