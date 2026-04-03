import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("操作账户:", deployer.address);

  const sanctuaryAddress = "0xc7df8398F5b6571883Fe75Be3B48CEE355b0dA28";
  const pluginAddress = "0x73ef9BfC37b3f085148c1d43afb8C3258f435795";

  // 连接到合约
  const sanctuary = await ethers.getContractAt("SanctuaryProtocolV2", sanctuaryAddress);

  // 检查当前状态
  console.log("\n1. 检查插件状态...");
  const pluginInfo = await sanctuary.plugins(pluginAddress);
  console.log("   当前状态:", pluginInfo.status);
  
  // 状态说明: 0=None, 1=PENDING_AUDIT, 2=IN_SANDBOX, 3=ACTIVE, 4=SUSPENDED
  const statusNames = ["None", "Pending Audit", "In Sandbox", "Active", "Suspended"];
  console.log("   状态名称:", statusNames[Number(pluginInfo.status)]);

  // 尝试激活
  if (Number(pluginInfo.status) === 2) {
    console.log("\n2. 激活插件...");
    try {
      const tx = await sanctuary.activatePlugin(pluginAddress);
      await tx.wait();
      console.log("   ✅ 插件激活成功!");
      
      // 再次检查状态
      const newInfo = await sanctuary.plugins(pluginAddress);
      console.log("   新状态:", statusNames[Number(newInfo.status)]);
    } catch (error: any) {
      console.log("   ❌ 激活失败:", error.message || error);
      
      // 如果是沙盒期未结束，显示剩余时间
      if (error.message?.includes("Sandbox not ended")) {
        const now = Math.floor(Date.now() / 1000);
        const sandboxEnd = Number(pluginInfo.sandboxEnd);
        const remaining = sandboxEnd - now;
        console.log(`   沙盒期还剩 ${Math.ceil(remaining / 60)} 分钟`);
      }
    }
  } else if (Number(pluginInfo.status) === 3) {
    console.log("\n   ✅ 插件已经是激活状态!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
