# ============================
# 构建阶段 (Builder stage)
# ============================
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 全局安装 pnpm
RUN npm install -g pnpm

# 复制依赖定义文件
COPY package.json pnpm-lock.yaml ./

# 这里只安装依赖（利用 Docker 缓存）
RUN pnpm install --frozen-lockfile

# 复制项目源代码
COPY . .

# 执行打包步骤（将 nestjs ts 代码编译成 js 至 dist 目录）
RUN pnpm run build

# 如果你的项目在本地开发需要排除掉一些特定依赖包并重新生成瘦身版的 node_modules
# 你可以在此阶段运行 pnpm prune --prod，或者干脆交给运行阶段处理

# ============================
# 运行阶段 (Runner stage)
# ============================
FROM node:20-alpine AS runner

WORKDIR /app

# 设置生产环境变量及时区
ENV NODE_ENV=production
ENV TZ=Asia/Shanghai

RUN npm install -g pnpm

# 仅复制并安装生产所需的包，极大地缩减镜像体积
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# 从 builder 镜像中提取构建好的 dist 目录
COPY --from=builder /app/dist ./dist
RUN mkdir -p /app/runtime/uploads

# 如果有配置文件也需要一并 copy，如 config, templates
# COPY src/config ./dist/config

# 暴露端口，如果是 3000 可以不动，需与代码监听一致
EXPOSE 3000

# 启动 Node 进程，不使用 ts-node 或 nest 启动，直接运行打包好的 JS 文件
CMD ["node", "dist/src/main.js"]
