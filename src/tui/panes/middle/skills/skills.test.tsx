/**
 * @fileoverview SkillBrowserPane tests. @since 0.2.3
 */
import { describe, it, expect } from 'bun:test';
import { renderToString } from '../../../core/test/render';
import { SkillBrowserPane } from './skills';

const skills = [
  { name: 'build', description: 'Build project', enabled: true, category: 'build', usageCount: 10 },
  { name: 'test', description: 'Run tests', enabled: false, category: 'test', usageCount: 3 },
  { name: 'security', description: 'Security scan', enabled: true, category: 'security' },
];

describe('SkillBrowserPane', () => {
  it('renders skill count and names', () => {
    const f = renderToString(<SkillBrowserPane skills={skills} />);
    expect(f).toContain('_SKILLS (2/3 enabled)');
    expect(f).toContain('build');
    expect(f).toContain('test');
    expect(f).toContain('security');
  });

  it('filters by search query', () => {
    const f = renderToString(<SkillBrowserPane skills={skills} searchQuery="sec" />);
    expect(f).toContain('security');
    expect(f).not.toContain('build');
  });

  it('shows no match message when filter empty', () => {
    const f = renderToString(<SkillBrowserPane skills={skills} searchQuery="zzz" />);
    expect(f).toContain('No skills match.');
  });
});
