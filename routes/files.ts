import { Router } from 'express';
import path from 'path';
import fs from 'fs';

const router = Router();

// 获取生成的文件列表
router.get('/', (req, res) => {
  try {
    const outputDir = path.join(__dirname, '..', 'output');
    if (!fs.existsSync(outputDir)) {
      return res.json({
        success: true,
        data: {
          totalFiles: 0,
          files: [],
        },
      });
    }

    const files = fs.readdirSync(outputDir);
    const fileList = files.map((file) => {
      const filePath = path.join(outputDir, file);
      const stats = fs.statSync(filePath);
      return {
        fileName: file,
        filePath: filePath,
        fileSize: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
      };
    });

    res.json({
      success: true,
      data: {
        totalFiles: fileList.length,
        files: fileList,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "获取文件列表时发生错误",
    });
  }
});

// 下载文件接口
router.get('/download/:fileName', (req, res) => {
  try {
    const { fileName } = req.params;
    const outputDir = path.join(__dirname, '..', 'output');
    const filePath = path.join(outputDir, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: "文件不存在",
      });
    }

    res.download(filePath, fileName);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "下载文件时发生错误",
    });
  }
});

// 删除文件接口
router.delete('/:fileName', (req, res) => {
  try {
    const { fileName } = req.params;
    const outputDir = path.join(__dirname, '..', 'output');
    const filePath = path.join(outputDir, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: "文件不存在",
      });
    }

    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: "文件删除成功",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "删除文件时发生错误",
    });
  }
});

export default router;
