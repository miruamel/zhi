#!/usr/bin/env node
// @since tag normalizer: replace unreleased 0.2.x with 0.1.11 (next patch)
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const TARGET_VERSION = '0.1.11';
const STALE_PATTERNS = ['0.2.0', '0.2.1', '0.2.2', '0.2.3', '0.2.4', '0.2.5', '0.2.6', '0.2.7'];
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);
const SCAN_DIRS = ['engine', 'src'];

let changed = 0, unchanged = 0, errors = 0;

function walkDir(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      walkDir(full);
    } else if (entry.isFile() && EXTENSIONS.has(extname(entry.name))) {
      processFile(full);
    }
  }
}

function processFile(filePath) {
  try {
    const raw = readFileSync(filePath, 'utf8');
    let updated = raw;
    for (const ver of STALE_PATTERNS) {
      updated = updated.replace(new RegExp(`@since ${ver}`, 'g'), `@since ${TARGET_VERSION}`);
    }
    if (updated !== raw) {
      writeFileSync(filePath, updated, 'utf8');
      changed++;
      console.log(`  ${filePath}`);
    } else {
      unchanged++;
    }
  } catch (e) {
    console.error(`  ERROR ${filePath}: ${e.message}`);
    errors++;
  }
}

for (const dir of SCAN_DIRS) {
  walkDir(dir);
}

console.log(`\nResult: ${changed} files updated, ${unchanged} unchanged, ${errors} errors`);
process.exit(errors > 0 ? 1 : 0);
