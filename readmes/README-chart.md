# Linkol 价格图表生成器

这是一个独立的工具，可以从你的原始React组件中提取HTML模板，获取数据，渲染图表，并导出为高质量PNG图片。

## 功能特性

- 🎨 完全复刻原始组件的样式和布局
- 📊 使用Chart.js渲染交互式图表
- 🖼️ 支持高分辨率图片导出（2x分辨率）
- 🔄 支持批量生成多个用户的图表
- 🚀 基于Puppeteer的无头浏览器渲染
- 📱 响应式设计，支持不同屏幕尺寸
- 🌐 集成真实API，支持自动回退到模拟数据
- 👤 支持用户头像显示和位置标记
- 📈 智能价格区间分析和可视化
- 🎯 精确的当前价格位置标记

## 文件结构

```
├── chart-generator.ts       # 主要生成脚本
├── template/
│   └── chart-template.html  # HTML模板文件
├── users.json               # 用户列表配置
├── output/                  # 输出目录
├── package.json             # 依赖管理文件
├── tsconfig.json            # TypeScript配置
└── README-chart.md          # 使用说明
```

## 安装依赖

```bash
# 安装依赖
npm install

# 或者使用yarn
yarn install
```

## 使用方法

### 1. 单个用户图表生成

```typescript
import { generateChartImage } from './chart-generator';

// 生成单个用户的图表
await generateChartImage('username', './output');
```

### 2. 批量生成图表

```typescript
import { generateMultipleCharts } from './chart-generator';

// 批量生成多个用户的图表
const users = ['user1', 'user2', 'user3', 'elonmusk'];
await generateMultipleCharts(users, './output');
```

### 3. 命令行运行

#### 单个用户生成
```bash
# 生成单个用户图表
npm run single <username>

# 指定输出目录
npm run single <username> --out ./custom-output

# 直接使用ts-node
ts-node chart-generator.ts single <username> -o ./output
```

#### 批量生成
```bash
# 从users.json批量生成
npm run batch users.json

# 指定输出目录
npm run batch users.json --out ./custom-output

# 直接使用ts-node
ts-node chart-generator.ts batch users.json -o ./output
```

#### 完整示例
```bash
# 运行完整示例
npm run generate

# 开发模式（自动重启）
npm run dev
```

## 命令行参数详解

### 单个用户模式
```bash
ts-node chart-generator.ts single <username> [-o|--out <输出目录>]
```

**参数说明：**
- `single`: 单用户模式
- `username`: 要生成图表的用户名（不含@符号）
- `-o, --out`: 可选，指定输出目录（默认: ./output）

**示例：**
```bash
ts-node chart-generator.ts single elonmusk
ts-node chart-generator.ts single zuck -o ./charts
```

### 批量模式
```bash
ts-node chart-generator.ts batch <json路径> [-o|--out <输出目录>]
```

**参数说明：**
- `batch`: 批量模式
- `json路径`: 包含用户列表的JSON文件路径
- `-o, --out`: 可选，指定输出目录（默认: ./output）

**支持的JSON格式：**
```json
// 格式1: 字符串数组
["user1", "user2", "elonmusk"]

// 格式2: 包含users字段的对象
{"users": ["user1", "user2", "elonmusk"]}

// 格式3: 包含screen_names字段的对象
{"screen_names": ["user1", "user2", "elonmusk"]}
```

**示例：**
```bash
ts-node chart-generator.ts batch users.json
ts-node chart-generator.ts batch ./config/users.json -o ./output
```

## API集成

### 真实API调用
工具会自动调用真实的Linkol API：
```typescript
const response = await fetch(
  `https://intentapi.agtchain.net/kol/api/v4/price/?screen_name=${screenName}`
);
```

### 自动回退机制
- 优先使用真实API数据
- API失败时自动使用模拟数据
- 支持错误状态码处理
- 智能数据验证

### 数据结构
```typescript
interface IGetPriceData {
  current_bin: number;         // 当前价格区间
  current_value: number;       // 当前价格
  kol: Kol;                    // KOL信息
  leading_percentage: number;  // 领先百分比
}

