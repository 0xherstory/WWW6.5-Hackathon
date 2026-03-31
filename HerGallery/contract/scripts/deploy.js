const hre = require("hardhat");

async function main() {
  const HerGallery = await hre.ethers.getContractFactory("HerGallery");
  const herGallery = await HerGallery.deploy();

  await herGallery.waitForDeployment();

  const address = await herGallery.getAddress();
  console.log("HerGallery deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
