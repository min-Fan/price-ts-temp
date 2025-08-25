#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目名称
PROJECT_NAME="linkol-generators"

echo -e "${BLUE}🚀 Linkol 生成器 Docker 服务启动脚本${NC}"
echo "=================================================="

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker 未运行，请先启动 Docker${NC}"
    exit 1
fi

# 检查Docker Compose是否可用
if ! docker-compose --version > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker Compose 不可用，请检查安装${NC}"
    exit 1
fi

# 检查.env文件
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  警告: 未找到 .env 文件${NC}"
    echo "请复制 env.example 为 .env 并配置以下环境变量:"
    echo "  - API_BASE_URL: 你的API基础URL"
    echo "  - API_PATH: 你的API路径"
    echo "  - PORT: 端口号 (可选，默认3000)"
    echo "  - NODE_ENV: 运行环境 (development/production)"
    echo ""
    read -p "是否继续启动服务？(y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}取消启动${NC}"
        exit 0
    fi
fi

# 创建必要的目录
echo -e "${BLUE}📁 创建必要的目录...${NC}"
mkdir -p output uploads

# 函数：显示服务状态
show_status() {
    echo -e "\n${BLUE}📊 服务状态:${NC}"
    docker-compose ps
}

# 函数：显示日志
show_logs() {
    local service=${1:-"linkol-api"}
    echo -e "\n${BLUE}📋 ${service} 服务日志:${NC}"
    docker-compose logs -f --tail=50 $service
}

# 函数：执行脚本命令
run_script() {
    local script_type=$1
    local username=$2
    
    case $script_type in
        "chart")
            if [ -z "$username" ]; then
                echo -e "${YELLOW}用法: $0 run chart <username>${NC}"
                exit 1
            fi
            echo -e "${BLUE}📈 为 @${username} 生成价格图表...${NC}"
            docker-compose exec linkol-unified-service npm run script:chart -- "$username"
            ;;
        "card")
            if [ -z "$username" ]; then
                echo -e "${YELLOW}用法: $0 run card <username>${NC}"
                exit 1
            fi
            echo -e "${BLUE}🃏 为 @${username} 生成Linkol卡片...${NC}"
            docker-compose exec linkol-unified-service npm run script:card -- "$username"
            ;;
        "batch-chart")
            echo -e "${BLUE}📈 批量生成价格图表...${NC}"
            docker-compose exec linkol-unified-service npm run chart:batch
            ;;
        "batch-card")
            echo -e "${BLUE}🃏 批量生成Linkol卡片...${NC}"
            docker-compose exec linkol-unified-service npm run card:batch
            ;;
        *)
            echo -e "${YELLOW}可用的脚本类型:${NC}"
            echo "  chart <username>      - 生成单个用户价格图表"
            echo "  card <username>       - 生成单个用户Linkol卡片"
            echo "  batch-chart           - 批量生成价格图表"
            echo "  batch-card            - 批量生成Linkol卡片"
            ;;
    esac
}

# 主函数
main() {
    case "$1" in
        "start")
            echo -e "${BLUE}🚀 启动所有服务...${NC}"
            docker-compose up -d
            echo -e "${GREEN}✅ 服务启动完成！${NC}"
            echo ""
            # 读取端口配置
            PORT=${PORT:-3000}
            
            echo -e "${BLUE}🌐 服务访问地址:${NC}"
            echo "  📊 API健康检查: http://localhost:${PORT}/api/health"
            echo "  📈 生成图表: POST http://localhost:${PORT}/api/chart/generate"
            echo "  🃏 生成卡片: POST http://localhost:${PORT}/api/card/generate"
            echo "  📦 批量生成: POST http://localhost:${PORT}/api/batch/generate"
            echo "  📁 文件列表: GET http://localhost:${PORT}/api/files"
            echo "  ⬇️ 下载文件: GET http://localhost:${PORT}/api/files/download/:fileName"
            echo "  🗑️ 删除文件: DELETE http://localhost:${PORT}/api/files/:fileName"
            echo ""
            echo -e "${BLUE}🔧 管理命令:${NC}"
            echo "  $0 status          - 查看服务状态"
            echo "  $0 logs [service]  - 查看服务日志"
            echo "  $0 stop            - 停止所有服务"
            echo "  $0 restart         - 重启所有服务"
            echo "  $0 run <type>      - 执行脚本命令"
            show_status
            ;;
        "stop")
            echo -e "${BLUE}🛑 停止所有服务...${NC}"
            docker-compose down
            echo -e "${GREEN}✅ 服务已停止${NC}"
            ;;
        "restart")
            echo -e "${BLUE}🔄 重启所有服务...${NC}"
            docker-compose down
            docker-compose up -d
            echo -e "${GREEN}✅ 服务重启完成${NC}"
            show_status
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs $2
            ;;
        "run")
            run_script $2 $3
            ;;
        "build")
            echo -e "${BLUE}🔨 构建Docker镜像...${NC}"
            docker-compose build
            echo -e "${GREEN}✅ 镜像构建完成${NC}"
            ;;
        "clean")
            echo -e "${BLUE}🧹 清理Docker资源...${NC}"
            docker-compose down --rmi all --volumes --remove-orphans
            echo -e "${GREEN}✅ 清理完成${NC}"
            ;;
        "help"|"--help"|"-h"|"")
            echo -e "${BLUE}📖 使用说明:${NC}"
            echo "  $0 start           - 启动所有服务"
            echo "  $0 stop            - 停止所有服务"
            echo "  $0 restart         - 重启所有服务"
            echo "  $0 status          - 查看服务状态"
            echo "  $0 logs [service]  - 查看服务日志"
            echo "  $0 build           - 构建Docker镜像"
            echo "  $0 clean           - 清理Docker资源"
            echo "  $0 run <type>      - 执行脚本命令"
            echo ""
            echo -e "${BLUE}📋 可用的脚本类型:${NC}"
            echo "  chart <username>      - 生成单个用户价格图表"
            echo "  card <username>       - 生成单个用户Linkol卡片"
            echo "  batch-chart           - 批量生成价格图表"
            echo "  batch-card            - 批量生成Linkol卡片"
            echo ""
            # 读取端口配置
            PORT=${PORT:-3000}
            
            echo -e "${BLUE}🌐 服务说明:${NC}"
            echo "  linkol-api        - Web API服务 (端口: ${PORT})"
            echo "  price-generator   - 脚本生成服务"
            echo "  linkol-manager    - 管理服务"
            echo "  📝 注意: 所有服务都使用统一的 Dockerfile"
            ;;
        *)
            echo -e "${RED}❌ 未知命令: $1${NC}"
            echo "使用 '$0 help' 查看帮助信息"
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"