interface Kol {
  name: string;                // 显示名称
  profile_image_url: string;   // 头像URL
  screen_name: string;         // 用户名
}
```

## 图表特性

### 可视化元素
- **价格分布曲线**: 基于Chart.js的平滑折线图
- **当前价格标记**: 蓝色虚线 + 用户头像
- **智能定位**: 自动计算价格在区间中的精确位置
- **高分辨率**: 2x缩放确保图片质量

### 样式特性
- **响应式设计**: 支持不同屏幕尺寸
- **现代化UI**: 圆角边框、阴影效果
- **品牌色彩**: 蓝色主题配色方案
- **字体优化**: 系统字体栈，确保跨平台一致性

### 头像显示
- **圆形头像**: 白色边框 + 蓝色轮廓
- **精确定位**: 基于当前价格在图表中的位置
- **跨域支持**: 支持外部图片源
- **错误处理**: 头像加载失败时的优雅降级

## 输出配置

### 文件命名
生成的图片文件命名格式：
```
@username_linkol_price_YYYY-MM-DD.png
```

**示例：**
- `@elonmusk_linkol_price_2025-01-18.png`
- `@zuck_linkol_price_2025-01-18.png`

### 输出目录
- **默认路径**: `./output`
- **自定义路径**: 通过 `-o` 或 `--out` 参数指定
- **自动创建**: 输出目录不存在时自动创建

### 图片质量
- **分辨率**: 原始尺寸的2倍
- **格式**: PNG格式，支持透明背景
- **尺寸**: 800x600像素（可自定义）

## 错误处理

### 常见错误类型
1. **API请求失败**: 网络错误、服务器错误
2. **数据格式无效**: API返回数据不符合预期
3. **文件系统错误**: 输出目录权限问题
4. **浏览器启动失败**: Puppeteer配置问题

### 错误恢复策略
- **API失败**: 自动回退到模拟数据
- **单个用户失败**: 继续处理其他用户
- **批量处理**: 记录失败用户，完成其他用户

### 日志输出
- **进度显示**: 实时显示处理进度
- **错误详情**: 详细的错误信息和堆栈
- **成功确认**: 每个成功生成的图表确认

## 性能优化

### 并发控制
- **请求间隔**: 批量处理时1秒间隔
- **内存管理**: 每个图表完成后关闭浏览器
- **资源清理**: 自动清理临时资源

### 浏览器优化
```typescript
const browser = await puppeteer.launch({
  headless: "new",           // 使用新版无头模式
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  args: [
    "--no-sandbox",          // 禁用沙箱
    "--disable-setuid-sandbox"  // 禁用setuid沙箱
  ]
});
```

### 渲染优化
- **等待策略**: 智能等待图表渲染完成
- **超时控制**: 2秒渲染等待时间
- **画布优化**: 高分辨率画布设置

## 自定义配置

### 修改API端点
在 `chart-generator.ts` 中修改 `getPriceData` 函数：
```typescript
async function getPriceData(screenName: string): Promise<IGetPriceData> {
  // 替换为你的实际API调用
  const response = await fetch(`/kol/api/v4/price/?screen_name=${screenName}`);
  return response.json();
}
```

### 自定义输出格式
修改文件名生成逻辑：
```typescript
const fileName = `custom_${screenName}_${Date.now()}.png`;
```

### 调整图表样式
在 `chart-template.html` 中修改CSS样式和Chart.js配置。

## 故障排除

### 常见问题

#### 1. Puppeteer安装失败
```bash
# 尝试使用unsafe-perm
npm install puppeteer --unsafe-perm=true

# 或者使用系统Chrome
export PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome"
```

#### 2. 内存不足
- 减少并发处理的用户数量
- 增加系统内存
- 使用 `--max-old-space-size` 参数

#### 3. 图片质量
- 检查输出路径是否有写入权限
- 确认画布分辨率设置
- 验证Chart.js版本兼容性

#### 4. API调用失败
- 检查网络连接
- 验证API端点URL
- 确认API密钥和权限

### 性能优化建议

#### 1. 调整等待时间
```typescript
// 根据图表复杂度调整
await page.waitForTimeout(2000); // 默认2秒
```

#### 2. 使用GPU加速
```typescript
args: [
  "--disable-gpu",           // 禁用GPU（某些系统）
  "--enable-gpu-rasterization" // 启用GPU光栅化
]
```

#### 3. 集群模式
对于大量用户，考虑使用集群模式：
```typescript
// 分批处理，每批10个用户
const batchSize = 10;
for (let i = 0; i < users.length; i += batchSize) {
  const batch = users.slice(i, i + batchSize);
  await Promise.all(batch.map(user => generateChartImage(user, outputPath)));
}
```

## 开发指南

### 项目结构
```
├── chart-generator.ts       # 主要逻辑
├── template/                # 模板文件
│   └── chart-template.html  # HTML模板
├── types/                   # 类型定义
├── utils/                   # 工具函数
└── output/                  # 输出目录
```

### 扩展功能
1. **添加新的图表类型**: 修改HTML模板和渲染逻辑
2. **支持更多数据源**: 扩展 `getPriceData` 函数
3. **自定义样式**: 修改CSS和Chart.js配置
4. **批量处理优化**: 实现并行处理和进度跟踪

### 测试
```bash
# 开发模式
npm run dev

# 构建
npm run build

# 运行测试
npm test
```

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request来改进这个工具！

## 更新日志

### v1.0.0
- 初始版本发布
- 支持单个和批量图表生成
- 集成真实API和模拟数据
- 高分辨率图片导出
- 完整的CLI支持
