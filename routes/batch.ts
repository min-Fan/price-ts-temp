import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { generateChartImage } from '../scripts/chart-generator';
import { generateLinkolCardImage } from '../scripts/linkol-card-generator';

const router = Router();

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// 批量生成接口
router.post('/generate', upload.single("userList"), async (req, res) => {
  try {
    let usernames: string[] = [];

    if (req.file) {
      // 从上传的JSON文件读取用户列表
      const fileContent = fs.readFileSync(req.file.path, "utf-8");
      const userData = JSON.parse(fileContent);

      if (Array.isArray(userData)) {
        usernames = userData;
      } else if (userData.users && Array.isArray(userData.users)) {
        usernames = userData.users;
      } else if (
        userData.screen_names &&
        Array.isArray(userData.screen_names)
      ) {
        usernames = userData.screen_names;
      } else {
        throw new Error("JSON格式不正确");
      }

      // 删除临时文件
      fs.unlinkSync(req.file.path);
    } else if (req.body.usernames) {
      // 从请求体读取用户列表
      usernames = Array.isArray(req.body.usernames)
        ? req.body.usernames
        : [req.body.usernames];
    } else {
      return res.status(400).json({
        success: false,
        error: "缺少用户列表，请上传JSON文件或提供usernames参数",
      });
    }

    if (usernames.length === 0) {
      return res.status(400).json({
        success: false,
        error: "用户列表不能为空",
      });
    }

    const { type = "both" } = req.body; // 'chart', 'card', 'both'
    const results: any[] = [];

    console.log(
      `开始批量生成 ${usernames.length} 个用户的${
        type === "both" ? "图表和卡片" : type === "chart" ? "图表" : "卡片"
      }...`
    );

    // 获取输出目录
    const outputDir = path.join(__dirname, '..', 'output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    for (let i = 0; i < usernames.length; i++) {
      const username = usernames[i];
      console.log(`\n[${i + 1}/${usernames.length}] 处理用户: @${username}`);

      try {
        if (type === "chart" || type === "both") {
          await generateChartImage(username, outputDir);
        }

        if (type === "card" || type === "both") {
          await generateLinkolCardImage(username, outputDir);
        }

        results.push({
          username,
          status: "success",
          message: "生成成功",
        });

        console.log(`✅ @${username} 生成成功`);
      } catch (error: any) {
        console.error(`❌ @${username} 生成失败:`, error);
        results.push({
          username,
          status: "error",
          message: error.message || "生成失败",
        });
      }

      // 添加延迟避免请求过于频繁
      if (i < usernames.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // 查找生成的文件
    const files = fs.readdirSync(outputDir);
    const generatedFiles = files.filter((file) =>
      usernames.some((username) => file.includes(`@${username}_`))
    );

    res.json({
      success: true,
      message: `批量生成完成，共处理 ${usernames.length} 个用户`,
      data: {
        totalUsers: usernames.length,
        successCount: results.filter((r) => r.status === "success").length,
        errorCount: results.filter((r) => r.status === "error").length,
        results: results,
        generatedFiles: generatedFiles,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("批量生成时出错:", error);
    res.status(500).json({
      success: false,
      error: error.message || "批量生成时发生未知错误",
    });
  }
});

export default router;
