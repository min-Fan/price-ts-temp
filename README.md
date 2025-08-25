# Linkol 生成器

Linkol 价格图表和卡片生成器，支持单个用户和批量生成，自动获取用户头像和价格数据。提供完整的Web API接口和CLI工具。

## ✨ 主要功能

- 🎴 **Linkol 卡片生成**: 生成精美的品牌卡片，支持自定义头像、用户名和价格
- 📊 **价格图表生成**: 生成用户价格趋势图表
- 🔄 **批量处理**: 支持从 JSON 文件批量生成多个用户的卡片和图表
- 🖼️ **高分辨率头像**: 自动获取用户高分辨率头像（移除 _normal 后缀）
- 🎨 **自定义模板**: 使用 Tailwind CSS 和自定义字体 KyivTypeSerif
- 🚀 **Web API**: 提供完整的RESTful API接口
- 🐳 **Docker支持**: 容器化部署，支持内存优化
- 🛠️ **CLI 工具**: 提供完整的命令行界面，支持自定义输出目录

## 📁 项目结构

```
price-ts-temp/
├── routes/                            # 🌐 API路由文件夹
│   ├── index.ts                      # 📋 路由索引
│   ├── health.ts                     # ❤️ 健康检查
│   ├── chart.ts                      # 📈 图表生成API
│   ├── card.ts                       # 🃏 卡片生成API
│   ├── batch.ts                      # 📦 批量生成API
│   └── files.ts                      # 📁 文件管理API
├── scripts/                           # 🚀 脚本文件夹
│   ├── chart-generator.ts            # 📊 价格图表生成器
│   ├── linkol-card-generator.ts      # 🎴 Linkol卡片生成器
│   └── run-script.ts                 # 🔧 统一脚本运行器
├── template/                          # 🎨 模板文件夹
│   ├── chart-template.html           # 📈 图表HTML模板
│   ├── linkol-card-template.html     # 🃏 卡片HTML模板
│   └── assets/                       # 🖼️ 资源文件
│       ├── svg/                      # 🔷 SVG图标和边框
│       ├── img/                      # 🖼️ 背景图片
│       └── font/                     # 🔤 自定义字体
├── output/                            # 📤 输出文件夹
├── uploads/                           # 📥 上传文件夹
├── Dockerfile                         # 🐳 Docker镜像配置
├── docker-compose.yml                 # 🐳 Docker Compose配置
├── server.ts                          # 🌐 Express API服务器
├── package.json                       # ⚙️ 项目配置
├── tsconfig.json                      # 🔧 TypeScript配置
├── .env                               # 🔐 环境变量配置
└── README.md                          # 📖 项目说明
```

## 🚀 快速开始

### 方式一：Web API 服务（推荐）

#### 启动API服务
```bash
# 使用Docker（推荐）
./run.sh

# 或使用管理脚本
./start-docker.sh start

# 本地运行
npm start
```

#### API接口
服务启动后，可通过以下接口访问：

- **健康检查**: `GET http://localhost:3000/api/health`
- **生成图表**: `POST http://localhost:3000/api/chart/generate`
- **生成卡片**: `POST http://localhost:3000/api/card/generate`
- **批量生成**: `POST http://localhost:3000/api/batch/generate`
- **文件列表**: `GET http://localhost:3000/api/files`
- **下载文件**: `GET http://localhost:3000/api/files/download/:fileName`
- **删除文件**: `DELETE http://localhost:3000/api/files/:fileName`

#### 使用示例
```bash
# 生成图表
curl -X POST http://localhost:3000/api/chart/generate \
  -H "Content-Type: application/json" \
  -d '{"username": "feifan933"}'

# 生成卡片
curl -X POST http://localhost:3000/api/card/generate \
  -H "Content-Type: application/json" \
  -d '{"username": "feifan933"}'

# 批量生成（上传JSON文件）
curl -X POST http://localhost:3000/api/batch/generate \
  -F "userList=@sample-card-data.json"
```

### 方式二：CLI 工具

#### 安装依赖
```bash
npm install
# 或
yarn install
```

#### 环境配置
创建 `.env` 文件：
```env
API_BASE_URL=https://your-api-domain.com
API_PATH=/api/price
PORT=3000
NODE_ENV=development
```

#### 运行脚本
```bash
# 使用统一脚本运行器
npm run script:chart -- <username>      # 生成图表
npm run script:card -- <username>       # 生成卡片

# 直接运行脚本
npm run chart:single <username>         # 生成单个用户图表
npm run card:single <username>          # 生成单个用户卡片
npm run chart:batch                     # 批量生成图表
npm run card:batch                      # 批量生成卡片
```

