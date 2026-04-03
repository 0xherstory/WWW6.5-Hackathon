import pkg from 'hardhat';
const { ethers, upgrades } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("升级账户:", deployer.address);

  const proxyAddress = "0xc7df8398F5b6571883Fe75Be3B48CEE355b0dA28";

  console.log("\n1. 准备升级 SanctuaryProtocolV2...");
  
  // 获取新实现合约工厂
  const SanctuaryProtocolV2 = await ethers.getContractFactory("SanctuaryProtocolV2");
  
  console.log("   执行升级...");
  const upgraded = await upgrades.upgradeProxy(proxyAddress, SanctuaryProtocolV2);
  await upgraded.waitForDeployment();
  
  const newImplementation = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  console.log("   ✅ 升级成功!");
  console.log("   代理地址:", proxyAddress);
  console.log("   新实现地址:", newImplementation);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
