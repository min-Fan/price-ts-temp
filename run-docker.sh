#!/bin/bash

# Docker 运行脚本
# 使用方法: ./run-docker.sh [command] [args...]

set -e

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请先启动 Docker"
    exit 1
fi

# 确保 output 目录存在并有正确的权限
if [ ! -d "output" ]; then
    echo "📁 创建 output 目录..."
    mkdir -p output
fi

# 设置 output 目录权限
echo "🔐 设置 output 目录权限..."
chmod 755 output

# 构建镜像（如果不存在）
if [[ "$(docker images -q price-ts-generator 2> /dev/null)" == "" ]]; then
    echo "🔨 构建 Docker 镜像..."
    docker build -t price-ts-generator .
fi

# 根据命令类型执行不同的操作
case "$1" in
    "chart-single")
        if [ -z "$2" ]; then
            echo "❌ 请提供用户名"
            echo "用法: ./run-docker.sh chart-single <username>"
            exit 1
        fi
        echo "📊 生成单个用户图表: @$2"
        docker run --rm \
            -v "$(pwd)/output:/app/output" \
            -v "$(pwd)/.env:/app/.env:ro" \
            price-ts-generator \
            ts-node scripts/chart-generator.ts single "$2"
        ;;
    
    "chart-batch")
        if [ -z "$2" ]; then
            echo "❌ 请提供 JSON 文件路径"
            echo "用法: ./run-docker.sh chart-batch <json-file>"
            exit 1
        fi
        echo "📊 批量生成图表: $2"
        docker run --rm \
            -v "$(pwd)/output:/app/output" \
            -v "$(pwd)/.env:/app/.env:ro" \
            -v "$(pwd)/$2:/app/$2:ro" \
            price-ts-generator \
            ts-node scripts/chart-generator.ts batch "$2"
        ;;
    
    "card-single")
        if [ -z "$2" ]; then
            echo "❌ 请提供用户名"
            echo "用法: ./run-docker.sh card-single <username>"
            exit 1
        fi
        echo "🃏 生成单个用户卡片: @$2"
        docker run --rm \
            -v "$(pwd)/output:/app/output" \
            -v "$(pwd)/.env:/app/.env:ro" \
            price-ts-generator \
            ts-node scripts/linkol-card-generator.ts single "$2"
        ;;
    
    "card-batch")
        if [ -z "$2" ]; then
            echo "❌ 请提供 JSON 文件路径"
            echo "用法: ./run-docker.sh card-batch <json-file>"
            exit 1
        fi
        echo "🃏 批量生成卡片: $2"
        docker run --rm \
            -v "$(pwd)/output:/app/output" \
            -v "$(pwd)/.env:/app/.env:ro" \
            -v "$(pwd)/$2:/app/$2:ro" \
            price-ts-generator \
            ts-node scripts/linkol-card-generator.ts batch "$2"
        ;;
    
    "shell")
        echo "🐳 进入容器 shell..."
        docker run --rm -it \
            -v "$(pwd)/output:/app/output" \
            -v "$(pwd)/.env:/app/.env:ro" \
            -v "$(pwd)/scripts:/app/scripts:ro" \
            -v "$(pwd)/template:/app/template:ro" \
            price-ts-generator \
            /bin/bash
        ;;
    
    "build")
        echo "🔨 重新构建 Docker 镜像..."
        docker build -t price-ts-generator .
        ;;
    
    "clean")
        echo "🧹 清理 Docker 镜像..."
        docker rmi price-ts-generator 2>/dev/null || true
        docker system prune -f
        ;;
    
    "help"|"--help"|"-h"|"")
        echo "🚀 Price TS Generator Docker 运行脚本"
        echo ""
        echo "用法:"
        echo "  ./run-docker.sh chart-single <username>     # 生成单个用户图表"
        echo "  ./run-docker.sh chart-batch <json-file>     # 批量生成图表"
        echo "  ./run-docker.sh card-single <username>      # 生成单个用户卡片"
        echo "  ./run-docker.sh card-batch <json-file>      # 批量生成卡片"
        echo "  ./run-docker.sh shell                       # 进入容器 shell"
        echo "  ./run-docker.sh build                       # 重新构建镜像"
        echo "  ./run-docker.sh clean                       # 清理镜像"
        echo "  ./run-docker.sh help                        # 显示帮助信息"
        echo ""
        echo "示例:"
        echo "  ./run-docker.sh chart-single elonmusk"
        echo "  ./run-docker.sh chart-batch sample-card-data.json"
        echo "  ./run-docker.sh card-single elonmusk"
        echo "  ./run-docker.sh card-batch sample-card-data.json"
        ;;
    
    *)
        echo "❌ 未知命令: $1"
        echo "使用 './run-docker.sh help' 查看帮助信息"
        exit 1
        ;;
esac
