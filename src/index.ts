export interface omniMap {
  // 事件名到载荷类型的映射；键为事件名字符串，值为该事件的载荷类型
  [key: string]: any;
}

/**
 * - 支持全局单例
 * - 支持 "*" 通配事件
 * - 支持异步队列（publish 异步执行）
 */
export class omniBus<T extends omniMap = Record<string, any>> {
  // 单例实例引用（全局仅一个实例）
  private static _instance: omniBus<any> | null = null;

  /** 全局单例 */
  static getInstance<EM extends omniMap = Record<string, any>>() {
    // 懒加载创建：首次调用时创建实例
    if (!omniBus._instance) {
      omniBus._instance = new omniBus<EM>();
    }
    // 返回时按调用方指定的事件映射进行类型断言
    return omniBus._instance as omniBus<EM>;
  }

  // 事件表：具体事件名或通配符 "*" -> 对应的回调列表
  private events: {
    [K in keyof T | "*"]?: Array<(payload: K extends "*" ? { event: string; data: any } : T[K]) => void>;
  } = {};

  /** 订阅 */
  subscribe<K extends keyof T | "*">(
    eventName: K,
    // 通配符订阅的 payload 为 { event, data }；普通订阅为事件对应的载荷类型
    callback: (payload: K extends "*" ? { event: string; data: any } : T[K]) => void
  ): () => void {
    // 初始化事件回调数组
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    // 记录回调
    this.events[eventName]!.push(callback as any);
    // 返回取消订阅函数，便于调用方释放
    return () => this.unsubscribe(eventName, callback);
  }

  /** 取消订阅 */
  unsubscribe<K extends keyof T | "*">(
    eventName: K,
    callback: (payload: any) => void
  ) {
    // 通过过滤移除指定回调
    this.events[eventName] = this.events[eventName]?.filter(cb => cb !== callback);
  }

  /** 异步发布 */
  publish<K extends keyof T>(eventName: K, payload: T[K]) {
    // 常规事件：使用微任务队列，避免阻塞调用方
    if (this.events[eventName]) {
      for (const cb of this.events[eventName]!) {
        Promise.resolve().then(() => cb(payload));
      }
    }
    // 通配事件：向订阅 "*" 的回调发送 { event, data }
    if (this.events["*"]) {
      for (const cb of this.events["*"]!) {
        Promise.resolve().then(() =>
          cb({ event: eventName as string, data: payload })
        );
      }
    }
  }

  /** 一次性订阅：触发一次后自动解除订阅（含幂等保护） */
  once<K extends keyof T>(
    eventName: K,
    callback: (payload: T[K]) => void
  ) {
    // 防重复标记：同一轮事件循环多次排队时只执行一次
    let fired = false;
    const wrapper = ((payload: K extends "*" ? { event: string; data: any } : T[K]) => {
      if (fired) return;
      fired = true;
      callback(payload as T[K]);
      this.unsubscribe(eventName, wrapper);
    }) as (payload: K extends "*" ? { event: string; data: any } : T[K]) => void;
    
    this.subscribe(eventName, wrapper);
  }
}
