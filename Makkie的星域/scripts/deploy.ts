import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "AVAX");

  // SIGNER_ADDRESS = 平台后端用来签发 mint 授权的 EOA 地址
  // 生产环境从 .env 读取，测试环境用 deployer 本身
  const signerAddress = process.env.PLATFORM_SIGNER_ADDRESS ?? deployer.address;
  console.log("Platform signer:", signerAddress);

  const Factory = await ethers.getContractFactory("MoodRealmStamp");
  const contract = await Factory.deploy(signerAddress);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("\n✅ MoodRealmStamp deployed to:", address);
  console.log("   Network:", (await ethers.provider.getNetwork()).name);
  console.log("\nNext steps:");
  console.log("  1. Copy contract address to your .env: CONTRACT_ADDRESS=" + address);
  console.log("  2. Verify: npx hardhat verify --network fuji", address, signerAddress);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
