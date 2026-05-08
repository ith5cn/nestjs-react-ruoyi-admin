# NestJS + React + Vite + Ant Design Admin

一个面向游戏平台与业务后台场景的全栈管理系统，采用 `NestJS + React + Vite + Ant Design` 构建，内置完整的系统管理能力与可落地的代码生成工具，适合作为中后台项目脚手架、业务后台起点，或二次开发基础工程。

## Demo

- 在线体验：[http://admin.ith5.cn/](http://admin.ith5.cn/)

## 为什么选择这个项目

和只提供登录页、菜单页的“空后台模板”不同，这个项目更像一套已经投入业务使用并持续演进的后台基础设施：

- 前后端分离，结构清晰，便于独立部署与协作开发
- 内置用户、角色、菜单、部门、字典、配置、日志、附件、定时任务等常用后台模块
- 提供数据库表导入式代码生成器，可生成前后端 CRUD、路由、菜单权限
- 已包含真实业务模块示例，如项目管理、游戏管理、游戏分组
- 支持按钮级权限控制与菜单自动注册
- 包含接口加密、签名、JWT 鉴权等安全机制

如果你在找的是：

- 一个可直接继续开发的后台基座
- 一个带代码生成能力的 NestJS + React 管理系统

这套项目会比较合适。

## 功能亮点

### 1.前后端分离

仓库同时包含：

- `sdm-api.ith5.com`：后端 API 服务
- `sdm.ith5.com`：前端管理端

不需要再自己去拼接前后端模板。

### 2. 内置代码生成器

项目内置代码生成器，支持：

- 从数据库表导入字段元数据
- 配置查询字段、表单字段、列表字段、组件类型
- 生成 NestJS 模块、Controller、Service、Entity、DTO
- 生成 React 页面、表单、表格、API 文件
- 自动插入菜单与按钮权限

这部分能力很适合中后台业务快速铺模块。

### 3. Docker 部署

前后端都提供了 Dockerfile，后端额外提供了开发环境依赖的 `docker-compose.dev.yml`，适合：

- 本地开发
- 单机部署
- 容器化交付

## 技术栈

### 前端

- React 19
- Vite 8
- TypeScript
- Ant Design
- Zustand
- Axios
- Tailwind CSS
- WangEditor

### 后端

- NestJS 11
- TypeORM
- MySQL 8
- Redis
- Zod
- JWT
- Winston

## 项目结构

```text
game-plat/
├─ sdm-api.ith5.com/   # NestJS API
└─ sdm.ith5.com/       # React admin frontend
```

## 核心模块

### 系统模块

- 用户管理
- 角色管理
- 菜单管理
- 部门管理
- 岗位管理
- 字典管理
- 系统配置
- 公告管理
- 附件管理
- 登录日志
- 操作日志
- 上传管理
- 定时任务

### 工具模块

- 代码生成器

前端入口：

- `/system/gen-code`

后端接口前缀：

- `/system/codegen`

## 本地开发

### 要求

- Node.js `18+` 或 `20+`
- pnpm
- Docker / Docker Compose（推荐，用于快速启动 MySQL / Redis）
- demo数据库sql文件在 `api/sql/sdm_system.sql`，可以自行导入到mysql

### 1. 启动后端依赖

```bash
cd sdm-api.ith5.com
docker compose -f docker-compose.dev.yml up -d
```

默认开发依赖端口：

- MySQL：`127.0.0.1:3308`
- Redis：`127.0.0.1:6381`

### 2. 启动后端 API

```bash
cd sdm-api.ith5.com
pnpm install
pnpm start:dev
```

默认 API 地址：

- `http://localhost:3200`

### 3. 启动前端

```bash
cd sdm.ith5.com
pnpm install
pnpm dev
```

默认前端地址：

- `http://localhost:5173`

开发环境下，前端会将 `/api` 代理到：

- `http://localhost:3200`

## Docker 部署

### 后端

```bash
cd sdm-api.ith5.com
cp .env.production.example .env.production
docker compose up -d
```

### 前端

```bash
cd sdm.ith5.com
docker compose up -d
```

## 命令

### 后端

```bash
pnpm start:dev
pnpm build
pnpm test
pnpm lint
```

### 前端

```bash
pnpm dev
pnpm build
pnpm preview
pnpm lint
```

## 适用场景

这个项目适合：

- 需要快速搭建游戏平台后台的团队
- 想找 NestJS + React 中后台实战项目的开发者
- 需要代码生成器来提升 CRUD 开发效率的项目
- 想基于现成权限系统和菜单系统做二次开发的团队

## 未来规划

如果后续继续打磨成更成熟的开源仓库，推荐优先补这几项：

1. 首页与核心模块截图
2. 初始化 SQL / Seed 文档
3. 默认管理员账号说明
4. 更细的部署文档
5. License
6. Changelog

## 

当前仓库保留了较强的业务项目痕迹，更适合作为“真实项目骨架”而不是“最小模板”。这也是它的亮点之一：你拿到的不只是空壳，而是一套已经具备实际后台工作流的工程基础。
