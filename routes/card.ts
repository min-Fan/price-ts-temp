import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { generateLinkolCardImage } from '../scripts/linkol-card-generator';

const router = Router();

// 生成Linkol卡片接口
router.post('/generate', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        error: "缺少必要参数: username",
      });
    }

    console.log(`开始为 @${username} 生成Linkol卡片...`);

    // 获取输出目录
    const outputDir = path.join(__dirname, '..', 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 生成卡片
    await generateLinkolCardImage(username, outputDir);

    // 查找生成的文件
    const files = fs.readdirSync(outputDir);
    const cardFile = files.find(
      (file) =>
        file.includes(`@${username}_linkol_card_`) && file.endsWith(".png")
    );

    if (!cardFile) {
      return res.status(500).json({
        success: false,
        error: "卡片生成成功但文件未找到",
      });
    }

    const fileName = cardFile;
    const filePath = path.join(outputDir, fileName);

    // 返回文件信息
    res.json({
      success: true,
      message: "Linkol卡片生成成功",
      data: {
        fileName: fileName,
        filePath: filePath,
        fileSize: fs.statSync(filePath).size,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("生成Linkol卡片时出错:", error);
    res.status(500).json({
      success: false,
      error: error.message || "生成Linkol卡片时发生未知错误",
    });
  }
});

export default router;
