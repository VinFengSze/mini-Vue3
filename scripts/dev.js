const path = require("path");
const esbuild = require("esbuild");
const args = require("minimist")(process.argv.slice(2));

// 解析命令行参数
const target = args._[0] || "reactivity"; // 默认模块
const format = args.f || "global"; // 默认格式

// 解析 package.json
const pkgPath = path.resolve(__dirname, `../packages/${target}/package.json`);
const pkg = require(pkgPath);

// 确定输出格式
const outputFormat = format.startsWith("global") ? "iife" : format === "cjs" ? "cjs" : "esm";

// 确定输出文件路径
const outfile = path.resolve(__dirname, `../packages/${target}/dist/${target}.${format}.js`);

// 获取包名
const { name } = pkg;

async function runWatch() {
  try {
    // 1. 创建 esbuild 上下文
    const ctx = await esbuild.context({
      entryPoints: [path.resolve(__dirname, `../packages/${target}/src/index.ts`)],
      outfile,
      bundle: true,
      sourcemap: true,
      format: outputFormat,
      globalName: format === pkg.buildOptions?.global ? name : undefined,
      platform: format === "cjs" ? "node" : "browser",
    });

    // 2. 启动监听模式
    await ctx.watch();
    console.log("👀 正在监听文件变化...");
  } catch (err) {
    console.error("🚨 初始构建失败:", err);
    process.exit(1);
  }
}

runWatch();
