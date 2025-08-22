# 环境变量配置说明

## 概述
本项目现在支持通过环境变量来配置API路径，而不是硬编码在代码中。

## 配置文件
项目使用 `.env` 文件来存储环境变量配置。

## 可配置的环境变量

### API_BASE_URL
- **描述**: API的基础URL地址
- **默认值**: `https://intentapi.agtchain.net`
- **示例**: `https://intentapi.agtchain.net`

### API_PATH
- **描述**: API的具体路径
- **默认值**: `/kol/api/v4/price/`
- **示例**: `/kol/api/v4/price/`

## 使用方法

### 1. 修改配置文件
编辑 `.env` 文件，修改相应的环境变量值：

```bash
# 修改为你的API地址
API_BASE_URL=https://your-api-domain.com
API_PATH=/your/api/path/
```

### 2. 使用系统环境变量
你也可以通过系统环境变量来覆盖配置：

```bash
export API_BASE_URL=https://your-api-domain.com
export API_PATH=/your/api/path/
```

### 3. 运行时指定配置文件
如果你想使用不同的配置文件，可以在代码中修改：

```typescript
dotenv.config({ path: path.join(__dirname, 'your-config.env') });
```

## 注意事项
- 如果环境变量未设置，系统将使用默认值
- 配置文件路径是相对于脚本文件的路径
- 修改配置文件后需要重启应用程序才能生效

## 示例配置
```bash
# 生产环境
API_BASE_URL=https://prod-api.example.com
API_PATH=/api/v1/price/

# 测试环境
API_BASE_URL=https://test-api.example.com
API_PATH=/api/v1/price/

# 本地开发
API_BASE_URL=http://localhost:3000
API_PATH=/api/price/
```
