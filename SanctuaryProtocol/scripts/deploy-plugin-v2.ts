import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("部署账户:", deployer.address);

  const protocolAddress = "0xc7df8398F5b6571883Fe75Be3B48CEE355b0dA28";

  console.log("\n部署 PlantOHCardPlugin V2...");
  const PlantOHCardPlugin = await ethers.getContractFactory("PlantOHCardPlugin");
  const plugin = await PlantOHCardPlugin.deploy(protocolAddress, deployer.address);
  await plugin.waitForDeployment();

  const pluginAddress = await plugin.getAddress();
  console.log("✅ 插件 V2 部署成功!");
  console.log("   地址:", pluginAddress);

  // 提交插件到协议
  console.log("\n提交插件到协议...");
  const sanctuary = await ethers.getContractAt("SanctuaryProtocolV2", protocolAddress);
  
  try {
    const tx = await sanctuary.submitPlugin(pluginAddress, deployer.address);
    await tx.wait();
    console.log("✅ 插件已提交");
  } catch (e: any) {
    console.log("提交失败:", e.message);
  }

  console.log("\n=== 完成 ===");
  console.log("新插件地址:", pluginAddress);
  console.log("请更新 .env 和 contracts.ts 中的插件地址");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
