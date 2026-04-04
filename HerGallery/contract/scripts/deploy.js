const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const HerGallery = await hre.ethers.getContractFactory("HerGallery");
  const proxy = await hre.upgrades.deployProxy(HerGallery, [deployer.address], {
    initializer: "initialize",
    kind: "uups",
  });

  await proxy.waitForDeployment();

  const proxyAddress = await proxy.getAddress();
  const implAddress = await hre.upgrades.erc1967.getImplementationAddress(proxyAddress);

  console.log("Proxy deployed to:         ", proxyAddress);
  console.log("Implementation deployed to:", implAddress);
  console.log("");
  console.log("Save the proxy address — this is the address you use in your frontend.");
  console.log("When upgrading, pass the proxy address to upgrade.js.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
