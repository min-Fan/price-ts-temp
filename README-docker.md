# Docker 部署指南

本项目已配置为可以在 Docker 环境中运行，使用官方的 Puppeteer + Chromium 镜像，避免依赖问题。

## 🐳 快速开始

### 1. 构建镜像

```bash
# 构建 Docker 镜像
docker build -t price-ts-generator .
```

### 2. 使用运行脚本（推荐）

我们提供了一个便捷的运行脚本 `run-docker.sh`：

```bash
# 查看帮助信息
./run-docker.sh help

# 生成单个用户图表
./run-docker.sh chart-single elonmusk

# 批量生成图表
./run-docker.sh chart-batch sample-card-data.json

# 生成单个用户卡片
./run-docker.sh card-single elonmusk

# 批量生成卡片
./run-docker.sh card-batch sample-card-data.json

# 进入容器 shell 进行调试
./run-docker.sh shell
```

### 3. 直接使用 Docker 命令

```bash
# 生成单个用户图表
docker run --rm \
  -v "$(pwd)/output:/app/output" \
  -v "$(pwd)/.env:/app/.env:ro" \
  price-ts-generator \
  ts-node scripts/chart-generator.ts single elonmusk

# 批量生成图表
docker run --rm \
  -v "$(pwd)/output:/app/output" \
  -v "$(pwd)/.env:/app/.env:ro" \
  -v "$(pwd)/sample-card-data.json:/app/sample-card-data.json:ro" \
  price-ts-generator \
  ts-node scripts/chart-generator.ts batch sample-card-data.json
```

## 🔧 配置说明

### 环境变量

确保你的 `.env` 文件包含必要的配置：

```env
API_BASE_URL=https://your-api-domain.com
API_PATH=/api/price
```

### 挂载目录

- `./output:/app/output` - 输出目录，生成的图片会保存到这里
- `./.env:/app/.env:ro` - 环境变量文件（只读）
- `./sample-card-data.json:/app/sample-card-data.json:ro` - 用户数据文件（只读）

## 🚀 使用 docker-compose

也可以使用 docker-compose 来管理：

```bash
# 启动服务（显示帮助信息）
docker-compose up

# 后台运行
docker-compose up -d

# 停止服务
docker-compose down
```

## 📁 文件结构

```
.
├── Dockerfile                 # Docker 镜像定义
├── docker-compose.yml         # Docker Compose 配置
├── .dockerignore             # Docker 构建忽略文件
├── run-docker.sh             # 便捷运行脚本
├── scripts/                  # TypeScript 脚本
├── template/                 # HTML 模板
├── output/                   # 输出目录（挂载到容器）
└── .env                      # 环境变量
```

## 🔍 故障排除

### 1. 权限问题

如果遇到权限问题，确保脚本有执行权限：

```bash
chmod +x run-docker.sh
```

### 2. 镜像构建失败

清理并重新构建：

```bash
./run-docker.sh clean
./run-docker.sh build
```

### 3. 容器内调试

进入容器 shell 进行调试：

```bash
./run-docker.sh shell
```

### 4. 查看日志

```bash
# 查看容器日志
docker logs price-ts-generator

# 实时查看日志
docker logs -f price-ts-generator
```

## 🌟 优势

使用 Docker 部署的优势：

1. **环境一致性** - 避免"在我机器上能运行"的问题
2. **依赖管理** - 使用官方镜像，无需担心 Chromium 安装
3. **部署简单** - 一键构建和运行
4. **隔离性** - 不会影响宿主机的环境
5. **可移植性** - 可以在任何支持 Docker 的服务器上运行

## 📝 注意事项

1. 确保 Docker 已安装并运行
2. 首次构建可能需要几分钟时间
3. 生成的图片会保存在 `./output` 目录中
4. 容器会自动清理（使用 `--rm` 参数）
5. 如果需要持久化数据，请使用卷挂载

## 🔄 更新镜像

当代码更新后，重新构建镜像：

```bash
./run-docker.sh build
```

或者强制重新构建：

```bash
docker build --no-cache -t price-ts-generator .
```
