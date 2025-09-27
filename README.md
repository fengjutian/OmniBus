# OmniBus

一个轻量级、类型安全的 EventBus 实现，具有单例模式、通配符事件和异步队列功能。

## 特性

- 🌟 **类型安全**：使用 TypeScript 泛型提供完整的类型推断和类型检查
- 🔄 **全局单例**：支持通过 `getInstance()` 方法获取全局单例实例
- 🔍 **通配符事件**：支持使用 `"*"` 监听所有事件
- ⏱️ **异步队列**：事件发布采用异步执行方式，避免阻塞主线程
- 🔥 **一次性订阅**：支持通过 `once()` 方法进行一次性事件订阅

## 安装

```bash
npm install omnibus
```

## 使用方法

### 基本用法

```typescript
import { EventBus } from 'omnibus';

// 定义事件类型
interface MyEvents {
  'user:login': { userId: string; username: string };
  'user:logout': { userId: string };
  'message:received': { id: string; content: string };
}

// 创建 EventBus 实例
const bus = new EventBus<MyEvents>();

// 订阅事件
const unsubscribe = bus.subscribe('user:login', (data) => {
  console.log(`用户 ${data.username} 已登录`);
});

// 发布事件
bus.publish('user:login', { userId: '123', username: 'zhangsan' });

// 取消订阅
unsubscribe();
```

### 使用全局单例

```typescript
import { EventBus } from 'omnibus';

// 获取全局单例
const bus = EventBus.getInstance<MyEvents>();

// 在应用的不同部分使用相同的实例
// 在组件 A 中
bus.subscribe('message:received', (data) => {
  console.log(`收到消息: ${data.content}`);
});

// 在组件 B 中
bus.publish('message:received', { id: '456', content: '你好！' });
```

### 使用通配符事件

```typescript
import { EventBus } from 'omnibus';

const bus = new EventBus<MyEvents>();

// 订阅所有事件
bus.subscribe('*', (data) => {
  console.log(`事件 ${data.event} 被触发，数据:`, data.data);
});

// 发布任意事件都会触发上面的订阅
bus.publish('user:login', { userId: '123', username: 'zhangsan' });
bus.publish('message:received', { id: '456', content: '你好！' });
```

### 一次性订阅

```typescript
import { EventBus } from 'omnibus';

const bus = new EventBus<MyEvents>();

// 一次性订阅，只会触发一次
bus.once('user:login', (data) => {
  console.log(`用户 ${data.username} 首次登录`);
});

// 第一次触发会执行回调
bus.publish('user:login', { userId: '123', username: 'zhangsan' });
// 第二次触发不会执行回调
bus.publish('user:login', { userId: '123', username: 'zhangsan' });
```

## 开发过程

1. 初始化项目结构
   - 创建基本的 TypeScript 项目
   - 配置 tsconfig.json 和 rollup.config.js

2. 实现核心功能
   - 设计 EventBus 类及其接口
   - 实现事件订阅、发布和取消订阅功能
   - 添加全局单例支持
   - 实现通配符事件监听
   - 添加异步事件队列
   - 实现一次性订阅功能

3. 解决类型问题
   - 修复 TypeScript 类型错误，特别是在 once 方法中的类型兼容性问题
   - 确保通配符事件与具体事件类型的兼容性

4. 构建配置
   - 添加 `"type": "module"` 到 package.json 以支持 ES 模块
   - 配置 Rollup 以生成 CommonJS 和 ES 模块格式的输出

5. 测试和发布
   - 验证所有功能正常工作
   - 发布到 npm 仓库

## 许可证

MIT