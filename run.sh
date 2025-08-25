#!/bin/bash

echo "🚀 启动 Linkol 生成器服务..."

# 检查Docker状态
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请先启动 Docker"
    exit 1
fi

# 启动所有服务
echo "📦 启动 Docker 服务..."
docker-compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "📊 检查服务状态..."
docker-compose ps

echo ""
echo "✅ 服务启动完成！"
echo ""
# 读取端口配置
PORT=${PORT:-3000}

echo "🌐 服务访问地址:"
echo "  📊 API健康检查: http://localhost:${PORT}/api/health"
echo "  📈 生成图表: POST http://localhost:${PORT}/api/chart/generate"
echo "  🃏 生成卡片: POST http://localhost:${PORT}/api/card/generate"
echo "  📦 批量生成: POST http://localhost:${PORT}/api/batch/generate"
echo "  📁 文件列表: GET http://localhost:${PORT}/api/files"
echo "  ⬇️ 下载文件: GET http://localhost:${PORT}/api/files/download/:fileName"
echo "  🗑️ 删除文件: DELETE http://localhost:${PORT}/api/files/:fileName"
echo ""
echo "🔧 管理命令:"
echo "  ./start-docker.sh status    - 查看服务状态"
echo "  ./start-docker.sh logs      - 查看服务日志"
echo "  ./start-docker.sh stop      - 停止所有服务"
echo "  ./start-docker.sh run chart <username>  - 生成图表"
echo "  ./start-docker.sh run card <username>   - 生成卡片"
echo ""
echo "🔧 脚本服务:"
echo "  📊 运行图表生成器: docker exec -it linkol-unified-service npm run script:chart"
echo "  🃏 运行卡片生成器: docker exec -it linkol-unified-service npm run script:card"
echo "  📦 批量生成图表: docker exec -it linkol-unified-service npm run chart:batch"
echo "  📦 批量生成卡片: docker exec -it linkol-unified-service npm run card:batch"
