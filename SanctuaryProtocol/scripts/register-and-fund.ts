import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("操作账户:", deployer.address);

  const sanctuaryAddress = "0xc7df8398F5b6571883Fe75Be3B48CEE355b0dA28";
  const pluginAddress = "0x73ef9BfC37b3f085148c1d43afb8C3258f435795";

  // 连接到合约
  const sanctuary = await ethers.getContractAt("SanctuaryProtocolV2", sanctuaryAddress);

  // 1. 检查插件状态
  console.log("\n1. 检查插件状态...");
  const pluginInfo = await sanctuary.plugins(pluginAddress);
  console.log("   插件状态:", pluginInfo.status);
  console.log("   沙盒结束时间:", new Date(Number(pluginInfo.sandboxEnd) * 1000).toLocaleString());

  // 2. 如果还在沙盒期，尝试激活
  if (pluginInfo.status == 2) { // IN_SANDBOX = 2
    console.log("\n2. 激活插件...");
    try {
      const activateTx = await sanctuary.activatePlugin(pluginAddress);
      await activateTx.wait();
      console.log("   ✅ 插件已激活");
    } catch (e) {
      console.log("   激活失败，可能沙盒期未结束");
    }
  }

  // 3. 给资金池充值 3 AVAX
  console.log("\n3. 给资金池充值 3 AVAX...");
  const fundTx = await deployer.sendTransaction({
    to: sanctuaryAddress,
    value: ethers.parseEther("3"),
  });
  await fundTx.wait();
  console.log("   ✅ 充值完成");

  // 4. 检查资金池余额
  const poolStatus = await sanctuary.getPoolStatus();
  console.log("   资金池余额:", ethers.formatEther(poolStatus[0]), "AVAX");

  console.log("\n=== 完成 ===");
  console.log("新合约地址:", sanctuaryAddress);
  console.log("新插件地址:", pluginAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
