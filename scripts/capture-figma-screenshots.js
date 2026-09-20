#!/usr/bin/env node
/**
 * Capture Figma screenshots and save them
 * Uses the figma MCP to get screenshots for each section
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');
const screenshotsDir = path.join(projectRoot, 'screenshots');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Section data
const SECTIONS = [
  { name: 'Nav', nodeId: '3:721' },
  { name: 'Hero', nodeId: '3:3' },
  { name: 'Pourquoi', nodeId: '3:128' },
  { name: 'Fonctionnalites', nodeId: '3:166' },
  { name: 'Dernieres-opportunites', nodeId: '3:395' },
  { name: 'Mentorat', nodeId: '3:556' },
  { name: 'Tarifs', nodeId: '3:622' },
  { name: 'Newsletter', nodeId: '3:704' },
  { name: 'Footer', nodeId: '3:480' },
];

console.log('📸 To capture Figma screenshots, call get_screenshot() for each section:');
console.log('');

for (const section of SECTIONS) {
  console.log(`\nSection: ${section.name}`);
  console.log(`Node ID: ${section.nodeId}`);
  console.log(`Output file: ${path.join(screenshotsDir, `figma-${section.name.toLowerCase()}.png`)}`);
  console.log(`Call: mcp__figma__get_screenshot(${section.nodeId})`);
}

console.log('\n\n✅ Use the Figma MCP tool to get screenshots for each section.');
console.log('Screenshots will be saved to the screenshots/ directory.\n');
