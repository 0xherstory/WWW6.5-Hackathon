import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("操作账户:", deployer.address);

  const sanctuaryAddress = "0xc7df8398F5b6571883Fe75Be3B48CEE355b0dA28";
  const pluginAddress = "0xb2bD4E12aa38a9CbA65822bE3B35f49f30d5162B";

  const sanctuary = await ethers.getContractAt("SanctuaryProtocolV2", sanctuaryAddress);

  // 1. 激活插件
  console.log("\n=== 1. 激活插件 ===");
  const pluginInfo = await sanctuary.plugins(pluginAddress);
  const statusNames = ["None", "Pending Audit", "In Sandbox", "Active", "Suspended", "Deprecated"];
  console.log("当前状态:", statusNames[Number(pluginInfo.status)]);

  if (Number(pluginInfo.status) === 2) { // IN_SANDBOX
    try {
      console.log("正在激活插件...");
      const tx = await sanctuary.registerPlugin(pluginAddress);
      await tx.wait();
      console.log("✅ 插件已激活");
      
      const newInfo = await sanctuary.plugins(pluginAddress);
      console.log("新状态:", statusNames[Number(newInfo.status)]);
    } catch (e: any) {
      console.log("激活失败:", e.message);
      // 继续尝试设置预算
    }
  }

  // 2. 设置插件预算
  console.log("\n=== 2. 设置插件预算 ===");
  const updatedInfo = await sanctuary.plugins(pluginAddress);
  console.log("当前预算:", ethers.formatEther(updatedInfo.allowance), "AVAX");

  if (updatedInfo.allowance < ethers.parseEther("1.0")) {
    try {
      console.log("正在设置预算为 1.0 AVAX...");
      const tx = await sanctuary.setPluginAllowance(pluginAddress, ethers.parseEther("1.0"));
      await tx.wait();
      console.log("✅ 预算已设置");
      
      const finalInfo = await sanctuary.plugins(pluginAddress);
      console.log("新预算:", ethers.formatEther(finalInfo.allowance), "AVAX");
    } catch (e: any) {
      console.log("设置预算失败:", e.message);
    }
  }

  console.log("\n=== 完成 ===");
  console.log("插件现在应该可以正常使用了！");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
