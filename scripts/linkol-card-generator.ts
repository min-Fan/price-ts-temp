import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// 加载环境变量
dotenv.config({ path: path.join(__dirname, "..", ".env") });

// 从环境变量读取API配置
const API_BASE_URL = process.env.API_BASE_URL;
const API_PATH = process.env.API_PATH;

// 定义数据类型
interface Kol {
  name: string;
  profile_image_url: string;
  screen_name: string;
}

interface IGetPriceData {
  current_bin: number;
  current_value: number;
  kol: Kol;
  leading_percentage: number;
}

interface LinkolCardData {
  date: string;
  username: string;
  price: number;
  brandName?: string;
}

// API请求函数（与chart-generator.ts相同）
async function getPriceData(screenName: string): Promise<IGetPriceData> {
  try {
    // 尝试调用真实API
    const response = await fetch(
      `${API_BASE_URL}${API_PATH}?screen_name=${screenName}`
    );

    // 检查响应状态
    if (!response.ok) {
      console.log(`API请求失败 (${response.status}): ${response.statusText}`);
      throw new Error(`API请求失败: ${response.status}`);
    }

    const responseData = await response.json();

    // 检查API返回的数据结构
    if (responseData.code === 200 && responseData.data) {
      // API 成功返回数据，直接返回 data 部分
      return responseData.data;
    } else {
      // API 返回错误状态
      console.log(`API返回错误: ${responseData.msg || "未知错误"}`);
      throw new Error(`API返回错误: ${responseData.msg || "未知错误"}`);
    }
  } catch (error: any) {
    console.log("API调用失败:", error.message);
    throw error;
  }
}

