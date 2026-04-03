import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  console.log("=== 检查插件详细状态 ===\n");

  const sanctuaryAddress = "0xc7df8398F5b6571883Fe75Be3B48CEE355b0dA28";
  const pluginAddress = "0xb2bD4E12aa38a9CbA65822bE3B35f49f30d5162B";

  const sanctuary = await ethers.getContractAt("SanctuaryProtocolV2", sanctuaryAddress);

  // 获取插件信息
  const pluginInfo = await sanctuary.plugins(pluginAddress);
  const statusNames = ["None", "Pending Audit", "In Sandbox", "Active", "Suspended", "Deprecated"];
  
  console.log("插件地址:", pluginAddress);
  console.log("插件类型:", ["Self Help", "Mutual Aid", "Escrow", "Custom"][Number(pluginInfo.pluginType)]);
  console.log("插件状态:", statusNames[Number(pluginInfo.status)]);
  console.log("审计员:", pluginInfo.auditor);
  console.log("总预算:", ethers.formatEther(pluginInfo.allowance), "AVAX");
  console.log("今日支出:", ethers.formatEther(pluginInfo.spentToday), "AVAX");
  console.log("上次重置:", new Date(Number(pluginInfo.lastPayoutReset) * 1000).toLocaleString());
  console.log("注册时间:", new Date(Number(pluginInfo.registeredAt) * 1000).toLocaleString());
  console.log("沙盒结束:", new Date(Number(pluginInfo.sandboxEnd) * 1000).toLocaleString());

  // 检查当前时间
  const now = Math.floor(Date.now() / 1000);
  console.log("\n当前时间:", new Date(now * 1000).toLocaleString());
  
  if (Number(pluginInfo.status) === 2) { // IN_SANDBOX
    const sandboxEnd = Number(pluginInfo.sandboxEnd);
    if (now >= sandboxEnd) {
      console.log("\n✅ 沙盒期已结束，可以激活插件！");
    } else {
      const remaining = sandboxEnd - now;
      console.log("\n⏳ 沙盒期还剩:", Math.floor(remaining / 60), "分钟");
    }
  }

  // 检查资金池
  console.log("\n=== 资金池状态 ===");
  const poolStatus = await sanctuary.getPoolStatus();
  console.log("资金池余额:", ethers.formatEther(poolStatus.balance), "AVAX");
  console.log("可用余额:", ethers.formatEther(poolStatus.available), "AVAX");
  console.log("当前领取金额:", ethers.formatEther(poolStatus.currentClaimAmount), "AVAX");

  // 检查地址 0x6442a5ae7ef7d73bf2c1c66c33c87eb368c9d211 的状态
  console.log("\n=== 检查测试地址状态 ===");
  const testAddress = "0x6442a5ae7ef7d73bf2c1c66c33c87eb368c9d211";
  const isDonor = await sanctuary.isDonor(testAddress);
  console.log("地址:", testAddress);
  console.log("是否捐赠者:", isDonor);
  
  if (!isDonor) {
    console.log("✅ 此地址可以领取资金！");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
