const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("部署账户:", deployer.address);
  console.log("账户余额:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "AVAX");

  const MoodToken = await ethers.getContractFactory("MoodToken");
  const token = await MoodToken.deploy();
  await token.waitForDeployment();

  const address = await token.getAddress();
  console.log("\n✅ MoodToken 已部署至:", address);
  console.log("\n👉 请将下面这行复制到 files/index.html 中的 MOOD_TOKEN_ADDRESS 常量：");
  console.log(`   const MOOD_TOKEN_ADDRESS = '${address}';`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