// 生成Linkol卡片并导出为图片
async function generateLinkolCardImage(
  screenName: string,
  outputPath: string
): Promise<void> {
  try {
    console.log(`开始为 @${screenName} 生成Linkol卡片...`);

    // 获取数据
    const data = await getPriceData(screenName);

    // 验证数据结构
    if (!data || !data.kol || !data.kol.screen_name) {
      throw new Error(`数据格式无效: ${JSON.stringify(data)}`);
    }

    console.log("数据获取成功:", {
      username: data.kol.screen_name,
      currentValue: data.current_value,
      leadingPercentage: data.leading_percentage,
      kol: data.kol,
    });

    // 启动浏览器
    const browser = await puppeteer.launch({
      headless: "new",
      // 在 Docker 环境中指定 Chrome 路径
      executablePath: "/usr/bin/google-chrome-stable",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-extensions"
      ],
    });

    const page = await browser.newPage();

    // 设置视口大小
    await page.setViewport({ width: 800, height: 600 });

    // 读取HTML模板
    const templatePath = path.join(
      __dirname,
      "..",
      "template",
      "linkol-card-template.html"
    );
    let htmlContent = fs.readFileSync(templatePath, "utf-8");

    // 读取并嵌入本地资源文件
    const assetsDir = path.join(__dirname, "..", "template", "assets");
    
    // 读取背景图片并转换为 base64
    const bgImagePath = path.join(assetsDir, "img", "card-bg.png");
    const bgImageBuffer = fs.readFileSync(bgImagePath);
    const bgImageBase64 = `data:image/png;base64,${bgImageBuffer.toString('base64')}`;
    
    // 读取字体文件并转换为 base64
    const fontPath = path.join(assetsDir, "font", "KyivTypeSerif-VarGX.ttf");
    const fontBuffer = fs.readFileSync(fontPath);
    const fontBase64 = `data:font/ttf;base64,${fontBuffer.toString('base64')}`;
    
    // 读取 img 目录下的 PNG 图片并转换为 base64
    const logoBorderPath = path.join(assetsDir, "img", "logo-border.png");
    const logoBorderBuffer = fs.readFileSync(logoBorderPath);
    const logoBorderBase64 = `data:image/png;base64,${logoBorderBuffer.toString('base64')}`;
    
    const linkolLogoPath = path.join(assetsDir, "img", "linkol-logoicon-light.png");
    const linkolLogoBuffer = fs.readFileSync(linkolLogoPath);
    const linkolLogoBase64 = `data:image/png;base64,${linkolLogoBuffer.toString('base64')}`;
    
    const linkolHorizontalPath = path.join(assetsDir, "img", "linkol-horizontal-light.png");
    const linkolHorizontalBuffer = fs.readFileSync(linkolHorizontalPath);
    const linkolHorizontalBase64 = `data:image/png;base64,${linkolHorizontalBuffer.toString('base64')}`;
    
    htmlContent = htmlContent
      .replace('./assets/img/card-bg.png', bgImageBase64)
      .replace('./assets/img/logo-border.png', logoBorderBase64)
      .replace('./assets/img/linkol-logoicon-light.svg', linkolLogoBase64)
      .replace('./assets/img/linkol-horizontal-light.svg', linkolHorizontalBase64);
    
    // 添加内联字体样式
    const fontStyle = `
      <style>
        @font-face {
          font-family: 'KyivTypeSerif';
          src: url('${fontBase64}') format('truetype');
        }
      </style>
    `;
    
    // 在 head 标签后插入字体样式
    htmlContent = htmlContent.replace('</head>', `${fontStyle}</head>`);

    // 设置HTML内容
    await page.setContent(htmlContent);

    // 等待页面完全加载
    await page.waitForTimeout(1000);

    // 更新卡片内容
    await page.evaluate(
      (cardData) => {
        // 更新日期
        const dateElement = document.getElementById("date");
        if (dateElement) {
          dateElement.textContent = cardData.date;
        }

        // 更新用户名
        const usernameElement = document.getElementById("username");
        if (usernameElement) {
          usernameElement.textContent = `@${cardData.username}`;
        }

        // 更新价格
        const priceElement = document.getElementById("price");
        if (priceElement) {
          priceElement.textContent = `$${cardData.price.toLocaleString()}`;
        }

        // 更新品牌名称
        const brandElement = document.getElementById("brand-name");
        if (brandElement) {
          brandElement.textContent = cardData.brandName;
        }

        // 更新用户头像
        const avatarElement = document.getElementById(
          "user-avatar"
        ) as HTMLImageElement;
        if (avatarElement && cardData.avatarUrl) {
          avatarElement.src = cardData.avatarUrl;
        }
      },
      {
        date: new Date().toISOString().split("T")[0].replace(/-/g, "."),
        username: data.kol.screen_name,
        price: data.current_value,
        brandName: data.kol.name,
        avatarUrl: data.kol.profile_image_url.replace("_normal", ""),
      }
    );

    // 等待内容更新完成
    await page.waitForTimeout(500);

    // 等待头像图片加载完成
    try {
      console.log("等待头像图片加载...");
      await page.waitForFunction(
        () => {
          const avatar = document.getElementById(
            "user-avatar"
          ) as HTMLImageElement;
          if (!avatar) return false;

          // 检查图片是否加载完成
          return avatar.complete && avatar.naturalWidth > 0;
        },
        { timeout: 10000 }
      ); // 10秒超时
      console.log("头像图片加载完成");
    } catch (error) {
      console.log("头像加载失败或超时，继续截图:", error);
    }

    // 截图
    const cardContainer = await page.$("#linkol-card");
    if (!cardContainer) {
      throw new Error("找不到卡片容器");
    }

    // 确保输出目录存在
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    // 生成文件名
    const fileName = `@${data.kol.screen_name}_linkol_card_${
      new Date().toISOString().split("T")[0]
    }.png`;
    const fullOutputPath = path.join(outputPath, fileName);

    // 截图并保存
    await cardContainer.screenshot({
      path: fullOutputPath,
      type: "png",
      omitBackground: true,
    });

    console.log(`Linkol卡片已保存到: ${fullOutputPath}`);

    await browser.close();
  } catch (error) {
    console.error("生成Linkol卡片时出错:", error);
    throw error;
  }
}

