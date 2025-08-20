import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// 加载环境变量
dotenv.config({ path: path.join(__dirname, ".env") });

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
  bins: number[];
  current_bin: number;
  current_value: number;
  data: number[];
  kol: Kol;
  leading_percentage: number;
}

// 模拟API请求函数
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

// 生成图表并导出为图片
async function generateChartImage(
  screenName: string,
  outputPath: string
): Promise<void> {
  try {
    console.log(`开始为 @${screenName} 生成图表...`);

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
      executablePath:
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // 设置视口大小
    await page.setViewport({ width: 800, height: 600 });

    // 读取HTML模板
    const templatePath = path.join(
      __dirname,
      "template",
      "chart-template.html"
    );
    const htmlContent = fs.readFileSync(templatePath, "utf-8");

    // 设置HTML内容
    await page.setContent(htmlContent);

    // 等待Chart.js加载完成
    await page.waitForFunction(() => (window as any).Chart !== undefined);

    // 渲染图表
    const chart = await page.evaluate((chartData) => {
      // @ts-ignore
      return window.renderLinkolChart(chartData);
    }, data);

    // 等待图表渲染完成
    await page.waitForTimeout(2000);

    // 等待头像图片加载完成（如果存在）
    try {
      console.log("等待头像图片加载...");
      await Promise.race([
        page.evaluate(() => {
          // 使用全局等待函数
          return (window as any).waitForAvatarLoad();
        }),
        new Promise((resolve) => setTimeout(resolve, 10000)), // 10秒超时
      ]);
      console.log("头像图片加载完成");
    } catch (error) {
      console.log("头像加载失败或不存在，继续截图:", error);
    }

    // 额外等待确保渲染完全完成
    await page.waitForTimeout(1000);

    // 截图
    const chartContainer = await page.$("#chart-container");
    if (!chartContainer) {
      throw new Error("找不到图表容器");
    }

    // 确保输出目录存在
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true });
    }

    // 生成文件名
    const fileName = `@${screenName}_linkol_price_${
      new Date().toISOString().split("T")[0]
    }.png`;
    const fullOutputPath = path.join(outputPath, fileName);

    // 截图并保存
    await chartContainer.screenshot({
      path: fullOutputPath,
      type: "png",
      omitBackground: false,
    });

    console.log(`图表已保存到: ${fullOutputPath}`);

    await browser.close();
  } catch (error) {
    console.error("生成图表时出错:", error);
    throw error;
  }
}

// 批量生成多个用户的图表
async function generateMultipleCharts(
  screenNames: string[],
  outputPath: string
): Promise<void> {
  console.log(`开始批量生成 ${screenNames.length} 个用户的图表...`);

  for (let i = 0; i < screenNames.length; i++) {
    const screenName = screenNames[i];
    console.log(`\n[${i + 1}/${screenNames.length}] 处理用户: @${screenName}`);

    try {
      await generateChartImage(screenName, outputPath);
      console.log(`✅ @${screenName} 图表生成成功`);
    } catch (error) {
      console.error(`❌ @${screenName} 图表生成失败:`, error);
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
      "  ts-node chart-generator.ts single <username> [-o|--out <输出目录>]",
      "  ts-node chart-generator.ts batch <json路径> [-o|--out <输出目录>]",
      "",
      "说明:",
      "  single: 为单个 username 生成图表",
      "  batch:  从 JSON 文件批量生成图表，JSON 可以是字符串数组，或 { users: string[] } / { screen_names: string[] }",
    ].join("\n")
  );
}

function parseArgs(
  argv: string[]
): {
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
    return path.join(__dirname, "output");
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
    return parsed as string[];
  }
  if (parsed && Array.isArray(parsed.users)) {
    return parsed.users as string[];
  }
  if (parsed && Array.isArray(parsed.screen_names)) {
    return parsed.screen_names as string[];
  }
  throw new Error(
    "JSON 格式不正确，应为字符串数组，或包含 users/screen_names 字段的对象"
  );
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
      await generateChartImage(parsed.username, parsed.outDir);
      return;
    }

    if (parsed.mode === "batch" && parsed.jsonPath) {
      const users = readUserListFromJson(parsed.jsonPath);
      await generateMultipleCharts(users, parsed.outDir);
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
export {
  generateChartImage,
  generateMultipleCharts,
  getPriceData,
  IGetPriceData,
  Kol,
};
