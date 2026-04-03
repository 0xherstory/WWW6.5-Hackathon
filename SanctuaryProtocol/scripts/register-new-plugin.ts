import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("操作账户:", deployer.address);

  const sanctuaryAddress = "0xc7df8398F5b6571883Fe75Be3B48CEE355b0dA28";
  const pluginAddress = "0xb2bD4E12aa38a9CbA65822bE3B35f49f30d5162B";

  const sanctuary = await ethers.getContractAt("SanctuaryProtocolV2", sanctuaryAddress);

  // 检查插件状态
  console.log("\n1. 检查插件状态...");
  const pluginInfo = await sanctuary.plugins(pluginAddress);
  const statusNames = ["None", "Pending Audit", "In Sandbox", "Active", "Suspended"];
  console.log("   状态:", statusNames[Number(pluginInfo.status)]);

  // 注册插件
  if (Number(pluginInfo.status) === 2) { // IN_SANDBOX
    console.log("\n2. 注册插件...");
    const tx = await sanctuary.registerPlugin(pluginAddress);
    await tx.wait();
    console.log("   ✅ 插件已注册");
    
    const newInfo = await sanctuary.plugins(pluginAddress);
    console.log("   新状态:", statusNames[Number(newInfo.status)]);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
