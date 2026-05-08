# ============================
# 构建阶段 (Builder stage)
# ============================
FROM node:18-alpine AS builder

WORKDIR /app

# 全局安装 pnpm
RUN npm install -g pnpm

# (可选) 如果你需要在 CI 流水线阶段传入动态参数打进 index.html 里，可以解注
# ARG VITE_API_BASE_URL
# ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# 复制依赖定义并安装
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 复制源码并执行构建，产物位于 /app/dist 目录下
COPY . .
RUN pnpm run build

# ============================
# 运行阶段 (Runner stage - Web Server)
# ============================
FROM nginx:alpine

# 将第一阶段的构建产物复制到 nginx 提供静态文件的根目录下
COPY --from=builder /app/dist /usr/share/nginx/html

# 将我们自定义的 nginx 配置覆盖官方默认的配置
# 这一步非常重要！用来支持 React Router 的浏览器历史模式 (History API) 以及静态资源缓存
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露 80 端口提供 web 服务
EXPOSE 80

# 启动 Nginx (需在前台运行以防容器退出)
CMD ["nginx", "-g", "daemon off;"]
