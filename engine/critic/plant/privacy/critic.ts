/** @brief Critic: deteksi kebocoran secret (mandate §7.1). @since 0.1.1 */
import type { CriticResult } from '../../aggregate';
import type { FileRecord } from '../sloc/critic';

interface SecretPattern {
  re: RegExp;
  label: string;
}

// ponytail: improved to detect common PII (email, NIK) with high-confidence patterns to reduce false positives.
// Next: contextual credential detection via taint analysis if generated artifacts show evidence.
const SECRET_RES: SecretPattern[] = [
  { re: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/, label: 'private-key-block' },
  { re: /\bAKIA[0-9A-Z]{16}\b/, label: 'aws-access-key-id' },
  { re: /\beyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/, label: 'jwt-token' },
  {
    re: /\b(?:postgres|postgresql|mysql|mongodb|redis|amqp):\/\/[^\s:'"]+:[^\s:'"]+@/,
    label: 'db-url-with-credentials',
  },
  {
    re: /\b(?:password|passwd|secret|api[_-]?key|token|private[_-]?key|access[_-]?key)\s*[:=]\s*['"](?!\/)[A-Za-z0-9/+_@.-]{8,}['"]/,
    label: 'hardcoded-credential',
  },
  // email pattern: simple but robust for common email format
  { re: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/, label: 'email' },
  // NIK (Nomor Induk Kependudukan) Indonesia: 16 digits
  { re: /\b\d{16}\b/, label: 'nik' },
];

/** @brief Privacy critic: setiap kecocokan secret kurangi skor 0.5 (floor 0), bobot 1.5.
 * @param {FileRecord[]} files - kumpulan file.
 * @return {Critique} hasil critic.
 * @since 0.1.1 */
export function privacyCritic(files: FileRecord[]): CriticResult {
  const findings: string[] = [];
  let count = 0;
  for (const f of files) {
    const lines = f.content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      for (const p of SECRET_RES) {
        if (p.re.test(lines[i])) {
          findings.push(`${f.path}:${i + 1} ${p.label}`);
          count++;
        }
      }
    }
  }
  const score = Math.max(0, 1 - 0.5 * count);
  return { name: 'privacy', score, weight: 1.5, findings };
}
