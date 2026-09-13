#!/usr/bin/env node
/**
 * @fileoverview Validate npm audit JSON and preserve npm's severity exit status.
 * @since 0.1.13
 */
import { existsSync, readFileSync, statSync } from 'node:fs';

const [reportPath, rawStatus] = process.argv.slice(2);
const auditStatus = Number(rawStatus);

if (
  !reportPath ||
  !Number.isInteger(auditStatus) ||
  auditStatus < 0 ||
  auditStatus > 255 ||
  !existsSync(reportPath) ||
  statSync(reportPath).size === 0
) {
  console.error('npm audit report is missing or empty');
  process.exit(1);
}

let audit;
try {
  audit = JSON.parse(readFileSync(reportPath, 'utf8'));
} catch (error) {
  console.error(`Invalid npm audit JSON: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}

if (
  !audit ||
  Array.isArray(audit) ||
  typeof audit !== 'object' ||
  !audit.vulnerabilities ||
  Array.isArray(audit.vulnerabilities) ||
  typeof audit.vulnerabilities !== 'object' ||
  !audit.metadata?.vulnerabilities ||
  Array.isArray(audit.metadata.vulnerabilities) ||
  typeof audit.metadata.vulnerabilities !== 'object'
) {
  console.error('npm audit JSON is missing the vulnerability report');
  process.exit(1);
}

const summary = audit.metadata.vulnerabilities;
const counts = {};
for (const severity of ['critical', 'high', 'moderate', 'low']) {
  const count = summary[severity];
  if (!Number.isFinite(count) || count < 0) {
    console.error(`npm audit JSON has an invalid ${severity} vulnerability count`);
    process.exit(1);
  }
  counts[severity] = count;
}

console.log('=== npm audit summary ===');
for (const severity of ['critical', 'high', 'moderate', 'low']) {
  console.log(`${severity}: ${counts[severity]}`);
}

const hasBlockingVulnerability = counts.critical > 0 || counts.high > 0;
process.exit(hasBlockingVulnerability ? 1 : auditStatus);
