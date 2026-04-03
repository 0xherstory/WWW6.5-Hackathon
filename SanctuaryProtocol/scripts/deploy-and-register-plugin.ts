import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  // 协议代理地址
  const PROXY_ADDRESS = "0xD1b15Af0d93F5a9615B79343Ed0531Eae3A33228";
  
  console.log("=== 部署并注册新插件脚本 ===");
  console.log("操作者:", deployer.address);
  console.log("协议地址:", PROXY_ADDRESS);
  console.log("");
  
  // 获取协议合约
  const protocol = await hre.ethers.getContractAt("SanctuaryProtocolV2", PROXY_ADDRESS);
  
  // 检查当前沙盒期
  const sandboxPeriod = await protocol.sandboxPeriod();
  console.log("当前沙盒期设置:", sandboxPeriod.toString(), "秒 (", Number(sandboxPeriod) / 60, "分钟)");
  console.log("");
  
  // 1. 部署新的 PlantOHCardPlugin 合约
  console.log("1. 部署新的 PlantOHCardPlugin 合约...");
  const PlantOHCardPlugin = await hre.ethers.getContractFactory("PlantOHCardPlugin");
  const plantOHCardPlugin = await PlantOHCardPlugin.deploy(
    PROXY_ADDRESS,      // 协议地址
    deployer.address    // owner
  );
  await plantOHCardPlugin.waitForDeployment();
  const pluginAddress = await plantOHCardPlugin.getAddress();
  console.log("   ✅ PlantOHCardPlugin 部署成功:", pluginAddress);
  console.log("");
  
  // 2. 提交插件审核
  console.log("2. 提交插件审核...");
  const submitTx = await protocol.submitPlugin(pluginAddress, deployer.address);
  await submitTx.wait();
  console.log("   ✅ 插件已提交审核");
  console.log("");
  
  // 3. 审计确认
  console.log("3. 审计确认...");
  const confirmTx = await protocol.confirmAudit(pluginAddress);
  await confirmTx.wait();
  console.log("   ✅ 审计已通过");
  console.log("");
  
  // 4. 检查沙盒期
  console.log("4. 检查沙盒期...");
  const pluginInfo = await protocol.plugins(pluginAddress);
  const now = Math.floor(Date.now() / 1000);
  const sandboxEnd = Number(pluginInfo.sandboxEnd);
  
  console.log("   沙盒结束时间:", new Date(sandboxEnd * 1000).toLocaleString());
  console.log("   剩余时间:", sandboxEnd - now, "秒 (约", Math.ceil((sandboxEnd - now) / 60), "分钟)");
  console.log("");
  
  if (sandboxEnd <= now) {
    console.log("5. 沙盒期已结束，立即注册插件...");
    const registerTx = await protocol.registerPlugin(pluginAddress);
    await registerTx.wait();
    console.log("   ✅ 插件注册成功！");
    
    const statusNames = ["NONE", "PENDING_AUDIT", "IN_SANDBOX", "ACTIVE", "SUSPENDED", "DEPRECATED"];
    const finalInfo = await protocol.plugins(pluginAddress);
    console.log("   最终状态:", statusNames[Number(finalInfo.status)]);
  } else {
    console.log("5. 沙盒期尚未结束");
    console.log("   请等待", Math.ceil((sandboxEnd - now) / 60), "分钟后手动注册插件");
    console.log("");
    console.log("   注册命令:");
    console.log("   npx hardhat run scripts/register-plugin.ts --network avalancheFuji");
  }
  
  console.log("");
  console.log("=== 部署完成 ===");
  console.log("新插件地址:", pluginAddress);
  console.log("");
  console.log("⚠️  重要：请更新 .env 文件中的 PLUGIN 地址：");
  console.log("NEXT_PUBLIC_PLUGIN_ADDRESS_FUJI=" + pluginAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
