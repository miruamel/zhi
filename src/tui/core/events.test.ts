import { describe, test, expect } from 'bun:test';
import { CANCEL, EventBus, createEventBus } from './events';

interface AppEvents {
  tick: number;
  message: { from: string; text: string };
  shutdown: void;
}

describe('EventBus', () => {
  test('subscribe/emit invokes handler with payload', () => {
    const bus = new EventBus<AppEvents>();
    const received: number[] = [];
    bus.subscribe('tick', (n) => {
      received.push(n);
    });
    bus.emit('tick', 1);
    bus.emit('tick', 2);
    expect(received).toEqual([1, 2]);
  });

  test('returns unsubscribe function from subscribe', () => {
    const bus = new EventBus<AppEvents>();
    const calls: number[] = [];
    const handler = (n: number) => {
      calls.push(n);
    };
    const unsub = bus.subscribe('tick', handler);
    bus.emit('tick', 1);
    unsub();
    bus.emit('tick', 2);
    expect(calls).toEqual([1]);
  });

  test('unsubscribe removes specific handler', () => {
    const bus = new EventBus<AppEvents>();
    const calls: number[] = [];
    const a = (n: number) => {
      calls.push(n * 10);
    };
    const b = (n: number) => {
      calls.push(n);
    };
    bus.subscribe('tick', a);
    bus.subscribe('tick', b);
    bus.unsubscribe('tick', a);
    bus.emit('tick', 3);
    expect(calls).toEqual([3]);
  });

  test('unsubscribe returns false when handler missing', () => {
    const bus = new EventBus<AppEvents>();
    const handler = (_n: number) => {};
    expect(bus.unsubscribe('tick', handler)).toBe(false);
  });

  test('once fires only on first emit', () => {
    const bus = new EventBus<AppEvents>();
    const calls: number[] = [];
    bus.once('tick', (n) => {
      calls.push(n);
    });
    bus.emit('tick', 5);
    bus.emit('tick', 6);
    expect(calls).toEqual([5]);
  });

  test('once unsubscribe prevents firing', () => {
    const bus = new EventBus<AppEvents>();
    const calls: number[] = [];
    const handler = (n: number) => {
      calls.push(n);
    };
    const off = bus.once('tick', handler);
    off();
    bus.emit('tick', 1);
    expect(calls).toEqual([]);
  });

  test('clear removes all listeners when no event given', () => {
    const bus = new EventBus<AppEvents>();
    bus.subscribe('tick', () => {});
    bus.subscribe('message', () => {});
    bus.clear();
    expect(bus.listenerCount('tick')).toBe(0);
    expect(bus.listenerCount('message')).toBe(0);
  });

  test('clear scoped to one event keeps others', () => {
    const bus = new EventBus<AppEvents>();
    bus.subscribe('tick', () => {});
    bus.subscribe('message', () => {});
    bus.clear('tick');
    expect(bus.listenerCount('tick')).toBe(0);
    expect(bus.listenerCount('message')).toBe(1);
  });

  test('emit returns false when no cancellation', () => {
    const bus = new EventBus<AppEvents>();
    bus.subscribe('tick', () => {});
    expect(bus.emit('tick', 1)).toBe(false);
  });

  test('CANCEL sentinel stops propagation', () => {
    const bus = new EventBus<AppEvents>();
    const calls: number[] = [];
    bus.subscribe('tick', (n) => {
      calls.push(n);
      return CANCEL;
    });
    bus.subscribe('tick', (n) => {
      calls.push(n * 100);
    });
    expect(bus.emit('tick', 7)).toBe(true);
    expect(calls).toEqual([7]);
  });

  test('boolean true stops propagation', () => {
    const bus = new EventBus<AppEvents>();
    const calls: number[] = [];
    bus.subscribe('tick', () => {
      calls.push(1);
      return true;
    });
    bus.subscribe('tick', () => {
      calls.push(2);
    });
    expect(bus.emit('tick', 0)).toBe(true);
    expect(calls).toEqual([1]);
  });

  test('once handler does not stop others via cancellation', () => {
    const bus = new EventBus<AppEvents>();
    const order: string[] = [];
    bus.subscribe('tick', () => {
      order.push('first');
      return CANCEL;
    });
    bus.once('tick', () => {
      order.push('once');
    });
    bus.emit('tick', 0);
    expect(order).toEqual(['first']);
  });

  test('payload types are enforced via generic', () => {
    const bus = new EventBus<AppEvents>();
    bus.subscribe('message', (m) => {
      const from: string = m.from;
      expect(typeof from).toBe('string');
    });
    bus.emit('message', { from: 'alice', text: 'hi' });
  });

  test('emit with no listeners is a no-op returning false', () => {
    const bus = new EventBus<AppEvents>();
    expect(bus.emit('shutdown', undefined)).toBe(false);
    expect(bus.emit('tick', 42)).toBe(false);
  });

  test('createEventBus returns independent instances', () => {
    const a = createEventBus<AppEvents>();
    const b = createEventBus<AppEvents>();
    const calls: number[] = [];
    a.subscribe('tick', (n) => {
      calls.push(n);
    });
    b.emit('tick', 9);
    expect(calls).toEqual([]);
  });

  test('listenerCount reflects subscriptions', () => {
    const bus = new EventBus<AppEvents>();
    expect(bus.listenerCount('tick')).toBe(0);
    bus.subscribe('tick', () => {});
    bus.subscribe('tick', () => {});
    bus.once('tick', () => {});
    expect(bus.listenerCount('tick')).toBe(3);
    bus.emit('tick', 0);
    expect(bus.listenerCount('tick')).toBe(2);
  });

  test('handler errors do not stop other handlers', () => {
    const bus = new EventBus<AppEvents>();
    const calls: number[] = [];
    bus.subscribe('tick', () => {
      throw new Error('boom');
    });
    bus.subscribe('tick', (n) => {
      calls.push(n);
    });
    expect(() => bus.emit('tick', 3)).toThrow('boom');
  });
});