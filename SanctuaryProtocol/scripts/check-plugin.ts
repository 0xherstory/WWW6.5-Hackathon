import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  const sanctuaryAddress = "0xc7df8398F5b6571883Fe75Be3B48CEE355b0dA28";
  const pluginAddress = "0x73ef9BfC37b3f085148c1d43afb8C3258f435795";
  
  const sanctuary = await ethers.getContractAt("SanctuaryProtocolV2", sanctuaryAddress);

  console.log("检查插件状态...\n");
  
  const pluginInfo = await sanctuary.plugins(pluginAddress);
  const statusNames = ["None", "Pending Audit", "In Sandbox", "Active", "Suspended"];
  
  console.log("插件地址:", pluginAddress);
  console.log("状态:", statusNames[Number(pluginInfo.status)]);
  console.log("每日限额:", ethers.formatEther(pluginInfo.allowance), "AVAX");
  console.log("今日已支出:", ethers.formatEther(pluginInfo.spentToday), "AVAX");
  console.log("注册时间:", new Date(Number(pluginInfo.registeredAt) * 1000).toLocaleString());
  
  const poolStatus = await sanctuary.getPoolStatus();
  console.log("\n资金池状态:");
  console.log("  总余额:", ethers.formatEther(poolStatus[0]), "AVAX");
  console.log("  储备金:", ethers.formatEther(poolStatus[1]), "AVAX");
  console.log("  可用余额:", ethers.formatEther(poolStatus[2]), "AVAX");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
