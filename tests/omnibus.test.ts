import { describe, it, expect } from 'vitest';
import { omniBus } from '../src/index';

interface MyEvents {
  'user:login': { userId: string; username: string };
  'user:logout': { userId: string };
}

describe('omniBus', () => {
  it('异步发布：回调不会同步触发', async () => {
    const bus = new omniBus<MyEvents>();
    let called = false;
    bus.subscribe('user:login', () => { called = true; });

    bus.publish('user:login', { userId: '1', username: 'alice' });
    expect(called).toBe(false); // 立即检查应为 false

    await Promise.resolve(); // 刷新微任务
    expect(called).toBe(true);
  });

  it('多订阅与取消订阅', async () => {
    const bus = new omniBus<MyEvents>();
    const results: string[] = [];

    const offA = bus.subscribe('user:login', (d) => results.push(`A:${d.username}`));
    const offB = bus.subscribe('user:login', (d) => results.push(`B:${d.username}`));

    bus.publish('user:login', { userId: '1', username: 'alice' });
    await Promise.resolve();
    expect(results).toEqual(['A:alice', 'B:alice']);

    offA();
    results.length = 0;
    bus.publish('user:login', { userId: '1', username: 'bob' });
    await Promise.resolve();
    expect(results).toEqual(['B:bob']);
  });

  it('一次性订阅只触发一次', async () => {
    const bus = new omniBus<MyEvents>();
    let count = 0;
    bus.once('user:logout', () => { count++; });

    bus.publish('user:logout', { userId: '1' });
    bus.publish('user:logout', { userId: '1' });

    await Promise.resolve();
    expect(count).toBe(1);
  });

  it('通配符订阅收到事件名与数据', async () => {
    const bus = new omniBus<MyEvents>();
    const events: Array<{ event: string; data: unknown }> = [];

    bus.subscribe('*', (payload) => events.push(payload));
    bus.publish('user:login', { userId: '1', username: 'alice' });

    await Promise.resolve();
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({ event: 'user:login', data: { userId: '1', username: 'alice' } });
  });

  it('getInstance 返回全局单例', () => {
    const a = omniBus.getInstance();
    const b = omniBus.getInstance();
    expect(a).toBe(b);
  });
});