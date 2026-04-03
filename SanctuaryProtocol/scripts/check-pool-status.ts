import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  console.log("=== 检查资金池状态 ===\n");

  const sanctuaryAddress = "0xc7df8398F5b6571883Fe75Be3B48CEE355b0dA28";
  const sanctuary = await ethers.getContractAt("SanctuaryProtocolV2", sanctuaryAddress);

  // 获取资金池状态
  const poolStatus = await sanctuary.getPoolStatus();
  console.log("资金池余额:", ethers.formatEther(poolStatus.balance), "AVAX");
  console.log("储备金:", ethers.formatEther(poolStatus.reserveAmount), "AVAX");
  console.log("可用余额:", ethers.formatEther(poolStatus.available), "AVAX");
  console.log("捐赠次数:", poolStatus.donationCount.toString());
  console.log("领取次数:", poolStatus.claimCount.toString());
  console.log("当前领取金额:", ethers.formatEther(poolStatus.currentClaimAmount), "AVAX");
  console.log("模式:", poolStatus.mode);

  console.log("\n=== 检查指定地址的捐赠状态 ===");
  const testAddress = "0x6442a5ae7ef7d73bf2c1c66c33c87eb368c9d211";
  const hasDonated = await sanctuary.isDonor(testAddress);
  console.log(`地址 ${testAddress}:`);
  console.log("  是否捐赠过:", hasDonated);
  if (hasDonated) {
    const total = await sanctuary.totalDonated(testAddress);
    console.log("  总捐赠金额:", ethers.formatEther(total), "AVAX");
  }

  console.log("\n=== 检查合约余额（实际） ===");
  const provider = ethers.provider;
  const contractBalance = await provider.getBalance(sanctuaryAddress);
  console.log("合约实际余额:", ethers.formatEther(contractBalance), "AVAX");

  console.log("\n=== 插件信息 ===");
  const pluginAddress = "0xb2bD4E12aa38a9CbA65822bE3B35f49f30d5162B";
  const pluginInfo = await sanctuary.plugins(pluginAddress);
  const statusNames = ["None", "Pending Audit", "In Sandbox", "Active", "Suspended"];
  console.log("插件地址:", pluginAddress);
  console.log("插件状态:", statusNames[Number(pluginInfo.status)]);
  console.log("插件预算:", ethers.formatEther(pluginInfo.allowance), "AVAX");
  console.log("今日支出:", ethers.formatEther(pluginInfo.spentToday), "AVAX");

  if (Number(pluginInfo.status) === 2) {
    console.log("沙盒结束时间:", new Date(Number(pluginInfo.sandboxEnd) * 1000).toLocaleString());
  }

  console.log("\n=== 创建新测试地址 ===");
  const wallet = ethers.Wallet.createRandom();
  console.log("新地址:", wallet.address);
  console.log("私钥 (请妥善保管!):", wallet.privateKey);
  console.log("\n⚠️  警告: 这是测试私钥，请在安全环境下使用!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
