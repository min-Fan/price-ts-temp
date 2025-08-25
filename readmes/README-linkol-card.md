# Linkol 卡片生成器

这是一个基于 Tailwind CSS 的 Linkol 品牌卡片生成器，可以生成类似图片中显示的黑色卡片设计。

## 功能特点

- 🎨 使用 Tailwind CSS 构建的现代化设计
- 📱 响应式布局，支持不同屏幕尺寸
- 🖼️ 自动生成高质量PNG图片
- 🔄 支持单个和批量生成
- 🌐 集成现有API接口，自动获取用户数据
- ⚙️ 可自定义品牌名称等参数

## 文件结构

```
├── template/
│   ├── linkol-card-template.html    # HTML模板文件
│   └── assets/                      # 资源文件目录
│       ├── svg/                     # SVG图标文件
│       │   └── linkol-logoicon-light.svg  # Linkol Logo
│       ├── img/                     # 图片文件
│       │   └── card-bg.png         # 卡片背景图片
│       └── font/                    # 字体文件
├── linkol-card-generator.ts         # 主要的生成器脚本
├── sample-card-data.json            # 示例数据文件
└── README-linkol-card.md            # 本说明文件
```

## 安装依赖

确保已安装必要的依赖：

```bash
npm install puppeteer
npm install -g ts-node typescript
```

## 使用方法

### 1. 生成单个卡片

```bash
# 基本用法
ts-node linkol-card-generator.ts single <用户名>

# 示例：为 @Linkol 用户生成卡片（通过API获取数据）
ts-node linkol-card-generator.ts single Linkol

# 指定输出目录
ts-node linkol-card-generator.ts single Linkol -o ./output
```

### 2. 批量生成卡片

```bash
# 从JSON文件批量生成
ts-node linkol-card-generator.ts batch <JSON文件路径>

# 示例：使用示例数据文件
ts-node linkol-card-generator.ts batch sample-card-data.json

# 指定输出目录
ts-node linkol-card-generator.ts batch sample-card-data.json -o ./output
```

### 3. JSON数据格式

批量生成时，JSON文件应包含字符串数组格式：

```json
[
  "用户名1",
  "用户名2",
  "用户名3"
]
```

**注意**：
- 现在使用简单的字符串数组格式，更加简洁
- 价格、日期等数据通过API自动获取，无需在JSON中指定
- 支持向后兼容旧的对象数组格式

## 设计特点

### 视觉元素
- **自定义背景**：使用 `card-bg.png` 作为卡片背景
- **品牌Logo**：使用 `linkol-logoicon-light.svg` 作为中央标识
- **蓝色边框**：品牌色彩突出
- **白色Logo区域**：中央品牌标识区域
- **L形装饰**：四个角落的蓝色装饰元素
- **价格显示**：大字体突出显示价值
- **底部操作条**：蓝色背景的功能区域

### 资源文件
- **背景图片**：`template/assets/img/card-bg.png` - 卡片背景图片
- **Logo图标**：`template/assets/svg/linkol-logoicon-light.svg` - Linkol品牌Logo
- **字体文件**：`template/assets/font/KyivTypeSerif-VarGX.ttf` - KyivTypeSerif 字体
- **字体样式**：`template/assets/font/index.css` - 字体CSS定义

### 技术实现
- 使用 Tailwind CSS 的 Play CDN
- 集成 KyivTypeSerif 自定义字体
- 响应式设计，支持不同设备
- 使用 Puppeteer 进行截图
- 支持自定义配置和主题

## API集成

Linkol 卡片生成器现在与现有的图表生成器使用相同的 API 接口：

- **数据源**：通过 `screen_name` 参数调用 API 获取用户数据
- **自动获取**：用户名、价格、排名百分比等数据自动从 API 获取
- **实时数据**：每次生成都使用最新的 API 数据
- **错误处理**：包含完整的 API 错误处理和重试机制

### API 数据结构

```typescript
interface IGetPriceData {
  current_bin: number;
  current_value: number;      // 用户当前价格
  kol: {
    name: string;
    profile_image_url: string;
    screen_name: string;      // 用户名
  };
  leading_percentage: number; // 排名百分比
}
```

## 自定义选项

### 修改颜色主题
在HTML模板中修改 `tailwind.config` 部分：

```javascript
tailwind.config = {
  theme: {
    extend: {
      colors: {
        'linkol-blue': '#3b82f6',    // 主色调
        'linkol-dark': '#000000',    // 背景色
      },
      fontFamily: {
        'kyiv': ['KyivTypeSerif', 'serif'],  // 自定义字体
      }
    }
  }
}
```

### 自定义字体
当前使用 KyivTypeSerif 字体：

1. **字体文件**：`template/assets/font/KyivTypeSerif-VarGX.ttf`
2. **CSS定义**：`template/assets/font/index.css`
3. **Tailwind类**：`font-kyiv` 应用于品牌名称和价格显示

更换字体：
1. 替换 TTF 文件
2. 更新 `index.css` 中的 `@font-face` 定义
3. 在HTML中使用 `font-kyiv` 类名

### 调整尺寸
修改卡片容器的尺寸类：

```html
<div id="linkol-card" class="relative w-80 h-96 ...">
  <!-- w-80: 宽度320px, h-96: 高度384px -->
</div>
```

## 输出文件

生成的图片文件命名格式：
```
@用户名_linkol_card_日期.png
```

例如：`@Linkol_linkol_card_2025-08-21.png`

## 故障排除

### 常见问题

1. **Chrome路径错误**
   - 确保Chrome浏览器已安装
   - 修改脚本中的 `executablePath` 为正确的Chrome路径

2. **权限问题**
   - 确保有写入输出目录的权限
   - 使用 `--no-sandbox` 参数（已在脚本中设置）

3. **图片生成失败**
   - 检查网络连接
   - 确保所有依赖已正确安装

## 扩展功能

### 添加新的设计元素
可以在HTML模板中添加更多自定义元素，如：
- 社交媒体图标
- 二维码
- 更多品牌信息

### 集成到现有系统
可以将生成器集成到现有的工作流程中：
- 自动化生成
- API接口
- 定时任务

## 许可证

本项目遵循与主项目相同的许可证条款。
