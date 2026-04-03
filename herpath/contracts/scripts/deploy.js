const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying HerPath contracts to Avalanche Fuji...");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Get account balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "AVAX");

  // Deploy HerPathNFT
  console.log("\n--- Deploying HerPathNFT ---");
  const projectWallet = deployer.address; // Use deployer as project wallet initially
  const HerPathNFT = await hre.ethers.getContractFactory("HerPathNFT");
  const nftContract = await HerPathNFT.deploy(projectWallet);
  await nftContract.waitForDeployment();
  const nftAddress = await nftContract.getAddress();
  console.log("HerPathNFT deployed to:", nftAddress);

  // Deploy HerPathSBT
  console.log("\n--- Deploying HerPathSBT ---");
  const HerPathSBT = await hre.ethers.getContractFactory("HerPathSBT");
  const sbtContract = await HerPathSBT.deploy();
  await sbtContract.waitForDeployment();
  const sbtAddress = await sbtContract.getAddress();
  console.log("HerPathSBT deployed to:", sbtAddress);

  // Save contract addresses and ABI
  const contractAddresses = {
    nft: nftAddress,
    sbt: sbtAddress,
    deployer: deployer.address,
    network: "fuji",
    deployedAt: new Date().toISOString(),
  };

  // Save to contracts/deployments directory
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save addresses
  const addressesFile = path.join(deploymentsDir, "fuji-addresses.json");
  fs.writeFileSync(addressesFile, JSON.stringify(contractAddresses, null, 2));
  console.log("\nContract addresses saved to:", addressesFile);

  // Save ABI files
  const artifactsDir = path.join(deploymentsDir, "abi");
  if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
  }

  const nftArtifact = await hre.artifacts.readArtifact("HerPathNFT");
  fs.writeFileSync(
    path.join(artifactsDir, "HerPathNFT.json"),
    JSON.stringify(nftArtifact.abi, null, 2)
  );

  const sbtArtifact = await hre.artifacts.readArtifact("HerPathSBT");
  fs.writeFileSync(
    path.join(artifactsDir, "HerPathSBT.json"),
    JSON.stringify(sbtArtifact.abi, null, 2)
  );

  console.log("ABIs saved to:", artifactsDir);

  // Generate environment variables for frontend
  const envContent = `# HerPath Smart Contract Addresses (Avalanche Fuji)
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=${nftAddress}
NEXT_PUBLIC_SBT_CONTRACT_ADDRESS=${sbtAddress}
NEXT_PUBLIC_NETWORK_ID=43113
NEXT_PUBLIC_NETWORK_NAME=Avalanche Fuji
NEXT_PUBLIC_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
`;

  const envFile = path.join(__dirname, "../../.env.local");
  fs.writeFileSync(envFile, envContent);
  console.log("\nFrontend .env.local updated with contract addresses");
  console.log("File:", envFile);

  console.log("\n=== Deployment Summary ===");
  console.log("Network: Avalanche Fuji (ChainID: 43113)");
  console.log("HerPathNFT Address:", nftAddress);
  console.log("HerPathSBT Address:", sbtAddress);
  console.log("\nNext steps:");
  console.log("1. Update charity wallet addresses in HerPathNFT contract");
  console.log("2. Deploy frontend with the contract addresses above");
  console.log("3. Request test AVAX from: https://faucet.avax.network");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
