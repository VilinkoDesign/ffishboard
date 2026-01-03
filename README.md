# 实时协作画板应用

一个基于 Vue 3 + Pinia + TypeScript 的实时协作画板应用，支持多人同时在线绘画，提供画笔、橡皮擦等基本绘图工具。

## 技术栈

### 前端
- Vue 3 (Composition API)
- Pinia (状态管理)
- TypeScript
- Vite (构建工具)
- HTML5 Canvas (绘图引擎)
- WebSocket (实时通信)

### 后端
- WebSocket 服务器 (用于实时通信)
- HTTP API 服务器 (用于房间管理和历史记录)

## 功能特性

- 🎨 实时协作绘画
- 🖌️ 基础绘图工具 (画笔、橡皮擦)
- 🎨 颜色选择器
- 📏 画笔粗细调节
- 👥 多人在线显示
- 🏠 房间管理
- 📱 响应式设计
- ⏱️ 操作回放/撤销支持

## 快速开始

### 环境要求

- Node.js 16+ (推荐使用 Node.js 18)
- npm 或 yarn 或 pnpm

### 安装依赖

```bash
# 使用 pnpm
pnpm install
```

### 开发模式

```bash
# 使用 pnpm
pnpm run dev
```

应用将在 http://localhost:5173 启动

### 构建生产版本

```bash
# 使用 pnpm
pnpm run build
```

构建产物将生成在 `dist` 目录中

## 私有化部署

### 1. 前端部署

#### 1.1 配置环境变量

在项目根目录创建 `.env.production` 文件，配置以下环境变量：

```env
# WebSocket 服务器地址
VITE_WEBSOCKET_URL=ws://your-websocket-server:port

# HTTP API 地址
VITE_API_BASE_URL=http://your-api-server:port/api
```

#### 1.2 构建前端

```bash
pnpm run build
```

#### 1.3 部署到静态文件服务器

将 `dist` 目录中的文件部署到任何静态文件服务器，如 Nginx、Apache、Caddy 或云服务提供商的静态网站托管服务。

**Nginx 配置示例**：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/your/fishboard/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 如果需要 HTTPS，请配置 SSL 证书
    # listen 443 ssl;
    # ssl_certificate /path/to/ssl/cert.pem;
    # ssl_certificate_key /path/to/ssl/key.pem;
}
```

### 2. 后端部署

#### 2.1 WebSocket 服务器

项目依赖于 WebSocket 服务器进行实时通信。你需要部署一个支持以下功能的 WebSocket 服务器：

- 房间管理（创建、加入、离开）
- 实时消息广播
- 操作同步
- 心跳检测和重连机制

**WebSocket 服务器要求**：

- 支持 WebSocket 协议
- 能够处理以下消息类型：
  - `join_room` - 用户加入房间
  - `operation` - 绘图操作
  - `ping` - 心跳检测
  - `user_joined` - 通知用户加入
  - `user_left` - 通知用户离开
  - `remote_operation` - 转发远程操作
  - `pong` - 心跳响应

#### 2.2 HTTP API 服务器

项目需要 HTTP API 服务器来处理以下功能：

- 房间创建和管理
- 用户认证（可选）
- 历史操作记录

**HTTP API 要求**：

- 支持 RESTful API
- 提供房间管理接口
- 提供历史操作查询接口

### 3. 配置说明

#### 3.1 前端配置

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| VITE_WEBSOCKET_URL | WebSocket 服务器地址 | ws://localhost:3000 |
| VITE_API_BASE_URL | HTTP API 地址 | http://localhost:3000/api |

#### 3.2 后端配置

根据你选择的后端框架和数据库，配置相应的参数：

- 数据库连接信息
- WebSocket 端口
- HTTP API 端口
- 跨域配置
- 认证配置（可选）

## API 接口文档

### 1. WebSocket 接口

#### 1.1 客户端发送消息

##### 1.1.1 加入房间

```json
{
  "type": "join_room",
  "data": {
    "roomId": "string",
    "userId": "string",
    "username": "string"
  }
}
```

##### 1.1.2 绘图操作

```json
{
  "type": "operation",
  "data": {
    "id": "string",
    "type": "StartStroke" | "AppendPoint" | "EndStroke",
    "userId": "string",
    "timestamp": 1234567890,
    "data": {
      // 操作数据，根据操作类型不同而不同
    },
    "tool": "brush" | "eraser"
  }
}
```

##### 1.1.3 心跳检测

```json
{
  "type": "ping",
  "data": {
    "timestamp": 1234567890
  }
}
```

#### 1.2 服务器发送消息

##### 1.2.1 用户加入通知

```json
{
  "type": "user_joined",
  "data": {
    "userId": "string",
    "username": "string",
    "color": "string"
  }
}
```

##### 1.2.2 用户离开通知

```json
{
  "type": "user_left",
  "data": {
    "userId": "string"
  }
}
```

##### 1.2.3 远程操作

```json
{
  "type": "remote_operation",
  "data": {
    // 同客户端发送的 operation 数据结构
  }
}
```

##### 1.2.4 心跳响应

```json
{
  "type": "pong",
  "data": {
    "timestamp": 1234567890
  }
}
```

### 2. HTTP API 接口

#### 2.1 房间管理

##### 2.1.1 创建房间

- **URL**: `/api/rooms`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "name": "房间名称"
  }
  ```
