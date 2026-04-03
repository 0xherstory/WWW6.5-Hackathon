import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  const pluginAddress = "0x73ef9BfC37b3f085148c1d43afb8C3258f435795";
  const userAddress = "0x6442A5ae7EF7D73BF2c1c66C33C87Eb368c9D211";
  
  const plugin = await ethers.getContractAt("PlantOHCardPlugin", pluginAddress);

  // 模拟参数
  const cardIds = [1, 2, 3];
  const journalHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
  const duration = 600; // 10分钟
  const journalLength = 500; // 500字符

  console.log("模拟参数:");
  console.log("  用户:", userAddress);
  console.log("  卡牌:", cardIds);
  console.log("  日记哈希:", journalHash);
  console.log("  时长:", duration, "秒");
  console.log("  日记长度:", journalLength, "字符");

  try {
    // 计算拨付金额
    const payout = await plugin.calculatePayout(cardIds.length, duration, journalLength);
    console.log("\n计算拨付金额:", ethers.formatEther(payout), "AVAX");

    // 检查用户是否有活动记录
    const activityCount = await plugin.activityCount(userAddress);
    console.log("用户活动记录数:", Number(activityCount));

    // 尝试静态调用（不发送交易）
    console.log("\n尝试静态调用...");
    await plugin.completeHealingAndRequestPayout.staticCall(
      cardIds,
      journalHash,
      duration,
      journalLength,
      { from: userAddress }
    );
    console.log("✅ 静态调用成功！");
  } catch (error: any) {
    console.log("\n❌ 错误:", error.message || error);
    if (error.data) {
      console.log("错误数据:", error.data);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
