/**
 * @fileoverview Doctor command — system health check. @since 0.1.11
 * @package zhi
 */
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

/** @brief Doctor options. @since 0.1.11 */
export interface DoctorOpts {
  verbose?: boolean;
}

/** @brief Doctor check result. @since 0.1.11 */
export interface DoctorCheck {
  name: string;
  ok: boolean;
  detail: string;
}

/** @brief Doctor report. @since 0.1.11 */
export interface DoctorReport {
  checks: DoctorCheck[];
  allOk: boolean;
}

/** @brief Run doctor checks. @since 0.1.11 */
export function doctor(_opts: DoctorOpts = {}): DoctorReport {
  const checks: DoctorCheck[] = [];
  const nodeOk = typeof process !== 'undefined' && process.versions?.node != null;
  checks.push({
    name: 'node',
    ok: nodeOk,
    detail: nodeOk ? `Node ${process.versions.node}` : 'Node not found',
  });

  let zigOk = false;
  let zigDetail = 'Zig not found';
  try {
    const out = execSync('zig version', { stdio: 'pipe', timeout: 5000 }).toString().trim();
    zigOk = out.length > 0;
    zigDetail = zigOk ? `Zig ${out}` : 'Zig not found';
  } catch {
    zigOk = false;
  }
  checks.push({ name: 'zig', ok: zigOk, detail: zigDetail });

  const bunOk = typeof Bun !== 'undefined';
  checks.push({ name: 'bun', ok: bunOk, detail: bunOk ? 'Bun runtime' : 'Bun not found' });

  const cwdOk = existsSync(process.cwd());
  checks.push({ name: 'disk', ok: cwdOk, detail: cwdOk ? 'CWD accessible' : 'CWD not accessible' });

  let netOk = false;
  try {
    netOk = typeof fetch === 'function';
  } catch {
    netOk = false;
  }
  checks.push({ name: 'network', ok: netOk, detail: netOk ? 'Fetch available' : 'Fetch not available' });

  const configOk = typeof process !== 'undefined' && typeof process.env === 'object';
  checks.push({ name: 'config', ok: configOk, detail: configOk ? 'Config env present' : 'Config env missing' });

  return { checks, allOk: checks.every((c) => c.ok) };
}
