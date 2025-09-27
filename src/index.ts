export interface EventMap {
  [key: string]: any;
}

/**
 * - 支持全局单例
 * - 支持 "*" 通配事件
 * - 支持异步队列（publish 异步执行）
 */
export class EventBus<T extends EventMap = Record<string, any>> {
  private static _instance: EventBus<any> | null = null;

  /** 全局单例 */
  static getInstance<EM extends EventMap = Record<string, any>>() {
    if (!EventBus._instance) {
      EventBus._instance = new EventBus<EM>();
    }
    return EventBus._instance as EventBus<EM>;
  }

  private events: {
    [K in keyof T | "*"]?: Array<(payload: K extends "*" ? { event: string; data: any } : T[K]) => void>;
  } = {};

  /** 订阅 */
  subscribe<K extends keyof T | "*">(
    eventName: K,
    callback: (payload: K extends "*" ? { event: string; data: any } : T[K]) => void
  ): () => void {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName]!.push(callback as any);
    return () => this.unsubscribe(eventName, callback);
  }

  /** 取消订阅 */
  unsubscribe<K extends keyof T | "*">(
    eventName: K,
    callback: (payload: any) => void
  ) {
    this.events[eventName] = this.events[eventName]?.filter(cb => cb !== callback);
  }

  /** 异步发布 */
  publish<K extends keyof T>(eventName: K, payload: T[K]) {
    // 常规事件
    if (this.events[eventName]) {
      for (const cb of this.events[eventName]!) {
        Promise.resolve().then(() => cb(payload));
      }
    }
    // 通配事件
    if (this.events["*"]) {
      for (const cb of this.events["*"]!) {
        Promise.resolve().then(() =>
          cb({ event: eventName as string, data: payload })
        );
      }
    }
  }

  /** 一次性订阅 */
  once<K extends keyof T>(
    eventName: K,
    callback: (payload: T[K]) => void
  ) {
    const wrapper = ((payload: K extends "*" ? { event: string; data: any } : T[K]) => {
      callback(payload as T[K]);
      this.unsubscribe(eventName, wrapper);
    }) as (payload: K extends "*" ? { event: string; data: any } : T[K]) => void;
    
    this.subscribe(eventName, wrapper);
  }
}
