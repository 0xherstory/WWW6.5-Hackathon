import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  // 合约地址
  const PROXY_ADDRESS = "0xD1b15Af0d93F5a9615B79343Ed0531Eae3A33228";
  const PLUGIN_ADDRESS = "0xe69E9cda8344AFA97AEfF755339eDc928A4CF3Db";
  
  console.log("=== 重新提交插件审核脚本 ===");
  console.log("操作者:", deployer.address);
  console.log("");
  
  // 获取合约实例
  const protocol = await hre.ethers.getContractAt("SanctuaryProtocolV2", PROXY_ADDRESS);
  
  // 1. 检查当前插件状态
  console.log("1. 检查当前插件状态...");
  const pluginInfo = await protocol.plugins(PLUGIN_ADDRESS);
  const statusNames = ["NONE", "PENDING_AUDIT", "IN_SANDBOX", "ACTIVE", "SUSPENDED", "DEPRECATED"];
  console.log("   当前状态:", statusNames[Number(pluginInfo.status)]);
  console.log("");
  
  // 2. 如果插件已经在审核中或沙盒中，先取消
  if (Number(pluginInfo.status) === 1) { // PENDING_AUDIT
    console.log("2. 取消当前审核...");
    const cancelTx = await protocol.cancelPluginSubmission(PLUGIN_ADDRESS);
    await cancelTx.wait();
    console.log("   ✅ 审核已取消");
  } else if (Number(pluginInfo.status) === 2) { // IN_SANDBOX
    console.log("2. 插件在沙盒中，尝试重新提交...");
    console.log("   注意：需要先取消当前状态");
    // 沙盒中的插件不能直接取消，需要其他处理
    console.log("   由于插件已在沙盒期，我们直接等待当前沙盒期结束...");
    const now = Math.floor(Date.now() / 1000);
    const sandboxEnd = Number(pluginInfo.sandboxEnd);
    
    if (sandboxEnd > now) {
      const waitSeconds = sandboxEnd - now;
      console.log("   还需等待:", waitSeconds, "秒 (约", Math.ceil(waitSeconds / 60), "分钟)");
      console.log("");
      console.log("   ⚠️ 请等待沙盒期结束后手动注册插件");
      console.log("   或者创建一个新的插件合约重新部署");
      return;
    }
  }
  
  // 3. 重新提交插件审核
  console.log("3. 重新提交插件审核...");
  const submitTx = await protocol.submitPlugin(PLUGIN_ADDRESS, deployer.address);
  await submitTx.wait();
  console.log("   ✅ 插件已重新提交审核");
  console.log("");
  
  // 4. 审计确认
  console.log("4. 审计确认...");
  const confirmTx = await protocol.confirmAudit(PLUGIN_ADDRESS);
  await confirmTx.wait();
  console.log("   ✅ 审计已通过");
  console.log("");
  
  // 5. 检查新的沙盒期
  console.log("5. 检查新的沙盒期...");
  const newPluginInfo = await protocol.plugins(PLUGIN_ADDRESS);
  const now = Math.floor(Date.now() / 1000);
  const sandboxEnd = Number(newPluginInfo.sandboxEnd);
  const sandboxPeriod = await protocol.sandboxPeriod();
  
  console.log("   沙盒期设置:", sandboxPeriod.toString(), "秒 (", Number(sandboxPeriod) / 60, "分钟)");
  console.log("   沙盒结束时间:", new Date(sandboxEnd * 1000).toLocaleString());
  console.log("   剩余时间:", sandboxEnd - now, "秒 (约", Math.ceil((sandboxEnd - now) / 60), "分钟)");
  console.log("");
  
  if (sandboxEnd <= now) {
    console.log("6. 沙盒期已结束，立即注册插件...");
    const registerTx = await protocol.registerPlugin(PLUGIN_ADDRESS);
    await registerTx.wait();
    console.log("   ✅ 插件注册成功！");
    
    const finalInfo = await protocol.plugins(PLUGIN_ADDRESS);
    console.log("   最终状态:", statusNames[Number(finalInfo.status)]);
  } else {
    console.log("6. 沙盒期尚未结束");
    console.log("   请等待", Math.ceil((sandboxEnd - now) / 60), "分钟后运行注册脚本");
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