// 批量生成多个用户的卡片
async function generateMultipleCards(
  screenNames: string[],
  outputPath: string
): Promise<void> {
  console.log(`开始批量生成 ${screenNames.length} 个用户的Linkol卡片...`);

  for (let i = 0; i < screenNames.length; i++) {
    const screenName = screenNames[i];
    console.log(`\n[${i + 1}/${screenNames.length}] 处理用户: @${screenName}`);

    try {
      await generateLinkolCardImage(screenName, outputPath);
      console.log(`✅ @${screenName} 卡片生成成功`);
    } catch (error) {
      console.error(`❌ @${screenName} 卡片生成失败:`, error);
    }

    // 添加延迟避免请求过于频繁
    if (i < screenNames.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log("\n批量生成完成！");
}

// CLI 辅助
function printUsage() {
  console.log(
    [
      "用法:",
      "  ts-node linkol-card-generator.ts single <username> [-o|--out <输出目录>]",
      "  ts-node linkol-card-generator.ts batch <json路径> [-o|--out <输出目录>]",
      "",
      "说明:",
      "  single: 为单个用户生成Linkol卡片",
      "  batch:  从 JSON 文件批量生成卡片",
      "",
      "JSON格式示例:",
      "  [",
      '    "user1",',
      '    "user2"',
      "  ]",
    ].join("\n")
  );
}

function parseArgs(argv: string[]): {
  mode: "single" | "batch";
  username?: string;
  jsonPath?: string;
  outDir: string;
} | null {
  const args = argv.slice(2);
  if (args.length === 0) return null;

  const getOutDir = (): string => {
    const idxO = args.findIndex((a) => a === "-o" || a === "--out");
    if (idxO !== -1 && args[idxO + 1]) {
      return path.isAbsolute(args[idxO + 1])
        ? args[idxO + 1]
        : path.join(process.cwd(), args[idxO + 1]);
    }
    return path.join(__dirname, "..", "output");
  };

  if (args[0] === "single") {
    const username = args[1];
    if (!username) return null;

    return { mode: "single", username, outDir: getOutDir() };
  }

  if (args[0] === "batch") {
    const jsonPath = args[1];
    if (!jsonPath) return null;
    const abs = path.isAbsolute(jsonPath)
      ? jsonPath
      : path.join(process.cwd(), jsonPath);
    return { mode: "batch", jsonPath: abs, outDir: getOutDir() };
  }

  return null;
}

function readUserListFromJson(jsonFilePath: string): string[] {
  const raw = fs.readFileSync(jsonFilePath, "utf-8");
  const parsed = JSON.parse(raw);

  if (Array.isArray(parsed)) {
    // 如果是字符串数组，直接返回
    if (typeof parsed[0] === "string") {
      return parsed as string[];
    }
    // 如果是对象数组，提取用户名字段（向后兼容）
    return parsed.map((item) => item.username || item.screen_name || item.name);
  }

  throw new Error("JSON 格式不正确，应为字符串数组或对象数组");
}

// 主函数（CLI 入口）
async function main() {
  try {
    const parsed = parseArgs(process.argv);
    if (!parsed) {
      printUsage();
      process.exit(1);
      return;
    }

    if (parsed.mode === "single" && parsed.username) {
      await generateLinkolCardImage(parsed.username, parsed.outDir);
      return;
    }

    if (parsed.mode === "batch" && parsed.jsonPath) {
      const screenNames = readUserListFromJson(parsed.jsonPath);
      await generateMultipleCards(screenNames, parsed.outDir);
      return;
    }

    printUsage();
    process.exit(1);
  } catch (error) {
    console.error("程序执行失败:", error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

// 导出函数供其他模块使用
export { generateLinkolCardImage, generateMultipleCards, LinkolCardData };
