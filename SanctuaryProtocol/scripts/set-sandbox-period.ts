import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("操作账户:", deployer.address);

  const sanctuaryAddress = "0xc7df8398F5b6571883Fe75Be3B48CEE355b0dA28";

  // 连接到合约
  const sanctuary = await ethers.getContractAt("SanctuaryProtocolV2", sanctuaryAddress);

  // 检查当前沙盒期
  console.log("\n1. 检查当前沙盒期...");
  const currentPeriod = await sanctuary.sandboxPeriod();
  console.log("   当前沙盒期:", Number(currentPeriod) / 60 / 60 / 24, "天");

  // 设置沙盒期为 0
  console.log("\n2. 设置沙盒期为 0...");
  const tx = await sanctuary.setSandboxPeriod(0);
  await tx.wait();
  console.log("   ✅ 沙盒期已设为 0");

  // 验证
  const newPeriod = await sanctuary.sandboxPeriod();
  console.log("   新沙盒期:", Number(newPeriod), "秒");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
