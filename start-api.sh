#!/bin/bash

echo "🚀 启动 Linkol 生成器 API 服务器..."

# 检查是否安装了依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 检查是否存在 .env 文件
if [ ! -f ".env" ]; then
    echo "⚠️  警告: 未找到 .env 文件"
    echo "请确保配置了以下环境变量:"
    echo "  - API_BASE_URL: 你的API基础URL"
    echo "  - API_PATH: 你的API路径"
    echo "  - PORT: 端口号 (可选，默认3000)"
    echo "  - NODE_ENV: 运行环境 (development/production)"
    echo ""
fi

# 创建必要的目录
mkdir -p output uploads

echo "📁 创建必要的目录..."
echo "  - output/: 生成的图片文件"
echo "  - uploads/: 上传的临时文件"

echo ""
# 读取端口配置
PORT=${PORT:-3000}

echo "🌐 启动服务器..."
echo "📊 健康检查: http://localhost:${PORT}/api/health"
echo "📈 生成图表: POST http://localhost:${PORT}/api/chart/generate"
echo "🃏 生成卡片: POST http://localhost:${PORT}/api/card/generate"
echo "📦 批量生成: POST http://localhost:${PORT}/api/batch/generate"
echo "📁 文件列表: GET http://localhost:${PORT}/api/files"
echo "⬇️ 下载文件: GET http://localhost:${PORT}/api/files/download/:fileName"
echo "🗑️ 删除文件: DELETE http://localhost:${PORT}/api/files/:fileName"
echo ""

# 启动服务器
npm start
