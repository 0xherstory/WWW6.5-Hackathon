import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  // 合约地址
  const PROXY_ADDRESS = "0xD1b15Af0d93F5a9615B79343Ed0531Eae3A33228";
  const PLUGIN_ADDRESS = "0xe69E9cda8344AFA97AEfF755339eDc928A4CF3Db";
  
  console.log("=== 缩短沙盒期脚本 ===");
  console.log("操作者:", deployer.address);
  console.log("");
  
  // 获取合约实例
  const protocol = await hre.ethers.getContractAt("SanctuaryProtocolV2", PROXY_ADDRESS);
  
  // 1. 检查当前沙盒期
  console.log("1. 检查当前沙盒期设置...");
  const currentSandboxPeriod = await protocol.sandboxPeriod();
  console.log("   当前沙盒期:", currentSandboxPeriod.toString(), "秒");
  console.log("   约等于:", Number(currentSandboxPeriod) / 60, "分钟");
  console.log("   约等于:", Number(currentSandboxPeriod) / 3600, "小时");
  console.log("   约等于:", Number(currentSandboxPeriod) / 86400, "天");
  console.log("");
  
  // 2. 缩短沙盒期到 10 分钟（600秒）
  const NEW_SANDBOX_PERIOD = 600; // 10 分钟
  console.log("2. 设置沙盒期为 10 分钟 (600秒)...");
  const tx = await protocol.setSandboxPeriod(NEW_SANDBOX_PERIOD);
  await tx.wait();
  console.log("   ✅ 沙盒期已更新为 10 分钟");
  console.log("");
  
  // 3. 检查插件状态
  console.log("3. 检查插件状态...");
  const pluginInfo = await protocol.plugins(PLUGIN_ADDRESS);
  console.log("   插件状态:", ["NONE", "PENDING_AUDIT", "IN_SANDBOX", "ACTIVE", "SUSPENDED", "DEPRECATED"][Number(pluginInfo.status)]);
  console.log("   沙盒结束时间:", new Date(Number(pluginInfo.sandboxEnd) * 1000).toLocaleString());
  
  const now = Math.floor(Date.now() / 1000);
  const sandboxEnd = Number(pluginInfo.sandboxEnd);
  
  if (sandboxEnd > now) {
    const waitSeconds = sandboxEnd - now;
    console.log("   还需等待:", waitSeconds, "秒 (约", Math.ceil(waitSeconds / 60), "分钟)");
    console.log("");
    console.log("   ⚠️ 沙盒期尚未结束，无法注册插件");
    console.log("   请等待沙盒期结束后再次运行 register-plugin.ts 脚本");
  } else {
    console.log("   ✅ 沙盒期已结束，可以注册插件");
    console.log("");
    console.log("4. 注册插件...");
    const registerTx = await protocol.registerPlugin(PLUGIN_ADDRESS);
    await registerTx.wait();
    console.log("   ✅ 插件注册成功！");
    
    // 验证状态
    const updatedInfo = await protocol.plugins(PLUGIN_ADDRESS);
    console.log("   更新后状态:", ["NONE", "PENDING_AUDIT", "IN_SANDBOX", "ACTIVE", "SUSPENDED", "DEPRECATED"][Number(updatedInfo.status)]);
  }
  
  console.log("");
  console.log("=== 脚本执行完成 ===");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
