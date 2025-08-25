#!/usr/bin/env ts-node

/**
 * 统一脚本运行器 - 减少内存占用
 * 支持运行chart-generator和linkol-card-generator
 */

import { spawn } from 'child_process';
import path from 'path';

// 脚本类型
type ScriptType = 'chart' | 'card';

// 运行脚本
async function runScript(scriptType: ScriptType, args: string[] = []): Promise<void> {
  const scriptMap = {
    chart: 'scripts/chart-generator.ts',
    card: 'scripts/linkol-card-generator.ts'
  };

  const scriptPath = scriptMap[scriptType];
  if (!scriptPath) {
    console.error(`❌ 不支持的脚本类型: ${scriptType}`);
    process.exit(1);
  }

  console.log(`🚀 启动 ${scriptType} 脚本...`);
  console.log(`📁 脚本路径: ${scriptPath}`);
  console.log(`🔧 参数: ${args.join(' ')}`);

  // 使用ts-node运行脚本
  const child = spawn('ts-node', [scriptPath, ...args], {
    stdio: 'inherit',
    cwd: process.cwd(),
    env: {
      ...process.env,
      NODE_ENV: process.env.NODE_ENV || 'development'
    }
  });

  child.on('error', (error) => {
    console.error(`❌ 脚本运行错误: ${error.message}`);
    process.exit(1);
  });

  child.on('exit', (code) => {
    if (code === 0) {
      console.log(`✅ ${scriptType} 脚本执行完成`);
    } else {
      console.error(`❌ ${scriptType} 脚本执行失败，退出码: ${code}`);
      process.exit(code || 1);
    }
  });
}

// 主函数
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🔧 Linkol 统一脚本运行器

用法:
  npm run script:chart [参数...]  - 运行价格图表生成器
  npm run script:card [参数...]   - 运行Linkol卡片生成器

示例:
  npm run script:chart -- --help
  npm run script:card -- --help
  npm run script:chart -- --data sample-card-data.json
  npm run script:card -- --data sample-card-data.json

环境变量:
  NODE_ENV=production  - 生产模式（使用Docker Chrome）
  NODE_ENV=development - 开发模式（使用本地Chrome）
    `);
    return;
  }

  const scriptType = args[0] as ScriptType;
  const scriptArgs = args.slice(1);

  if (!['chart', 'card'].includes(scriptType)) {
    console.error(`❌ 不支持的脚本类型: ${scriptType}`);
    console.log('支持的脚本类型: chart, card');
    process.exit(1);
  }

  await runScript(scriptType, scriptArgs);
}

// 运行主函数
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ 程序执行错误:', error);
    process.exit(1);
  });
}
