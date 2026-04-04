const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("部署账户:", deployer.address);
  console.log("账户余额:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "AVAX");

  const Registry = await ethers.getContractFactory("GirlsVaultRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();

  const registryAddress = await registry.getAddress();
  console.log("\n✅ GirlsVaultRegistry 部署成功:", registryAddress);
  console.log("Snowtrace:", `https://testnet.snowtrace.io/address/${registryAddress}`);
  console.log("\n📋 把以下地址填入 frontend/src/utils/contracts.js:");
  console.log(`REGISTRY_ADDRESS = "${registryAddress}"`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
