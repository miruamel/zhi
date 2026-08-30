/** @brief Critic: deteksi kebocoran secret (mandate §7.1). @since 0.2.0 */
import type { Critique } from '../../aggregate';
import type { FileRecord } from '../sloc/critic';

interface SecretPattern {
  re: RegExp;
  label: string;
}

// ponytail: hanya pola high-confidence untuk hindari false-positive masif. PII umum (email/NIK)
// disengaja dikecualikan; nilai credential diawali '/' (path URL) diabaikan. Tambah pola di sini
// bila ada bukti kebocoran nyata di repo target.
const SECRET_RES: SecretPattern[] = [
  { re: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/, label: 'private-key-block' },
  { re: /\bAKIA[0-9A-Z]{16}\b/, label: 'aws-access-key-id' },
  { re: /\beyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/, label: 'jwt-token' },
  { re: /\b(?:postgres|postgresql|mysql|mongodb|redis|amqp):\/\/[^\s:'"]+:[^\s:'"]+@/, label: 'db-url-with-credentials' },
  { re: /\b(?:password|passwd|secret|api[_-]?key|token|private[_-]?key|access[_-]?key)\s*[:=]\s*['"](?!\/)[A-Za-z0-9/+_@.-]{8,}['"]/, label: 'hardcoded-credential' },
];

/** @brief Privacy critic: setiap kecocokan secret kurangi skor 0.5 (floor 0), bobot 1.5.
 * @param {FileRecord[]} files - kumpulan file.
 * @return {Critique} hasil critic.
 * @since 0.2.0 */
export function privacyCritic(files: FileRecord[]): Critique {
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
