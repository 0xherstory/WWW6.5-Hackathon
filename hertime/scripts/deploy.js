const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "AVAX");

  // 1. 部署 HerTimeToken
  console.log("\n1. Deploying HerTimeToken...");
  const Token = await hre.ethers.getContractFactory("HerTimeToken");
  const token = await Token.deploy();
  await token.waitForDeployment();
  const tokenAddr = await token.getAddress();
  console.log("   HerTimeToken:", tokenAddr);

  // 2. 部署 HerTimeSkillNFT（先部署，reputation 地址后设置）
  console.log("2. Deploying HerTimeSkillNFT...");
  const SkillNFT = await hre.ethers.getContractFactory("HerTimeSkillNFT");
  const skillNFT = await SkillNFT.deploy();
  await skillNFT.waitForDeployment();
  const skillNFTAddr = await skillNFT.getAddress();
  console.log("   HerTimeSkillNFT:", skillNFTAddr);

  // 3. 部署 HerTimeReputation，传入 skillNFT 地址（通过 setSkillNFT 设置）
  console.log("3. Deploying HerTimeReputation...");
  const Reputation = await hre.ethers.getContractFactory("HerTimeReputation");
  const reputation = await Reputation.deploy();
  await reputation.waitForDeployment();
  const reputationAddr = await reputation.getAddress();
  console.log("   HerTimeReputation:", reputationAddr);

  // 4. 部署 HerTimeService
  console.log("4. Deploying HerTimeService...");
  const Service = await hre.ethers.getContractFactory("HerTimeService");
  const service = await Service.deploy(tokenAddr, reputationAddr);
  await service.waitForDeployment();
  const serviceAddr = await service.getAddress();
  console.log("   HerTimeService:", serviceAddr);

  // 5. 设置权限和引用
  console.log("\n5. Setting up roles and references...");

  const MINTER_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("MINTER_ROLE"));
  const BURNER_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("BURNER_ROLE"));
  const SERVICE_CONTRACT_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("SERVICE_CONTRACT_ROLE"));
  const REPUTATION_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("REPUTATION_ROLE"));

  // Token: 给 Service 合约 MINTER_ROLE 和 BURNER_ROLE
  await (await token.grantRole(MINTER_ROLE, serviceAddr)).wait();
  console.log("   Token: granted MINTER_ROLE to Service");
  await (await token.grantRole(BURNER_ROLE, serviceAddr)).wait();
  console.log("   Token: granted BURNER_ROLE to Service");

  // Reputation: 给 Service 合约 SERVICE_CONTRACT_ROLE
  await (await reputation.grantRole(SERVICE_CONTRACT_ROLE, serviceAddr)).wait();
  console.log("   Reputation: granted SERVICE_CONTRACT_ROLE to Service");

  // Reputation: 设置 SkillNFT 地址
  await (await reputation.setSkillNFT(skillNFTAddr)).wait();
  console.log("   Reputation: skillNFT set to", skillNFTAddr);

  // SkillNFT: 设置 Reputation 地址
  await (await skillNFT.setReputation(reputationAddr)).wait();
  console.log("   SkillNFT: reputation set to", reputationAddr);

  // SkillNFT: 给 Reputation 合约 REPUTATION_ROLE
  await (await skillNFT.grantRole(REPUTATION_ROLE, reputationAddr)).wait();
  console.log("   SkillNFT: granted REPUTATION_ROLE to Reputation");

  // 6. 保存部署地址
  const networkName = hre.network.name;
  const chainId = (await hre.ethers.provider.getNetwork()).chainId.toString();

  const deployed = {
    network: networkName,
    chainId,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    contracts: {
      HerTimeToken: tokenAddr,
      HerTimeService: serviceAddr,
      HerTimeReputation: reputationAddr,
      HerTimeSkillNFT: skillNFTAddr,
    },
  };

  const utilsDir = path.join(__dirname, "../frontend/src/utils");
  fs.mkdirSync(utilsDir, { recursive: true });

  // 按网络保存，前端根据 chainId 自动选择
  const networkFile = path.join(utilsDir, `deployed.${networkName}.json`);
  fs.writeFileSync(networkFile, JSON.stringify(deployed, null, 2));
  console.log(`\nDeployment saved to frontend/src/utils/deployed.${networkName}.json`);

  console.log("\n=== Deployment Complete ===");
  console.log(JSON.stringify(deployed.contracts, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
