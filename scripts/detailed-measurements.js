#!/usr/bin/env node
/**
 * Detailed Pixel-Perfect Measurements
 * Compares current implementation against Figma design specifications
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const screenshotsDir = path.join(projectRoot, 'screenshots');

// Section specifications from Figma design context
const SECTIONS = [
  {
    name: 'Nav',
    nodeId: '3:721',
    file: 'nav',
    specs: {
      height: '80px',
      logo: '40x40px, border 2px black, shadow 3px 3px 0px black',
      font: 'Poppins Bold 24px for logo, Inter Medium 14px for links',
      colors: 'Primary #06f, Highlight #fdcb58, Dark #111827',
      shadow_button: '4px 4px 0px black for S\'inscrire'
    }
  },
  {
    name: 'Hero',
    nodeId: '3:3',
    file: 'hero',
    specs: {
      height: '~900px',
      title: 'Poppins ExtraBold 72px',
      highlight: 'Yellow (#fdcb58) on "avenir" word',
      buttons: 'Primary CTA + Secondary border-only CTA',
      composition: 'Dashboard card + Offer card + Notification badge'
    }
  },
  {
    name: 'Pourquoi Springr',
    nodeId: '3:128',
    file: 'pourquoi',
    specs: {
      height: '~550px',
      background: '#fdcb58 (yellow)',
      cards: '3 cards with icons, title, description',
      cardShadow: '4px 4px 0px black',
      cardRadius: '12px border'
    }
  },
  {
    name: 'Fonctionnalités',
    nodeId: '3:166',
    file: 'fonctionnalites',
    specs: {
      height: '~670px',
      tabs: '4 tabs: Offres, Mentorat, Bons Plans, Communauté',
      layout: 'Tab selector + content panel with border 2px black'
    }
  },
  {
    name: 'Dernières opportunités',
    nodeId: '3:395',
    file: 'dernieres-opportunites',
    specs: {
      height: '~615px',
      grid: '3 columns job cards',
      cardStyle: 'border 2px black, shadow 4px 4px 0px black'
    }
  },
  {
    name: 'Mentorat',
    nodeId: '3:556',
    file: 'mentorat',
    specs: {
      height: '~521px',
      background: '#1fad7a (teal/green)',
      badge: 'Black badge with white "MENTORAT" text',
      title: 'Poppins Bold white text',
      mentors: '4 mentor cards in grid'
    }
  },
  {
    name: 'Tarifs',
    nodeId: '3:622',
    file: 'tarifs',
    specs: {
      height: '~973px',
      title: 'Poppins Bold "Investissez en vous-même"',
      toggle: 'Étudiants / Entreprises toggle',
      cards: '2 pricing cards: Freemium (white) + Premium (yellow #fdcb58)',
      premiumBadge: 'Black "POPULAIRE" badge on premium'
    }
  },
  {
    name: 'Newsletter',
    nodeId: '3:704',
    file: 'newsletter',
    specs: {
      height: '~416px',
      background: 'Dark navy background',
      title: 'Poppins Bold white "Prêt à lancer votre carrière ?"',
      input: 'White input field',
      button: 'Primary CTA "Je m\'inscris"'
    }
  },
  {
    name: 'Footer',
    nodeId: '3:480',
    file: 'footer',
    specs: {
      height: '~442px',
      logo: 'UpNest logo (or Springr)',
      columns: '4 columns: Plateforme, Entreprise, Légal + Social',
      copyright: 'Bottom copyright text'
    }
  }
];

/**
 * Load and compare two PNG images
 */
async function comparePNGs(path1, path2) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(path1) || !fs.existsSync(path2)) {
      resolve(null);
      return;
    }

    const img1Data = fs.readFileSync(path1);
    const img2Data = fs.readFileSync(path2);

    let img1, img2;
    let loadCount = 0;

    const checkComplete = () => {
      if (loadCount === 2 && img1 && img2) {
        try {
          const width = Math.min(img1.width, img2.width);
          const height = Math.min(img1.height, img2.height);
          const diff = new PNG({ width, height });

          const mismatchPixels = pixelmatch(
            img1.data, img2.data, diff.data,
            width, height,
            { threshold: 0.1 }
          );

          const totalPixels = width * height;
          const percentage = (mismatchPixels / totalPixels * 100).toFixed(2);

          resolve({
            mismatchPixels,
            totalPixels,
            percentage: parseFloat(percentage),
            dimensions: { width, height }
          });
        } catch (err) {
          reject(err);
        }
      }
    };

    new PNG().parse(img1Data, (err, data) => {
      if (err) reject(err);
      img1 = data;
      loadCount++;
      checkComplete();
    });

    new PNG().parse(img2Data, (err, data) => {
      if (err) reject(err);
      img2 = data;
      loadCount++;
      checkComplete();
    });
  });
}

/**
 * Generate measurement report
 */
async function generateReport() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║         PIXEL-PERFECT HOMEPAGE MEASUREMENTS                    ║');
  console.log('║         Springr — Figma vs Playwright Comparison               ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const results = [];

  for (const section of SECTIONS) {
    console.log(`\n📏 ${section.name} (${section.nodeId})`);
    console.log('─'.repeat(60));

    // Print specifications
    console.log('\n📋 Figma Specifications:');
    Object.entries(section.specs).forEach(([key, value]) => {
      console.log(`   • ${key}: ${value}`);
    });

    // Check Playwright screenshot
    const playwrightPath = path.join(screenshotsDir, `playwright-${section.file}.png`);
    if (fs.existsSync(playwrightPath)) {
      const stats = fs.statSync(playwrightPath);
      console.log(`\n✅ Playwright screenshot found: ${(stats.size / 1024).toFixed(1)}KB`);

      // Try to load and get dimensions
      try {
        const data = fs.readFileSync(playwrightPath);
        // PNG header info at bytes 16-24 contains width/height
        const width = data.readUInt32BE(16);
        const height = data.readUInt32BE(20);
        console.log(`   Dimensions: ${width}x${height}px`);
      } catch (err) {
        // Ignore dimension read errors
      }
    } else {
      console.log(`⚠️  No Playwright screenshot found`);
    }

    results.push({
      section: section.name,
      nodeId: section.nodeId,
      status: 'INITIAL_MEASUREMENT'
    });
  }

  // Summary
  console.log('\n\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                      MEASUREMENT SUMMARY                        ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log('| Section | AVANT % | APRÈS % | Status |');
  console.log('|---------|---------|---------|--------|');
  for (const result of results) {
    console.log(`| ${result.section.padEnd(30)} | - | - | Initial |`);
  }

  console.log('\n\n📝 NEXT STEPS:');
  console.log('1. Review each section against Figma design context');
  console.log('2. Make CSS corrections for any visual differences');
  console.log('3. Re-capture screenshots with Playwright');
  console.log('4. Run pixelmatch comparison: node scripts/detailed-measurements.js');
  console.log('5. Document before/after percentages\n');
}

// Run report
generateReport().catch(console.error);
