#!/usr/bin/env node
/**
 * Update Service Worker Build Timestamp
 * Run this script before deployment to force service worker updates
 * 
 * Usage: node scripts/update-sw-version.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SW_PATH = path.join(__dirname, '../public/sw.js');

// Read current service worker
let swContent = fs.readFileSync(SW_PATH, 'utf8');

// Generate new build timestamp
const buildTimestamp = Date.now();
const buildDate = new Date().toISOString();

// Replace the build timestamp
swContent = swContent.replace(
  /const BUILD_TIMESTAMP = [^;]+;/,
  `const BUILD_TIMESTAMP = ${buildTimestamp};`
);

// Add comment with human-readable date
swContent = swContent.replace(
  /\/\/ This should be replaced with actual build time/,
  `// Built on: ${buildDate}`
);

// Write updated service worker
fs.writeFileSync(SW_PATH, swContent);

console.log(`✅ Service Worker updated with build timestamp: ${buildTimestamp}`);
console.log(`📅 Build date: ${buildDate}`);
console.log(`🚀 Deploy this version to force client updates!`);