import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();
  const pluginAddress = "0x73ef9BfC37b3f085148c1d43afb8C3258f435795";
  const userAddress = "0x6442A5ae7EF7D73BF2c1c66C33C87Eb368c9D211";
  
  const plugin = await ethers.getContractAt("PlantOHCardPlugin", pluginAddress);

  // 模拟参数
  const cardIds = [1, 2, 3];
  const journalHash = "0x21df5d42c175df5e63ff055d33ee677a39bfb4035c649daee2334f7dfa02fdd0";
  const duration = 600; // 10分钟
  const journalLength = 500; // 500字符

  console.log("测试参数:");
  console.log("  用户:", userAddress);
  console.log("  卡牌:", cardIds);
  console.log("  日记哈希:", journalHash);
  console.log("  时长:", duration, "秒");
  console.log("  日记长度:", journalLength, "字符");

  // 检查计算金额
  const payout = await plugin.calculatePayout(cardIds.length, duration, journalLength);
  console.log("\n计算拨付金额:", ethers.formatEther(payout), "AVAX");

  // 尝试调用（使用静态调用来检查错误）
  console.log("\n尝试静态调用...");
  try {
    await plugin.completeHealingAndRequestPayout.staticCall(
      cardIds,
      journalHash,
      duration,
      journalLength
    );
    console.log("✅ 静态调用成功！");
  } catch (error: any) {
    console.log("❌ 静态调用失败:");
    console.log("  错误:", error.message || error);
    
    // 解析错误原因
    if (error.message?.includes("No cards selected")) {
      console.log("  原因: 没有选中的卡牌");
    } else if (error.message?.includes("Invalid journal hash")) {
      console.log("  原因: 无效的日记哈希");
    } else if (error.message?.includes("Healing too short")) {
      console.log("  原因: 疗愈时长太短（需要 >= 300秒）");
    } else if (error.message?.includes("Journal too short")) {
      console.log("  原因: 日记太短（需要 >= 100字符）");
    } else if (error.message?.includes("Donors cannot claim")) {
      console.log("  原因: 捐赠者不能领取");
    } else if (error.message?.includes("Insufficient pool")) {
      console.log("  原因: 资金池余额不足");
    } else if (error.message?.includes("Exceeds allowance")) {
      console.log("  原因: 超过插件每日限额");
    } else if (error.message?.includes("Not active plugin")) {
      console.log("  原因: 插件未激活");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
