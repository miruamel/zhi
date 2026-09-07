/**
 * @fileoverview File tree entity types. @since 0.2.0
 * @package zhi
 */
/** File node for tree */
export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory' | 'symlink';
  size?: number;
  modified?: number;
  children?: FileNode[];
  expanded?: boolean;
  selected?: boolean;
  icon?: string;
  depth?: number;
}

/** File change */
export interface FileChange {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  hunks?: DiffHunk[];
}

/** Diff hunk */
export interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: DiffLine[];
}

/** Diff line */
export interface DiffLine {
  type: 'context' | 'add' | 'delete' | 'header';
  content: string;
  oldLineNum?: number;
  newLineNum?: number;
}
