/**
 * - 支持全局单例
 * - 支持 "*" 通配事件
 * - 支持异步队列（publish 异步执行）
 */
class omniBus {
    constructor() {
        this.events = {};
    }
    /** 全局单例 */
    static getInstance() {
        if (!omniBus._instance) {
            omniBus._instance = new omniBus();
        }
        return omniBus._instance;
    }
    /** 订阅 */
    subscribe(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
        return () => this.unsubscribe(eventName, callback);
    }
    /** 取消订阅 */
    unsubscribe(eventName, callback) {
        var _a;
        this.events[eventName] = (_a = this.events[eventName]) === null || _a === void 0 ? void 0 : _a.filter(cb => cb !== callback);
    }
    /** 异步发布 */
    publish(eventName, payload) {
        // 常规事件
        if (this.events[eventName]) {
            for (const cb of this.events[eventName]) {
                Promise.resolve().then(() => cb(payload));
            }
        }
        // 通配事件
        if (this.events["*"]) {
            for (const cb of this.events["*"]) {
                Promise.resolve().then(() => cb({ event: eventName, data: payload }));
            }
        }
    }
    /** 一次性订阅 */
    once(eventName, callback) {
        const wrapper = ((payload) => {
            callback(payload);
            this.unsubscribe(eventName, wrapper);
        });
        this.subscribe(eventName, wrapper);
    }
}
omniBus._instance = null;

export { omniBus };
