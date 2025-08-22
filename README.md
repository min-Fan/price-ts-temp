# Linkol 生成器

Linkol 价格图表和卡片生成器，支持单个用户和批量生成，自动获取用户头像和价格数据。

## ✨ 主要功能

- 🎴 **Linkol 卡片生成**: 生成精美的品牌卡片，支持自定义头像、用户名和价格
- 📊 **价格图表生成**: 生成用户价格趋势图表
- 🔄 **批量处理**: 支持从 JSON 文件批量生成多个用户的卡片和图表
- 🖼️ **高分辨率头像**: 自动获取用户高分辨率头像（移除 _normal 后缀）
- 🎨 **自定义模板**: 使用 Tailwind CSS 和自定义字体 KyivTypeSerif
- 🚀 **CLI 工具**: 提供完整的命令行界面，支持自定义输出目录

## 📁 项目结构

```
price-ts-temp/
├── scripts/                           # 🚀 脚本文件夹
│   ├── chart-generator.ts            # 📊 价格图表生成器
│   └── linkol-card-generator.ts      # 🎴 Linkol卡片生成器
├── template/                          # 🎨 模板文件夹
│   ├── chart-template.html           # 📈 图表HTML模板
│   ├── linkol-card-template.html     # 🃏 卡片HTML模板
│   └── assets/                       # 🖼️ 资源文件
│       ├── svg/                      # 🔷 SVG图标和边框
│       ├── img/                      # 🖼️ 背景图片
│       └── font/                     # 🔤 自定义字体
├── output/                            # 📤 输出文件夹（根目录）
├── package.json                       # ⚙️ 项目配置
├── tsconfig.json                      # 🔧 TypeScript配置
├── .env                               # 🔐 环境变量配置
└── README.md                          # 📖 项目说明
```

## 🚀 快速开始

### 安装依赖
```bash
npm install
# 或
yarn install
```

### 环境配置
创建 `.env` 文件：
```env
API_BASE_URL=https://your-api-domain.com
API_PATH=/api/price
```

## 📊 价格图表生成

### 单个用户图表
```bash
npm run chart:single <username>
# 或
yarn chart:single <username>
```

### 批量生成图表
```bash
npm run chart:batch <json文件路径>
# 或
yarn chart:batch <json文件路径>
```

### 开发模式（图表）
```bash
npm run dev:chart
# 或
yarn dev:chart
```

## 🎴 Linkol卡片生成

### 单个用户卡片
```bash
npm run card:single <username>
# 或
yarn card:single <username>
```

### 批量生成卡片
```bash
npm run card:batch <json文件路径>
# 或
yarn card:batch <json文件路径>
```

### 开发模式（卡片）
```bash
npm run dev:card
# 或
yarn dev:card
```

## 📝 使用示例

### 生成单个用户图表
```bash
npm run chart:single feifan933
```

### 生成单个用户卡片
```bash
npm run card:single feifan933
```

### 批量生成图表
```bash
npm run chart:batch users.json
```

### 批量生成卡片
```bash
npm run card:batch sample-card-data.json
```

## 🔧 脚本命令说明

### 基础命令
| 命令 | 说明 | 用法 |
|------|------|------|
| `chart` | 运行图表生成器 | `npm run chart` |
| `card` | 运行卡片生成器 | `npm run card` |

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
| `chart:batch` | 批量生成图表 | `npm run chart:batch <json文件>` |
| `card:batch` | 批量生成卡片 | `npm run card:batch <json文件>` |
| `batch:chart` | 图表批量生成快捷命令 | `npm run batch:chart <json文件>` |
| `batch:card` | 卡片批量生成快捷命令 | `npm run batch:card <json文件>` |

### 开发模式
| 命令 | 说明 | 用法 |
|------|------|------|
| `dev:chart` | 图表生成器开发模式 | `npm run dev:chart` |
| `dev:card` | 卡片生成器开发模式 | `npm run dev:card` |

## 📋 JSON数据格式

### 图表数据格式
```json
[
  "user1",
  "user2",
  "user3"
]
```

### 卡片数据格式
```json
[
  "user1",
  "user2",
  "user3"
]
```

## 🎨 自定义配置

### 输出目录
使用 `-o` 或 `--out` 参数指定输出目录：
```bash
npm run card:single feifan933 -o ./custom-output
npm run chart:batch users.json -o ./charts-output
```

### 环境变量
- `API_BASE_URL`: API基础URL
- `API_PATH`: API路径

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
1. **环境变量未设置**: 确保 `.env` 文件存在且包含正确的 API 配置
2. **头像加载失败**: 脚本会自动处理头像加载超时，继续生成图片
3. **输出目录权限**: 确保有权限写入指定的输出目录

### 调试模式
使用开发模式命令可以实时查看生成过程：
```bash
npm run dev:card
npm run dev:chart
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

## 📞 支持

如果您在使用过程中遇到问题，请：
1. 检查环境变量配置
2. 查看控制台错误信息
3. 确认网络连接和 API 可用性
