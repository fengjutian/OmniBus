# omnibus-ts (OmniBus)

一个轻量级、类型安全的 omniBus 实现，支持全局单例、通配符事件与异步发布。

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

## 导入方式
- ESM（推荐）
  ```ts
  import { omniBus } from 'omnibus-ts';
  ```
- CommonJS
  ```js
  const { omniBus } = require('omnibus-ts');
  ```

> 提示：本包提供 ESM 与 CJS 构建产物，未提供 UMD。浏览器环境建议经由打包工具引入。

## 快速上手

```ts
import { omniBus } from 'omnibus-ts';

// 1) 定义事件类型映射（键为事件名，值为载荷类型）
interface MyEvents {
  'user:login': { userId: string; username: string };
  'user:logout': { userId: string };
  'message:received': { id: string; content: string };
}

// 2) 创建或获取总线
const bus = new omniBus<MyEvents>();
// 或：const bus = omniBus.getInstance<MyEvents>(); // 全局单例

// 3) 订阅
const off = bus.subscribe('user:login', (data) => {
  console.log(`用户 ${data.username} 已登录`);
});

// 4) 发布（异步执行订阅回调）
bus.publish('user:login', { userId: '123', username: 'zhangsan' });

// 5) 取消订阅
off();
```

## 通配符订阅（监听所有事件）

```ts
import { omniBus } from 'omnibus-ts';

interface MyEvents {
  'user:login': { userId: string; username: string };
  'message:received': { id: string; content: string };
}

const bus = new omniBus<MyEvents>();

// "*" 订阅回调的参数为 { event: string; data: any }
bus.subscribe('*', ({ event, data }) => {
  console.log('触发事件:', event, '数据:', data);
});

bus.publish('user:login', { userId: '1', username: 'alice' });
```

## 一次性订阅

```ts
const bus = new omniBus<MyEvents>();

bus.once('user:login', (data) => {
  console.log('首次登录:', data.username);
});

bus.publish('user:login', { userId: '1', username: 'alice' }); // 触发
bus.publish('user:login', { userId: '1', username: 'alice' }); // 不再触发
```

## API 概览
- `new omniBus<T>()`：创建事件总线，`T` 为事件名到载荷的映射
- `omniBus.getInstance<T>()`：获取/初始化全局单例
- `subscribe(eventName, callback)`：订阅事件；返回取消订阅函数
- `unsubscribe(eventName, callback)`：取消订阅
- `publish(eventName, payload)`：异步发布事件
- `once(eventName, callback)`：一次性订阅

通配符回调签名：`{ event: string; data: any }`

## 本地开发与构建（操作过程）
1. 安装依赖
   ```bash
   npm install
   ```
2. 构建产物（生成 CJS 与 ESM）
   ```bash
   npm run build
   ```
   输出：`dist/index.cjs.js`、`dist/index.esm.js`、`dist/index.d.ts`
3. 本地调试引用
   - 方式 A：link
     ```bash
     # 在本项目中
     npm run build
     npm link

     # 在你的应用项目中
     npm link omnibus-ts
     ```
   - 方式 B：file 引用（在应用 `package.json` 中）
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
     npm version patch && npm publish --access public
     ```
   - 若使用镜像或需要切换源，请在 `login/publish` 命令后附带 `--registry=...`

## 版本与兼容性
- 语义化版本：遵循 SemVer
- 运行时环境：现代 Node/浏览器（编译目标 `ES2019`）
- 类型支持：内置 TypeScript 声明（`dist/index.d.ts`）

## 许可证
MIT