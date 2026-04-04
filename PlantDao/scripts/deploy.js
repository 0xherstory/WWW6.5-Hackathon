const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("🚀 部署 PlantDAO 全部合约...");
  console.log("📋 部署者:", deployer.address);
  console.log("💰 余额:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH");

  // 1. PleafToken ($PLEAF)
  console.log("\n🍃 部署 PleafToken...");
  const PleafToken = await hre.ethers.getContractFactory("PleafToken");
  const pleafToken = await PleafToken.deploy();
  await pleafToken.waitForDeployment();
  const pleafAddress = await pleafToken.getAddress();
  console.log("✅ PleafToken:", pleafAddress);

  // 2. SeedToken ($SEED)
  console.log("\n🌱 部署 SeedToken...");
  const SeedToken = await hre.ethers.getContractFactory("SeedToken");
  const seedToken = await SeedToken.deploy();
  await seedToken.waitForDeployment();
  const seedAddress = await seedToken.getAddress();
  console.log("✅ SeedToken:", seedAddress);

  // 3. SeasonManager
  console.log("\n🌤️ 部署 SeasonManager...");
  const SeasonManager = await hre.ethers.getContractFactory("SeasonManager");
  const seasonManager = await SeasonManager.deploy();
  await seasonManager.waitForDeployment();
  const seasonAddress = await seasonManager.getAddress();
  console.log("✅ SeasonManager:", seasonAddress);

  // 4. GlobalEcology
  console.log("\n🌍 部署 GlobalEcology...");
  const GlobalEcology = await hre.ethers.getContractFactory("GlobalEcology");
  const globalEcology = await GlobalEcology.deploy();
  await globalEcology.waitForDeployment();
  const ecologyAddress = await globalEcology.getAddress();
  console.log("✅ GlobalEcology:", ecologyAddress);

  // 5. GardenEnvironment
  console.log("\n🏡 部署 GardenEnvironment...");
  const GardenEnvironment = await hre.ethers.getContractFactory("GardenEnvironment");
  const gardenEnv = await GardenEnvironment.deploy();
  await gardenEnv.waitForDeployment();
  const gardenAddress = await gardenEnv.getAddress();
  console.log("✅ GardenEnvironment:", gardenAddress);

  // 6. PlantNFT
  console.log("\n🌿 部署 PlantNFT...");
  const PlantNFT = await hre.ethers.getContractFactory("PlantNFT");
  const plantNFT = await PlantNFT.deploy();
  await plantNFT.waitForDeployment();
  const nftAddress = await plantNFT.getAddress();
  console.log("✅ PlantNFT:", nftAddress);

  // 7. PlantOffspring
  console.log("\n🌱 部署 PlantOffspring...");
  const PlantOffspring = await hre.ethers.getContractFactory("PlantOffspring");
  const plantOffspring = await PlantOffspring.deploy();
  await plantOffspring.waitForDeployment();
  const offspringAddress = await plantOffspring.getAddress();
  console.log("✅ PlantOffspring:", offspringAddress);

  // 8. PlantCare (依赖 NFT + Seed + Garden + Season + Ecology)
  console.log("\n💧 部署 PlantCare...");
  const PlantCare = await hre.ethers.getContractFactory("PlantCare");
  const plantCare = await PlantCare.deploy(nftAddress, seedAddress, gardenAddress, seasonAddress, ecologyAddress);
  await plantCare.waitForDeployment();
  const careAddress = await plantCare.getAddress();
  console.log("✅ PlantCare:", careAddress);

  // 9. PlantMarketplace
  console.log("\n🛒 部署 PlantMarketplace...");
  const PlantMarketplace = await hre.ethers.getContractFactory("PlantMarketplace");
  const marketplace = await PlantMarketplace.deploy(nftAddress, pleafAddress);
  await marketplace.waitForDeployment();
  const marketAddress = await marketplace.getAddress();
  console.log("✅ PlantMarketplace:", marketAddress);

  // 10. PlantDAO
  console.log("\n🏛️ 部署 PlantDAO...");
  const PlantDAO = await hre.ethers.getContractFactory("PlantDAO");
  const dao = await PlantDAO.deploy(pleafAddress);
  await dao.waitForDeployment();
  const daoAddress = await dao.getAddress();
  console.log("✅ PlantDAO:", daoAddress);

  // ============ 设置合约关联 ============
  console.log("\n🔗 设置合约关联...");

  let tx;
  // SeedToken ↔ PleafToken
  tx = await seedToken.setPleafToken(pleafAddress);
  await tx.wait();
  console.log("✅ SeedToken → PleafToken");

  tx = await pleafToken.setSeedToken(seedAddress);
  await tx.wait();
  console.log("✅ PleafToken → SeedToken");

  // PlantNFT ownership → PlantCare
  tx = await plantNFT.transferOwnership(careAddress);
  await tx.wait();
  console.log("✅ PlantNFT owner → PlantCare");

  // SeedToken ownership → PlantCare
  tx = await seedToken.transferOwnership(careAddress);
  await tx.wait();
  console.log("✅ SeedToken owner → PlantCare");

  // GardenEnvironment ownership → PlantCare
  tx = await gardenEnv.transferOwnership(careAddress);
  await tx.wait();
  console.log("✅ GardenEnvironment owner → PlantCare");

  // GlobalEcology ownership → PlantCare (or DAO)
  tx = await globalEcology.transferOwnership(daoAddress);
  await tx.wait();
  console.log("✅ GlobalEcology owner → PlantDAO");

  // SeasonManager ownership → DAO
  tx = await seasonManager.transferOwnership(daoAddress);
  await tx.wait();
  console.log("✅ SeasonManager owner → PlantDAO");

  // PlantDAO 关联合约
  tx = await dao.setContracts(seedAddress, seasonAddress, ecologyAddress, gardenAddress, careAddress);
  await tx.wait();
  console.log("✅ PlantDAO contracts linked");

  // ============ 初始测试代币 ============
  console.log("\n🎁 铸造初始测试代币...");
  tx = await pleafToken.mintGovernanceReward(deployer.address, hre.ethers.parseEther("100"));
  await tx.wait();
  console.log("✅ 100 $PLEAF → 部署者");

  // ============ 完成 ============
  console.log("\n" + "=".repeat(60));
  console.log("🎉 PlantDAO 全部合约部署完成！");
  console.log("=".repeat(60));
  console.log("\n📄 合约地址:");
  console.log("  PleafToken ($PLEAF):  ", pleafAddress);
  console.log("  SeedToken ($SEED):    ", seedAddress);
  console.log("  PlantNFT:             ", nftAddress);
  console.log("  PlantCare:            ", careAddress);
  console.log("  PlantMarketplace:     ", marketAddress);
  console.log("  PlantDAO:             ", daoAddress);
  console.log("  SeasonManager:        ", seasonAddress);
  console.log("  GlobalEcology:        ", ecologyAddress);
  console.log("  GardenEnvironment:    ", gardenAddress);
  console.log("  PlantOffspring:       ", offspringAddress);

  const deployInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    deployTime: new Date().toISOString(),
    contracts: {
      PleafToken: pleafAddress,
      SeedToken: seedAddress,
      PlantNFT: nftAddress,
      PlantCare: careAddress,
      PlantMarketplace: marketAddress,
      PlantDAO: daoAddress,
      SeasonManager: seasonAddress,
      GlobalEcology: ecologyAddress,
      GardenEnvironment: gardenAddress,
      PlantOffspring: offspringAddress,
    }
  };

  fs.writeFileSync("deployment.json", JSON.stringify(deployInfo, null, 2));
  console.log("\n💾 部署信息已保存到 deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  });