- **Response**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "roomId": "string",
      "name": "string",
      "createdAt": "string"
    }
  }
  ```

##### 2.1.2 获取房间信息

- **URL**: `/api/rooms/{roomId}`
- **Method**: `GET`
- **Response**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "roomId": "string",
      "name": "string",
      "users": [
        {
          "userId": "string",
          "username": "string",
          "color": "string"
        }
      ]
    }
  }
  ```

#### 2.2 历史操作

##### 2.2.1 获取房间历史操作

- **URL**: `/api/rooms/{roomId}/operations`
- **Method**: `GET`
- **Query Parameters**:
  - `limit`: 每页数量
  - `offset`: 偏移量
- **Response**:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "operations": [
        // 操作列表
      ],
      "total": 100
    }
  }
  ```

## 项目结构

```
src/
├── api/             # API 服务层
│   ├── http.ts      # HTTP 客户端
│   ├── types.ts     # API 类型定义
│   └── websocket.ts # WebSocket 客户端
├── components/      # Vue 组件
│   ├── CanvasBoard.vue    # 画板组件
│   ├── ColorPicker.vue    # 颜色选择器
│   ├── BrushSetting.vue   # 画笔设置
│   ├── RoomInfo.vue       # 房间信息
│   └── Toolbar.vue        # 工具栏
├── controllers/     # 控制器层
│   ├── InputController.ts      # 输入处理
│   └── OperationController.ts  # 操作处理
├── engine/          # Canvas 引擎
│   ├── CanvasEngine.ts     # 画布引擎
│   ├── renderer/           # 渲染器
│   │   └── PathRenderer.ts # 路径渲染器
│   └── types.ts            # 引擎类型定义
├── models/          # 数据模型
│   ├── operation.ts # 操作模型
│   └── stroke.ts    # 笔触模型
├── store/           # Pinia 状态管理
│   ├── board.ts     # 画板状态
│   └── user.ts      # 用户状态
├── utils/           # 工具函数
├── App.vue          # 根组件
├── main.ts          # 入口文件
└── vite-env.d.ts    # Vite 环境类型
```

## 开发指南

### 代码规范

- 遵循 Vue 3 Composition API 最佳实践
- 使用 TypeScript 进行类型检查
- 组件命名使用 PascalCase
- 文件名使用 PascalCase 或 kebab-case
- 使用 ESLint 和 Prettier 进行代码格式化
- UI 设计 遵循 VinaDesign 内部版本设计规范

## 注意事项

1. **WebSocket 连接**：
   - 确保 WebSocket 服务器配置了正确的跨域策略
   - 实现了心跳机制以保持连接活跃
   - 实现了重连机制以处理网络波动

2. **Canvas 性能**：
   - 对于大量笔触的场景，考虑实现分层渲染
   - 实现笔触合并和优化渲染逻辑
   - 使用 requestAnimationFrame 进行平滑渲染

3. **数据同步**：
   - 确保操作顺序的一致性
   - 实现操作的幂等性
   - 考虑使用 CRDT 算法处理冲突

4. **安全性**：
   - 对 WebSocket 连接进行认证
   - 验证客户端发送的操作数据
   - 限制单个用户的操作频率

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！