### 方式三：Docker 部署

#### 使用运行脚本（最简单）
```bash
# 启动所有服务
./run.sh

# 管理服务
./start-docker.sh start                 # 启动服务
./start-docker.sh stop                  # 停止服务
./start-docker.sh status                # 查看状态
./start-docker.sh logs                  # 查看日志
./start-docker.sh restart               # 重启服务

# 执行脚本命令
./start-docker.sh run chart <username>  # 生成图表
./start-docker.sh run card <username>   # 生成卡片
./start-docker.sh run batch-chart       # 批量生成图表
./start-docker.sh run batch-card        # 批量生成卡片
```

#### 直接使用 Docker 命令
```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 进入容器执行脚本
docker exec -it linkol-unified-service npm run script:chart -- <username>
docker exec -it linkol-unified-service npm run script:card -- <username>
```

## 🐳 Docker 配置

### 服务架构
- **linkol-api**: Web API服务，端口3000，内存限制512M
- **linkol-service**: 统一脚本服务，内存限制256M

### 环境变量
```env
# 服务器配置
PORT=3000                              # 服务端口
NODE_ENV=production                    # 环境模式

# API配置
API_BASE_URL=https://your-api.com     # API基础URL
API_PATH=/api/price                   # API路径
```

## 📊 价格图表生成

### 单个用户图表
```bash
# CLI方式
npm run chart:single <username>

# API方式
POST /api/chart/generate
{
  "username": "feifan933"
}
```

### 批量生成图表
```bash
# CLI方式
npm run chart:batch

# API方式
POST /api/batch/generate
# 上传包含用户列表的JSON文件
```

## 🎴 Linkol卡片生成

### 单个用户卡片
```bash
# CLI方式
npm run card:single <username>

# API方式
POST /api/card/generate
{
  "username": "feifan933"
}
```

### 批量生成卡片
```bash
# CLI方式
npm run card:batch

# API方式
POST /api/batch/generate
# 上传包含用户列表的JSON文件
```

## 📝 使用示例

### 生成单个用户图表
```bash
npm run chart:single feifan933
# 或
curl -X POST http://localhost:3000/api/chart/generate \
  -H "Content-Type: application/json" \
  -d '{"username": "feifan933"}'
```

### 生成单个用户卡片
```bash
npm run card:single feifan933
# 或
curl -X POST http://localhost:3000/api/card/generate \
  -H "Content-Type: application/json" \
  -d '{"username": "feifan933"}'
```

### 批量生成
```bash
# 准备用户数据文件
echo '["user1", "user2", "user3"]' > users.json

# 批量生成
npm run chart:batch
npm run card:batch

# 或使用API
curl -X POST http://localhost:3000/api/batch/generate \
  -F "userList=@users.json"
```

## 🔧 脚本命令说明

### 基础命令
| 命令 | 说明 | 用法 |
|------|------|------|
| `chart` | 运行图表生成器 | `npm run chart` |
| `card` | 运行卡片生成器 | `npm run card` |

### 统一脚本运行器
| 命令 | 说明 | 用法 |
|------|------|------|
| `script:chart` | 统一图表生成器 | `npm run script:chart -- <username>` |
| `script:card` | 统一卡片生成器 | `npm run script:card -- <username>` |

### 单个生成
| 命令 | 说明 | 用法 |
|------|------|------|
| `chart:single` | 生成单个用户图表 | `npm run chart:single <username>` |
| `card:single` | 生成单个用户卡片 | `npm run card:single <username>` |
| `generate:chart` | 图表生成快捷命令 | `npm run generate:chart <username>` |
| `generate:card` | 卡片生成快捷命令 | `npm run generate:card <username>` |

### 批量生成
| 命令 | 说明 | 用法 |
|------|------|------|
| `chart:batch` | 批量生成图表 | `npm run chart:batch` |
| `card:batch` | 批量生成卡片 | `npm run card:batch` |
| `batch:chart` | 图表批量生成快捷命令 | `npm run batch:chart` |
| `batch:card` | 卡片批量生成快捷命令 | `npm run batch:card` |

### 开发模式
| 命令 | 说明 | 用法 |
|------|------|------|
| `dev:chart` | 图表生成器开发模式 | `npm run dev:chart` |
| `dev:card` | 卡片生成器开发模式 | `npm run dev:card` |

