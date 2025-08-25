import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { generateChartImage } from '../scripts/chart-generator';

const router = Router();

// 生成价格图表接口
router.post('/generate', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        error: "缺少必要参数: username",
      });
    }

    console.log(`开始为 @${username} 生成价格图表...`);

    // 获取输出目录
    const outputDir = path.join(__dirname, '..', 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 生成图表
    await generateChartImage(username, outputDir);

    // 查找生成的文件
    const files = fs.readdirSync(outputDir);
    const chartFile = files.find(
      (file) =>
        file.includes(`@${username}_linkol_price_`) && file.endsWith(".png")
    );

    if (!chartFile) {
      return res.status(500).json({
        success: false,
        error: "图表生成成功但文件未找到",
      });
    }

    const fileName = chartFile;
    const filePath = path.join(outputDir, fileName);

    // 返回文件信息
    res.json({
      success: true,
      message: "价格图表生成成功",
      data: {
        fileName: fileName,
        filePath: filePath,
        fileSize: fs.statSync(filePath).size,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("生成价格图表时出错:", error);
    res.status(500).json({
      success: false,
      error: error.message || "生成价格图表时发生未知错误",
    });
  }
});

export default router;
