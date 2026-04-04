const hre = require("hardhat");

// Set this to your deployed proxy address before running
const PROXY_ADDRESS = process.env.PROXY_ADDRESS;

async function main() {
  if (!PROXY_ADDRESS) {
    throw new Error("Set PROXY_ADDRESS environment variable to your proxy contract address");
  }

  console.log("Upgrading proxy at:", PROXY_ADDRESS);

  const HerGalleryV2 = await hre.ethers.getContractFactory("HerGallery");
  const upgraded = await hre.upgrades.upgradeProxy(PROXY_ADDRESS, HerGalleryV2, {
    kind: "uups",
  });

  await upgraded.waitForDeployment();

  const newImplAddress = await hre.upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS);
  console.log("Upgrade complete. New implementation:", newImplAddress);
  console.log("Proxy address unchanged:             ", PROXY_ADDRESS);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
