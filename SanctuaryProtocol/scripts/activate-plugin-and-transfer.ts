import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("操作账户:", deployer.address);

  const sanctuaryAddress = "0xc7df8398F5b6571883Fe75Be3B48CEE355b0dA28";
  const pluginAddress = "0xb2bD4E12aa38a9CbA65822bE3B35f49f30d5162B";
  
  // 新创建的测试地址
  const newTestAddress = "0x641206c4aB455ae4868b9Ad8829aAD59E801DE8F";

  const sanctuary = await ethers.getContractAt("SanctuaryProtocolV2", sanctuaryAddress);

  // 检查插件状态
  console.log("\n=== 检查插件状态 ===");
  const pluginInfo = await sanctuary.plugins(pluginAddress);
  const statusNames = ["None", "Pending Audit", "In Sandbox", "Active", "Suspended"];
  console.log("当前状态:", statusNames[Number(pluginInfo.status)]);

  // 如果插件在沙盒期，激活它
  if (Number(pluginInfo.status) === 2) { // IN_SANDBOX
    console.log("\n=== 激活插件 ===");
    try {
      const tx = await sanctuary.registerPlugin(pluginAddress);
      await tx.wait();
      console.log("✅ 插件已激活");
      
      const newInfo = await sanctuary.plugins(pluginAddress);
      console.log("新状态:", statusNames[Number(newInfo.status)]);
    } catch (e: any) {
      console.log("激活失败:", e.message);
    }
  }

  // 设置插件预算
  console.log("\n=== 设置插件预算 ===");
  const currentAllowance = await sanctuary.pluginAllowances(pluginAddress);
  console.log("当前预算:", ethers.formatEther(currentAllowance), "AVAX");
  
  if (currentAllowance < ethers.parseEther("1.0")) {
    try {
      const tx = await sanctuary.setPluginAllowance(pluginAddress, ethers.parseEther("1.0"));
      await tx.wait();
      console.log("✅ 插件预算已设置为 1.0 AVAX");
    } catch (e: any) {
      console.log("设置预算失败:", e.message);
    }
  }

  // 转账给新测试地址
  console.log("\n=== 转账给新测试地址 ===");
  console.log("目标地址:", newTestAddress);
  
  const balance = await deployer.provider.getBalance(newTestAddress);
  console.log("当前余额:", ethers.formatEther(balance), "AVAX");
  
  if (balance < ethers.parseEther("0.5")) {
    try {
      const tx = await deployer.sendTransaction({
        to: newTestAddress,
        value: ethers.parseEther("0.5")
      });
      await tx.wait();
      console.log("✅ 已转账 0.5 AVAX");
      
      const newBalance = await deployer.provider.getBalance(newTestAddress);
      console.log("新余额:", ethers.formatEther(newBalance), "AVAX");
    } catch (e: any) {
      console.log("转账失败:", e.message);
    }
  } else {
    console.log("地址已有足够余额，无需转账");
  }

  console.log("\n=== 新测试地址信息 ===");
  console.log("地址:", newTestAddress);
  console.log("私钥: 0x1a766d69efce8e51ee7a1213fc3a49e792aae759ce08b3951d54d62450905d7a");
  console.log("\n请使用此地址在 MetaMask 中导入并测试！");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
