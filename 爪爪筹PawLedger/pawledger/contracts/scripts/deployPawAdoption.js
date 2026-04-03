const { ethers, network } = require("hardhat");

async function main() {
  const signers = await ethers.getSigners();
  if (!signers.length) {
    throw new Error(
      "No signer available. Set PRIVATE_KEY in src/contracts/.env before deploying to fuji."
    );
  }
  const [deployer] = signers;

  console.log("Network:", network.name);
  console.log("Deploying with:", deployer.address);
  console.log(
    "Balance:",
    ethers.formatEther(await ethers.provider.getBalance(deployer.address)),
    "AVAX"
  );

  const PawAdoption = await ethers.getContractFactory("PawAdoption");
  const pawAdoption = await PawAdoption.deploy();
  await pawAdoption.waitForDeployment();

  const pawAdoptionAddr = await pawAdoption.getAddress();

  console.log("\nPawAdoption deployed:", pawAdoptionAddr);
  console.log("\nCopy this to src/ui/src/config.js -> CONTRACT_ADDRESSES.PawAdoption");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
