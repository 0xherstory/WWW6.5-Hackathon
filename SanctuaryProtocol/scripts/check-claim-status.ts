import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  console.log("=== 检查领取状态 ===\n");

  const sanctuaryAddress = "0xc7df8398F5b6571883Fe75Be3B48CEE355b0dA28";
  const userAddress = "0x6442a5ae7ef7d73bf2c1c66c33c87eb368c9d211";

  const sanctuary = await ethers.getContractAt("SanctuaryProtocolV2", sanctuaryAddress);
  const provider = ethers.provider;

  // 检查用户余额
  console.log("用户地址:", userAddress);
  const balance = await provider.getBalance(userAddress);
  console.log("当前余额:", ethers.formatEther(balance), "AVAX");

  // 检查领取记录
  console.log("\n=== 领取记录 ===");
  const claimCount = await sanctuary.getClaimCount();
  console.log("总领取次数:", claimCount.toString());

  if (Number(claimCount) > 0) {
    for (let i = 0; i < Number(claimCount); i++) {
      const claim = await sanctuary.claims(i);
      console.log(`\n领取记录 ${i + 1}:`);
      console.log("  领取人:", claim.recipient);
      console.log("  金额:", ethers.formatEther(claim.amount), "AVAX");
      console.log("  时间:", new Date(Number(claim.timestamp) * 1000).toLocaleString());
      console.log("  邮箱哈希:", claim.emailHash);
      
      if (claim.recipient.toLowerCase() === userAddress.toLowerCase()) {
        console.log("  ✅ 这是你的领取记录！");
      }
    }
  }

  // 检查邮箱验证状态
  console.log("\n=== 邮箱验证状态 ===");
  // 注意：需要知道邮箱哈希才能查询，这里显示如何查询
  console.log("要查询特定邮箱的验证状态，需要提供邮箱哈希");

  // 检查资金池
  console.log("\n=== 资金池状态 ===");
  const poolStatus = await sanctuary.getPoolStatus();
  console.log("资金池余额:", ethers.formatEther(poolStatus.balance), "AVAX");
  console.log("可用余额:", ethers.formatEther(poolStatus.available), "AVAX");
  console.log("当前领取金额:", ethers.formatEther(poolStatus.currentClaimAmount), "AVAX");

  // 检查插件支出
  console.log("\n=== 插件支出 ===");
  const pluginAddress = "0xb2bD4E12aa38a9CbA65822bE3B35f49f30d5162B";
  const pluginInfo = await sanctuary.plugins(pluginAddress);
  console.log("插件今日支出:", ethers.formatEther(pluginInfo.spentToday), "AVAX");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
