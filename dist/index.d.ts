export interface EventMap {
    [key: string]: any;
}
/**
 * - 支持全局单例
 * - 支持 "*" 通配事件
 * - 支持异步队列（publish 异步执行）
 */
export declare class EventBus<T extends EventMap = Record<string, any>> {
    private static _instance;
    /** 全局单例 */
    static getInstance<EM extends EventMap = Record<string, any>>(): EventBus<EM>;
    private events;
    /** 订阅 */
    subscribe<K extends keyof T | "*">(eventName: K, callback: (payload: K extends "*" ? {
        event: string;
        data: any;
    } : T[K]) => void): () => void;
    /** 取消订阅 */
    unsubscribe<K extends keyof T | "*">(eventName: K, callback: (payload: any) => void): void;
    /** 异步发布 */
    publish<K extends keyof T>(eventName: K, payload: T[K]): void;
    /** 一次性订阅 */
    once<K extends keyof T>(eventName: K, callback: (payload: T[K]) => void): void;
}
