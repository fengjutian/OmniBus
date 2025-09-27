# omnibus-ts (OmniBus)

一个轻量级、类型安全的 EventBus 实现，支持全局单例、通配符事件与异步发布。

## 特性
- 类型安全：泛型驱动的端到端类型提示与校验
- 全局单例：`EventBus.getInstance()` 获取全局唯一实例
- 通配符事件：使用 `"*"` 订阅所有事件
- 异步发布：`publish` 回调在微任务队列执行，不阻塞主流程
- 一次性订阅：`once` 只触发一次后自动取消订阅

## 安装

```bash
npm install omnibus-ts
```

## 快速上手

```ts
import { EventBus } from 'omnibus-ts';

// 1) 定义事件类型映射
interface MyEvents {
  'user:login': { userId: string; username: string };
  'user:logout': { userId: string };
  'message:received': { id: string; content: string };
}

// 2) 创建或获取总线
const bus = new EventBus<MyEvents>();
// 或：const bus = EventBus.getInstance<MyEvents>(); // 全局单例

// 3) 订阅
const off = bus.subscribe('user:login', (data) => {
  console.log(`用户 ${data.username} 已登录`);
});

// 4) 发布
bus.publish('user:login', { userId: '123', username: 'zhangsan' });

// 5) 取消订阅
off();
```

## 通配符订阅

```ts
import { EventBus } from 'omnibus-ts';

interface MyEvents {
  'user:login': { userId: string; username: string };
  'message:received': { id: string; content: string };
}

const bus = new EventBus<MyEvents>();

bus.subscribe('*', ({ event, data }) => {
  console.log('触发事件:', event, '数据:', data);
});

bus.publish('user:login', { userId: '1', username: 'alice' });
```

## 一次性订阅

```ts
const bus = new EventBus<MyEvents>();

bus.once('user:login', (data) => {
  console.log('首次登录:', data.username);
});

bus.publish('user:login', { userId: '1', username: 'alice' }); // 触发
bus.publish('user:login', { userId: '1', username: 'alice' }); // 不再触发
```

## API
- `new EventBus<T>()`：创建事件总线，`T` 为事件名到负载的映射
- `EventBus.getInstance<T>()`：获取/初始化全局单例
- `subscribe(eventName, callback)`：订阅事件；返回取消订阅函数
- `unsubscribe(eventName, callback)`：取消订阅
- `publish(eventName, payload)`：异步发布事件
- `once(eventName, callback)`：一次性订阅

通配符回调签名：`{ event: string; data: any }`

## 构建与开发（操作过程）
1. 安装依赖
   ```bash
   npm install
   ```
2. 构建产物（生成 CJS 与 ESM）
   ```bash
   npm run build
   ```
   - 输出：`dist/index.cjs.js`、`dist/index.esm.js`、类型声明 `dist/index.d.ts`
3. 本地调试引用
   - 方式 A：link
     ```bash
     # 在本项目中
     npm run build
     npm link

     # 在你的应用项目中
     npm link omnibus-ts
     ```
   - 方式 B：file 引用
     在应用 `package.json` 中：
     ```json
     {
       "dependencies": {
         "omnibus-ts": "file:/absolute/path/to/OmniBus"
       }
     }
     ```
4. 发布到 npm（可选）
   - 登录（使用官方源）：
     ```bash
     npm config set registry https://registry.npmjs.org/
     npm login
     ```
   - 发布：
     ```bash
     npm publish --access public
     ```
   - 若使用镜像或需要切换源，请在 `login/publish` 命令后附带 `--registry=...`

## 版本与兼容性
- 语义化版本：遵循 SemVer
- 运行时环境：现代 Node/浏览器（编译目标 `ES2019`）
- 类型支持：内置 TypeScript 声明（`dist/index.d.ts`）

## 许可证
MIT