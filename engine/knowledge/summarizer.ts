/**
 * @fileoverview Code summarizer — produces structured summaries from source files. @since 0.2.6
 * @package zhi
 */
/** @brief Source file input. @since 0.2.6 */
export interface SourceFile {
  path: string;
  content: string;
  language?: string;
}

/** @brief Project context. @since 0.2.6 */
export interface ProjectContext {
  name?: string;
  description?: string;
  dependencies?: string[];
}

/** @brief Summary section. @since 0.2.6 */
export interface SummarySection {
  symbol: string;
  startLine: number;
  endLine: number;
  summary: string;
}

/** @brief File summary. @since 0.2.6 */
export interface FileSummary {
  path: string;
  language: string;
  purpose: string;
  exports: string[];
  sections: SummarySection[];
  lineCount: number;
}

/** @brief Summarize a source file. @since 0.2.6 */
export function summarize(file: SourceFile, _context?: ProjectContext): FileSummary {
  const lines = file.content.split('\n');
  const language = file.language ?? detectLanguage(file.path);
  const exports: string[] = [];
  const sections: SummarySection[] = [];
  let currentSection: SummarySection | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const exportMatch = line.match(
      /export\s+(?:function|const|class|interface|type|async\s+function)\s+(\w+)/,
    );
    if (exportMatch) {
      exports.push(exportMatch[1]);
      if (currentSection) sections.push(currentSection);
      currentSection = {
        symbol: exportMatch[1],
        startLine: i + 1,
        endLine: i + 1,
        summary: `Exports ${exportMatch[1]}`,
      };
    }
    if (currentSection) currentSection.endLine = i + 1;
  }
  if (currentSection) sections.push(currentSection);

  return {
    path: file.path,
    language,
    purpose: `${language} module at ${file.path}`,
    exports,
    sections,
    lineCount: lines.length,
  };
}

/** @brief Detect language from file path. @since 0.2.6 */
function detectLanguage(path: string): string {
  if (path.endsWith('.ts') || path.endsWith('.tsx')) return 'typescript';
  if (path.endsWith('.js') || path.endsWith('.jsx')) return 'javascript';
  if (path.endsWith('.zig')) return 'zig';
  if (path.endsWith('.py')) return 'python';
  if (path.endsWith('.go')) return 'go';
  if (path.endsWith('.rs')) return 'rust';
  return 'unknown';
}
