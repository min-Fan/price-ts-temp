import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import routes from './routes';

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 确保必要的目录存在
const outputDir = path.join(__dirname, "output");
const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 注册API路由
app.use('/api', routes);

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Linkol HTML模板图片生成器 API服务器已启动，监听端口: ${PORT}`);
  console.log(`📊 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`📈 生成图表: POST http://localhost:${PORT}/api/chart/generate`);
  console.log(`🃏 生成卡片: POST http://localhost:${PORT}/api/card/generate`);
  console.log(`📦 批量生成: POST http://localhost:${PORT}/api/batch/generate`);
  console.log(`📁 文件列表: GET http://localhost:${PORT}/api/files`);
  console.log(`⬇️ 下载文件: GET http://localhost:${PORT}/api/files/download/:fileName`);
  console.log(`🗑️ 删除文件: DELETE http://localhost:${PORT}/api/files/:fileName`);
});

export default app;
