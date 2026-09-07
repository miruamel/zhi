/**
 * @fileoverview Arranger engine tests. @since 0.2.0
 */
import { describe, it, expect } from 'bun:test';
import { Arranger } from './engine';

describe('Arranger', () => {
  it('starts with default layout', () => {
    const a = new Arranger();
    const snap = a.snapshot();
    expect(snap.root.id).toBe('root');
    expect(snap.root.children).toBeDefined();
  });

  it('finds node by id', () => {
    const a = new Arranger();
    const node = a.findNode('dag');
    expect(node).not.toBeNull();
    expect(node!.id).toBe('dag');
  });

  it('finds parent of node', () => {
    const a = new Arranger();
    const parent = a.findParent('dag');
    expect(parent).not.toBeNull();
    expect(parent!.parent.id).toBe('middle');
  });

  it('visiblePanes returns leaf nodes', () => {
    const a = new Arranger();
    const panes = a.visiblePanes();
    expect(panes.length).toBeGreaterThan(0);
    expect(panes).toContain('dag');
    expect(panes).toContain('log');
  });

  it('dispatch resize updates size', () => {
    const a = new Arranger();
    const before = a.findNode('dag')!;
    a.dispatch({ type: 'resize', id: 'dag', size: 50 });
    const after = a.findNode('dag')!;
    expect(after.size).toBe(50);
    expect(after.size).not.toBe(before.size);
  });

  it('dispatch collapse hides node', () => {
    const a = new Arranger();
    a.dispatch({ type: 'collapse', id: 'dag' });
    const node = a.findNode('dag');
    expect(node!.collapsed).toBe(true);
  });

  it('dispatch expand un-hides node', () => {
    const a = new Arranger();
    a.dispatch({ type: 'collapse', id: 'dag' });
    a.dispatch({ type: 'expand', id: 'dag' });
    const node = a.findNode('dag');
    expect(node!.collapsed).toBe(false);
  });

  it('subscribe fires on dispatch', () => {
    const a = new Arranger();
    let calls = 0;
    a.subscribe(() => {
      calls++;
    });
    a.dispatch({ type: 'resize', id: 'dag', size: 30 });
    expect(calls).toBeGreaterThan(0);
  });

  it('reset restores default layout', () => {
    const a = new Arranger();
    a.dispatch({ type: 'resize', id: 'dag', size: 50 });
    a.reset();
    const node = a.findNode('dag');
    expect(node!.size).not.toBe(50);
  });

  it('split creates two children', () => {
    const a = new Arranger();
    a.dispatch({ type: 'split', id: 'dag', direction: 'horizontal' });
    const after = a.findNode('dag')!;
    expect(after.children).toBeDefined();
    expect(after.children!.length).toBe(2);
    expect(after.children![0].id).not.toBe(after.children![1].id);
  });

  it('swap exchanges pane values', () => {
    const a = new Arranger();
    const dagBefore = a.findNode('dag')!;
    const detailBefore = a.findNode('detail')!;
    a.dispatch({ type: 'swap', idA: 'dag', idB: 'detail' });
    const dagAfter = a.findNode('dag')!;
    const detailAfter = a.findNode('detail')!;
    expect(dagAfter.pane).toBe(detailBefore.pane);
    expect(detailAfter.pane).toBe(dagBefore.pane);
  });

  it('close removes node from tree', () => {
    const a = new Arranger();
    a.dispatch({ type: 'close', id: 'pr' });
    const node = a.findNode('pr');
    expect(node).toBeNull();
  });
});
