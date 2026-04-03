import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  // 合约地址
  const PROXY_ADDRESS = "0xD1b15Af0d93F5a9615B79343Ed0531Eae3A33228";
  
  console.log("=== 向资金池存入测试资金 ===");
  console.log("操作者:", deployer.address);
  console.log("");
  
  // 获取合约实例
  const protocol = await hre.ethers.getContractAt("SanctuaryProtocolV2", PROXY_ADDRESS);
  
  // 检查当前资金池余额
  console.log("1. 检查当前资金池余额...");
  const poolBalance = await protocol.poolBalance();
  console.log("   当前余额:", hre.ethers.formatEther(poolBalance), "AVAX");
  console.log("");
  
  // 存入 1 AVAX
  const depositAmount = hre.ethers.parseEther("1.0");
  console.log("2. 存入 1 AVAX...");
  const tx = await protocol.donate({ value: depositAmount });
  await tx.wait();
  console.log("   ✅ 存入成功");
  console.log("");
  
  // 验证新余额
  console.log("3. 验证新余额...");
  const newBalance = await protocol.poolBalance();
  console.log("   新余额:", hre.ethers.formatEther(newBalance), "AVAX");
  console.log("");
  
  console.log("=== 完成 ===");
  console.log("资金池现在有", hre.ethers.formatEther(newBalance), "AVAX 可供测试使用");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
