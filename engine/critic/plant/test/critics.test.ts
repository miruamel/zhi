/**
 * @fileoverview Critic registry tests. @since 0.2.6
 */
import { describe, it, expect } from 'bun:test';
import { CRITIC_REGISTRY, getCriticDescriptor } from '../critics';

describe('critic registry', () => {
  it('has at least 20 critics', () => {
    expect(CRITIC_REGISTRY.length).toBeGreaterThanOrEqual(20);
  });

  it('returns descriptor by id', () => {
    const d = getCriticDescriptor(CRITIC_REGISTRY[0].id);
    expect(d).toBeDefined();
    expect(d?.id).toBe(CRITIC_REGISTRY[0].id);
  });

  it('returns undefined for unknown id', () => {
    expect(getCriticDescriptor('nonexistent')).toBeUndefined();
  });

  it('each critic has required fields', () => {
    for (const c of CRITIC_REGISTRY) {
      expect(c.id).toBeTruthy();
      expect(c.name).toBeTruthy();
      expect(c.severity).toBeTruthy();
      expect(c.check).toBeTypeOf('function');
    }
  });
});
