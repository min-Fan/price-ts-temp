# 使用官方的 Puppeteer + Chromium 镜像
FROM ghcr.io/puppeteer/puppeteer:latest

# 设置工作目录
WORKDIR /app

# 安装 Node.js、npm 和 Chrome
USER root
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    wget \
    gnupg \
    && wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码和模板
COPY scripts/ ./scripts/
COPY routes/ ./routes/
COPY template/ ./template/
COPY tsconfig.json ./
COPY server.ts ./
COPY .env* ./

# 创建必要的目录
RUN mkdir -p output uploads

# 安装 TypeScript 和 ts-node（开发依赖）
RUN npm install -g typescript ts-node

# 设置环境变量
ENV NODE_ENV=production
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
ENV PORT=3000

# 设置目录权限，让任何用户都能写入
RUN chmod 777 output && chmod 777 uploads && chmod 777 /app

# 切换回 puppeteer 用户（官方镜像推荐）
USER pptruser

# 暴露端口（通过环境变量动态配置）
EXPOSE ${PORT:-3000}

# 设置默认命令（可以通过环境变量覆盖）
CMD ["ts-node", "server.ts"]