### Docker管理
| 命令 | 说明 | 用法 |
|------|------|------|
| `docker:start` | 启动Docker服务 | `npm run docker:start` |
| `docker:stop` | 停止Docker服务 | `npm run docker:stop` |
| `docker:restart` | 重启Docker服务 | `npm run docker:restart` |
| `docker:status` | 查看服务状态 | `npm run docker:status` |
| `docker:logs` | 查看服务日志 | `npm run docker:logs` |
| `docker:build` | 构建Docker镜像 | `npm run docker:build` |
| `docker:clean` | 清理Docker资源 | `npm run docker:clean` |

## 📋 JSON数据格式

### 用户列表格式
```json
[
  "user1",
  "user2",
  "user3"
]
```

### API响应格式
```json
{
  "success": true,
  "message": "生成成功",
  "data": {
    "fileName": "@username_linkol_price_2025-08-25.png",
    "filePath": "./output/@username_linkol_price_2025-08-25.png",
    "fileSize": 25926,
    "generatedAt": "2025-08-25T12:16:14.869Z"
  }
}
```

## 🎨 自定义配置

### 输出目录
使用 `-o` 或 `--out` 参数指定输出目录：
```bash
npm run card:single feifan933 -o ./custom-output
npm run chart:batch -o ./charts-output
```

### 环境变量
- `API_BASE_URL`: API基础URL
- `API_PATH`: API路径
- `PORT`: 服务端口
- `NODE_ENV`: 环境模式

## 🔍 技术特性

### 头像处理
- 自动获取用户高分辨率头像
- 移除 Twitter 头像 URL 中的 `_normal` 后缀
- 等待头像完全加载后再生成图片

### 模板系统
- 使用 Tailwind CSS 进行样式设计
- 支持自定义字体 KyivTypeSerif
- 响应式设计，支持不同尺寸

### 图片生成
- 使用 Puppeteer 进行高质量截图
- 支持透明背景
- 自动等待资源加载完成

### API系统
- Express.js RESTful API
- 模块化路由设计
- 统一错误处理和响应格式
- 支持文件上传和下载

### Docker 支持
- 使用官方 Puppeteer + Chromium 镜像
- 内存优化配置
- 健康检查支持
- 环境一致性保证

## 🛠️ 开发

### 构建项目
```bash
npm run build
```

### 类型检查
```bash
npx tsc --noEmit
```

### 项目结构
- **TypeScript**: 类型安全的脚本开发
- **模块化**: 清晰的代码组织结构
- **CLI 支持**: 完整的命令行参数解析
- **API 支持**: RESTful API接口

## 📊 输出文件

### 文件命名规则
- 图表: `@{username}_linkol_price_{date}.png`
- 卡片: `@{username}_linkol_card_{date}.png`

### 输出目录
- 默认输出到根目录的 `output/` 文件夹
- 支持自定义输出目录
- 自动创建不存在的目录

## 🔧 故障排除

### 常见问题
1. **环境变量未设置**: 确保 `.env` 文件存在且包含正确的配置
2. **头像加载失败**: 脚本会自动处理头像加载超时，继续生成图片
3. **输出目录权限**: 确保有权限写入指定的输出目录
4. **API接口无法访问**: 检查Docker服务状态和端口配置

### Docker 相关问题
1. **Chrome 启动失败**: 使用官方 Puppeteer 镜像，已预装 Chrome
2. **资源文件加载失败**: 所有本地资源已转换为 base64 格式内联
3. **平台兼容性**: 支持 Linux/amd64 和 Linux/arm64 平台
4. **内存不足**: 已优化内存使用，建议至少 1GB 可用内存

### 调试模式
使用开发模式命令可以实时查看生成过程：
```bash
npm run dev:card
npm run dev:chart
```

### 服务状态检查
```bash
# 查看Docker服务状态
docker-compose ps

# 查看服务日志
docker-compose logs linkol-api
docker-compose logs linkol-unified-service

# 查看内存使用
docker stats
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 📚 详细文档

- **[README-CHART-DETAILED.md](./README-CHART-DETAILED.md)** - 价格图表生成器详细技术说明
- **[README-CARD-DETAILED.md](./README-CARD-DETAILED.md)** - Linkol卡片生成器详细技术说明

## 📞 支持

如果您在使用过程中遇到问题，请：
1. 检查环境变量配置
2. 查看控制台错误信息
3. 确认网络连接和 API 可用性
4. 检查Docker服务状态
5. 查看服务日志获取详细错误信息
