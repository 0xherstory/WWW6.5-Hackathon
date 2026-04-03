import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("操作账户:", deployer.address);

  const sanctuaryAddress = "0xc7df8398F5b6571883Fe75Be3B48CEE355b0dA28";
  const pluginAddress = "0x73ef9BfC37b3f085148c1d43afb8C3258f435795";

  // 连接到合约
  const sanctuary = await ethers.getContractAt("SanctuaryProtocolV2", sanctuaryAddress);

  // 检查插件状态
  console.log("\n1. 检查插件状态...");
  const pluginInfo = await sanctuary.plugins(pluginAddress);
  const statusNames = ["None", "Pending Audit", "In Sandbox", "Active", "Suspended"];
  console.log("   当前状态:", statusNames[Number(pluginInfo.status)]);

  // 注册插件
  if (Number(pluginInfo.status) === 2) { // IN_SANDBOX
    console.log("\n2. 注册插件...");
    const tx = await sanctuary.registerPlugin(pluginAddress);
    await tx.wait();
    console.log("   ✅ 插件已注册并激活!");
    
    // 再次检查状态
    const newInfo = await sanctuary.plugins(pluginAddress);
    console.log("   新状态:", statusNames[Number(newInfo.status)]);
    console.log("   每日限额:", ethers.formatEther(newInfo.allowance), "AVAX");
  } else {
    console.log("   插件状态不是 IN_SANDBOX，无法注册");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
