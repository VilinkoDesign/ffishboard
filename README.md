# 实时协作画板应用

一个基于 Vue 3 + Pinia + TypeScript 的实时协作画板应用，支持多人同时在线绘画，提供画笔、橡皮擦等基本绘图工具。

> [!IMPORTANT]  
> 请尽量使用 `pnpm` 安装和管理，以避免潜在的设置问题。

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
- HTTP API 服务器 (用于房间管理、用户认证和历史记录)
- SQL 数据库 (用于用户数据和房间信息存储)

## 功能特性

- 🎨 实时协作绘画
- 🖌️ 基础绘图工具 (画笔、橡皮擦)
- 🎨 颜色选择器
- 📏 画笔粗细调节
- 👥 多人在线显示
- 🏠 房间管理
- 📱 响应式设计
- 🔐 用户认证系统 (登录、注册)
- 📱 手机登录支持
- 🎯 自动房间分配

## 测试账号

为了方便测试，以下是两个测试手机号和对应的密码：

| 手机号 | 密码 | 说明 |
|--------|------|------|
| 13800138000 | 123456 | 测试账号1 |
| 13800138001 | 123456 | 测试账号2 |

## 快速开始

### 环境要求

- Node.js 16+ (推荐使用 Node.js 18)
- pnpm

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

#### 2.1 数据库设计

##### 2.1.1 用户表 (`users`)

```sql
CREATE TABLE `users` (
  `id` varchar(36) NOT NULL COMMENT '用户ID',
  `username` varchar(50) NOT NULL COMMENT '用户名',
  `phone` varchar(20) NOT NULL COMMENT '手机号',
  `password_hash` varchar(255) NOT NULL COMMENT '密码哈希',
  `color` varchar(10) NOT NULL COMMENT '用户颜色',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';
```

##### 2.1.2 房间表 (`rooms`)

```sql
CREATE TABLE `rooms` (
  `id` varchar(36) NOT NULL COMMENT '房间ID',
  `name` varchar(100) NOT NULL COMMENT '房间名称',
  `creator_id` varchar(36) NOT NULL COMMENT '创建者ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='房间表';
```

##### 2.1.3 房间用户表 (`room_users`)

```sql
CREATE TABLE `room_users` (
  `room_id` varchar(36) NOT NULL COMMENT '房间ID',
  `user_id` varchar(36) NOT NULL COMMENT '用户ID',
  `joined_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
  PRIMARY KEY (`room_id`, `user_id`),
  FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='房间用户表';
```

##### 2.1.4 操作记录表 (`operations`)

```sql
CREATE TABLE `operations` (
  `id` varchar(36) NOT NULL COMMENT '操作ID',
  `room_id` varchar(36) NOT NULL COMMENT '房间ID',
  `user_id` varchar(36) NOT NULL COMMENT '用户ID',
  `type` varchar(20) NOT NULL COMMENT '操作类型',
  `data` json NOT NULL COMMENT '操作数据',
  `tool` varchar(20) NOT NULL COMMENT '工具类型',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_room_id` (`room_id`),
  KEY `idx_user_id` (`user_id`),
  FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作记录表';
```

#### 2.2 WebSocket 服务器

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
  - `check_room` - 检查房间是否存在
  - `room_exists` - 房间存在响应

#### 2.3 HTTP API 服务器

项目需要 HTTP API 服务器来处理以下功能：

- 房间创建和管理
- 用户认证（登录、注册）
- 历史操作记录

## 项目结构

```
src/
├── api/             # API 服务层
│   └── websocket.ts # WebSocket 客户端
├── components/      # Vue 组件
│   ├── CanvasBoard.vue    # 画板组件
│   ├── ColorPicker.vue    # 颜色选择器
│   ├── BrushSetting.vue   # 画笔设置
│   ├── RoomInfo.vue       # 房间信息
│   ├── Toolbar.vue        # 工具栏
│   └── LoginPage.vue      # 登录注册页面
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
├── App.vue          # 根组件
├── main.js          # 入口文件
├── style.css        # 全局样式
└── vite-env.d.ts    # Vite 环境类型
```

## 开发指南

### 代码规范

- 遵循 Vue 3 Composition API 最佳实践
- 使用 TypeScript 进行类型检查
- 组件命名使用 PascalCase
- 文件名使用 PascalCase 或 kebab-case

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

## 许可证

MIT
